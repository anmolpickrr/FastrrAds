/* ============================================================
   Fastrr Creative — Order History (internal team)
   Firebase Auth (email/password) + Firestore, so each signed-in
   team member only ever sees orders they logged themselves. This
   is a separate, real access boundary from the site-wide
   is-internal flag in app.js (which is just URL-based obscurity
   for the public/internal UI split) — signing in here requires a
   real account and Firestore rules enforce the per-user isolation
   server-side, not just in this UI.

   All UI wiring below (popup open/close, sign-in/signup mode toggle,
   form validation) runs unconditionally, independent of whether
   Firebase is actually configured yet — every control always
   responds to a click. Only the final network step (actually
   creating/checking an account, actually saving/reading orders)
   depends on FIREBASE_CONFIG being filled in; until then it fails
   with a clear, professional inline message instead of doing
   nothing when clicked.

   SETUP — before accounts/orders will actually work:
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
const FIREBASE_IS_CONFIGURED = !FIREBASE_CONFIG.apiKey.startsWith("REPLACE_WITH_");
const NOT_CONFIGURED_MSG = "Order History isn't connected yet — ask an admin to finish the setup.";

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
   1. POPUP — open/close/nav-button wiring. Runs unconditionally so
   the popup is interactive the instant the page loads, well before
   (and even without) Firebase.
---------------------------------------------------------- */
function initAuthModal() {
  const modal = $("teamAuthModal");
  const backdrop = $("teamAuthModalBackdrop");
  const closeBtn = $("teamAuthModalClose");
  const navBtn = $("teamNavBtn");
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  // Nav button only ever shown on the internal build (CSS also
  // enforces this for public visitors regardless of JS).
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

/* ----------------------------------------------------------
   2. SIGN-IN / SIGN-UP FORM — mode toggle + submit handling, wired
   unconditionally. `getAuthApi()` resolves once Firebase has loaded;
   until then submit shows NOT_CONFIGURED_MSG instead of silently
   doing nothing.
---------------------------------------------------------- */
function initAuthForm(authModal, getAuthApi) {
  const form = $("teamAuthForm");
  if (!form) return;
  const nameRow = $("teamNameRow");
  const nameInput = $("teamNameInput");
  const emailInput = $("teamEmailInput");
  const passwordInput = $("teamPasswordInput");
  const title = $("teamAuthTitle");
  const sub = $("teamAuthSub");
  const submitLabel = $("teamAuthSubmitBtnLabel");
  const status = $("teamAuthStatus");
  const switchText = $("teamAuthSwitchText");
  const switchBtn = $("teamAuthSwitchBtn");

  let mode = "signin";

  function setStatus(msg, isError) {
    status.textContent = msg || "";
    status.className = "team-form-status" + (msg ? (isError ? " is-error" : " is-success") : "");
  }

  function setMode(next) {
    mode = next;
    setStatus("");
    if (mode === "signup") {
      title.textContent = "Create your account";
      sub.textContent = "Use your work email (" + ALLOWED_SIGNUP_DOMAINS.map((d) => "@" + d).join(" or ") + ") to set up access.";
      submitLabel.textContent = "Create account";
      switchText.textContent = "Already have an account?";
      switchBtn.textContent = "Sign in";
      passwordInput.setAttribute("autocomplete", "new-password");
      nameRow.hidden = false;
      nameInput.setAttribute("required", "");
    } else {
      title.textContent = "Sign in";
      sub.textContent = "Use your work email to access your order history.";
      submitLabel.textContent = "Sign in";
      switchText.textContent = "New to the team?";
      switchBtn.textContent = "Create an account";
      passwordInput.setAttribute("autocomplete", "current-password");
      nameRow.hidden = true;
      nameInput.removeAttribute("required");
    }
  }
  switchBtn.addEventListener("click", () => setMode(mode === "signin" ? "signup" : "signin"));

  function friendlyAuthError(err) {
    const code = err && err.code ? err.code : "";
    if (code.includes("email-already-in-use")) return "An account already exists for this email — try signing in instead.";
    if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Incorrect email or password.";
    if (code.includes("user-not-found")) return "No account found for this email.";
    if (code.includes("weak-password")) return "Password should be at least 6 characters.";
    if (code.includes("invalid-email")) return "Enter a valid email address.";
    if (code.includes("network-request-failed")) return "Network error — check your connection and try again.";
    if (code.includes("too-many-requests")) return "Too many attempts — please wait a moment and try again.";
    return "Something went wrong — please try again.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (mode === "signup" && !name) {
      setStatus("Please enter your name.", true);
      return;
    }
    if (!email || !password) {
      setStatus("Please enter your email and password.", true);
      return;
    }
    if (password.length < 6) {
      setStatus("Password should be at least 6 characters.", true);
      return;
    }
    const domain = email.split("@")[1] || "";
    if (mode === "signup" && !ALLOWED_SIGNUP_DOMAINS.includes(domain.toLowerCase())) {
      setStatus("Please sign up with your Fastrr work email.", true);
      return;
    }

    const api = getAuthApi();
    if (!api) {
      setStatus(NOT_CONFIGURED_MSG, true);
      return;
    }

    const originalLabel = submitLabel.textContent;
    submitLabel.textContent = mode === "signup" ? "Creating…" : "Signing in…";
    setStatus("");
    try {
      if (mode === "signup") {
        const cred = await api.createUserWithEmailAndPassword(api.auth, email, password);
        await api.updateProfile(cred.user, { displayName: name });
        api.refreshDisplay();
      } else {
        await api.signInWithEmailAndPassword(api.auth, email, password);
      }
      form.reset();
      authModal.close();
    } catch (err) {
      setStatus(friendlyAuthError(err), true);
    } finally {
      submitLabel.textContent = originalLabel;
    }
  });

  return { setMode };
}

