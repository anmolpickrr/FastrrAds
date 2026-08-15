/* ============================================================
   Fastrr Creative — Order History (internal team)
   Firebase Auth (email/password) + Firestore, so each signed-in
   team member only ever sees orders they logged themselves. This
   is a separate, real access boundary from the site-wide
   is-internal flag in app.js (which is just URL-based obscurity
   for the public/internal UI split) — signing in here requires a
   real account and Firestore rules enforce the per-user isolation
   server-side, not just in this UI.

   SETUP — before this section will work:
   1. Create a Firebase project at https://console.firebase.google.com
   2. Build → Authentication → enable the Email/Password provider.
   3. Build → Firestore Database → create a database (production mode).
   4. Project settings → Your apps → add a Web app → copy the
      firebaseConfig object into FIREBASE_CONFIG below.
   5. Firestore → Rules → paste:

      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /orders/{orderId} {
            allow read, update, delete: if request.auth != null
              && resource.data.uid == request.auth.uid;
            allow create: if request.auth != null
              && request.resource.data.uid == request.auth.uid
              && request.resource.data.email == request.auth.token.email;
          }
        }
      }

   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
};

// New accounts must sign up with one of these email domains. This is a
// light client-side guard, not real security — Firestore rules are what
// actually keep one member's orders private from another.
const ALLOWED_SIGNUP_DOMAINS = ["fastrr.com", "pickrr.com"];

const STATUS_LABEL = { placed: "Placed", completed: "Completed", failed: "Failed", cancelled: "Cancelled" };

const $ = (id) => document.getElementById(id);

function isInternal() {
  return document.documentElement.classList.contains("is-internal");
}

/* ----------------------------------------------------------
   Sign-in/signup popup — open/close wiring runs unconditionally
   (doesn't need Firebase loaded) so the popup is interactive the
   moment the page loads, from either the nav button, the in-section
   prompt, or automatically on arrival at /teamfastrr while signed out.
---------------------------------------------------------- */
function initAuthModal() {
  const modal = $("teamAuthModal");
  const backdrop = $("teamAuthModalBackdrop");
  const closeBtn = $("teamAuthModalClose");
  const navBtn = $("teamNavBtn");
  const openBtn = $("teamOpenAuthBtn");
  if (!modal) return { open() {}, close() {} };

  function open() {
    modal.classList.add("open");
    document.body.classList.add("lb-locked");
    const emailInput = $("teamEmailInput");
    if (emailInput) emailInput.focus();
  }
  function close() {
    modal.classList.remove("open");
    document.body.classList.remove("lb-locked");
  }

  if (backdrop) backdrop.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (openBtn) openBtn.addEventListener("click", open);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  // Nav button is only ever shown on the internal build (CSS also
  // enforces this for public visitors regardless of JS); default state
  // before auth resolves is a plain "Sign in" trigger.
  if (navBtn && isInternal()) {
    navBtn.style.display = "";
    navBtn.textContent = "Team Sign In";
    navBtn.addEventListener("click", () => {
      if (navBtn.dataset.signedIn === "1") {
        document.getElementById("history").scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        open();
      }
    });
  }

  return { open, close };
}

