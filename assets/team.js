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
          match /counters/{counterId} {
            allow read: if request.auth != null;
            allow create: if request.auth != null && request.resource.data.next == 1;
            allow update: if request.auth != null
              && request.resource.data.next == resource.data.next + 1;
          }
          match /orders/{orderId} {
            allow read, update, delete: if request.auth != null
              && (resource.data.uid == request.auth.uid
                  || request.auth.token.email in ['design.tools@pickrr.com']);
            allow create: if request.auth != null
              && request.resource.data.uid == request.auth.uid
              && request.resource.data.email == request.auth.token.email;
          }
        }
      }

      The admin email list inside the rule above must be kept in sync
      by hand with ADMIN_EMAILS below — Firestore rules can't read a
      JS constant, so this is the one place both actually enforce it.

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

// Accounts signed in with one of these emails see every rep's orders
// (an "All Orders" view alongside their own), not just the ones they
// placed. This list is just what decides whether the UI *offers* that
// view — the real access boundary is the matching allowlist in the
// Firestore security rules (see the SETUP comment above); a non-admin
// can't see other reps' orders no matter what this array says, because
// the server-side rule is what Firestore actually checks.
const ADMIN_EMAILS = ["design.tools@pickrr.com"];

const STATUS_LABEL = { placed: "Placed", in_progress: "In Progress", completed: "Completed", failed: "Failed", cancelled: "Cancelled" };
const STATUS_ORDER = ["placed", "in_progress", "completed", "failed", "cancelled"];

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
  const menuHeader = $("teamProfileMenuHeader");
  const historyBtn = $("teamProfileHistoryBtn");
  const signOutBtn = $("teamProfileSignOutBtn");
  if (!wrap || !trigger) return;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

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
    setSignedIn(signedIn, label, email) {
      trigger.dataset.signedIn = signedIn ? "1" : "0";
      // The nav trigger stays concise (first name only) since it's
      // competing for space with the rest of the nav bar — the full
      // name still shows in the dropdown header, where there's room.
      const firstName = (label || "").trim().split(/\s+/)[0];
      trigger.textContent = signedIn ? firstName || label : "Team Sign In";
      const initial = (label || "?").trim().charAt(0).toUpperCase();
      if (signedIn) trigger.dataset.initial = initial;
      if (menu) menu.hidden = !signedIn;
      if (signedIn && menuHeader) {
        menuHeader.innerHTML =
          `<div class="team-profile-menu-avatar">${escapeHtml(initial)}</div>` +
          `<div class="team-profile-menu-who"><div class="team-profile-menu-name">${escapeHtml(label || "")}</div>` +
          (email ? `<div class="team-profile-menu-email">${escapeHtml(email)}</div>` : "") +
          `</div>`;
      }
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

  // The field is pre-filled with "+91 " (see the input's default value
  // in the HTML, restored by form.reset() on every open) so the rep
  // only ever types the 10-digit number. Strips everything down to
  // digits and accepts the +91/0 prefix being retyped by accident, but
  // always normalizes to a clean "+91XXXXXXXXXX" for storage.
  function normalizePhone(raw) {
    let digits = String(raw || "").replace(/[^\d]/g, "");
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length !== 10) return null;
    return "+91" + digits;
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
    const subtotalText = $("qSubtotal")?.textContent.trim() || "";
    const discountRow = $("discountRow");
    const discountActive = !!(discountRow && discountRow.classList.contains("is-active"));
    const discountLabelText = discountActive ? $("qDiscountLabel")?.textContent.trim() || "" : "";
    const discountText = discountActive ? $("qDiscountAmt")?.textContent.trim() || "" : "";
    const gstToggleEl = $("qGstToggle");
    const gstEnabled = gstToggleEl ? gstToggleEl.checked : true;
    const gstText = $("qGstAmt")?.textContent.trim() || "";
    return { items, finalText, finalAmount, subtotalText, discountLabelText, discountText, gstEnabled, gstText };
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

  // Focusing the phone field (pre-filled with "+91 ") drops the cursor
  // straight after the prefix, so typing the 10-digit number is all
  // that's needed — no clicking past the prefix first.
  const ocPhoneInput = $("ocClientPhone");
  if (ocPhoneInput) {
    ocPhoneInput.addEventListener("focus", () => {
      const len = ocPhoneInput.value.length;
      ocPhoneInput.setSelectionRange(len, len);
    });
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
    const phoneRaw = $("ocClientPhone").value.trim();
    const website = $("ocClientWebsite").value.trim();
    const category = $("ocClientCategory").value;
    const notes = $("ocClientNotes").value.trim();
    if (!clientName || !email || !phoneRaw) {
      setStatus("Please fill in the client's name, email, and contact number.", true);
      return;
    }
    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      setStatus("Please enter a valid 10-digit contact number.", true);
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
        items: cart.items,
        subtotalText: cart.subtotalText,
        discountLabelText: cart.discountLabelText,
        discountText: cart.discountText,
        gstEnabled: cart.gstEnabled,
        gstText: cart.gstText,
        finalText: cart.finalText,
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
      console.error("[Fastrr] Order placement failed.", err);
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
  const { getFirestore, collection, addDoc, updateDoc, doc, runTransaction, query, where, limit, onSnapshot, serverTimestamp } = fsMod;

  const app = initializeApp(FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const filterRow = $("teamFilterRow");
  const orderList = $("teamOrderList");
  const searchInput = $("teamOrderSearch");
  const scopeRow = $("teamScopeRow");
  const dateFilterEl = $("teamDateFilter");
  const sortFilterEl = $("teamSortFilter");
  const memberFilterEl = $("teamMemberFilter");
  const customRangeRow = $("teamCustomRangeRow");
  const dateFromEl = $("teamDateFrom");
  const dateToEl = $("teamDateTo");

  function isAdmin(user) {
    return !!user && ADMIN_EMAILS.indexOf((user.email || "").toLowerCase()) !== -1;
  }

  // Every order gets a short, sequential, human-readable number (e.g.
  // FA-000123) generated from one shared Firestore counter document via
  // a transaction — transactions are atomic and auto-retry on conflict,
  // so this stays collision-free even with 20+ reps placing orders in
  // the same second. A gap in the sequence (transaction succeeds, the
  // follow-up addDoc fails) is a cosmetic, extremely rare edge case;
  // a genuine duplicate is not possible.
  //
  // Deliberately best-effort: this is a nice-to-have on top of order
  // placement, not a precondition for it. If the Firestore rules for
  // the "counters" collection haven't been (re)published yet — the
  // exact failure mode that broke real order placement in production
  // once this was added — this must NOT take the whole order down
  // with it, so any failure here is caught and logged, and the order
  // just saves without a number rather than failing outright.
  async function nextOrderNumber() {
    try {
      const counterRef = doc(db, "counters", "orders");
      const next = await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        const current = snap.exists() ? snap.data().next : 0;
        const n = current + 1;
        if (snap.exists()) tx.update(counterRef, { next: n });
        else tx.set(counterRef, { next: n });
        return n;
      });
      return "FA-" + String(next).padStart(6, "0");
    } catch (err) {
      console.error(
        "[Fastrr] Couldn't generate an order number — the order will still be saved without one. " +
          "This usually means the Firestore rules haven't been republished to include the 'counters' collection (see the SETUP comment at the top of this file).",
        err
      );
      return "";
    }
  }

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
  let renderedRows = [];
  let activeFilter = "all";
  let searchTerm = "";
  let scope = "mine"; // "mine" | "all" — "all" only ever takes effect for an admin
  let sortOrder = "newest";
  let dateRangeMode = "all";
  let memberFilter = "all";
  let hasAutoOpened = false;

  // updateProfile() (setting displayName right after sign-up) does not
  // itself re-fire onAuthStateChanged — true of real Firebase, not just
  // this mock — so the profile menu's name label needs an explicit
  // refresh right after it resolves, not just on auth-state changes.
  function refreshWho(user) {
    if (!user) return;
    const displayName = user.displayName || user.email.split("@")[0];
    if (profileMenu) profileMenu.setSignedIn(true, displayName, user.email);
  }
  authApi = { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, refreshDisplay: () => refreshWho(auth.currentUser) };

  // Shared by both order-entry points — the quick manual form below
  // and the order-confirm modal opened from "Place Your Order" — so
  // every order lands in Firestore with the same shape regardless of
  // which flow created it. Optional fields default to "" rather than
  // being omitted, since Firestore rejects `undefined` field values.
  // `items` and the pricing breakdown are stored alongside the flattened
  // `package` string so Order History and the invoice PDF can render an
  // itemised view without re-deriving it from text — `package` is kept
  // for orders logged before this field existed.
  async function logOrder(data) {
    const user = auth.currentUser;
    if (!user) return Promise.reject(new Error("not signed in"));
    const orderNumber = await nextOrderNumber();
    return addDoc(collection(db, "orders"), {
      orderNumber,
      uid: user.uid,
      email: user.email,
      client: data.client,
      package: data.package,
      items: data.items || [],
      subtotalText: data.subtotalText || "",
      discountLabelText: data.discountLabelText || "",
      discountText: data.discountText || "",
      gstEnabled: data.gstEnabled !== false,
      gstText: data.gstText || "",
      finalText: data.finalText || "",
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

  if (sortFilterEl) {
    sortFilterEl.addEventListener("change", () => {
      sortOrder = sortFilterEl.value;
      renderOrders();
    });
  }

  if (dateFilterEl) {
    dateFilterEl.addEventListener("change", () => {
      dateRangeMode = dateFilterEl.value;
      if (customRangeRow) customRangeRow.hidden = dateRangeMode !== "custom";
      renderOrders();
    });
  }
  if (dateFromEl) dateFromEl.addEventListener("change", renderOrders);
  if (dateToEl) dateToEl.addEventListener("change", renderOrders);

  if (memberFilterEl) {
    memberFilterEl.addEventListener("change", () => {
      memberFilter = memberFilterEl.value;
      renderOrders();
    });
  }

  if (scopeRow) {
    scopeRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".team-scope-chip");
      if (!chip || chip.dataset.scope === scope) return;
      scope = chip.dataset.scope;
      scopeRow.querySelectorAll(".team-scope-chip").forEach((c) => c.classList.toggle("is-active", c === chip));
      if (memberFilterEl) {
        memberFilterEl.hidden = scope !== "all";
        memberFilter = "all";
        memberFilterEl.value = "all";
      }
      subscribeOrders(auth.currentUser);
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

  // Populates the admin-only "team member" dropdown from whoever has
  // actually placed an order in the currently loaded (All Orders) set,
  // rather than a hardcoded roster — stays correct as reps join or leave
  // without needing an edit here.
  function populateMemberFilterOptions() {
    if (!memberFilterEl || scope !== "all") return;
    const emails = Array.from(new Set(allOrders.map((o) => o.email).filter(Boolean))).sort();
    const current = memberFilterEl.value || "all";
    memberFilterEl.innerHTML =
      '<option value="all">All team members</option>' + emails.map((e) => `<option value="${escapeHtml(e)}">${escapeHtml(e)}</option>`).join("");
    memberFilterEl.value = emails.indexOf(current) !== -1 ? current : "all";
    memberFilter = memberFilterEl.value;
  }

  function dateRangeBounds() {
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dateRangeMode === "today") {
      const start = startOfDay(now);
      return [start.getTime(), start.getTime() + 24 * 60 * 60 * 1000];
    }
    if (dateRangeMode === "week") {
      const day = now.getDay(); // 0 = Sunday
      const diffToMonday = day === 0 ? 6 : day - 1;
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday));
      return [start.getTime(), start.getTime() + 7 * 24 * 60 * 60 * 1000];
    }
    if (dateRangeMode === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return [start.getTime(), end.getTime()];
    }
    if (dateRangeMode === "lastmonth") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return [start.getTime(), end.getTime()];
    }
    if (dateRangeMode === "custom") {
      const fromVal = dateFromEl && dateFromEl.value ? new Date(dateFromEl.value + "T00:00:00").getTime() : -Infinity;
      const toVal = dateToEl && dateToEl.value ? new Date(dateToEl.value + "T23:59:59").getTime() : Infinity;
      return [fromVal, toVal];
    }
    return null; // "all" — no bound
  }

  function renderOrders() {
    let rows = activeFilter === "all" ? allOrders.slice() : allOrders.filter((o) => o.status === activeFilter);

    const bounds = dateRangeBounds();
    if (bounds) {
      const [start, end] = bounds;
      rows = rows.filter((o) => {
        const t = tsMillis(o.createdAt);
        return t >= start && t < end;
      });
    }

    if (scope === "all" && memberFilter !== "all") {
      rows = rows.filter((o) => o.email === memberFilter);
    }

    if (searchTerm) {
      rows = rows.filter((o) => {
        const haystack = [o.orderNumber, o.client, o.package, o.email, (o.items || []).map((i) => i.name).join(" ")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchTerm);
      });
    }

    rows.sort((a, b) => {
      if (sortOrder === "oldest") return tsMillis(a.createdAt) - tsMillis(b.createdAt);
      if (sortOrder === "amount-desc") return (b.amount || 0) - (a.amount || 0);
      if (sortOrder === "amount-asc") return (a.amount || 0) - (b.amount || 0);
      return tsMillis(b.createdAt) - tsMillis(a.createdAt); // newest (default)
    });

    renderedRows = rows;

    if (!rows.length) {
      const msg = !allOrders.length
        ? "No orders placed yet. Orders you place from the homepage will show up here."
        : searchTerm
        ? "No orders match your search."
        : "No orders match these filters.";
      orderList.innerHTML =
        '<div class="team-order-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M9 11H3v10h6V11ZM21 3h-6v18h6V3ZM15 15H9v6h6v-6Z"/></svg><p>' +
        msg +
        "</p></div>";
      return;
    }
    orderList.innerHTML = rows
      .map((o, idx) => {
        const detailRows = [
          ["Client email", o.clientEmail],
          ["Client phone", o.clientPhone],
          ["Website", o.clientWebsite],
          ["Category", o.clientCategory],
          ["Placed by", o.email],
          ["Placed on", fmtDate(o.createdAt)],
        ]
          .filter(([, v]) => v)
          .map(([label, v]) => `<div class="team-order-detail-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(v)}</b></div>`)
          .join("");
        const notesRow = o.notes ? `<div class="team-order-detail-row span-2"><span>Notes</span><b>${escapeHtml(o.notes)}</b></div>` : "";
        const items = o.items && o.items.length ? o.items : null;
        const itemsHtml = items
          ? `<div class="team-order-items">${items.map((i) => `<span class="team-order-item-chip">${escapeHtml(i.name)} ×${escapeHtml(i.qty)}</span>`).join("")}</div>`
          : "";
        const metaBase = items ? fmtDate(o.createdAt) : `${escapeHtml(o.package)} · ${fmtDate(o.createdAt)}`;
        const placedByMeta = scope === "all" ? ` · Placed by ${escapeHtml(o.email || "—")}` : "";
        return `
      <div class="team-order-card" data-order-idx="${idx}">
        <div class="team-order-card-top">
          <div class="team-order-main">
            <div class="team-order-title-line">
              <div class="team-order-client">${escapeHtml(o.client)}</div>
              ${o.orderNumber ? `<span class="team-order-number">${escapeHtml(o.orderNumber)}</span>` : ""}
            </div>
          </div>
          <div class="team-order-right">
            <span class="team-order-amount">${fmtINR(o.amount)}</span>
            <select class="team-order-status-select status-${o.status}" aria-label="Order status">
              ${STATUS_ORDER.map((s) => `<option value="${s}"${s === o.status ? " selected" : ""}>${STATUS_LABEL[s]}</option>`).join("")}
            </select>
            <button type="button" class="team-order-invoice-btn" aria-label="Download invoice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
            </button>
            <button type="button" class="team-order-view-btn" aria-label="View order details" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="team-order-meta">${metaBase}${placedByMeta}</div>
        ${itemsHtml}
        <div class="team-order-details">
          <div class="team-order-detail-row span-2"><span>Package</span><b>${escapeHtml(o.package)}</b></div>
          ${detailRows}
          ${notesRow}
        </div>
      </div>`;
      })
      .join("");
  }

  function generateInvoicePdf(order) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      window.alert("PDF export isn't available right now — please reload the page and try again.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 16;
    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20);
    doc.text("Invoice", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(order.orderNumber || "—", pageW - marginX, y, { align: "right" });
    y += 6;
    doc.setFontSize(9.5);
    doc.text("Fastrr Ads", marginX, y);
    doc.text(fmtDate(order.createdAt) || "—", pageW - marginX, y, { align: "right" });
    y += 10;
    doc.setDrawColor(225);
    doc.line(marginX, y, pageW - marginX, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("Billed To", marginX, y);
    y += 6;
    doc.autoTable({
      startY: y,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: { top: 1, bottom: 1 } },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 34 }, 1: { textColor: 60 } },
      body: [
        ["Client", order.client || "—"],
        ["Email", order.clientEmail || "—"],
        ["Phone", order.clientPhone || "—"],
        ["Website", order.clientWebsite || "—"],
      ],
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("Order Items", marginX, y);
    y += 4;
    const items = order.items && order.items.length ? order.items : [{ name: order.package || "Order", qty: "1", price: order.finalText || fmtINR(order.amount) }];
    doc.autoTable({
      startY: y,
      head: [["#", "Creative", "Qty", "Price"]],
      body: items.map((it, i) => [String(i + 1), it.name, String(it.qty), it.price]),
      styles: { fontSize: 9.5, cellPadding: 4, valign: "middle" },
      headStyles: { fillColor: [26, 20, 46], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 9 }, 2: { cellWidth: 20, halign: "center" }, 3: { cellWidth: 40, halign: "right" } },
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text("Pricing", marginX, y);
    y += 4;
    const priceRows = [];
    if (order.subtotalText) priceRows.push(["Subtotal", order.subtotalText]);
    if (order.discountText) priceRows.push([order.discountLabelText || "Discount", order.discountText]);
    priceRows.push(order.gstEnabled ? ["GST (18%)", order.gstText || "—"] : ["GST", "Not applied"]);
    doc.autoTable({
      startY: y,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2.4 },
      columnStyles: { 0: { textColor: 90 }, 1: { halign: "right", textColor: 40 } },
      body: priceRows,
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY + 2;
    doc.setDrawColor(210);
    doc.line(marginX, y, pageW - marginX, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text("Total", marginX, y);
    doc.text(order.finalText || fmtINR(order.amount), pageW - marginX, y, { align: "right" });
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20);
    doc.text("Status: " + (STATUS_LABEL[order.status] || order.status), marginX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Placed by " + (order.email || "—"), marginX, y);

    const filenameSafe = (order.orderNumber || "invoice").replace(/[^A-Za-z0-9-]/g, "");
    doc.save(`Invoice-${filenameSafe}.pdf`);
  }

  orderList.addEventListener("click", (e) => {
    const invoiceBtn = e.target.closest(".team-order-invoice-btn");
    if (invoiceBtn) {
      const card = invoiceBtn.closest(".team-order-card");
      const order = renderedRows[Number(card.dataset.orderIdx)];
      if (order) generateInvoicePdf(order);
      return;
    }
    const btn = e.target.closest(".team-order-view-btn");
    if (!btn) return;
    const card = btn.closest(".team-order-card");
    const nowOpen = !card.classList.contains("is-open");
    card.classList.toggle("is-open", nowOpen);
    btn.setAttribute("aria-expanded", String(nowOpen));
  });

  // Moving an order through its stages (Placed → In Progress →
  // Completed, or Cancelled/Failed at any point) writes straight to
  // its Firestore doc — the live onSnapshot listener above re-renders
  // every signed-in view of that order automatically, so nobody needs
  // to refresh to see a status a teammate just changed.
  orderList.addEventListener("change", async (e) => {
    const select = e.target.closest(".team-order-status-select");
    if (!select) return;
    const card = select.closest(".team-order-card");
    const order = renderedRows[Number(card.dataset.orderIdx)];
    if (!order || !order.id) return;
    const newStatus = select.value;
    const previousClass = select.className;
    select.className = `team-order-status-select status-${newStatus}`;
    select.disabled = true;
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
    } catch (err) {
      select.className = previousClass;
      select.value = order.status;
      window.alert("Couldn't update the order's status — please try again.");
    } finally {
      select.disabled = false;
    }
  });

  // Deliberately NOT combined with orderBy("createdAt") here — a
  // where()+orderBy() on different fields is a composite query that
  // Firestore refuses to run without a manually-created index, and
  // onSnapshot's error callback below was previously unwired, so that
  // failure was silent: the write would succeed but the order would
  // just never appear. Sorting client-side instead means this view
  // never depends on any index existing — true for both the per-rep
  // query and the admin's unfiltered "All Orders" query.
  function subscribeOrders(user) {
    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }
    if (!user) return;
    const wantAll = scope === "all" && isAdmin(user);
    const q = wantAll
      ? query(collection(db, "orders"), limit(ORDER_FETCH_CAP))
      : query(collection(db, "orders"), where("uid", "==", user.uid), limit(ORDER_FETCH_CAP));
    unsubscribeOrders = onSnapshot(
      q,
      (snap) => {
        allOrders = snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt));
        populateMemberFilterOptions();
        renderOrders();
      },
      (err) => {
        console.error("[Fastrr] Order History failed to load.", err);
        orderList.innerHTML =
          '<div class="team-order-empty"><p>Couldn\'t load your order history right now. Try reopening this panel — if it keeps failing, check the browser console for details.</p></div>';
      }
    );
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      refreshWho(user);
      scope = "mine";
      if (scopeRow) {
        scopeRow.hidden = !isAdmin(user);
        scopeRow.querySelectorAll(".team-scope-chip").forEach((c) => c.classList.toggle("is-active", c.dataset.scope === "mine"));
      }
      if (memberFilterEl) memberFilterEl.hidden = true;
      allOrders = [];
      renderOrders();
      subscribeOrders(user);
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
      if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = null;
      }
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