/* ----------------------------------------------------------
   3. DASHBOARD (log order + filterable history) + FIREBASE LOAD.
   Everything that genuinely requires a backend lives here.
---------------------------------------------------------- */
async function boot() {
  const authModal = initAuthModal();
  let authApi = null; // set once Firebase has loaded — { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword }
  const authFormCtl = initAuthForm(authModal, () => authApi);

  if (!FIREBASE_IS_CONFIGURED) {
    console.warn("[Fastrr] " + NOT_CONFIGURED_MSG + " (assets/team.js FIREBASE_CONFIG is still a placeholder)");
    return;
  }

  let firebaseMods;
  try {
    firebaseMods = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"),
    ]);
  } catch (err) {
    console.error("[Fastrr] Failed to load Firebase SDK — Order History will stay signed-out.", err);
    return;
  }
  const [{ initializeApp }, authMod, fsMod] = firebaseMods;
  const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } = authMod;
  const { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } = fsMod;

  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const dash = $("teamDash");
  const whoEmail = $("teamWhoEmail");
  const logoutBtn = $("teamLogoutBtn");
  const orderForm = $("teamOrderForm");
  const orderSubmitLabel = $("teamOrderSubmitBtnLabel");
  const orderStatusMsg = $("teamOrderStatusMsg");
  const filterRow = $("teamFilterRow");
  const orderList = $("teamOrderList");
  const navBtn = $("teamNavBtn");

  let unsubscribeOrders = null;
  let allOrders = [];
  let activeFilter = "all";
  let hasAutoOpened = false;

  // updateProfile() (setting displayName right after sign-up) does not
  // itself re-fire onAuthStateChanged — true of real Firebase, not just
  // this mock — so the "Signed in as …" text and nav label need an
  // explicit refresh right after it resolves, not just on auth-state
  // changes.
  function refreshWho(user) {
    if (!user) return;
    const displayName = user.displayName || user.email.split("@")[0];
    whoEmail.textContent = user.displayName ? `${user.displayName} (${user.email})` : user.email;
    if (navBtn) {
      navBtn.dataset.signedIn = "1";
      navBtn.textContent = displayName;
    }
  }
  authApi = { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, refreshDisplay: () => refreshWho(auth.currentUser) };

  function setOrderStatus(msg, isError) {
    orderStatusMsg.textContent = msg || "";
    orderStatusMsg.className = "team-form-status" + (msg ? (isError ? " is-error" : " is-success") : "");
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
    if (!client || !pkg || !(amount >= 0)) {
      setOrderStatus("Please fill in the client, package, and a valid amount.", true);
      return;
    }

    const originalLabel = orderSubmitLabel.textContent;
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
      orderSubmitLabel.textContent = originalLabel;
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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

  onAuthStateChanged(auth, (user) => {
    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }
    if (user) {
      dash.classList.add("is-active");
      refreshWho(user);
      allOrders = [];
      renderOrders();
      const q = query(collection(db, "orders"), where("uid", "==", user.uid), orderBy("createdAt", "desc"));
      unsubscribeOrders = onSnapshot(q, (snap) => {
        allOrders = snap.docs.map((d) => d.data());
        renderOrders();
      });
    } else {
      dash.classList.remove("is-active");
      if (authFormCtl) authFormCtl.setMode("signin");
      if (navBtn) {
        navBtn.dataset.signedIn = "0";
        navBtn.textContent = "Team Sign In";
      }
      // Arriving at /teamfastrr (or any page load while the internal
      // flag is set) but not yet authenticated — surface the popup
      // immediately rather than leaving the visitor to find it. Fires
      // once per page load only.
      if (isInternal() && !hasAutoOpened) {
        hasAutoOpened = true;
        authModal.open();
      }
    }
  });
}

boot();
