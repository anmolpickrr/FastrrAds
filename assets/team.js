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
  apiKey: "AIzaSyABUBoMfvcYdiUJQwI2rPBb8-GGnX-daTk",
  authDomain: "fastrr-creative.firebaseapp.com",
  projectId: "fastrr-creative",
  storageBucket: "fastrr-creative.firebasestorage.app",
  messagingSenderId: "210648202688",
  appId: "1:210648202688:web:0335d98449f6610cacdc25",
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
   1. POPUP — open/close wiring. Runs unconditionally so the popup is
   interactive the instant the page loads, well before (and even
   without) Firebase.
---------------------------------------------------------- */
function initAuthModal() {
  const modal = $("teamAuthModal");
  const backdrop = $("teamAuthModalBackdrop");
  const closeBtn = $("teamAuthModalClose");
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

  return { open, close };
}

/* ----------------------------------------------------------
   1b. ORDER HISTORY MODAL — same open/close pattern. Only ever opened
   from the profile dropdown below; there's no other entry point, so
   unlike the other modals nothing needs to auto-open this one.
---------------------------------------------------------- */
function initOrderHistoryModal() {
  const modal = $("orderHistoryModal");
  const backdrop = $("orderHistoryModalBackdrop");
  const closeBtn = $("orderHistoryModalClose");
  if (!modal) return { open() {}, close() {} };

  function open() {
    modal.classList.add("open");
    document.body.classList.add("lb-locked");
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

  return { open, close };
}

/* ----------------------------------------------------------
   1c. PROFILE DROPDOWN (nav) — signed-out: a plain button that opens
   the sign-in popup. Signed-in: a hover/click-revealed menu with
   "Order History" and "Sign out" — the only way to reach either.
   Wired unconditionally so hover/click behavior works immediately;
   `getAuthApi()` (resolves once Firebase has loaded) is only needed
   for the actual sign-out call.
---------------------------------------------------------- */
function initProfileMenu(authModal, orderHistoryModal, getAuthApi) {
  const wrap = $("teamProfile");
  const trigger = $("teamNavBtn");
  const menu = $("teamProfileMenu");
  const historyBtn = $("teamProfileHistoryBtn");
  const signOutBtn = $("teamProfileSignOutBtn");
  if (!wrap || !trigger) return;

  if (isInternal()) {
    wrap.style.display = "";
    trigger.textContent = "Team Sign In";
  }

  function closeMenu() {
    wrap.classList.remove("menu-open");
  }

  trigger.addEventListener("click", () => {
    if (trigger.dataset.signedIn === "1") {
      wrap.classList.toggle("menu-open");
    } else {
      authModal.open();
    }
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      closeMenu();
      orderHistoryModal.open();
    });
  }
  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      closeMenu();
      const api = getAuthApi();
      if (api) api.signOut(api.auth);
    });
  }

  return {
    setSignedIn(signedIn, label) {
      trigger.dataset.signedIn = signedIn ? "1" : "0";
      trigger.textContent = signedIn ? label : "Team Sign In";
      if (signedIn) trigger.dataset.initial = (label || "?").trim().charAt(0).toUpperCase();
      if (menu) menu.hidden = !signedIn;
      if (!signedIn) closeMenu();
    },
  };
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
  const passwordToggle = $("teamPasswordToggle");
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const showing = passwordInput.type === "text";
      passwordInput.type = showing ? "password" : "text";
      passwordToggle.setAttribute("aria-pressed", String(!showing));
      passwordToggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  }
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
   3. ORDER-CONFIRM MODAL — the "Place Your Order" button in the
   Order panel is shared markup with the public build (same button,
   same js-open-lead-modal class, so public still opens the lead
   popup there). On the team build we intercept that same click in
   the capture phase and open this modal instead: review the cart
   already built, collect the client's contact details, and log the
   order under the signed-in rep — a proper internal order-creation
   step, not a cold-lead form. Wired unconditionally like the auth
   modal; only the actual Firestore write depends on Firebase/being
   signed in.