async function boot() {
  const authModal = initAuthModal();

  if (FIREBASE_CONFIG.apiKey.startsWith("REPLACE_WITH_")) {
    console.warn("[Fastrr] Order History is not wired up yet — add your Firebase config to assets/team.js.");
    return;
  }

  const [{ initializeApp }, authMod, fsMod] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"),
  ]);
  const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } = authMod;
  const { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } = fsMod;

  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const authView = $("teamAuthView");
  const dash = $("teamDash");
  const authForm = $("teamAuthForm");
  const emailInput = $("teamEmailInput");
  const passwordInput = $("teamPasswordInput");
  const authTitle = $("teamAuthTitle");
  const authSub = $("teamAuthSub");
  const authSubmitLabel = $("teamAuthSubmitBtnLabel");
  const authStatus = $("teamAuthStatus");
  const switchText = $("teamAuthSwitchText");
  const switchBtn = $("teamAuthSwitchBtn");
  const whoEmail = $("teamWhoEmail");
  const logoutBtn = $("teamLogoutBtn");
  const orderForm = $("teamOrderForm");
  const orderSubmitLabel = $("teamOrderSubmitBtnLabel");
  const orderStatusMsg = $("teamOrderStatusMsg");
  const filterRow = $("teamFilterRow");
  const orderList = $("teamOrderList");
  const navBtn = $("teamNavBtn");

  let mode = "signin"; // or "signup"
  let unsubscribeOrders = null;
  let allOrders = [];
  let activeFilter = "all";
  let hasAutoOpened = false;

  function setAuthStatus(msg, isError) {
    authStatus.textContent = msg || "";
    authStatus.className = "team-form-status" + (msg ? (isError ? " is-error" : " is-success") : "");
  }

  function setOrderStatus(msg, isError) {
    orderStatusMsg.textContent = msg || "";
    orderStatusMsg.className = "team-form-status" + (msg ? (isError ? " is-error" : " is-success") : "");
  }

  function setMode(next) {
    mode = next;
    setAuthStatus("");
    if (mode === "signup") {
      authTitle.textContent = "Create your account";
      authSub.textContent = "Use your work email (" + ALLOWED_SIGNUP_DOMAINS.map((d) => "@" + d).join(" or ") + ") to set up access.";
      authSubmitLabel.textContent = "Create account";
      switchText.textContent = "Already have an account?";
      switchBtn.textContent = "Sign in";
      passwordInput.setAttribute("autocomplete", "new-password");
    } else {
      authTitle.textContent = "Sign in";
      authSub.textContent = "Use your work email to access your order history.";
      authSubmitLabel.textContent = "Sign in";
      switchText.textContent = "New to the team?";
      switchBtn.textContent = "Create an account";
      passwordInput.setAttribute("autocomplete", "current-password");
    }
  }
  switchBtn.addEventListener("click", () => setMode(mode === "signin" ? "signup" : "signin"));

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const domain = email.split("@")[1] || "";

    if (mode === "signup" && !ALLOWED_SIGNUP_DOMAINS.includes(domain.toLowerCase())) {
      setAuthStatus("Please sign up with your Fastrr work email.", true);
      return;
    }

    authSubmitLabel.textContent = mode === "signup" ? "Creating…" : "Signing in…";
    setAuthStatus("");
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      authForm.reset();
      authModal.close();
    } catch (err) {
      setAuthStatus(friendlyAuthError(err), true);
    } finally {
      authSubmitLabel.textContent = mode === "signup" ? "Create account" : "Sign in";
    }
  });

  function friendlyAuthError(err) {
    const code = err && err.code ? err.code : "";
    if (code.includes("email-already-in-use")) return "An account already exists for this email — try signing in instead.";
    if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Incorrect email or password.";
    if (code.includes("user-not-found")) return "No account found for this email.";
    if (code.includes("weak-password")) return "Password should be at least 6 characters.";
    if (code.includes("invalid-email")) return "Enter a valid email address.";
    return "Something went wrong — please try again.";
  }

  logoutBtn.addEventListener("click", () => signOut(auth));

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const client = $("teamOrderClient").value.trim();
    const pkg = $("teamOrderPackage").value.trim();
    const amount = Number($("teamOrderAmount").value);
    const status = $("teamOrderStatus").value;
    if (!client || !pkg || !(amount >= 0)) return;

    orderSubmitLabel.textContent = "Adding…";
    setOrderStatus("");
    try {
      await addDoc(collection(db, "orders"), {
        uid: user.uid,
        email: user.email,
        client,
        package: pkg,
        amount,
        status,
        createdAt: serverTimestamp(),
      });
      orderForm.reset();
      $("teamOrderStatus").value = "placed";
      setOrderStatus("Order added.", false);
    } catch (err) {
      setOrderStatus("Couldn't save the order — please try again.", true);
    } finally {
      orderSubmitLabel.textContent = "Add order";
    }
  });

  filterRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".team-filter-chip");
    if (!chip) return;
    activeFilter = chip.dataset.status;
    filterRow.querySelectorAll(".team-filter-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    renderOrders();
  });

  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  function fmtDate(ts) {
    if (!ts || !ts.toDate) return "";
    return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderOrders() {
    const rows = activeFilter === "all" ? allOrders : allOrders.filter((o) => o.status === activeFilter);
    if (!rows.length) {
      orderList.innerHTML =
        '<div class="team-order-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M9 11H3v10h6V11ZM21 3h-6v18h6V3ZM15 15H9v6h6v-6Z"/></svg><p>' +
        (allOrders.length ? "No orders with this status." : "No orders logged yet. Use the form above once you've confirmed one.") +
        "</p></div>";
      return;
    }
    orderList.innerHTML = rows
      .map(
        (o) => `
      <div class="team-order-card">
        <div class="team-order-main">
          <div class="team-order-client">${escapeHtml(o.client)}</div>
          <div class="team-order-meta">${escapeHtml(o.package)} · ${fmtDate(o.createdAt)}</div>
        </div>
        <div class="team-order-right">
          <span class="team-order-amount">${fmtINR(o.amount)}</span>
          <span class="team-order-status status-${o.status}">${STATUS_LABEL[o.status] || o.status}</span>
        </div>
      </div>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  onAuthStateChanged(auth, (user) => {
    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }
    if (user) {
      authView.classList.add("is-hidden");
      dash.classList.add("is-active");
      whoEmail.textContent = user.email;
      allOrders = [];
      renderOrders();
      if (navBtn) {
        navBtn.dataset.signedIn = "1";
        navBtn.textContent = user.email.split("@")[0];
      }
      const q = query(collection(db, "orders"), where("uid", "==", user.uid), orderBy("createdAt", "desc"));
      unsubscribeOrders = onSnapshot(q, (snap) => {
        allOrders = snap.docs.map((d) => d.data());
        renderOrders();
      });
    } else {
      authView.classList.remove("is-hidden");
      dash.classList.remove("is-active");
      setMode("signin");
      if (navBtn) {
        navBtn.dataset.signedIn = "0";
        navBtn.textContent = "Team Sign In";
      }
      // Arriving at /teamfastrr (or any page load while the internal
      // flag is set) but not yet authenticated — surface the popup
      // immediately instead of leaving the visitor to find the
      // sign-in prompt further down the page. Only fires once per
      // page load so it doesn't reopen every time auth state settles.
      if (isInternal() && !hasAutoOpened) {
        hasAutoOpened = true;
        authModal.open();
      }
    }
  });
}

boot();