---------------------------------------------------------- */
function initOrderConfirmModal(authModal, getAuthApi, getOrderApi, onSignedInPending) {
  const placeBtn = $("placeOrderBtn");
  const modal = $("orderConfirmModal");
  if (!placeBtn || !modal) return;

  const backdrop = $("orderConfirmModalBackdrop");
  const closeBtn = $("orderConfirmModalClose");
  const formView = $("orderConfirmFormView");
  const successView = $("orderConfirmSuccessView");
  const summaryEl = $("orderConfirmSummary");
  const form = $("orderConfirmForm");
  const submitLabel = $("orderConfirmSubmitBtnLabel");
  const status = $("orderConfirmStatus");
  const continueBtn = $("orderConfirmContinueBtn");
  const closeSuccessBtn = $("orderConfirmCloseBtn");
  const ocPanel = $("ocPanel");

  function setStatus(msg, isError) {
    status.textContent = msg || "";
    status.className = "lead-form-status" + (msg ? (isError ? " is-error" : " is-success") : "");
  }

  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  // Reads the order straight off the already-rendered cart DOM rather
  // than reaching into app.js's internals — keeps the two scripts
  // decoupled, the same way the rest of this file talks to app.js
  // only through the DOM (ids, dispatched events).
  function readCartFromDom() {
    const rows = Array.from(document.querySelectorAll("#orderCartList .cart-item"));
    const items = rows.map((row) => ({
      name: row.querySelector(".cart-item-name")?.textContent.trim() || "",
      qty: row.querySelector(".cart-item-qty span")?.textContent.trim() || "",
      price: row.querySelector(".cart-item-price")?.textContent.trim() || "",
    }));
    const finalText = $("qFinal")?.textContent.trim() || "₹0";
    const finalAmount = Number(finalText.replace(/[^0-9]/g, "")) || 0;
    return { items, finalText, finalAmount };
  }

  function renderSummary(cart) {
    if (!cart.items.length) {
      summaryEl.innerHTML = '<div class="oc-review-label">Order</div><div class="oc-review-row"><span>No creatives added yet</span></div>';
      return;
    }
    summaryEl.innerHTML =
      '<div class="oc-review-label">Order</div>' +
      cart.items.map((i) => `<div class="oc-review-row"><span>${i.name} ×${i.qty}</span><span>${i.price}</span></div>`).join("") +
      `<div class="oc-review-total"><span>Final Amount</span><b>${cart.finalText}</b></div>`;
  }

  function flashCartEmpty() {
    if (!ocPanel) return;
    ocPanel.classList.remove("flash-warn");
    void ocPanel.offsetWidth;
    ocPanel.classList.add("flash-warn");
    ocPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function open() {
    formView.hidden = false;
    successView.hidden = true;
    form.reset();
    setStatus("");
    renderSummary(readCartFromDom());
    modal.classList.add("open");
    document.body.classList.add("lb-locked");
    $("ocClientName")?.focus();
  }
  function close() {
    modal.classList.remove("open");
    document.body.classList.remove("lb-locked");
  }

  if (backdrop) backdrop.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  // Capture phase, ahead of app.js's own bubble-phase listener on the
  // same .js-open-lead-modal button — stopImmediatePropagation there
  // is what keeps the public lead popup from also opening.
  placeBtn.addEventListener(
    "click",
    (e) => {
      e.stopImmediatePropagation();
      const cart = readCartFromDom();
      if (!cart.items.length) {
        flashCartEmpty();
        return;
      }
      const authApi = getAuthApi();
      if (authApi && !authApi.auth.currentUser) {
        // Not signed in yet — prompt sign-in first, then come straight
        // back to this modal once they're in, instead of a dead end.
        onSignedInPending(open);
        authModal.open();
        return;
      }
      open();
    },
    true
  );

  let lastClientDetails = null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cart = readCartFromDom();
    if (!cart.items.length) {
      close();
      flashCartEmpty();
      return;
    }
    const clientName = $("ocClientName").value.trim();
    const email = $("ocClientEmail").value.trim();
    const phone = $("ocClientPhone").value.trim();
    const website = $("ocClientWebsite").value.trim();
    const category = $("ocClientCategory").value;
    const notes = $("ocClientNotes").value.trim();
    if (!clientName || !email || !phone) {
      setStatus("Please fill in the client's name, email, and contact number.", true);
      return;
    }

    const orderApi = getOrderApi();
    if (!orderApi) {
      setStatus(NOT_CONFIGURED_MSG, true);
      return;
    }

    const originalLabel = submitLabel.textContent;
    submitLabel.textContent = "Placing…";
    setStatus("");
    try {
      const packageSummary = cart.items.map((i) => `${i.name} ×${i.qty}`).join(", ");
      await orderApi.logOrder({
        client: clientName,
        package: packageSummary,
        amount: cart.finalAmount,
        status: "placed",
        clientEmail: email,
        clientPhone: phone,
        clientWebsite: website,
        clientCategory: category,
        notes,
      });
      lastClientDetails = { clientName, email, phone, website, category };
      formView.hidden = true;
      successView.hidden = false;
    } catch (err) {
      setStatus("Couldn't save the order — please try again.", true);
    } finally {
      submitLabel.textContent = originalLabel;
    }
  });

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      close();
      // Carry the client details straight into the Message Generator
      // fields via real input/change events, so app.js's own listeners
      // pick them up exactly as if the rep had typed them there —
      // no direct reach into app.js's internals needed.
      if (lastClientDetails) {
        const bn = $("brandNameInput");
        if (bn) {
          bn.value = lastClientDetails.clientName;
          bn.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (lastClientDetails.website) {
          const site = $("websiteInput");
          if (site) {
            site.value = lastClientDetails.website;
            site.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        if (lastClientDetails.category) {
          const cat = $("brandCategorySelect");
          if (cat) {
            cat.value = lastClientDetails.category;
            cat.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
      const messages = document.getElementById("messages");
      if (messages) messages.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

/* ----------------------------------------------------------
   4. DASHBOARD (log order + filterable history) + FIREBASE LOAD.
   Everything that genuinely requires a backend lives here.
---------------------------------------------------------- */
async function boot() {
  const authModal = initAuthModal();
  const orderHistoryModal = initOrderHistoryModal();
  let authApi = null; // set once Firebase has loaded — { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut }
  const authFormCtl = initAuthForm(authModal, () => authApi);
  const profileMenu = initProfileMenu(authModal, orderHistoryModal, () => authApi);
  let orderApi = null; // set once Firebase has loaded — { logOrder(data) }
  let pendingOrderOpen = null; // set when "Place Your Order" opened the auth modal instead (not signed in yet)
  initOrderConfirmModal(authModal, () => authApi, () => orderApi, (resumeFn) => {
    pendingOrderOpen = resumeFn;
  });

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
  const { getFirestore, collection, addDoc, query, where, limit, onSnapshot, serverTimestamp } = fsMod;

  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const whoEmail = $("teamWhoEmail");
  const filterRow = $("teamFilterRow");
  const orderList = $("teamOrderList");
  const searchInput = $("teamOrderSearch");

  // Soft cap, not a hard scale limit — keeps a single query from ever
  // pulling a runaway number of documents. Comfortably covers a rep's
  // realistic history; genuinely unbounded search across tens of
  // thousands of orders per person would need a Firestore composite
  // index (uid + createdAt) for cursor-based pagination and likely a
  // dedicated search index (e.g. Algolia) for full-text search — real
  // infrastructure additions, not something to silently half-build here.
  const ORDER_FETCH_CAP = 500;

  let unsubscribeOrders = null;
  let allOrders = [];
  let activeFilter = "all";
  let searchTerm = "";
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
    if (profileMenu) profileMenu.setSignedIn(true, displayName);
  }
  authApi = { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, refreshDisplay: () => refreshWho(auth.currentUser) };

  // Shared by both order-entry points — the quick manual form below
  // and the order-confirm modal opened from "Place Your Order" — so
  // every order lands in Firestore with the same shape regardless of
  // which flow created it. Optional fields default to "" rather than
  // being omitted, since Firestore rejects `undefined` field values.
  function logOrder(data) {
    const user = auth.currentUser;
    if (!user) return Promise.reject(new Error("not signed in"));
    return addDoc(collection(db, "orders"), {
      uid: user.uid,
      email: user.email,
      client: data.client,
      package: data.package,
      amount: data.amount,
      status: data.status || "placed",
      clientEmail: data.clientEmail || "",
      clientPhone: data.clientPhone || "",
      clientWebsite: data.clientWebsite || "",
      clientCategory: data.clientCategory || "",
      notes: data.notes || "",
      createdAt: serverTimestamp(),
    });
  }
  orderApi = { logOrder };

  filterRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".team-filter-chip");
    if (!chip) return;
    activeFilter = chip.dataset.status;
    filterRow.querySelectorAll(".team-filter-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    renderOrders();
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      renderOrders();
    });
  }

  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  function fmtDate(ts) {
    if (!ts || !ts.toDate) return "";
    return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function tsMillis(ts) {
    return ts && ts.toDate ? ts.toDate().getTime() : 0;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function renderOrders() {
    let rows = activeFilter === "all" ? allOrders : allOrders.filter((o) => o.status === activeFilter);
    if (searchTerm) {
      rows = rows.filter((o) => (o.client + " " + o.package).toLowerCase().includes(searchTerm));
    }
    if (!rows.length) {
      const msg = !allOrders.length
        ? "No orders logged yet. Use the form above once you've confirmed one."
        : searchTerm
        ? "No orders match your search."
        : "No orders with this status.";
      orderList.innerHTML =
        '<div class="team-order-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M9 11H3v10h6V11ZM21 3h-6v18h6V3ZM15 15H9v6h6v-6Z"/></svg><p>' +
        msg +
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
      refreshWho(user);
      allOrders = [];
      renderOrders();
      // Deliberately NOT combined with orderBy("createdAt") here — a
      // where()+orderBy() on different fields is a composite query
      // that Firestore refuses to run without a manually-created
      // index, and onSnapshot's error callback below was previously
      // unwired, so that failure was silent: the write would succeed
      // but the order would just never appear. Sorting client-side
      // instead means this view never depends on any index existing.
      const q = query(collection(db, "orders"), where("uid", "==", user.uid), limit(ORDER_FETCH_CAP));
      unsubscribeOrders = onSnapshot(
        q,
        (snap) => {
          allOrders = snap.docs.map((d) => d.data()).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
          renderOrders();
        },
        (err) => {
          console.error("[Fastrr] Order History failed to load.", err);
          orderList.innerHTML =
            '<div class="team-order-empty"><p>Couldn\'t load your order history right now. Try reopening this panel — if it keeps failing, check the browser console for details.</p></div>';
        }
      );
      // "Place Your Order" was clicked signed-out, which opened the
      // sign-in popup instead with a note to resume here — now that
      // sign-in/signup just succeeded, pick that order right back up
      // instead of leaving the rep to click "Place Your Order" again.
      if (pendingOrderOpen) {
        const resume = pendingOrderOpen;
        pendingOrderOpen = null;
        resume();
      }
    } else {
      if (authFormCtl) authFormCtl.setMode("signin");
      if (profileMenu) profileMenu.setSignedIn(false);
      orderHistoryModal.close();
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
