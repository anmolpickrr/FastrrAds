/* ============================================================
   Fastrr Creative — Services & Quotation Platform
   Application logic (data-driven: showcase, scope, calculator,
   message generator, theme, lightbox).
   Depends on creative-data.js being loaded first (REELS, STATICS,
   CAROUSELS, CATS).
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     -1. LAZY jsPDF LOADER
     jsPDF + its autotable plugin (~400KB combined) used to load as
     two unconditional <script> tags on every single page view, even
     though PDF export is a rarely-clicked action (Package Summary
     here, the internal Invoice download in team.js). Fetching and
     parsing that on every load was pure dead weight for the other
     ~95% of visits. Both PDF features now call this on demand
     instead — first call kicks off the fetch, every call (including
     concurrent ones) shares the same promise so the scripts are only
     ever requested once per page. Exposed on window since team.js is
     a separate module script with no access to this closure.
  ---------------------------------------------------------- */
  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }
  window.__ensureJsPDF = function () {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
    if (!window.__jspdfLoadPromise) {
      window.__jspdfLoadPromise = loadScriptOnce("assets/vendor/jspdf.umd.min.js").then(() =>
        loadScriptOnce("assets/vendor/jspdf.plugin.autotable.min.js")
      );
    }
    return window.__jspdfLoadPromise;
  };

  /* ----------------------------------------------------------
     0. ACCESS MODE (public vs internal team)
     Two genuinely separate URLs/files (see scripts/build_pages.py) —
     internal markup doesn't even exist in the public build's HTML.
     is-internal is purely a function of which URL loaded this script,
     recomputed fresh on every page load:
       - creative.fastrr.com/           → public, always.
       - creative.fastrr.com/teamfastrr → internal, always — the exact
         same file is served at both paths (see the <base href="/">
         note in index.html's <head>), so landing on /teamfastrr never
         navigates anywhere; it just renders unlocked in place.
     Deliberately NOT persisted (no localStorage, no ?team=1 query
     param) — an earlier version remembered the unlock across the
     whole origin, which meant a device that had ever visited
     /teamfastrr would then also render the PUBLIC page as internal
     (hiding the public offer banner, among other things) purely
     because of a stale flag from a previous visit to the other URL.
     Since the two URLs are real, separate files now, there's nothing
     to "remember" — visiting /teamfastrr again is exactly as easy as
     following the link, so persistence was only a liability.
  ---------------------------------------------------------- */
  (function initAccessMode() {
    const unlocked = /^\/teamfastrr\/?$/.test(window.location.pathname);
    document.documentElement.classList.toggle("is-internal", unlocked);
    // One-time cleanup: clear the old persisted flag from any device
    // that unlocked internal mode before this page stopped writing it,
    // so a stale "internal" flag left over from a past /teamfastrr
    // visit can't keep silently affecting this URL going forward.
    try {
      localStorage.removeItem("fastrr-internal");
    } catch (e) {}
  })();

  /* ----------------------------------------------------------
     1. SERVICE / PACKAGE DATA MODEL
     Static & Carousel pricing preserved verbatim from the
     source prototype. AI Reel + 360° Catalogue pricing/rules
     per the brief (supersedes the prototype for these two).
  ---------------------------------------------------------- */
  const DATA = {
    catalogue: {
      name: "360° Catalogue Video",
      short: "AI-generated 360° product rotation, catalogue-ready.",
      benefit: "Fastest way to make a product page feel alive.",
      unit: "SKU",
      basePrice: 1800,
      duration: "8–15 sec",
      format: "1 of 1:1 / 4:5 / 9:16",
      revisions: "No revisions",
      scripting: "No scripting",
      language: "Not applicable (silent, no voiceover)",
      turnaround: "24–48 working hours per SKU after we receive all required details, assets, and final confirmation from you",
      included: [
        "AI-generated 360° rotation per SKU",
        "Silent, looped motion, 8–15 sec",
        "1 aspect ratio of your choice",
        "Clean/white or brand-background finish",
        "Lifestyle/product-use shots showing the product worn or used, where relevant",
      ],
      excluded: [
        "Text overlays",
        "Voiceover",
        "Custom music",
        "Offers or promotional elements",
        "Scripting",
        "Additional aspect ratios (quoted separately)",
      ],
      need: [
        "SKU list with the product names that need a rotation",
        "Reference/inspiration for the rotation style (if any)",
      ],
      deliver: "1 MP4 per SKU in the chosen aspect ratio, 8–15 sec, silent (no text, voiceover, or music), delivered via shared drive folder",
      // Standard 360° rotation is deliberately silent/text-free/script-free (see
      // `excluded` above); the one exception is that a human CAN appear wearing or
      // using the product via lifestyle/product-use shots where relevant — that's
      // not the same as a scripted presenter piece, so it stays editor-only, no
      // writer/CD role.
      support: ["editor", "call"],
    },
    static: {
      name: "Static Creative",
      short: "Single-frame, on-brand design creative.",
      benefit: "Clean, fast-turnaround creative for feed & ads.",
      unit: "creative",
      basePrice: 499,
      duration: "Single frame",
      format: "1:1 + 9:16 (2 sizes)",
      revisions: "1 revision",
      scripting: "Not applicable",
      language: "Not applicable",
      turnaround: "24 working hours per creative after we receive all required details, assets, and final confirmation from you",
      included: [
        "1 designed static creative",
        "2 aspect ratios (1:1 and 9:16)",
        "On-brand layout, colour & typography",
      ],
      excluded: [
        "Extra aspect ratios beyond 1:1 & 9:16",
        "New concepts or major creative rework (new order)",
        "Photography or product shoots",
      ],
      need: [
        "Brief/summary of the creative idea or requirement",
        "Key message/offer to highlight",
        "References/inspiration (if any)",
      ],
      deliver: "2 files (1:1 and 9:16), PNG/JPG, print-ready resolution, delivered via shared drive folder",
      // Design-only, no scripting (`scripting: "Not applicable"`) — editor/designer
      // builds the creative, no dedicated writer or CD script oversight needed.
      support: ["editor", "call"],
    },
    carousel: {
      name: "Carousel Creative",
      short: "Up to 5-slide narrative carousel.",
      benefit: "Built to hold attention across the swipe.",
      unit: "carousel",
      basePrice: 1499,
      duration: "Up to 5 slides",
      format: "1:1 + 9:16 (2 sizes)",
      revisions: "1 revision",
      scripting: "Not applicable",
      language: "Not applicable",
      turnaround: "24–48 working hours per carousel after we receive all required details, assets, and final confirmation from you",
      included: [
        "Up to 5-slide carousel",
        "2 aspect ratios (1:1 and 9:16)",
        "Consistent visual narrative across slides",
      ],
      excluded: [
        "More than 5 slides (separate deliverable)",
        "Extra aspect ratios beyond 1:1 & 9:16",
        "New concepts or major creative rework (new order)",
      ],
      need: [
        "Brief/summary of the narrative, or up to 5 key points/features to spotlight",
        "References/inspiration (if any)",
      ],
      deliver: "Up to 5 slides × 2 sizes, PNG/JPG set, numbered & sequenced, delivered via shared drive folder",
      // Same reasoning as Static — design-only, `scripting: "Not applicable"`.
      support: ["editor", "call"],
    },
    reel1: {
      name: "AI Reel — Quick Cut", tier: 1, unit: "reel", basePrice: 2500,
      short: "Script from your brief, with one minor revision included.",
      benefit: "The quickest, most affordable way into AI reels.",
      duration: "Max 25 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (minor, in frame changes only)", scripting: "Script written from your brief, with no separate approval step",
      language: "Hindi / English voiceover",
      turnaround: "1 to 2 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Script written from the brief we discuss together, with no separate approval step",
        "Single 9:16 export, max 25 sec",
        "1 revision for minor, in frame changes such as text or element placement",
      ],
      excluded: ["Script shared for approval", "Major creative changes or new concepts, which would be a new order", "Additional dimensions, quoted separately"],
      need: [
        "A clear, fully discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 25 sec, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Quick Cut is the only reel tier with no client-facing script approval
      // step — every tier from Story Cut up shares the script for approval
      // before the reel is built. Writer and Editor are still involved here,
      // just working from the discussed brief rather than an approved script.
      support: ["writer", "editor", "call"],
    },
    reel2: {
      name: "AI Reel — Story Cut", tier: 2, unit: "reel", basePrice: 3500,
      short: "Script shared for approval, with one small revision included.",
      benefit: "A safety net to get the script and hook right before we build.",
      duration: "Max 30 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (small script or communication changes)", scripting: "1 script shared for approval",
      language: "Hindi / English voiceover",
      turnaround: "Up to 3 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with Writer and Editor input",
        "Single 9:16 export, max 30 sec",
        "1 script shared for approval",
        "1 revision for small script or communication changes, such as the hook, CTA, or minor additions and removals",
      ],
      excluded: ["Additional hook options", "Major creative rework or new concepts, which would be a new order", "Additional dimensions, quoted separately"],
      need: [
        "A clear, fully discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 30 sec, plus 1 script shared for approval, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // First tier with an actual script approval step — the client sees
      // and signs off on the script before the reel is built, with room for
      // one small revision afterward. Still a single hook, not the 2 that
      // Director's Cut and up include.
      support: ["writer", "editor", "call"],
    },
    reel3: {
      name: "AI Reel — Director's Cut", tier: 3, unit: "reel", basePrice: 5000,
      short: "Script and 2 hook options shared for approval, with creative input throughout.",
      benefit: "Creative guidance and content writer involvement for a stronger direction.",
      duration: "Max 35 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (small script or communication changes)", scripting: "1 script plus 2 hook options shared for approval",
      language: "Hindi / English voiceover",
      turnaround: "Up to 4 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with content writer involvement and editor input",
        "Creative guidance, suggestions, and input on the script and direction",
        "Single 9:16 export, max 35 sec",
        "1 script plus 2 hook options shared for approval",
        "1 revision for small script or communication changes",
      ],
      excluded: ["Creative Director oversight", "Major creative rework or new concepts, which would be a new order", "Additional dimensions, quoted separately"],
      need: [
        "A clear, discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 35 sec, plus 1 script and 2 hook options for approval, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Adds a second hook option and hands-on creative guidance on top of
      // Story Cut's single script approval. Still short of Studio Cut's
      // dedicated Creative Director oversight and custom music.
      support: ["writer", "editor", "call"],
    },
    reel4: {
      name: "AI Reel — Studio Cut", tier: 4, unit: "reel", basePrice: 8000,
      short: "Script and 2 hook options shared for approval, with full Creative Director involvement.",
      benefit: "Full creative oversight, custom brand music, and the most revision room.",
      duration: "Max 45 sec", format: "9:16 (1 dimension)",
      revisions: "2 revisions (small script or communication changes)", scripting: "1 script plus 2 hook options shared for approval",
      language: "Hindi / English voiceover",
      turnaround: "Up to 5 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with full Writer, Editor, and Creative Director involvement",
        "Creative Director guidance, suggestions, and input throughout",
        "Single 9:16 export, max 45 sec",
        "1 script plus 2 hook options shared for approval",
        "Custom music composed for your brand (music only, no lip sync with the model)",
        "Call support for requirement discussions",
        "2 revisions for small script or communication changes",
      ],
      excluded: ["Major creative rework or new concepts, which would be a new order", "Additional dimensions, quoted separately", "Lip sync of the model to the custom music"],
      need: [
        "A clear, discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 45 sec, plus 1 script and 2 hook options for approval, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Top tier: full Writer, Editor, and Creative Director involvement, 2
      // revisions instead of 1, and custom brand music alongside the longest
      // duration and turnaround window of any reel tier.
      support: ["writer", "editor", "director", "call", "music"],
    },
  };

  // Standard GST rate for creative/advertising agency services in India.
  // Applied once to the order's taxable value (post-discount subtotal) —
  // see computeCart().
  const GST_RATE = 0.18;

  // Brand/product-level assets that only need to be collected once per
  // order, no matter how many creative types or tiers are in it — every
  // DATA[x].need array above is now creative-specific only (brief,
  // references, tone/key-message, voiceover language, SKU list) and
  // deliberately excludes these, so they're requested exactly once
  // instead of once per line item.
  // Split in two: brand assets are a true one-time ask regardless of
  // order size, but the page link and images are per selected product —
  // an order covering 3 SKUs needs 3 of each, not 1. Grouping them
  // together as "once per order" was the actual source of confusion.
  const BRAND_NEED = [
    "Brand logo",
    "Brand colour palette (if available)",
    "Brand fonts (if available)",
    "Selected product(s) to be featured",
  ];
  const PER_PRODUCT_NEED = [
    "Product page / website link",
    "Product images, high-resolution with a clean background, or raw product images/footage, as available",
  ];
  const COMMON_NEED = [...BRAND_NEED, ...PER_PRODUCT_NEED];

  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  // jsPDF's built-in fonts (WinAnsi/Latin-only) can't render ₹ — it falls
  // back to an unrelated glyph — so the PDF path formats amounts with
  // "Rs." instead. Everywhere else on the page keeps the ₹ symbol.
  function fmtINRPdf(n) {
    return "Rs. " + Math.round(n).toLocaleString("en-IN");
  }

  // Shared "Discount" / "Discount (10%)" label used by the calculator
  // summary, the WhatsApp messages, and the PDF — flat-amount discounts
  // don't have a percentage to show, so they just read "Discount". Public
  // visitors never set a discount manually, so their version reads as an
  // offer they earned rather than a generic "Discount" line.
  function discountLabel(cart) {
    if (cart.discountType === "pct" && cart.discountValue > 0) {
      return isInternal() ? `Discount (${cart.discountValue}%)` : `Order Discount (${cart.discountValue}%)`;
    }
    return "Discount";
  }

  // Public visitors get an automatic offer instead of a manually
  // editable discount field (see .oc-offer / #discountFieldRow) —
  // internal team keeps full manual control for real negotiated
  // pricing. Re-checked on every render rather than cached, since
  // is-internal can only change via a full page load anyway.
  function isInternal() {
    return document.documentElement.classList.contains("is-internal");
  }
  const PUBLIC_OFFER_THRESHOLD = 10000;
  const PUBLIC_OFFER_PCT = 10;
  const PUBLIC_OFFER_CODE = "SAVE10";

  /* ----------------------------------------------------------
     2. SHARED APPLICATION STATE
     Single source of truth. Every dependent view (Services
     scope panel, Calculator, Message generator) re-renders
     from this object — this is the fix for the "View Full
     Scope" bug in the source prototype, where scope panels
     were static hard-coded per-tier HTML blocks with CSS-only
     radio toggles that never received the currently selected
     service/tier from the calculator, so the two could show
     mismatched info (or the panel simply never updated when a
     different package was chosen). Here there is exactly one
     state object and one render pass.
  ---------------------------------------------------------- */
  const state = {
    service: "reels", // reels | catalogue | static | carousel — also the order-builder's current selection
    tier: 3, // only relevant when service === 'reels'
    qty: 1, // builder quantity, for the item about to be added to the order
    cart: [], // order line items: { id, service, tier|null, qty }
    discountType: "pct", // pct | flat — how discountValue below is interpreted
    discountValue: 0, // order-level discount, applied once to the whole cart's subtotal — a percent (0-100) or a flat ₹ amount depending on discountType
    gstEnabled: true, // 18% GST toggle — off for clients billed without a GST invoice
    scopeTab: "inc", // inc | exc | need
    brandName: "",
    website: "",
    brandCategory: "",
    specialReq: "",
  };
  let cartIdSeq = 1;

  /* ----------------------------------------------------------
     0b. AUTOSAVE — the order builder (cart, discount, GST) and the
     brand/message fields persist to localStorage on every change and
     restore on load, so a refresh or accidental tab close mid-order
     doesn't lose what's been built. Scoped per browser, not per
     account — same trade-off as the rest of this static site.
  ---------------------------------------------------------- */
  const STATE_STORAGE_KEY = "fastrr-order-draft";
  function persistState() {
    try {
      localStorage.setItem(
        STATE_STORAGE_KEY,
        JSON.stringify({
          cart: state.cart,
          cartIdSeq,
          discountType: state.discountType,
          discountValue: state.discountValue,
          gstEnabled: state.gstEnabled,
          brandName: state.brandName,
          website: state.website,
          brandCategory: state.brandCategory,
          specialReq: state.specialReq,
        })
      );
    } catch (e) {}
  }
  function clearPersistedState() {
    try {
      localStorage.removeItem(STATE_STORAGE_KEY);
    } catch (e) {}
  }
  function restoreState() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STATE_STORAGE_KEY) || "null");
    } catch (e) {
      saved = null;
    }
    if (!saved) return;
    if (Array.isArray(saved.cart)) state.cart = saved.cart;
    if (typeof saved.cartIdSeq === "number") cartIdSeq = saved.cartIdSeq;
    if (saved.discountType) state.discountType = saved.discountType;
    if (typeof saved.discountValue === "number") state.discountValue = saved.discountValue;
    if (typeof saved.gstEnabled === "boolean") state.gstEnabled = saved.gstEnabled;
    if (typeof saved.brandName === "string") state.brandName = saved.brandName;
    if (typeof saved.website === "string") state.website = saved.website;
    if (typeof saved.brandCategory === "string") state.brandCategory = saved.brandCategory;
    if (typeof saved.specialReq === "string") state.specialReq = saved.specialReq;

    // Sync the restored values into the actual inputs — state alone
    // doesn't drive these fields' displayed value, the user's typing
    // does, so a restore has to set .value directly. Internal-only
    // fields, no-op (null) on the public build.
    const bn = document.getElementById("brandNameInput");
    if (bn) bn.value = state.brandName;
    const site = document.getElementById("websiteInput");
    if (site) site.value = state.website;
    const cat = document.getElementById("brandCategorySelect");
    if (cat) cat.value = state.brandCategory;
    const req = document.getElementById("specialReqInput");
    if (req) req.value = state.specialReq;
  }
  /* ----------------------------------------------------------
     0c. VIDEO PLAYBACK CONCURRENCY CAP — shared by the hero orbit and
     the filmstrip below it (see their IntersectionObserver setup).
     Both grids pack far more video tiles than fit in one screen, and
     on a wide viewport most of them sit "visible" in the very first
     frame — staggering each tile's start time (already in place)
     spreads out *when* they begin, but every tile still eventually
     starts downloading/playing, saturating bandwidth for several
     seconds after load. Capping how many can be active at once (the
     rest wait in a queue and take the next free slot as playing
     tiles scroll out and pause) keeps initial load light regardless
     of how many video tiles the page has.
  ---------------------------------------------------------- */
  const MAX_CONCURRENT_VIDEOS = 6;
  let activeVideoCount = 0;
  const pendingVideoQueue = [];
  function requestVideoPlay(vid) {
    if (pendingVideoQueue.includes(vid)) return;
    if (activeVideoCount < MAX_CONCURRENT_VIDEOS) {
      activeVideoCount++;
      vid.play && vid.play().catch(() => {});
    } else {
      pendingVideoQueue.push(vid);
    }
  }
  function releaseVideoSlot(vid) {
    const wasQueued = pendingVideoQueue.indexOf(vid);
    if (wasQueued !== -1) {
      pendingVideoQueue.splice(wasQueued, 1);
      return;
    }
    if (activeVideoCount > 0) activeVideoCount--;
    const next = pendingVideoQueue.shift();
    if (next) requestVideoPlay(next);
  }
  // Tracks the previous render's unlocked/not state so the "just
  // unlocked" pop animation only plays on the actual crossing, not on
  // every re-render while the order stays above the threshold.
  let offerWasUnlocked = false;

  function keyFor(service, tier) {
    return service === "reels" ? "reel" + tier : service;
  }
  function dataFor(service, tier) {
    return DATA[keyFor(service, tier)];
  }
  function currentKey() {
    return keyFor(state.service, state.tier);
  }
  function currentData() {
    return DATA[currentKey()];
  }

  // Preview for whatever's currently configured in the order builder,
  // before it's added to the cart — just unit price × qty, no discount
  // (discount is order-level now, applied once in computeCart()).
  function computeBuilderPreview() {
    const d = currentData();
    const qty = Math.max(1, state.qty || 1);
    return { d, qty, lineSubtotal: d.basePrice * qty };
  }

  // Resolves every cart line item's live data + price, then applies the
  // single order-level discount once across the combined subtotal —
  // this is the actual "order total" shown in the summary and used by
  // the message generator, and the only place quote math happens for
  // more than one creative type at a time.
  function computeCart() {
    const items = state.cart.map((item) => {
      const d = dataFor(item.service, item.tier);
      const lineSubtotal = d.basePrice * item.qty;
      return { ...item, d, lineSubtotal };
    });
    const subtotal = items.reduce((sum, i) => sum + i.lineSubtotal, 0);
    let discountType = state.discountType === "flat" ? "flat" : "pct";
    let rawDiscountValue = Math.max(0, state.discountValue || 0);
    if (!isInternal()) {
      // Overrides whatever's in state — public visitors never edit this
      // directly, so state.discountValue here is stale/irrelevant, not
      // something to respect.
      discountType = "pct";
      rawDiscountValue = subtotal >= PUBLIC_OFFER_THRESHOLD ? PUBLIC_OFFER_PCT : 0;
    }
    const discountValue = discountType === "pct" ? Math.min(100, rawDiscountValue) : rawDiscountValue;
    const discountAmt =
      discountType === "flat" ? Math.min(subtotal, discountValue) : subtotal * (discountValue / 100);
    const taxable = subtotal - discountAmt;
    // GST is compulsory on every public order — only internal team can
    // switch it off (e.g. to issue a non-GST invoice for a specific
    // client arrangement), so state.gstEnabled is only ever respected
    // in that mode.
    const gstEnabled = isInternal() ? state.gstEnabled !== false : true;
    const gstAmt = gstEnabled ? taxable * GST_RATE : 0;
    const final = taxable + gstAmt;
    return { items, subtotal, discountType, discountValue, discountAmt, taxable, gstEnabled, gstAmt, final };
  }

  function addToOrder() {
    const service = state.service;
    const tier = service === "reels" ? state.tier : null;
    const qty = Math.max(1, state.qty || 1);
    const existing = state.cart.find((i) => i.service === service && i.tier === tier);
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({ id: cartIdSeq++, service, tier, qty });
    }
    state.qty = 1;
    render();
    const btn = document.getElementById("obAddBtn");
    if (btn) {
      btn.classList.remove("flash");
      void btn.offsetWidth;
      btn.classList.add("flash");
    }
  }

  function removeCartItem(id) {
    state.cart = state.cart.filter((i) => i.id !== id);
    render();
  }

  function clearCart() {
    state.cart = [];
    render();
  }

  function changeCartQty(id, delta) {
    const item = state.cart.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    render();
  }



  /* ----------------------------------------------------------
     3. RENDER: SERVICE SELECTOR + SCOPE PANEL
     One service selected at a time via the numbered tabs, one panel
     below showing everything about it — not a grid of always-visible
     cards. Included/Not Included/Client Provides are their own tab so
     only one list is on screen at once; the Included tab additionally
     carries the operational facts (plain bordered rows, not a second
     boxed panel) plus who delivers it.
  ---------------------------------------------------------- */
  const svcNav = document.getElementById("svcNav");
  const tierRow = document.getElementById("tierRow");
  const scopePanel = document.getElementById("scopePanel");
  const pkgModalBackdrop = document.getElementById("pkgModalBackdrop");
  const pkgModal = document.getElementById("pkgModal");
  const pkgModalScroll = document.getElementById("pkgModalScroll");
  const pkgModalGlow = document.getElementById("pkgModalGlow");
  const pkgModalClose = document.getElementById("pkgModalClose");
  const svcPanelInner = document.getElementById("svcPanelInner");
  let pkgOriginCard = null;
  let pkgModalOpen = false;

  // AI Reels' 4 tiers carry different amounts of included/excluded
  // copy, so the panel's natural content height differs per tier —
  // left alone, switching tiers would resize (and, since the modal is
  // flex-centered in its backdrop, reposition) the whole modal. This
  // renders each tier's content once up front (synchronously, before
  // the modal is ever shown) just to measure it, restores whichever
  // tier was actually selected, and returns the tallest height seen —
  // openPkgModal() locks the scroll region to that height before the
  // FLIP-morph measures the modal's box, so the footprint never moves
  // while switching tiers afterward.
  function measureMaxTierHeight() {
    if (state.service !== "reels") return 0;
    const savedTier = state.tier;
    const savedScopeTab = state.scopeTab;
    let maxH = 0;
    [1, 2, 3, 4].forEach((t) => {
      state.tier = t;
      renderServiceSummary();
      renderServiceGlance();
      renderScopePanel();
      maxH = Math.max(maxH, svcPanelInner.scrollHeight);
    });
    state.tier = savedTier;
    state.scopeTab = savedScopeTab;
    renderServiceSummary();
    renderServiceGlance();
    renderScopePanel();
    return maxH;
  }

  // The card-to-modal "grow" morph (FLIP: First-Last-Invert-Play).
  // 1. Show the modal (opacity/visibility only) so its natural,
  //    centered layout box can be measured.
  // 2. Compute the transform that would make that box exactly
  //    overlay the clicked card's box, and apply it with transitions
  //    off — visually the modal snaps into looking like the card.
  // 3. Force a reflow, turn transitions back on, then clear the
  //    transform — the browser animates from "shaped like the card"
  //    to "its real size", which is what reads as the card growing
  //    into the detail view rather than a dialog just fading in.
  // transitionend isn't fully reliable to hang cleanup on — it can be
  // skipped if a transition gets interrupted/re-triggered mid-flight
  // (e.g. closing again before the previous close finished animating),
  // which would otherwise leave the modal's "open" class stuck forever
  // even though it's no longer visible. pendingCloseCleanup lets a new
  // open flush any not-yet-run close cleanup synchronously first, and
  // closePkgModal backs its own transitionend listener with a fallback
  // timer so cleanup always runs even if that event never fires.
  let pendingCloseCleanup = null;

  function openPkgModal(card) {
    if (pendingCloseCleanup) {
      pendingCloseCleanup();
      pendingCloseCleanup = null;
    }
    pkgOriginCard = card;
    const accent = getComputedStyle(card).getPropertyValue("--accent").trim() || "var(--violet)";
    pkgModal.style.setProperty("--accent", accent);
    pkgModalGlow.style.background = accent;
    const maxTierH = measureMaxTierHeight();
    if (maxTierH) {
      pkgModalScroll.style.setProperty("--modal-locked-h", Math.ceil(maxTierH) + "px");
      pkgModalScroll.classList.add("height-locked");
    } else {
      pkgModalScroll.classList.remove("height-locked");
      pkgModalScroll.style.removeProperty("--modal-locked-h");
    }

    pkgModalBackdrop.classList.add("open");
    pkgModal.classList.add("open");
    document.body.classList.add("pkg-modal-open");
    document.documentElement.classList.add("pkg-modal-open");
    pkgModalOpen = true;

    const cardRect = card.getBoundingClientRect();
    const targetRect = pkgModal.getBoundingClientRect();
    const scaleX = cardRect.width / targetRect.width;
    const scaleY = cardRect.height / targetRect.height;
    const dx = cardRect.left + cardRect.width / 2 - (targetRect.left + targetRect.width / 2);
    const dy = cardRect.top + cardRect.height / 2 - (targetRect.top + targetRect.height / 2);

    pkgModal.style.transition = "none";
    pkgModal.style.opacity = "0";
    pkgModal.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
    void pkgModal.offsetWidth;
    pkgModal.style.transition = "transform .5s cubic-bezier(.16,1,.3,1), opacity .3s ease";
    pkgModal.style.opacity = "1";
    pkgModal.style.transform = "translate(0,0) scale(1,1)";
  }

  function closePkgModal() {
    if (!pkgModalOpen) return;
    pkgModalOpen = false;
    pkgModalBackdrop.classList.remove("open");
    document.body.classList.remove("pkg-modal-open");
    document.documentElement.classList.remove("pkg-modal-open");

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      pendingCloseCleanup = null;
      pkgModal.classList.remove("open");
      pkgModal.style.transition = "";
      pkgModal.style.transform = "";
      pkgModal.style.opacity = "";
    };
    pendingCloseCleanup = finish;
    if (!pkgOriginCard || !document.body.contains(pkgOriginCard)) {
      finish();
      return;
    }
    const cardRect = pkgOriginCard.getBoundingClientRect();
    const targetRect = pkgModal.getBoundingClientRect();
    const scaleX = cardRect.width / targetRect.width;
    const scaleY = cardRect.height / targetRect.height;
    const dx = cardRect.left + cardRect.width / 2 - (targetRect.left + targetRect.width / 2);
    const dy = cardRect.top + cardRect.height / 2 - (targetRect.top + targetRect.height / 2);
    pkgModal.style.transition = "transform .4s cubic-bezier(.4,0,.2,1), opacity .3s ease";
    pkgModal.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
    pkgModal.style.opacity = "0";
    const onEnd = (e) => {
      if (e.target !== pkgModal || e.propertyName !== "transform") return;
      pkgModal.removeEventListener("transitionend", onEnd);
      finish();
    };
    pkgModal.addEventListener("transitionend", onEnd);
    setTimeout(finish, 500);
  }

  function renderServiceNav() {
    tierRow.classList.toggle("is-hidden", state.service !== "reels");
    if (state.service === "reels") {
      tierRow.querySelectorAll(".tier-chip").forEach((chip) => {
        chip.classList.toggle("active", Number(chip.dataset.tier) === state.tier);
      });
    }
    svcNav.querySelectorAll(".pkg-card").forEach((card) => {
      card.classList.toggle("selected", card.dataset.svc === state.service);
    });
  }

  function scopeListHTML(items) {
    return items.map((i) => `<li>${i}</li>`).join("");
  }

  const SUPPORT_ROLES = [
    { key: "writer", label: "Dedicated Content Writer" },
    { key: "editor", label: "Dedicated Video Editor" },
    { key: "director", label: "Creative Director Oversight" },
    { key: "call", label: "Call Support &amp; Requirement Discussion" },
    { key: "music", label: "Custom Brand Music" },
  ];

  // Just the roles actually included, as plain text — same weight and
  // treatment as every other spec row (Script, Language). Excluded
  // roles aren't listed at all; what a package gives you is the point,
  // not a running scorecard of what it doesn't.
  function supportIncludedValue(d) {
    const support = d.support || [];
    const included = SUPPORT_ROLES.filter((r) => support.indexOf(r.key) !== -1).map((r) => r.label);
    return included.length ? included.join(", ") : "—";
  }

  function renderServiceSummary() {
    const d = currentData();
    // The active service tab right above this panel already says "AI
    // Reels" — repeating "AI Reel —" in the heading here just to name
    // the cut ("AI Reel — Quick Cut") restated something the reader
    // already sees a few pixels up. Dropping that prefix leaves just
    // the cut name, which is the actually new information.
    document.getElementById("svcName").textContent = d.name.replace(/^AI Reel — /, "");
    document.getElementById("svcStartPrice").textContent = fmtINR(d.basePrice) + " / " + (d.unit || "package");
    document.getElementById("svcShort").textContent = d.short || "";
  }

  // The handful of facts worth scanning without a click: always visible,
  // so understanding a package doesn't start by opening the Included tab.
  function renderServiceGlance() {
    const d = currentData();
    const items = [
      ["Length", d.duration],
      ["Format", d.format],
      ["Turnaround", d.turnaround],
      ["Revisions", d.revisions],
    ].filter(([, v]) => v);
    document.getElementById("svcGlance").innerHTML = items
      .map(([k, v]) => `<div class="svc-glance-item"><span>${k}</span><b>${v}</b></div>`)
      .join("");
  }

  function renderScopePanel() {
    const d = currentData();
    scopePanel.querySelectorAll(".scope-tab-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === state.scopeTab)
    );

    let html = "";
    if (state.scopeTab === "inc") {
      const notApplicable = (v) => !v || /^(no scripting|not applicable)/i.test(v);
      const specRows = [
        ["Script", notApplicable(d.scripting) ? null : d.scripting],
        ["Language", notApplicable(d.language) ? null : d.language],
        ["Support", supportIncludedValue(d)],
      ].filter(([, v]) => v);
      // What's included leads — it's the one thing everyone opening this
      // tab actually came to scan. Script/language/support and the exact
      // delivery spec are real but secondary, so they're one click away
      // in a closed-by-default toggle instead of pushing the checklist
      // further down the page on every single visit.
      html = `
        <ul class="scope-list">${scopeListHTML(d.included)}</ul>
        <details class="mini-toggle">
          <summary>Production &amp; delivery details</summary>
          <div class="scope-specs">${specRows.map(([k, v]) => `<div class="scope-spec-row"><span>${k}</span><b>${v}</b></div>`).join("")}</div>
          <div class="scope-deliver-box"><b>Creative Team Delivers</b><span>${d.deliver}</span></div>
        </details>
      `;
    } else if (state.scopeTab === "exc") {
      html = `<ul class="scope-list scope-exc">${scopeListHTML(d.excluded)}</ul>`;
    } else {
      // Three groups: brand assets (a true one-time ask), assets that
      // scale with how many products the order actually covers, and
      // whatever's specific to this creative type — so the "how many do
      // you need" question has a different, correct answer per group
      // instead of one flat list implying everything is asked for once.
      html = `
        <div class="scope-need-group">
          <span class="scope-need-label">Brand assets — once per order</span>
          <ul class="scope-list scope-need">${scopeListHTML(BRAND_NEED)}</ul>
        </div>
        <div class="scope-need-group">
          <span class="scope-need-label">Per selected product</span>
          <ul class="scope-list scope-need">${scopeListHTML(PER_PRODUCT_NEED)}</ul>
        </div>
        <div class="scope-need-group">
          <span class="scope-need-label">Specific to this creative</span>
          <ul class="scope-list scope-need">${scopeListHTML(d.need)}</ul>
        </div>
        ${d.dimNote ? `<p class="scope-note">${d.dimNote}</p>` : ""}
      `;
    }
    document.getElementById("scopeBody").innerHTML = html;

    // Reel comparison table (nested inside "Good to know") only makes
    // sense for AI Reels — hide the whole toggle, not just the table,
    // for tier-less services.
    const compareToggle = document.getElementById("rulesCompareToggle");
    if (compareToggle) compareToggle.style.display = state.service === "reels" ? "" : "none";
    const table = document.getElementById("reelCompareTable");
    if (table) {
      table.querySelectorAll("[data-tier-col]").forEach((cell) => {
        cell.classList.toggle("ct-sel", Number(cell.dataset.tierCol) === state.tier);
      });
    }
  }

  /* ----------------------------------------------------------
     4. RENDER: ORDER BUILDER + CART
  ---------------------------------------------------------- */
  // Only the 3 facts a sales rep actually needs to sanity-check before
  // adding a line to the order — not the full scope (that's what the
  // Services section above is for). Skips any fact that doesn't apply
  // to the given package instead of always showing a fixed set.
  function keyFacts(d) {
    return [
      ["Revisions", d.revisions],
      ["Turnaround", (d.turnaround || "").split(" after")[0]],
      ["Script", d.scripting && !/^(no scripting|not applicable)/i.test(d.scripting) ? d.scripting : null],
      ["Format", !d.scripting || /^(no scripting|not applicable)/i.test(d.scripting) ? d.format : null],
    ].filter(([, v]) => v);
  }

  function renderCalculator() {
    const preview = computeBuilderPreview();
    const isReel = state.service === "reels";

    // Keep the <select> itself in sync with state too — state.service can
    // change from outside this control, and previously nothing here ever
    // wrote back to qServiceSelect.value, so the dropdown could silently show a
    // different service than the one actually active/priced below it.
    const qServiceSelect = document.getElementById("qServiceSelect");
    if (qServiceSelect.value !== state.service) qServiceSelect.value = state.service;

    // Tier chips only apply to AI Reel — hide the whole field for
    // tier-less services, and keep exactly one chip marked .active,
    // driven directly from state.tier.
    document.getElementById("qTierField").style.display = isReel ? "" : "none";
    if (isReel) {
      document.querySelectorAll(".qtier-chip").forEach((chip) => {
        chip.classList.toggle("active", Number(chip.dataset.tier) === state.tier);
      });
    }

    document.getElementById("qUnitPrice").textContent =
      fmtINR(preview.d.basePrice) + " / " + (preview.d.unit || "pkg");
    document.getElementById("qQtyInput").value = preview.qty;

    document.getElementById("obFacts").innerHTML = keyFacts(preview.d)
      .map(([l, v]) => `<div class="ob-fact"><span class="dot"></span>${l}: <b>${v}</b></div>`)
      .join("");

    const existing = state.cart.find((i) => i.service === state.service && i.tier === (isReel ? state.tier : null));
    document.getElementById("obAddBtnLabel").textContent = existing
      ? `Add ${preview.qty} more (already in order)`
      : "Add to Order";
  }

  function renderCart() {
    persistState();
    const cart = computeCart();
    const list = document.getElementById("orderCartList");
    document.getElementById("ocCount").textContent =
      cart.items.length === 0 ? "0 items" : cart.items.length === 1 ? "1 item" : `${cart.items.length} items`;
    const clearBtn = document.getElementById("orderCartClearBtn");
    if (clearBtn) clearBtn.hidden = cart.items.length === 0;

    // A coupon ticket (code stub + copy), not a plain notification bar
    // or an abstract percentage badge — the code itself is always
    // shown, so this reads as an actual applied coupon rather than a
    // generic "discount" line. Value-based, not quantity-based, so
    // it's labeled as an order discount rather than a "bulk" offer.
    // CSS hides this entirely for internal (see html.is-internal
    // .oc-offer).
    const offerEl = document.getElementById("ocOffer");
    if (offerEl) {
      const thresholdStr = fmtINR(PUBLIC_OFFER_THRESHOLD);
      const unlocked = cart.subtotal >= PUBLIC_OFFER_THRESHOLD;
      let kicker, title, status;
      if (unlocked) {
        kicker = "Coupon applied";
        title = `Code <b>${PUBLIC_OFFER_CODE}</b> saved you ${PUBLIC_OFFER_PCT}% on this order.`;
        status = "Applied";
      } else if (cart.items.length > 0) {
        const remaining = fmtINR(PUBLIC_OFFER_THRESHOLD - cart.subtotal);
        kicker = "Automatic coupon";
        title = `Add ${remaining} more to auto-apply code <b>${PUBLIC_OFFER_CODE}</b> for ${PUBLIC_OFFER_PCT}% off.`;
        status = "Locked";
      } else {
        kicker = "Automatic coupon";
        title = `Orders above ${thresholdStr} auto-apply code <b>${PUBLIC_OFFER_CODE}</b> for ${PUBLIC_OFFER_PCT}% off.`;
        status = "Locked";
      }
      offerEl.innerHTML = `
        <span class="oc-offer-main"><span class="oc-offer-kicker">${kicker}</span><span class="oc-offer-title">${title}</span></span>
        <span class="oc-offer-stub"><span class="oc-offer-code">${PUBLIC_OFFER_CODE}</span><span class="oc-offer-code-status">${status}</span></span>
      `;
      offerEl.classList.toggle("is-unlocked", unlocked);
      if (unlocked && !offerWasUnlocked) {
        offerEl.classList.remove("just-unlocked");
        void offerEl.offsetWidth;
        offerEl.classList.add("just-unlocked");
      }
      offerWasUnlocked = unlocked;
    }

    if (cart.items.length === 0) {
      list.innerHTML = `<div class="cart-empty">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <p>No creatives added yet. Configure one on the left and click "Add to Order."</p>
      </div>`;
    } else {
      list.innerHTML = cart.items
        .map((item) => {
          const name = item.d.name;
          const facts = keyFacts(item.d)
            .slice(0, 2)
            .map(([l, v]) => `${l}: ${v}`)
            .join("   ");
          // Full per-item scope, tucked into a data attribute so the
          // internal order-confirm flow (team.js, a separate script
          // with no access to this closure's DATA object) can pull the
          // same deliverables/revisions/turnaround detail into the
          // invoice PDF at the moment an order is placed — encoded via
          // encodeURIComponent rather than raw JSON-in-an-attribute so
          // apostrophes in names like "Director's Cut" never need
          // HTML-attribute escaping.
          const spec = encodeURIComponent(
            JSON.stringify({
              deliver: item.d.deliver || "",
              duration: item.d.duration || "",
              format: item.d.format || "",
              revisions: item.d.revisions || "",
              scripting: item.d.scripting || "",
              language: item.d.language || "",
              turnaround: item.d.turnaround || "",
              // service/tier (the raw selector keys, not display text) let
              // the internal Edit Order flow (team.js) rebuild this exact
              // line item back into the builder via FastrrOrderBuilder
              // .setCart() below, rather than just displaying it read-only.
              service: item.service,
              tier: item.tier || null,
            })
          );
          return `<div class="cart-item" data-id="${item.id}" data-spec="${spec}">
            <div class="cart-item-info">
              <div class="cart-item-name">${name}</div>
              <div class="cart-item-facts">${facts}</div>
            </div>
            <div class="cart-item-qty">
              <button type="button" class="ci-qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button type="button" class="ci-qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item-price">${fmtINR(item.lineSubtotal)}</div>
            <div class="cart-item-actions">
              <button type="button" class="ci-remove" data-action="remove" title="Remove" aria-label="Remove">✕</button>
            </div>
          </div>`;
        })
        .join("");
    }

    // qDiscountInput/discountTypeToggle/qGstToggle are the manual-edit
    // controls inside #discountFieldRow/#gstToggleRow — internal-tools
    // only, and entirely absent from the public build (not just
    // CSS-hidden), so every reference to them here is null-guarded.
    const qDiscountInputEl = document.getElementById("qDiscountInput");
    if (qDiscountInputEl) {
      qDiscountInputEl.value = state.discountValue;
      qDiscountInputEl.max = cart.discountType === "pct" ? 100 : "";
    }
    document.querySelectorAll("#discountTypeToggle .unit-toggle-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === cart.discountType);
    });
    document.getElementById("qSubtotal").textContent = fmtINR(cart.subtotal);
    document.getElementById("qDiscountLabel").textContent = discountLabel(cart);
    document.getElementById("qDiscountAmt").textContent = "− " + fmtINR(cart.discountAmt);
    document.getElementById("qGstAmt").textContent = cart.gstEnabled ? "+ " + fmtINR(cart.gstAmt) : "Not applied";
    document.getElementById("qFinal").textContent = fmtINR(cart.final);

    const discountActive = cart.discountAmt > 0;
    document.getElementById("discountRow").classList.toggle("is-active", discountActive);

    const qGstToggleEl = document.getElementById("qGstToggle");
    if (qGstToggleEl) qGstToggleEl.checked = cart.gstEnabled;
    document.getElementById("gstRow").classList.toggle("is-muted", !cart.gstEnabled);

    const gstSwitchState = document.getElementById("gstSwitchState");
    if (gstSwitchState) {
      gstSwitchState.textContent = cart.gstEnabled ? "With GST" : "Without GST";
      gstSwitchState.classList.toggle("is-on", cart.gstEnabled);
    }
  }

  /* ----------------------------------------------------------
     5. RENDER: MESSAGE TEMPLATES
  ---------------------------------------------------------- */
  function renderMessages() {
    // The entire Message Generator (#messages) is internal-only and
    // absent from the public build, not just CSS-hidden — but this
    // function is still called from every cart-changing action (both
    // builds share that code path), so it has to no-op cleanly rather
    // than throw when its target elements don't exist.
    if (!document.getElementById("clientMsg")) return;
    const cart = computeCart();
    const brandName = state.brandName.trim() || "[Client / Brand Name]";
    const clientName = brandName;
    const website = state.website.trim() || "[Website]";
    const brandCategory = state.brandCategory.trim() || "[Brand Category]";

    const packageDetails =
      cart.items.length === 0
        ? "No creatives added yet"
        : cart.items.map((i) => `${i.d.name} ×${i.qty}`).join(", ");
    const packageDetailsEl = document.getElementById("packageDetailsVal");
    if (packageDetailsEl) packageDetailsEl.textContent = packageDetails;

    if (cart.items.length === 0) {
      const emptyMsg =
        "No creatives have been added to this order yet. Add at least one under \"03 — Quote & Price Calculator\" above to generate this message.";
      document.getElementById("clientMsg").value = emptyMsg;
      document.getElementById("internalMsg").value = emptyMsg;
      return;
    }

    const priceBlock = [
      `Subtotal: ${fmtINR(cart.subtotal)}`,
      cart.discountAmt > 0 ? `${discountLabel(cart)}: − ${fmtINR(cart.discountAmt)}` : null,
      cart.gstEnabled ? `GST (18%): + ${fmtINR(cart.gstAmt)}` : "GST: Not applied (non-GST invoice)",
      `Total: ${fmtINR(cart.final)}${cart.gstEnabled ? " (incl. GST)" : ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Message 1 — Package Summary. Kept deliberately short — just the
    // order line items and the combined pricing breakdown — so it stays
    // readable dropped straight into a WhatsApp thread. The full
    // per-item breakdown (deliverables/duration/revisions/script/format/
    // language/timeline) plus general terms lives in the downloadable
    // PDF only (see generatePackagePdf below), not duplicated here.
    const orderBlock = cart.items
      .map((item, idx) => `${idx + 1}. ${item.d.name} — Qty ${item.qty} — ${fmtINR(item.lineSubtotal)}`)
      .join("\n");

    const clientMsg = `Package Summary — ${brandName}

Brand: ${brandName} (${brandCategory})
Website: ${website}

Order:
${orderBlock}

Pricing:
${priceBlock}

Full package details (deliverables, revisions, turnaround, terms) — download the PDF from the Package Summary panel.`;

    // Message 2 — What We Need From You. Since every line item in the
    // order belongs to the same brand, brand/product-level assets (logo,
    // colours, fonts, product selection, website link, product images)
    // are asked for exactly once via COMMON_NEED, instead of once per
    // creative type — then each creative type's own d.need (brief,
    // references, tone/key-message, voiceover language, etc.) is grouped
    // underneath so the client can see at a glance what's shared vs.
    // what's specific to each piece.
    const commonBlock = COMMON_NEED.map((n) => "- " + n).join("\n");
    const specificBlock = cart.items
      .map((item) => {
        const needs = item.d.need.map((n) => "- " + n).join("\n");
        return `${item.d.name}:\n${needs}`;
      })
      .join("\n\n");
    const specialReqLine = state.specialReq.trim()
      ? `\n\nAlso noting: ${state.specialReq.trim()}`
      : "";
    const internalMsg = `Hi ${clientName}, thank you! To get production started on your order, could you please share the following at your earliest convenience:

Brand & product assets (once for this order):
${commonBlock}

Creative-specific requirements:

${specificBlock}

Feel free to also share anything else you'd like us to keep in mind.${specialReqLine}`;

    document.getElementById("clientMsg").value = clientMsg;
    document.getElementById("internalMsg").value = internalMsg;
  }

  /* ----------------------------------------------------------
     5b. PACKAGE SUMMARY PDF
     The WhatsApp message stays short by design — everything that would
     make it unreadable in a chat thread (full deliverables/revision/TAT
     breakdown per line item, general terms) goes in this downloadable
     PDF instead, built with the same cart/state data as the messages.
  ---------------------------------------------------------- */
  const PDF_TERMS = [
    "Turnaround shown for each package is per single creative. For bulk orders or multiple creative types, overall delivery depends on quantity, creative type, cut, complexity, and final requirements.",
    "Turnaround timeline begins once we've received everything we need, meaning all required assets and details, not the payment date.",
    "New concepts, major creative rework, and any additions beyond what's included (extra dimensions, formats, slides, or aspect ratios) sit outside package scope and are quoted separately or as a new order.",
    "AI-generated visuals can vary slightly between runs, and final creative direction may be adjusted for platform policy or technical feasibility.",
    "A single discount applies to the whole order, not to each creative type individually, as either a percentage or a flat Rs. amount.",
  ];

  // Kept separate from PDF_TERMS since its wording depends on whether GST
  // was switched on for this specific order (see cart.gstEnabled).
  function gstTerm(cart) {
    return cart.gstEnabled
      ? "GST (18%) is calculated on the order total after any discount. Prices elsewhere in this document are base rates before GST."
      : "This order is quoted without GST, as a non-GST invoice.";
  }

  // The source logo PNG is full-resolution (3476×1404, for crisp use
  // anywhere on the page) — embedding it straight into the PDF at that
  // resolution bloats the file to ~19MB despite rendering at ~9mm tall.
  // Downscaling to a print-adequate thumbnail on a canvas first keeps the
  // PDF a normal size.
  function loadLogoThumbnail(src, maxWidthPx) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidthPx / img.naturalWidth);
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  async function generatePackagePdf() {
    if (!validateCartNonEmpty()) return;
    if (validateRequiredFields()) return;

    const btn = document.getElementById("downloadPdfBtn");
    const label = document.getElementById("downloadPdfBtnLabel");
    const originalLabel = label.textContent;
    btn.disabled = true;
    label.textContent = "Preparing PDF…";

    try {
      await window.__ensureJsPDF();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 16;
      let y = 16;

      let logoDataUrl = null;
      try {
        logoDataUrl = await loadLogoThumbnail("assets/logo/fastrr-ads-black.png?v=20260811-9", 500);
      } catch (e) {
        logoDataUrl = null;
      }
      if (logoDataUrl) {
        try {
          const imgProps = doc.getImageProperties(logoDataUrl);
          const logoH = 9;
          const logoW = (imgProps.width / imgProps.height) * logoH;
          doc.addImage(logoDataUrl, "PNG", marginX, y, logoW, logoH);
        } catch (e) {}
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      const genDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      doc.text("Generated: " + genDate, pageW - marginX, y + 4, { align: "right" });
      y += 22;

      doc.setDrawColor(225);
      doc.line(marginX, y, pageW - marginX, y);
      y += 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20);
      doc.text("Package Summary", marginX, y);
      y += 9;

      const brandName = state.brandName.trim() || "—";
      const website = state.website.trim() || "—";
      const brandCategory = state.brandCategory.trim() || "—";

      doc.autoTable({
        startY: y,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: { top: 1, bottom: 1 } },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 34 }, 1: { textColor: 60 } },
        body: [
          ["Brand / Client", brandName],
          ["Category", brandCategory],
          ["Website", website],
        ],
        margin: { left: marginX, right: marginX },
      });
      y = doc.lastAutoTable.finalY + 8;

      const cart = computeCart();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(20);
      doc.text("Selected Services", marginX, y);
      y += 4;

      doc.autoTable({
        startY: y,
        head: [["#", "Creative", "Qty", "Unit Price", "Line Total"]],
        body: cart.items.map((item, i) => [
          String(i + 1),
          item.d.name,
          String(item.qty),
          fmtINRPdf(item.d.basePrice) + " / " + (item.d.unit || "pkg"),
          fmtINRPdf(item.lineSubtotal),
        ]),
        styles: { fontSize: 9.5, cellPadding: 4, valign: "middle" },
        headStyles: { fillColor: [26, 20, 46], textColor: 255, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 9 },
          2: { cellWidth: 14, halign: "center" },
          3: { cellWidth: 40, halign: "right" },
          4: { cellWidth: 32, halign: "right" },
        },
        margin: { left: marginX, right: marginX },
      });
      y = doc.lastAutoTable.finalY + 10;

      cart.items.forEach((item) => {
        const d = item.d;
        if (y > pageH - 55) {
          doc.addPage();
          y = 18;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(20);
        doc.text(d.name + (item.qty > 1 ? ` (×${item.qty})` : ""), marginX, y);
        y += 4;
        const rows = [
          ["Deliverables", d.deliver],
          ["Duration / Format", `${d.duration} · ${d.format}`],
          ["Revisions", d.revisions],
        ];
        if (d.scripting && !/^(no scripting|not applicable)/i.test(d.scripting)) rows.push(["Script / Approval", d.scripting]);
        if (d.language && !/^not applicable/i.test(d.language)) rows.push(["Language", d.language]);
        rows.push(["Turnaround", d.turnaround]);
        doc.autoTable({
          startY: y,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 4, textColor: 50, lineColor: 225, lineWidth: 0.2 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 38, fillColor: [246, 245, 250] },
            1: { cellWidth: pageW - marginX * 2 - 38 },
          },
          body: rows,
          margin: { left: marginX, right: marginX },
        });
        y = doc.lastAutoTable.finalY + 8;
      });

      if (y > pageH - 60) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(20);
      doc.text("Pricing", marginX, y);
      y += 4;
      const priceRows = [["Subtotal", fmtINRPdf(cart.subtotal)]];
      if (cart.discountAmt > 0) priceRows.push([discountLabel(cart), "- " + fmtINRPdf(cart.discountAmt)]);
      priceRows.push(cart.gstEnabled ? ["GST (18%)", "+ " + fmtINRPdf(cart.gstAmt)] : ["GST", "Not applied (non-GST invoice)"]);
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
      doc.text("Final Amount", marginX, y);
      doc.text(fmtINRPdf(cart.final) + (cart.gstEnabled ? " (incl. GST)" : ""), pageW - marginX, y, { align: "right" });
      y += 12;

      if (y > pageH - 60) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(20);
      doc.text("Important Terms", marginX, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70);
      const usableWidth = pageW - marginX * 2 - 5;
      [...PDF_TERMS, gstTerm(cart)].forEach((term) => {
        const lines = doc.splitTextToSize("• " + term, usableWidth);
        const blockH = lines.length * 4.2 + 2;
        if (y + blockH > pageH - 20) {
          doc.addPage();
          y = 18;
        }
        doc.text(lines, marginX, y);
        y += blockH;
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Fastrr Ads", marginX, pageH - 10);
        doc.text(`Page ${p} of ${pageCount}`, pageW - marginX, pageH - 10, { align: "right" });
      }

      const safeBrand = brandName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "package";
      const fileDate = new Date().toISOString().slice(0, 10);
      doc.save(`Fastrr-Ads-Package-Summary-${safeBrand}-${fileDate}.pdf`);
    } catch (e) {
      label.textContent = "Couldn't generate PDF";
      setTimeout(() => {
        label.textContent = originalLabel;
      }, 2200);
      btn.disabled = false;
      return;
    }
    btn.disabled = false;
    label.textContent = originalLabel;
  }

  /* ----------------------------------------------------------
     6. MASTER RENDER
  ---------------------------------------------------------- */
  function render() {
    renderServiceNav();
    renderServiceSummary();
    renderServiceGlance();
    renderScopePanel();
    renderCalculator();
    renderCart();
    renderMessages();
  }

  // Re-rendering a panel (tabs, tiers, cart, showcase) can change the
  // height of content anywhere on the page — including sections above
  // the one the user is looking at (e.g. switching the service tab also
  // re-renders the Creative Showcase higher up). Since scrollY is a fixed
  // pixel offset, any such height change silently shifts the whole page
  // under the user. Anchoring on the clicked/focused control and
  // compensating scroll by however far it moved keeps the interaction
  // visually anchored where the user is actually looking.
  function withScrollAnchor(fn) {
    const anchor = document.activeElement;
    const canAnchor = anchor && anchor !== document.body && typeof anchor.getBoundingClientRect === "function";
    const beforeTop = canAnchor ? anchor.getBoundingClientRect().top : null;
    fn();
    if (canAnchor && document.body.contains(anchor)) {
      const delta = anchor.getBoundingClientRect().top - beforeTop;
      // The page sets `scroll-behavior:smooth` globally, and this browser
      // applies that even to a direct scrollTop assignment — not just
      // scrollTo()/scrollBy() — turning what should be an invisible
      // same-frame correction into a slow, visible catch-up scroll.
      // Forcing scroll-behavior:auto on the root for the duration of this
      // one assignment makes it truly instant, then restores whatever was
      // there so normal smooth-scrolling (nav links, etc.) is unaffected.
      if (delta) {
        const root = document.documentElement;
        const prevBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const se = document.scrollingElement || root;
        se.scrollTop = se.scrollTop + delta;
        root.style.scrollBehavior = prevBehavior;
      }
    }
  }

  // Clicking a button also focuses it, and browsers scroll a newly-focused
  // element into view by default — smoothly, since the page sets
  // scroll-behavior:smooth globally. That native scroll is a second,
  // independent source of the same "page jumps on click" problem
  // withScrollAnchor addresses above, and it isn't something a delta
  // correction after the fact can fully cancel out because it plays out
  // as its own separate browser-driven animation. Heading it off at the
  // source: suppress the default mousedown focus (which is what triggers
  // it) and focus the button ourselves with preventScroll instead.
  document.addEventListener(
    "mousedown",
    (e) => {
      const el = e.target.closest(
        ".pkg-card, .tier-chip, .scope-tab-btn, .showcase-tab, .qtier-chip, #qtyMinus, #qtyPlus, #obAddBtn, #orderCartList button, #orderCartClearBtn"
      );
      if (!el) return;
      e.preventDefault();
      el.focus({ preventScroll: true });
    },
    true
  );

  /* ----------------------------------------------------------
     7. WIRE UP CONTROLS
  ---------------------------------------------------------- */
  // Cards float on the stage (base position set by --x/--y in CSS,
  // drifting ambiently via a CSS animation) and can be dragged to a
  // new spot with the pointer, matching the reference video's
  // "floating card cloud" interaction. A drag past a small threshold
  // suppresses the click that would otherwise open the modal, so a
  // drag and a tap stay clearly distinct gestures. Below the 760px
  // breakpoint the stage becomes a static stacked list (see the CSS
  // media query) and dragging is skipped entirely.
  function initPkgDrag() {
    const THRESHOLD = 6;
    svcNav.querySelectorAll(".pkg-card").forEach((card) => {
      let tracking = false;
      let dragging = false;
      let suppressNextClick = false;
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let originLeft = 0;
      let originTop = 0;

      card.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (getComputedStyle(card).position !== "absolute") return;
        tracking = true;
        dragging = false;
        pointerId = e.pointerId;
        const stageRect = svcNav.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        originLeft = cardRect.left - stageRect.left + cardRect.width / 2;
        originTop = cardRect.top - stageRect.top + cardRect.height / 2;
        card.setPointerCapture(pointerId);
      });

      card.addEventListener("pointermove", (e) => {
        if (!tracking) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) > THRESHOLD) {
          dragging = true;
          card.classList.add("dragging");
        }
        if (!dragging) return;
        const stageRect = svcNav.getBoundingClientRect();
        const left = Math.max(0, Math.min(stageRect.width, originLeft + dx));
        const top = Math.max(0, Math.min(stageRect.height, originTop + dy));
        card.style.left = left + "px";
        card.style.top = top + "px";
      });

      const endDrag = () => {
        if (!tracking) return;
        tracking = false;
        if (dragging) {
          dragging = false;
          suppressNextClick = true;
          card.classList.remove("dragging");
        }
        if (pointerId !== null) {
          try {
            card.releasePointerCapture(pointerId);
          } catch (err) {
            /* pointer already released */
          }
        }
        pointerId = null;
      };
      card.addEventListener("pointerup", endDrag);
      card.addEventListener("pointercancel", endDrag);

      card.addEventListener("click", (e) => {
        if (suppressNextClick) {
          suppressNextClick = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        state.service = card.dataset.svc;
        render();
        switchShowcaseCat(state.service === "reels" ? "reels" : state.service);
        openPkgModal(card);
      });
    });
  }
  initPkgDrag();

  pkgModalClose.addEventListener("click", closePkgModal);
  pkgModalBackdrop.addEventListener("click", (e) => {
    if (e.target === pkgModalBackdrop) closePkgModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pkgModalOpen) closePkgModal();
  });

  tierRow.querySelectorAll(".tier-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      withScrollAnchor(() => {
        state.tier = Number(chip.dataset.tier);
        render();
      });
    });
  });

  scopePanel.querySelectorAll(".scope-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      withScrollAnchor(() => {
        state.scopeTab = btn.dataset.tab;
        renderScopePanel();
      });
    });
  });

  const qQtyInput = document.getElementById("qQtyInput");
  qQtyInput.addEventListener("input", () => {
    state.qty = Math.max(1, parseInt(qQtyInput.value, 10) || 1);
    render();
  });
  document.getElementById("qtyMinus").addEventListener("click", () => {
    withScrollAnchor(() => {
      state.qty = Math.max(1, state.qty - 1);
      render();
    });
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    withScrollAnchor(() => {
      state.qty = state.qty + 1;
      render();
    });
  });

  // Order-level discount — applies once to the combined cart subtotal,
  // not per line item. Type (% vs flat ₹) and value are separate so
  // switching type never has to guess what the existing number meant.
  // These controls (manual discount/GST override) are internal-tools
  // only and entirely absent from the public build, so this whole
  // block is skipped there rather than throwing on missing elements.
  const qDiscountInput = document.getElementById("qDiscountInput");
  if (qDiscountInput) {
    qDiscountInput.addEventListener("input", () => {
      let v = Math.max(0, parseFloat(qDiscountInput.value) || 0);
      if (state.discountType === "pct") v = Math.min(100, v);
      state.discountValue = v;
      renderCart();
      renderMessages();
    });

    document.getElementById("discountTypeToggle").addEventListener("click", (e) => {
      const btn = e.target.closest(".unit-toggle-btn");
      if (!btn || btn.dataset.type === state.discountType) return;
      state.discountType = btn.dataset.type;
      state.discountValue = 0; // a number under one type rarely means the same thing under the other
      renderCart();
      renderMessages();
    });

    document.getElementById("qGstToggle").addEventListener("change", (e) => {
      state.gstEnabled = e.target.checked;
      renderCart();
      renderMessages();
    });
  }

  // order-builder service/tier controls
  document.getElementById("qServiceSelect").addEventListener("change", (e) => {
    withScrollAnchor(() => {
      state.service = e.target.value;
      render();
      switchShowcaseCat(state.service);
    });
  });
  document.querySelectorAll(".qtier-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      withScrollAnchor(() => {
        state.tier = Number(chip.dataset.tier);
        render();
      });
    });
  });

  document.getElementById("obAddBtn").addEventListener("click", () => {
    withScrollAnchor(addToOrder);
  });

  // Delegated so it keeps working as cart rows are added/removed/re-rendered.
  document.getElementById("orderCartList").addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = Number(row.dataset.id);
    const action = e.target.closest("button")?.dataset.action;
    if (!action) return;
    withScrollAnchor(() => {
      if (action === "inc") changeCartQty(id, 1);
      else if (action === "dec") changeCartQty(id, -1);
      else if (action === "remove") removeCartItem(id);
    });
  });

  const orderCartClearBtn = document.getElementById("orderCartClearBtn");
  if (orderCartClearBtn) {
    orderCartClearBtn.addEventListener("click", () => {
      withScrollAnchor(clearCart);
    });
  }

  const brandNameInput = document.getElementById("brandNameInput");
  const websiteInput = document.getElementById("websiteInput");
  const brandCategorySelect = document.getElementById("brandCategorySelect");
  const REQUIRED_FIELDS = [brandNameInput, websiteInput, brandCategorySelect];

  function clearFieldError(el) {
    el.classList.remove("input-error");
  }
  // brandNameInput/websiteInput/brandCategorySelect/specialReqInput
  // live inside the internal-only #messages section — entirely absent
  // from the public build, not just CSS-hidden — so each listener is
  // guarded individually rather than assuming the element exists.
  if (brandNameInput) {
    brandNameInput.addEventListener("input", (e) => {
      state.brandName = e.target.value;
      clearFieldError(brandNameInput);
      persistState();
      renderMessages();
    });
  }
  if (websiteInput) {
    websiteInput.addEventListener("input", (e) => {
      state.website = e.target.value;
      clearFieldError(websiteInput);
      persistState();
      renderMessages();
    });
  }
  if (brandCategorySelect) {
    brandCategorySelect.addEventListener("change", (e) => {
      state.brandCategory = e.target.value;
      clearFieldError(brandCategorySelect);
      persistState();
      renderMessages();
    });
  }
  const specialReqInputEl = document.getElementById("specialReqInput");
  if (specialReqInputEl) {
    specialReqInputEl.addEventListener("input", (e) => {
      state.specialReq = e.target.value;
      persistState();
      renderMessages();
    });
  }

  // Returns the first empty required field, or null if all are filled.
  // Highlights every empty required field with an inline error state
  // (border + shake) instead of a blocking alert().
  function validateRequiredFields() {
    let firstInvalid = null;
    REQUIRED_FIELDS.forEach((el) => {
      const empty = !el.value || !el.value.trim();
      el.classList.toggle("input-error", empty);
      if (empty && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      // restart the shake animation on repeat clicks
      firstInvalid.classList.remove("input-error");
      // eslint-disable-next-line no-unused-expressions
      void firstInvalid.offsetWidth;
      firstInvalid.classList.add("input-error");
      firstInvalid.focus();
    }
    return firstInvalid;
  }

  // The order cart is as much a required "field" as brand name/website —
  // there's nothing to summarize without it. Flashes the cart panel the
  // same way an empty required input shakes, instead of silently copying
  // a message that just says "no creatives added yet."
  function validateCartNonEmpty() {
    if (state.cart.length > 0) return true;
    const panel = document.getElementById("ocPanel");
    panel.classList.remove("flash-warn");
    void panel.offsetWidth;
    panel.classList.add("flash-warn");
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  function wireCopyButton(btnId, sourceId) {
    const btn = document.getElementById(btnId);
    if (!btn) return; // internal-only button, absent from the public build
    btn.addEventListener("click", async () => {
      if (!validateCartNonEmpty()) return; // empty order — panel flashes, no copy
      if (validateRequiredFields()) return; // incomplete — inline error shown, no copy
      const text = document.getElementById(sourceId).value;
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext !== false) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch (e) {
        ok = false;
      }
      if (!ok) {
        try {
          const ta = document.getElementById(sourceId);
          ta.focus();
          ta.select();
          ok = document.execCommand("copy");
        } catch (e) {
          ok = false;
        }
      }
      const original = btn.dataset.label || btn.textContent;
      btn.dataset.label = original;
      btn.textContent = ok ? "Copied ✓" : "Copy failed, select and copy manually";
      btn.classList.add(ok ? "copied" : "copy-error");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied", "copy-error");
      }, 1800);
    });
  }
  wireCopyButton("copyClientBtn", "clientMsg");
  wireCopyButton("copyInternalBtn", "internalMsg");
  const downloadPdfBtnEl = document.getElementById("downloadPdfBtn");
  if (downloadPdfBtnEl) downloadPdfBtnEl.addEventListener("click", generatePackagePdf);

  const footerYearEl = document.getElementById("footerYear");
  if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     7b. LEAD CAPTURE — "Share Your Requirement"
     No backend on this static site, so submissions go straight to a
     Google Form's /formResponse endpoint (same technique the "get
     pre-filled link" feature is built on) — Google Forms' own "email
     notifications for new responses" setting is what actually delivers
     each submission to the inbox, no server of our own required. The
     entry.* IDs below were read off a pre-filled link generated from
     the live form, so they have to stay in sync if the form's
     questions are ever rebuilt from scratch (edits to existing
     questions are fine; deleting and re-adding one changes its ID).
     Falls back to opening the visitor's own mail client if the POST
     fails outright (e.g. offline), so a submission is never silently
     lost.

     KNOWN LANDMINE — Forms' own "Collect email addresses" setting
     (Settings tab -> Responses in the Forms editor) must stay OFF.
     When it's on, Google silently prepends its own hidden, required
     email question ahead of every question below — usually in
     "Verified" mode, which requires the respondent to be signed into
     a Google account. This site's submissions are anonymous POSTs
     from a hidden iframe, so that hidden field can never be
     satisfied: Google rejects the whole submission, but the iframe
     still "loads" *something* (a validation/sign-in page), so the
     code below has no way to tell and reports success anyway. This
     exact setting being on is what caused a real production incident
     where every single public lead silently vanished — visitors saw
     a normal success screen, nothing ever reached the sales team, and
     it went unnoticed until someone checked the Form's Responses tab
     directly and found it at zero. The form already has its own
     visible "Email ID" question doing this job, so Google's automatic
     version is pure redundancy with no upside — if it's ever back on,
     turn it off rather than trying to work around it.
  ---------------------------------------------------------- */
  const LEAD_EMAIL = "design.tools@pickrr.com";
  const GOOGLE_FORM_ACTION =
    "https://docs.google.com/forms/d/e/1FAIpQLSfacU63ttdHBCsoYjjsxDmMLtm-uLApii4BuzvLUgtjK_GrCg/formResponse";
  const GOOGLE_FORM_ENTRIES = {
    name: "entry.2106469787",
    email: "entry.862053348",
    phone: "entry.1611403095",
    brand: "entry.1196878162",
    requirement: "entry.104750499",
    details: "entry.910210025",
  };

  // Shared by the lead modal's auto-prefill (on open) and its
  // submission payload (on submit) — a short "Nx Name, Nx Name" line
  // for the Requirement field, and a fuller itemised block (with
  // pricing) for the Details field, so whatever's already been
  // configured in the calculator always travels with the submission
  // even if the visitor doesn't retype it themselves.
  function packageSummaryLine() {
    const cart = computeCart();
    if (!cart.items.length) return "";
    return cart.items.map((i) => `${i.qty}× ${i.d.name}`).join(", ");
  }
  function orderDetailsBlock() {
    const cart = computeCart();
    if (!cart.items.length) return "";
    const lines = cart.items.map((i) => `- ${i.d.name} × ${i.qty} — ${fmtINR(i.lineSubtotal)}`);
    return `Order configured on the site:\n${lines.join("\n")}\nEstimated total: ${fmtINR(cart.final)}`;
  }

  (function initLeadModal() {
    const modal = document.getElementById("leadModal");
    // Every trigger (the Order panel CTA, the footer CTA, etc.) shares
    // this class rather than a single id, so adding another entry
    // point anywhere on the page is just marking it up, no JS change.
    const ctaBtns = document.querySelectorAll(".js-open-lead-modal");
    if (!modal || !ctaBtns.length) return;
    const closeBtn = document.getElementById("leadModalClose");
    const backdrop = document.getElementById("leadModalBackdrop");
    const formView = document.getElementById("leadFormView");
    const successView = document.getElementById("leadSuccessView");
    const form = document.getElementById("leadForm");

    function openModal() {
      // Reused across visits within the same page load — always resets
      // to a blank form rather than remembering a previous submission,
      // in case the visitor wants to send a second, different one.
      formView.hidden = false;
      successView.hidden = true;
      form.reset();
      document.getElementById("leadFormStatus").textContent = "";
      // Dynamically reflects whatever's currently configured in the
      // calculator — still just a starting point, freely editable.
      const reqInput = document.getElementById("leadRequirement");
      if (reqInput) reqInput.value = packageSummaryLine();
      modal.classList.add("open");
      document.body.classList.add("lb-locked");
      document.getElementById("leadName").focus();
    }
    function closeModal() {
      modal.classList.remove("open");
      document.body.classList.remove("lb-locked");
    }
    ctaBtns.forEach((btn) => btn.addEventListener("click", openModal));
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
    document.getElementById("leadSuccessCloseBtn").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  })();

  (function initLeadForm() {
    const form = document.getElementById("leadForm");
    if (!form) return;
    const btn = document.getElementById("leadSubmitBtn");
    const label = document.getElementById("leadSubmitBtnLabel");
    const status = document.getElementById("leadFormStatus");

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = "lead-form-status" + (kind ? " is-" + kind : "");
    }

    function showSuccess() {
      document.getElementById("leadFormView").hidden = true;
      document.getElementById("leadSuccessView").hidden = false;
    }

    function openMailtoFallback(data) {
      const subject = `New requirement — ${data.brand || data.name}`;
      const body =
        `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nBrand: ${data.brand || "-"}\n` +
        `Requirement: ${data.requirement}\nDetails: ${data.details || "-"}`;
      window.location.href =
        `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    // Exactly +91 followed by 10 digits, whatever the visitor actually
    // typed (spaces/dashes/an extra leading 91 or 0 are all normalized
    // away first) — anything left that isn't a clean 10-digit number
    // is rejected rather than silently mangled.
    function normalizePhone(raw) {
      let digits = raw.replace(/[^\d]/g, "");
      if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
      else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
      if (digits.length !== 10) return null;
      return "+91" + digits;
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rawPhone = document.getElementById("leadPhone").value.trim();
      const normalizedPhone = normalizePhone(rawPhone);
      const data = {
        name: document.getElementById("leadName").value.trim(),
        email: document.getElementById("leadEmail").value.trim(),
        phone: normalizedPhone || rawPhone,
        brand: document.getElementById("leadBrand").value.trim(),
        requirement: document.getElementById("leadRequirement").value.trim(),
        details: document.getElementById("leadDetails").value.trim(),
      };

      if (data.name.length < 2) {
        setStatus("Please enter your full name.", "error");
        return;
      }
      if (!EMAIL_RE.test(data.email)) {
        setStatus("Please enter a valid email address.", "error");
        return;
      }
      if (!normalizedPhone) {
        setStatus("Please enter a valid 10-digit contact number (e.g. +91 98765 43210).", "error");
        return;
      }
      if (!data.requirement) {
        setStatus("Please fill in your requirement, or add at least one creative to the order above.", "error");
        return;
      }

      // Whatever's already configured in the calculator rides along
      // automatically, ahead of anything the visitor typed themselves,
      // so the team always sees the exact order even if the visitor
      // never touched the Requirement/Details fields at all.
      const orderBlock = orderDetailsBlock();
      if (orderBlock) {
        data.details = data.details ? `${orderBlock}\n\n${data.details}` : orderBlock;
      }

      const originalLabel = label.textContent;
      btn.disabled = true;
      label.textContent = "Sending…";
      try {
        await submitToGoogleForm(data);
        form.reset();
        showSuccess();
      } catch (err) {
        openMailtoFallback(data);
        setStatus("Couldn't reach our form directly. Opening your email app with these details instead.", "error");
      } finally {
        btn.disabled = false;
        label.textContent = originalLabel;
      }
    });

    // Google Forms doesn't send CORS headers, so a fetch() response can
    // never be read from here either way — but a real <form> POST into a
    // hidden same-page iframe is the standard, most reliable way to
    // deliver it: unlike fetch(), it isn't a background XHR-style
    // request some ad/tracker blockers quietly drop, it's an ordinary
    // browser form submission (just targeted at an invisible frame
    // instead of navigating the page). We wait for the iframe's "load"
    // event (with a timeout fallback in case it never fires) before
    // treating the submission as sent.
    function submitToGoogleForm(data) {
      return new Promise((resolve, reject) => {
        const iframe = document.getElementById("leadHiddenFrame");
        if (!iframe) {
          reject(new Error("missing hidden iframe"));
          return;
        }
        const tempForm = document.createElement("form");
        tempForm.action = GOOGLE_FORM_ACTION;
        tempForm.method = "POST";
        tempForm.target = "leadHiddenFrame";
        tempForm.style.display = "none";

        const fields = {
          [GOOGLE_FORM_ENTRIES.name]: data.name,
          [GOOGLE_FORM_ENTRIES.email]: data.email,
          [GOOGLE_FORM_ENTRIES.phone]: data.phone,
          [GOOGLE_FORM_ENTRIES.brand]: data.brand,
          [GOOGLE_FORM_ENTRIES.requirement]: data.requirement,
          [GOOGLE_FORM_ENTRIES.details]: data.details,
        };
        Object.keys(fields).forEach((entryId) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = entryId;
          input.value = fields[entryId];
          tempForm.appendChild(input);
        });

        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          iframe.removeEventListener("load", finish);
          tempForm.remove();
          resolve();
        };
        iframe.addEventListener("load", finish);
        setTimeout(finish, 2500);

        document.body.appendChild(tempForm);
        tempForm.submit();
      });
    }
  })();

  /* ----------------------------------------------------------
     8. THEME TOGGLE (persisted)
  ---------------------------------------------------------- */
  // The favicon itself is handled entirely in <head> via `media`-scoped
  // <link> tags matching prefers-color-scheme — the tab's actual
  // background follows the visitor's OS/browser setting, not our own
  // theme toggle, so there's nothing to drive from here.
  (function initTheme() {
    const root = document.documentElement;
    const btn = document.getElementById("themeToggle");
    let saved = null;
    try {
      saved = localStorage.getItem("fastrr-theme");
    } catch (e) {}
    // Dark is the default regardless of the visitor's OS color-scheme
    // preference — previously a light-mode OS would silently override it
    // on first visit. A saved choice (from the toggle) still always wins.
    const initial = saved || "dark";
    root.setAttribute("data-theme", initial);

    btn.addEventListener("click", () => {
      const isLight = root.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("fastrr-theme", next); } catch (e) {}
      // Drive the spin with a JS-triggered class + explicit @keyframes
      // instead of relying only on the attribute-selector transition —
      // an unmissable whole-button spin every click, restarted cleanly
      // via a forced reflow so rapid re-clicks always replay it.
      btn.classList.remove("theme-spin");
      void btn.offsetWidth;
      btn.classList.add("theme-spin");
    });
  })();

  /* ----------------------------------------------------------
     9. CREATIVE SHOWCASE — data-driven horizontal rows + lightbox
  ---------------------------------------------------------- */
  const SHOWCASE_SOURCES = {
    reels: REELS,
    catalogue: CATALOGUE,
    static: STATICS,
    carousel: CAROUSELS,
  };

  let activeShowcaseCat = "reels";
  let activeShowcaseList = [];
  let lbIndex = 0;
  let lbSlideIndex = 0;

  const showcaseTrack = document.getElementById("showcaseTrack");
  const showcaseTabs = document.querySelectorAll(".showcase-tab");

  function cardMediaSrc(item) {
    return item.type === "carousel" ? item.slides[0] : item.thumb;
  }

  // Card thumbnail: real delivered videos (e.g. 360° Catalogue) render a
  // <video> pinned to its poster frame via preload="none" — no bytes are
  // fetched until the user opens the lightbox and presses play there.
  function mediaTagHTML(item, cls, extraAttrs) {
    if (item.video) {
      return `<video class="${cls}" src="${item.video}#t=0.1" poster="${item.thumb || ""}" muted loop playsinline preload="none" ${extraAttrs || ""}></video>`;
    }
    return `<img class="${cls}" src="${item.thumb}" loading="lazy" alt="${escapeHtml(item.title)}" ${extraAttrs || ""}>`;
  }

  // AI Reels + 360° Catalogue are real 1080x1920 (9:16) source video;
  // Static creatives are real 4:5 source ad creative; Carousel slides are
  // 1:1 source content. Sizing each category's cards to match its actual
  // media ratio (instead of a single hardcoded square for everything) is
  // the fix for the showcase "misalignment" complaint — see .ar-square /
  // .ar-portrait / .ar-4x5 in the stylesheet.
  function showcaseArClass(cat) {
    if (cat === "reels" || cat === "catalogue") return "ar-portrait";
    if (cat === "static") return "ar-4x5";
    return "ar-square";
  }

  // Canonical creative-type label per showcase tab — reused on every card
  // and in the lightbox so "type" reads identically everywhere on the
  // page instead of drifting into ad-hoc per-item wording.
  const SHOWCASE_TYPE_LABEL = {
    reels: "AI Reel",
    catalogue: "360° Catalogue Video",
    static: "Static Creative",
    carousel: "Carousel Creative",
  };

  // The creative is the focus — no title, no type line, nothing below the
  // media. The only label is the category, shown as a small pill overlaid
  // on the image itself, so every card's total height is just its fixed
  // media aspect-ratio and a row always lines up card-for-card. Demo/
  // placeholder items (not real delivered work) get their own muted note
  // instead, so they're never mistaken for a real category.
  function workCardMetaHTML(item) {
    const isDemo = item.cat === "demo";
    if (isDemo) return `<span class="wc-demo-note">${escapeHtml(item.catlabel)}</span>`;
    // Static/Carousel cards drop the category pill overlay entirely,
    // by request — Reels/Catalogue keep it.
    if (activeShowcaseCat === "static" || activeShowcaseCat === "carousel") return "";
    return `<span class="wc-cat-pill">${escapeHtml(item.catlabel || item.cat)}</span>`;
  }

  function workCardHTML(item, idx) {
    const arClass = showcaseArClass(activeShowcaseCat);
    if (item.type === "carousel") {
      const slideDots = item.slides
        .map((_, i) => `<span class="wc-dot${i === 0 ? " active" : ""}" data-slide="${i}"></span>`)
        .join("");
      return `
      <article class="work-card carousel-card ${arClass}" data-idx="${idx}" data-slide="0" style="--i:${idx}">
        <div class="wc-media-wrap">
          <img class="wc-media wc-slide-img" src="${item.slides[0]}" loading="lazy" alt="${escapeHtml(item.title)}">
          ${workCardMetaHTML(item)}
          <button class="wc-mini-prev" aria-label="Previous slide">‹</button>
          <button class="wc-mini-next" aria-label="Next slide">›</button>
          <div class="wc-dots">${slideDots}</div>
        </div>
      </article>`;
    }
    return `
      <article class="work-card ${arClass}" data-idx="${idx}" style="--i:${idx}">
        <div class="wc-media-wrap">
          ${mediaTagHTML(item, "wc-media")}
          ${workCardMetaHTML(item)}
        </div>
      </article>`;
  }

  function emptyCardHTML(cat) {
    const meta = CATS[cat] || {};
    return `<div class="work-empty glass">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="30" height="30"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>${escapeHtml(meta.empty || "Sample coming soon.")}</p>
    </div>`;
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function renderShowcase(cat) {
    activeShowcaseCat = cat;
    const list = SHOWCASE_SOURCES[cat] || [];
    activeShowcaseList = list;
    showcaseTabs.forEach((t) => t.classList.toggle("active", t.dataset.cat === cat));
    if (!list.length) {
      showcaseTrack.innerHTML = emptyCardHTML(cat);
      document.getElementById("showcaseNav").style.display = "none";
      return;
    }
    document.getElementById("showcaseNav").style.display = "";
    showcaseTrack.innerHTML = list.map((item, i) => workCardHTML(item, i)).join("");
    attachCardHandlers();
  }

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia && window.matchMedia("(hover: none)").matches;

  function attachCardTilt(card) {
    if (prefersReducedMotion || isTouch) return;
    let raf = null;
    card.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${py * -8}deg) rotateY(${px * 10}deg)`;
        raf = null;
      });
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  function attachCardHandlers() {
    showcaseTrack.querySelectorAll(".work-card").forEach((card) => {
      attachCardTilt(card);
      card.addEventListener("click", (e) => {
        if (e.target.closest(".wc-mini-prev") || e.target.closest(".wc-mini-next") || e.target.closest(".wc-dot")) return;
        openLightbox(Number(card.dataset.idx));
      });
      const prevBtn = card.querySelector(".wc-mini-prev");
      const nextBtn = card.querySelector(".wc-mini-next");
      if (prevBtn) {
        prevBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          shiftCardSlide(card, -1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          shiftCardSlide(card, 1);
        });
      }
      card.querySelectorAll(".wc-dot").forEach((dot) => {
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          setCardSlide(card, Number(dot.dataset.slide));
        });
      });
    });
  }

  function setCardSlide(card, n) {
    const idx = Number(card.dataset.idx);
    const item = activeShowcaseList[idx];
    const total = item.slides.length;
    const wrapped = ((n % total) + total) % total;
    card.dataset.slide = wrapped;
    card.querySelector(".wc-slide-img").src = item.slides[wrapped];
    card.querySelectorAll(".wc-dot").forEach((d, i) => d.classList.toggle("active", i === wrapped));
  }
  function shiftCardSlide(card, delta) {
    setCardSlide(card, Number(card.dataset.slide) + delta);
  }

  document.getElementById("carPrev").addEventListener("click", () => scrollShowcase(-1));
  document.getElementById("carNext").addEventListener("click", () => scrollShowcase(1));
  function scrollShowcase(direction) {
    const amount = Math.min(showcaseTrack.clientWidth * 0.85, 900);
    showcaseTrack.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  showcaseTabs.forEach((tab) => {
    tab.addEventListener("click", () => withScrollAnchor(() => renderShowcase(tab.dataset.cat)));
  });
  function switchShowcaseCat(svc) {
    // 'reels' | 'catalogue' | 'static' | 'carousel'
    if (SHOWCASE_SOURCES[svc]) renderShowcase(svc);
  }

  /* ---- Lightbox ---- */
  const lb = document.getElementById("lightbox");
  const lbMedia = document.getElementById("lbMedia");
  const lbCaption = document.getElementById("lbCaption");

  function renderLightboxMedia() {
    const item = activeShowcaseList[lbIndex];
    if (!item) return;
    if (item.type === "carousel") {
      lbSlideIndex = Math.min(lbSlideIndex, item.slides.length - 1);
      const dots = item.slides
        .map((_, i) => `<span class="lb-dot${i === lbSlideIndex ? " active" : ""}" data-slide="${i}"></span>`)
        .join("");
      lbMedia.innerHTML = `
        <div class="lb-carousel">
          <img src="${item.slides[lbSlideIndex]}" alt="${escapeHtml(item.title)}">
          <button class="lb-slide-prev" aria-label="Previous slide">‹</button>
          <button class="lb-slide-next" aria-label="Next slide">›</button>
          <div class="lb-dots">${dots}</div>
        </div>`;
      lbMedia.querySelector(".lb-slide-prev").addEventListener("click", (e) => {
        e.stopPropagation();
        lbSlideIndex = ((lbSlideIndex - 1) % item.slides.length + item.slides.length) % item.slides.length;
        renderLightboxMedia();
      });
      lbMedia.querySelector(".lb-slide-next").addEventListener("click", (e) => {
        e.stopPropagation();
        lbSlideIndex = (lbSlideIndex + 1) % item.slides.length;
        renderLightboxMedia();
      });
      lbMedia.querySelectorAll(".lb-dot").forEach((dot) => {
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          lbSlideIndex = Number(dot.dataset.slide);
          renderLightboxMedia();
        });
      });
      lbCaption.innerHTML = `<span class="lb-cat">${escapeHtml(item.catlabel || item.cat)} · ${SHOWCASE_TYPE_LABEL[activeShowcaseCat] || ""}</span><h3>${escapeHtml(item.title)}</h3><p>Slide ${lbSlideIndex + 1} of ${item.slides.length}</p>`;
    } else {
      const isVertical = activeShowcaseCat === "reels" || activeShowcaseCat === "catalogue";
      const isFourFive = activeShowcaseCat === "static";
      const lbFrameClass = isVertical ? "lb-frame-vertical" : isFourFive ? "lb-frame-4x5" : "lb-frame-square";
      const mediaEl = item.video
        ? `<video src="${item.video}" poster="${item.thumb || ""}" controls autoplay playsinline preload="metadata"></video>`
        : `<img src="${item.thumb}" alt="${escapeHtml(item.title)}">`;
      lbMedia.innerHTML = `
        <div class="lb-frame ${lbFrameClass}">
          ${mediaEl}
          ${isVertical && !item.video ? `<span class="lb-play-badge">▶</span>` : ""}
        </div>`;
      lbCaption.innerHTML = `<span class="lb-cat">${escapeHtml(item.catlabel || item.cat)} · ${SHOWCASE_TYPE_LABEL[activeShowcaseCat] || ""}</span><h3>${escapeHtml(item.title)}</h3>`;
    }
  }

  // Fully stop (not just pause) any video currently in the lightbox —
  // clearing src and calling load() drops the decoder/network buffer
  // instead of leaving it paused-but-loaded in the background, so audio
  // and decode work can't continue after the popup closes or navigates.
  function stopLightboxVideo() {
    const vid = lbMedia.querySelector("video");
    if (!vid) return;
    vid.pause();
    vid.removeAttribute("src");
    vid.load();
  }

  function openLightbox(idx) {
    lbIndex = idx;
    lbSlideIndex = 0;
    renderLightboxMedia();
    lb.classList.add("open");
    document.body.classList.add("lb-locked");
  }
  function closeLightbox() {
    stopLightboxVideo();
    lb.classList.remove("open");
    document.body.classList.remove("lb-locked");
  }
  function navLightbox(delta) {
    const total = activeShowcaseList.length;
    if (!total) return;
    stopLightboxVideo();
    lbIndex = ((lbIndex + delta) % total + total) % total;
    lbSlideIndex = 0;
    renderLightboxMedia();
  }
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbBackdrop").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", () => navLightbox(-1));
  document.getElementById("lbNext").addEventListener("click", () => navLightbox(1));
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navLightbox(-1);
    if (e.key === "ArrowRight") navLightbox(1);
  });

  /* ----------------------------------------------------------
     10a. HERO ORBIT — layered/overlapping real-creative tiles
     around the headline. Curated (not random) positions with
     varied size/rotation/z-index for depth. Two tiles use real
     inline video (muted/loop/playsinline/preload=none), started
     only once visible via IntersectionObserver, to keep hero
     load light. Mouse + scroll parallax is rAF-throttled and
     applied to an inner wrapper element so it never fights the
     CSS entrance animation running on the outer tile.
  ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     9a. BRAND LOGOS STRIP — hidden entirely while BRAND_LOGOS is
     empty (the common case until real logos are uploaded and wired
     in), so there's never a broken-looking empty trust-bar on the
     live site.
  ---------------------------------------------------------- */
  (function buildBrandLogos() {
    const strip = document.getElementById("brandLogosStrip");
    const trackA = document.getElementById("brandLogosTrackA");
    const trackB = document.getElementById("brandLogosTrackB");
    if (!strip || !trackA || !trackB || !Array.isArray(BRAND_LOGOS) || !BRAND_LOGOS.length) return;

    const mid = Math.ceil(BRAND_LOGOS.length / 2);
    const rows = [BRAND_LOGOS.slice(0, mid), BRAND_LOGOS.slice(mid)];
    [trackA, trackB].forEach((track, i) => {
      const row = rows[i].length ? rows[i] : BRAND_LOGOS;
      // Each row's logos are duplicated so the marquee can loop
      // seamlessly at translateX(-50%) with no visible jump/reset.
      const imgs = row.map((b) => {
        const scaleStyle = b.sizePct ? ` style="--logo-scale:${(b.sizePct / 100).toFixed(2)}"` : "";
        return `<div class="brand-logo-box"><img src="${b.src}" alt="${escapeHtml(b.name)}" loading="lazy"${scaleStyle}></div>`;
      }).join("");
      track.innerHTML = imgs + imgs;
    });
    strip.style.display = "";
  })();

  (function buildHeroOrbit() {
    const orbit = document.getElementById("heroOrbit");
    if (!orbit) return;

    // Explicitly-aligned 7-column layout — replaces the earlier 2-column
    // cluster with a wider wall of creative. No rotation, no overlap:
    // every column shares ONE fixed 72px width, so every tile's left/right
    // edges line up exactly with its column neighbors, separated by a
    // constant 14px gap. That's the literal definition of "aligned" —
    // edges that line up — carried over unchanged from the 2-column build.
    //
    // 72px is a multiple of 36 (=lcm(4,9)), so BOTH the 4:5 static ratio
    // (72×90) and the 9:16 video ratio (72×128) land on exact integer
    // heights within the same column width — zero rounding error.
    //
    // Each column stacks 4 tiles, alternating video/static so every
    // column mixes both media types. Columns alternate a 0/36px top
    // offset for rhythm without breaking any single column's own
    // alignment (same device the 2-column layout used).
    const colW = 72;
    const gap = 14;
    const videoH = 128; // 72 × 16/9, exact
    const staticH = 90; // 72 × 5/4, exact
    const colCount = 7;

    const heroVideo = REELS.find((r) => r.video && r.video.includes("bang-bang-reel"));
    const catVideo = CATALOGUE.find((c) => c.video && c.video.includes("apex-edge"));
    const videoPool = CATALOGUE.filter((c) => c.video && c.video !== (catVideo && catVideo.video))
      .concat(REELS.filter((r) => r.video && r.video !== (heroVideo && heroVideo.video)));
    const staticPool = STATICS.filter((s) => s.thumb);

    let videoCursor = 0;
    let staticCursor = 0;
    function nextVideo() {
      const item = videoPool[videoCursor % videoPool.length];
      videoCursor++;
      return item;
    }
    function nextStatic() {
      const item = staticPool[staticCursor % staticPool.length];
      staticCursor++;
      return item;
    }

    const tiles = [];
    for (let c = 0; c < colCount; c++) {
      const rightPx = c * (colW + gap);
      const offsetTop = c % 2 === 0 ? 0 : 36;
      // First column leads with the curated hero video; second column
      // leads with the curated 360° catalogue video — both keep their
      // restrained gradient-glow accent. A handful of other columns each
      // carry ONE real video (never two in the same column, and never
      // every column) so the wall reads as a real mix of motion + stills
      // instead of either "all video" or "video only on the far left."
      // Column 4 stays all-static as a deliberate breathing-room beat.
      // Total real videos stays capped at 6 — combined with the playback
      // stagger below, that keeps the above-the-fold decode/download load
      // bounded instead of bursting dozens of clips at once.
      const pattern =
        c === 0
          ? [{ kind: "video", item: heroVideo, extraClass: "tile-hero" }, { kind: "img" }, { kind: "img" }, { kind: "img" }]
          : c === 1
          ? [{ kind: "video", item: catVideo, extraClass: "tile-secondary" }, { kind: "img" }, { kind: "img" }, { kind: "img" }]
          : c === 2
          ? [{ kind: "img" }, { kind: "video" }, { kind: "img" }, { kind: "img" }]
          : c === 3
          ? [{ kind: "img" }, { kind: "img" }, { kind: "video" }, { kind: "img" }]
          : c === 5
          ? [{ kind: "img" }, { kind: "video" }, { kind: "img" }, { kind: "img" }]
          : c === 6
          ? [{ kind: "img" }, { kind: "img" }, { kind: "img" }, { kind: "video" }]
          : [{ kind: "img" }, { kind: "img" }, { kind: "img" }, { kind: "img" }];

      let top = offsetTop;
      pattern.forEach((spec, i) => {
        const isVideo = spec.kind === "video";
        const item = spec.item || (isVideo ? nextVideo() : nextStatic());
        const h = isVideo ? videoH : staticH;
        if (item) {
          tiles.push({
            top: `${top}px`, right: `${rightPx}px`, w: colW, h, r: 0,
            z: 3 + (pattern.length - i), d: (c * 0.05 + i * 0.04).toFixed(2), ix: 0, iy: 18,
            depth: { mx: 6 - i * 0.4, my: 4 - i * 0.3, sy: 0.014 },
            extraClass: spec.extraClass, kind: isVideo ? "video" : "img", item,
          });
        }
        top += h + gap;
      });
    }

    function mediaHTML(t) {
      if (t.kind === "video" && t.item.video) {
        return `<video src="${t.item.video}#t=0.1" poster="${t.item.thumb || ""}" muted loop playsinline preload="none"></video>`;
      }
      if (t.kind === "carousel") {
        const src = t.item.slides ? t.item.slides[0] : "";
        return `<img src="${src}" loading="lazy" alt="">`;
      }
      return `<img src="${t.item.thumb}" loading="lazy" alt="">`;
    }

    orbit.innerHTML = tiles
      .map((t, i) => {
        const cls = ["hero-tile"];
        if (t.extraClass) cls.push(t.extraClass);
        if (t.drift) cls.push("tile-drift");
        const style = [
          `top:${t.top}`, `right:${t.right}`, `width:${t.w}px`, `height:${t.h}px`,
          `z-index:${t.z}`, `--r:${t.r}deg`, `--d:${t.d}s`,
          `--ix:${t.ix || 0}px`, `--iy:${t.iy != null ? t.iy : 26}px`,
          t.driftDur ? `--drift-dur:${t.driftDur}` : "",
        ]
          .filter(Boolean)
          .join(";");
        return `<div class="${cls.join(" ")}" data-i="${i}" style="${style}">
          <div class="hero-tile-drift">
            <div class="hero-tile-inner">
              <div class="hero-tile-media">${mediaHTML(t)}</div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    const tileEls = Array.from(orbit.querySelectorAll(".hero-tile"));

    // Lazy-start real video tiles only once visible. Since every video
    // tile sits above the fold, they'd all intersect within the same
    // frame on load — staggering each tile's FIRST play by a small,
    // index-based delay spreads out the initial fetches instead of
    // bursting 6 multi-MB requests at once. Later re-intersections
    // (scrolling back up) start immediately, no stagger.
    const startedVideos = new WeakSet();
    let videoStartOrder = 0;
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const vid = entry.target.querySelector("video");
            if (!vid) return;
            if (entry.isIntersecting) {
              if (!startedVideos.has(vid)) {
                startedVideos.add(vid);
                const delay = videoStartOrder * 180;
                videoStartOrder++;
                setTimeout(() => requestVideoPlay(vid), delay);
              } else {
                requestVideoPlay(vid);
              }
            } else {
              vid.pause && vid.pause();
              releaseVideoSlot(vid);
            }
          });
        },
        { threshold: 0.2 }
      );
      tileEls.forEach((el) => {
        if (el.querySelector("video")) vio.observe(el);
      });
    }

    if (prefersReducedMotion || isTouch) return;

    // Combined mouse + scroll parallax, rAF-throttled, applied to
    // the inner wrapper so it never fights the outer entrance animation.
    const stage = document.getElementById("heroStage");
    let mx = 0, my = 0, sy = 0, raf = null;
    function apply() {
      raf = null;
      tileEls.forEach((el, i) => {
        const t = tiles[i];
        const inner = el.querySelector(".hero-tile-inner");
        if (!inner || !t.depth) return;
        const tx = mx * t.depth.mx;
        const ty = my * t.depth.my + sy * t.depth.sy;
        inner.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0)`;
      });
    }
    function queue() {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    }
    if (stage) {
      stage.addEventListener("mousemove", (e) => {
        const r = stage.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;
        my = (e.clientY - r.top) / r.height - 0.5;
        queue();
      });
      stage.addEventListener("mouseleave", () => {
        mx = 0; my = 0;
        queue();
      });
    }
    window.addEventListener(
      "scroll",
      () => {
        sy = window.scrollY || window.pageYOffset || 0;
        queue();
      },
      { passive: true }
    );
  })();

  /* ----------------------------------------------------------
     10. HERO — kinetic filmstrip of real creative thumbnails
     Two rows, auto-scrolling opposite directions (pure CSS
     transform animation — cheap, GPU-composited). A single
     rAF-throttled scroll listener adds a subtle parallax drift
     so the rows feel scroll-linked, not just looping.

     Row 1 = AI Reels + 360° Catalogue only, real 9:16 content,
     rendered in a 9:16 tile (see .tile-video CSS) so cover never
     crops. Items with a real .video get an actual <video muted
     loop playsinline preload="none">, started only once the tile
     scrolls into the filmstrip's horizontal viewport (see the
     IntersectionObserver below) — never more than a handful of
     the real clips decode/play at once. Items without .video fall
     back to their thumb image.

     Row 2 = Static Ads only, real 4:5 content, rendered in a 4:5
     tile (.tile-static). No Carousel content in either row — it
     already has its own tab in the main showcase.
  ---------------------------------------------------------- */
  (function buildHeroFilmstrip() {
    const wrap = document.getElementById("heroFilmstrip");
    if (!wrap) return;

    const rowA = [].concat(REELS, CATALOGUE); // video row: reels + catalogue only
    const rowB = STATICS.slice(); // static row: static ads only

    // Every REELS/CATALOGUE item gets a real <video> tile — concurrency is
    // bounded not by an arbitrary cap on which items are eligible, but by
    // the IntersectionObserver below: only tiles actually scrolled into the
    // filmstrip's horizontal viewport ever play, and they pause the moment
    // they scroll back out. That keeps simultaneous decodes bounded by
    // what's on screen (plus the initial-load stagger), while still
    // letting every real clip play as it comes into view, not just a
    // fixed handful.
    function videoTileHTML(item) {
      if (item.video) {
        return `<video class="fs-media" src="${item.video}#t=0.1" poster="${item.thumb || ""}" muted loop playsinline preload="none"></video>`;
      }
      return `<img class="fs-media" src="${item.thumb}" loading="lazy" alt="">`;
    }

    function rowHTML(items, dir, dur, tileClass, mediaFn) {
      if (!items.length) return "";
      const doubled = items.concat(items); // seamless loop
      const tiles = doubled
        .map((item) => `<div class="filmstrip-tile ${tileClass}">${mediaFn(item)}</div>`)
        .join("");
      return `<div class="filmstrip-row dir-${dir}" style="--dur:${dur}s"><div class="filmstrip-track">${tiles}</div></div>`;
    }

    wrap.innerHTML =
      rowHTML(rowA, "left", 48, "tile-video", videoTileHTML) +
      rowHTML(rowB, "right", 60, "tile-static", (item) => `<img class="fs-media" src="${item.thumb}" loading="lazy" alt="">`);

    // Lazy-start real video tiles only once horizontally visible
    // within the filmstrip — keeps far more than a couple of the
    // ~44 real 9:16 clips from ever decoding/playing simultaneously.
    // The filmstrip often sits right alongside the hero orbit within the
    // same first viewport, so its own enabled tiles can all intersect in
    // the same initial callback — stagger each tile's first play so those
    // requests don't burst at once alongside the orbit's.
    const startedFsVideos = new WeakSet();
    let fsVideoStartOrder = 0;
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const vid = entry.target.querySelector("video");
            if (!vid) return;
            if (entry.isIntersecting && !prefersReducedMotion) {
              if (!startedFsVideos.has(vid)) {
                startedFsVideos.add(vid);
                const delay = fsVideoStartOrder * 180;
                fsVideoStartOrder++;
                setTimeout(() => requestVideoPlay(vid), delay);
              } else {
                requestVideoPlay(vid);
              }
            } else {
              vid.pause && vid.pause();
              releaseVideoSlot(vid);
            }
          });
        },
        { root: null, threshold: 0.15 }
      );
      wrap.querySelectorAll(".filmstrip-tile.tile-video").forEach((el) => {
        if (el.querySelector("video")) vio.observe(el);
      });
    }

    // Subtle scroll-linked parallax: rows drift vertically at
    // slightly different rates as the hero scrolls out of view.
    if (prefersReducedMotion) return;
    const rows = wrap.querySelectorAll(".filmstrip-row");
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        rows.forEach((row, i) => {
          row.style.transform = `translateY(${y * (0.04 + i * 0.03)}px)`;
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* ----------------------------------------------------------
     11. SCROLL-REVEAL (IntersectionObserver)
  ---------------------------------------------------------- */
  (function reveal() {
    const items = document.querySelectorAll(".reveal-on-scroll");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach((i) => i.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((i) => io.observe(i));
  })();

  /* ----------------------------------------------------------
     12. NAV: smooth scroll + active link highlight
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // No beforeunload confirmation here on purpose: browsers don't allow
  // a custom message or custom buttons on that prompt (every browser
  // shows its own generic "Leave site? Changes may not be saved"
  // wording, Cancel/Leave only) so it can only ever appear as a jarring
  // system dialog, not a page-native one — and it's redundant besides,
  // since the order/brand-field state is already autosaved to
  // localStorage on every change (see persistState()/restoreState()),
  // so nothing is actually lost however someone leaves. The explicit
  // per-item ✕ and the cart-level Clear button (#orderCartClearBtn,
  // wired below) are the real, always-visible way to discard a draft.

  // Minimal cart-replacement hook so team.js (a separate script/
  // closure with no access to this file's private `state`) can drive
  // the order builder from outside — used by Order History's "Edit
  // Order" flow to load an already-placed order's items back into the
  // real builder and reuse this exact same render path (renderCart,
  // persistState, etc.) that every normal add/remove/qty change goes
  // through, instead of building a second parallel cart UI.
  window.FastrrOrderBuilder = {
    setCart(items) {
      state.cart = (items || []).map((it) => ({
        id: cartIdSeq++,
        service: it.service,
        tier: it.tier || null,
        qty: Math.max(1, Number(it.qty) || 1),
      }));
      render();
    },
    clearCart() {
      state.cart = [];
      render();
    },
  };

  /* ----------------------------------------------------------
     FASTY — public-only FAQ assistant. Entirely client-side pattern
     matching against a small knowledge base built from this file's
     own DATA/pricing constants (not a hard-coded copy of them), so an
     answer can never quote a price that's out of sync with what the
     calculator itself shows. No network calls, nothing to configure —
     this is deliberately a fast, predictable FAQ layer, not a general
     LLM chat. The DOM guard below is what actually keeps this off the
     team build: the markup itself is stripped out at build time (see
     TEAM:STRIP in src/master.html), so #fastyWidget simply doesn't
     exist there and this whole function becomes a no-op.
  ---------------------------------------------------------- */
  function initFasty() {
    const widget = document.getElementById("fastyWidget");
    if (!widget) return;

    const toggle = document.getElementById("fastyToggle");
    const hint = document.getElementById("fastyHint");
    const hintClose = document.getElementById("fastyHintClose");
    const panel = document.getElementById("fastyPanel");
    const panelCloseBtn = document.getElementById("fastyPanelClose");
    const panelExpandBtn = document.getElementById("fastyPanelExpand");
    const messagesEl = document.getElementById("fastyMessages");
    const quickEl = document.getElementById("fastyQuick");
    const form = document.getElementById("fastyForm");
    const input = document.getElementById("fastyInput");
    const micBtn = document.getElementById("fastyMicBtn");
    if (!toggle || !panel || !messagesEl || !form || !input) return;

    const START_PRICE = { catalogue: DATA.catalogue.basePrice, static: DATA.static.basePrice, carousel: DATA.carousel.basePrice, reels: DATA.reel1.basePrice };

    /* ---- Language — English or Hindi (written the way people
       actually type/read it here: Devanagari grammar with common
       English/brand words like "reel", "GST", "order" left as-is,
       i.e. natural Hinglish rather than a purist translation), fully
       auto-detected — no visible toggle. One flag drives all three
       surfaces at once: which reply text renders, what language voice
       recognition listens for next, and what language speech
       synthesis speaks in, so a visitor never gets Hindi text read
       back in an English voice or vice versa. Detected fresh from
       every typed or spoken message, so it follows the conversation
       rather than needing to be set up front — the one limitation is
       the very first voice turn of a session, before any language has
       been detected yet, which listens in English (best all-rounder
       for Hinglish/Indian-accented speech) until a message signals
       otherwise. */
    let uiLang = "en";
    const HINGLISH_RE = /\b(kya|kaise|kitna|kitne|kitni|hai|hain|kripya|chahiye|karo|kardo|bhejo|batao|paisa|rupaye|rupees|samay|turant|abhi|madad|dhanyavaad|shukriya|namaste|namaskar|theek|accha|bhai|kimat|keemat|daam|chhoot|milega|karna|karni|sakte|mujhe|aap|hamare|humein)\b/i;
    function detectLang(text) {
      if (/[ऀ-ॿ]/.test(text)) return "hi";
      if (HINGLISH_RE.test(text)) return "hi";
      return "en";
    }
    // The KB below matches on Latin/Hinglish keywords, but hi-IN speech
    // recognition transcribes spoken Hindi as Devanagari script, and a
    // fair share of typed Hindi comes in Devanagari too — so without
    // this, every intent match would silently fail for anyone actually
    // speaking or typing native Hindi, always falling through to the
    // generic "didn't understand" reply. This maps the common Devanagari
    // words for each intent onto the Hinglish keyword the KB already
    // recognizes, so matching (not the displayed message) runs against
    // the normalized text.
    const DEVANAGARI_KEYWORD_MAP = [
      [/नमस्ते|नमस्कार|हाय+|हेलो+/g, "namaste"],
      [/सर्विस|सेवा/g, "services"],
      [/रील/g, "reel"],
      [/कैटलॉग|कैटालॉग/g, "catalogue"],
      [/स्टैटिक/g, "static"],
      [/कैरोसेल/g, "carousel"],
      [/न्यूनतम/g, "kam se kam"],
      [/डिस्काउंट|छूट|कूपन|ऑफर/g, "discount"],
      [/जीएसटी/g, "gst"],
      [/टैक्स/g, "tax"],
      [/कीमत|दाम|प्राइस|रेट|क़ीमत/g, "price"],
      [/कितन[ेाी]/g, "kitna"],
      [/ऑर्डर/g, "order"],
      [/कैसे/g, "kaise"],
      [/करना है|करूं|करें|करदो|करो/g, "karna hai"],
      [/डिलीवरी/g, "delivery"],
      [/कब तक/g, "kab tak"],
      [/समय/g, "samay"],
      [/बदलाव|रिवीजन/g, "revision"],
      [/संपर्क|सम्पर्क/g, "contact"],
      [/कनेक्ट/g, "connect"],
      [/टीम से बात|बात करनी है/g, "team se baat"],
      [/टीम से/g, "team se"],
      [/शुक्रिया|धन्यवाद/g, "shukriya"],
      [/अलविदा/g, "alvida"],
      [/दिखाएं|दिखाओ|दिखा/g, "dekhein"],
    ];
    function normalizeForMatch(text) {
      let out = text;
      for (const [re, repl] of DEVANAGARI_KEYWORD_MAP) out = out.replace(re, repl);
      return out;
    }
    function setLang(lang) {
      uiLang = lang;
      const isHi = lang === "hi";
      if (recognition) recognition.lang = isHi ? "hi-IN" : "en-IN";
      if (!isListening) input.placeholder = isHi ? "Services, pricing ya ordering ke baare mein poochein…" : "Ask about services, pricing, or ordering…";
    }

    function scrollToSelector(sel) {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      closePanel();
    }
    function openLead() {
      const btn = document.querySelector(".js-open-lead-modal");
      if (btn) btn.click();
    }
    const ACTION_QUOTE = (lang) => ({ label: lang === "hi" ? "Quote banayein" : "Open quote builder", onClick: () => scrollToSelector("#quote") });
    const ACTION_SERVICES = (lang) => ({ label: lang === "hi" ? "Services dekhein" : "See Services", onClick: () => scrollToSelector("#services") });
    const ACTION_TALK = (lang) => ({ label: lang === "hi" ? "Team se baat karein" : "Talk to the team", onClick: () => openLead() });

    function escapeHtml(s) {
      return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }
    function stripHtml(html) {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    /* ---- Voice — Web Speech API, feature-detected. Recognition turns
       a spoken question into the same sendUserMessage() path a typed
       one takes (so it goes through the identical KB matching, no
       separate voice-only logic to drift out of sync); synthesis
       speaks the reply back, but only for turns that started as voice
       — a typed question still gets a silent text reply, so voice
       stays something the visitor opts into rather than a surprise
       the first time Fasty answers. Removed entirely (not just
       disabled) on browsers without support. */
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const canSpeak = "speechSynthesis" in window;
    let recognition = null;
    let isListening = false;
    let voiceTurn = false;

    // Voice list loads async in most browsers (empty on the first call,
    // populated once "voiceschanged" fires), so it's cached and kept
    // fresh rather than read fresh inside speak() every time.
    let cachedVoices = [];
    if (canSpeak) {
      const loadVoices = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }
    // Prefers an Indian-accented female voice for the given language,
    // and — since "robotic" is almost always a quality-tier problem,
    // not a gender one — a higher-quality voice within that language
    // family before a lower one. The Web Speech API exposes no
    // quality/age/gender field, only whatever a voice's own name
    // carries, so this reads a few real-world naming patterns: OS
    // vendors increasingly ship both a legacy "Desktop"/compact voice
    // (fast, robotic, always-available offline) and a much better
    // network/neural one for the same language — Windows' "...Online
    // (Natural)" voices, and Chrome/Android's "Google ..." voices are
    // both meaningfully more natural-sounding than the legacy default,
    // so those are preferred first, ahead of even gender-matching a
    // lower-quality voice. An exact-region voice that happens to be
    // male-named (e.g. Windows' only Hindi voice is often "Microsoft
    // Ravi", a man) no longer wins outright just for matching the
    // region — a female or unlabeled (gender-neutral name, common for
    // network voices, which for hi-IN/en-IN already default to a
    // female-sounding voice) voice in the same language family
    // outranks it. Voice packs vary hugely by OS/browser, so this
    // degrades gracefully through each tier rather than assuming any
    // of them exist, down to null (browser default) at the very end.
    const QUALITY_HINTS = /natural|neural|enhanced|premium|online|wavenet|google/i;
    const FEMALE_HINTS = /female|woman|girl|zira|heera|lekha|veena|priya|kalpana|shreya|neerja|swara|aditi|ananya|kavya|samantha|kate|karen|susan|moira|tessa|salli|joanna|kimberly|ivy/i;
    const MALE_HINTS = /\bmale\b|\bman\b|david|ravi\b|rishi|hemant|prabhat|daniel|george|mark|james|matthew|justin|kevin|brian|joey/i;
    function pickVoice(lang) {
      const voices = cachedVoices.length ? cachedVoices : (canSpeak ? window.speechSynthesis.getVoices() : []);
      if (!voices.length) return null;
      const wantLang = lang === "hi" ? "hi-in" : "en-in";
      const wantFamily = lang === "hi" ? "hi" : "en";
      const isQuality = (v) => QUALITY_HINTS.test(v.name);
      const isFemale = (v) => FEMALE_HINTS.test(v.name);
      const isMale = (v) => MALE_HINTS.test(v.name);
      const exact = voices.filter((v) => (v.lang || "").toLowerCase() === wantLang);
      const family = voices.filter((v) => (v.lang || "").toLowerCase().startsWith(wantFamily));
      return (
        exact.find((v) => isQuality(v) && isFemale(v)) ||
        exact.find((v) => isQuality(v) && !isMale(v)) ||
        family.find((v) => isQuality(v) && isFemale(v)) ||
        family.find((v) => isQuality(v) && !isMale(v)) ||
        exact.find(isFemale) ||
        exact.find((v) => !isMale(v)) ||
        family.find(isFemale) ||
        exact[0] ||
        family.find((v) => !isMale(v)) ||
        family[0] ||
        null
      );
    }

    // Split into sentences and queue them as separate utterances
    // (speechSynthesis plays consecutive speak() calls back to back)
    // instead of one long utterance — most engines pace and breathe a
    // run of short utterances more naturally than a single dense
    // paragraph, where they tend to rush or flatten out partway
    // through. Falls back to the whole string as one sentence if the
    // split finds nothing (short replies, no terminal punctuation).
    function splitSentences(text) {
      const parts = text.match(/[^.!?]+[.!?]*/g);
      return parts && parts.length ? parts.map((s) => s.trim()).filter(Boolean) : [text];
    }

    function speak(text) {
      if (!canSpeak || !text) return;
      window.speechSynthesis.cancel();
      const lang = uiLang === "hi" ? "hi-IN" : "en-IN";
      const voice = pickVoice(uiLang);
      splitSentences(text).forEach((sentence) => {
        const utter = new SpeechSynthesisUtterance(sentence);
        utter.lang = lang;
        if (voice) {
          try {
            utter.voice = voice;
          } catch (err) {
            // Falls back to the browser's own default voice for
            // utter.lang — still correct-language, just not
            // necessarily the specific voice picked above.
          }
        }
        // Left at the engine's own natural rate/pitch rather than
        // sped up or pitch-shifted — synthetic pitch-shifting is
        // exactly what pushes a voice from "natural" to "robotic",
        // since it's simple signal processing, not real re-synthesis.
        utter.rate = 1;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
      });
    }

    if (micBtn) {
      if (!SpeechRecognitionCtor) {
        micBtn.remove();
      } else {
        recognition = new SpeechRecognitionCtor();
        // Starts listening in Hindi, not English. There's no way to
        // detect spoken language before recognition has already
        // decoded something (the Web Speech API takes one fixed
        // language per session, it can't guess), and English speech
        // fed to an en-IN model with no Hindi in it yet transcribes
        // fine either way — but Hindi/Hinglish speech fed to en-IN
        // comes out as mangled English word-salad instead of
        // Devanagari or a recognizable Hinglish transcript, which
        // then can't be language-detected at all and silently answers
        // in English. hi-IN's model is built around Hindi-English
        // code-switching (the norm for how this audience actually
        // talks) and handles clear English within it fine too, so it's
        // the safer default until a typed message says otherwise.
        recognition.lang = "hi-IN";
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.addEventListener("start", () => {
          isListening = true;
          micBtn.classList.add("is-listening");
          micBtn.setAttribute("aria-pressed", "true");
          input.placeholder = "Listening…";
        });
        const stopListeningUI = () => {
          isListening = false;
          micBtn.classList.remove("is-listening");
          micBtn.setAttribute("aria-pressed", "false");
          input.placeholder = "Ask about services, pricing, or ordering…";
        };
        recognition.addEventListener("end", stopListeningUI);
        recognition.addEventListener("error", stopListeningUI);
        recognition.addEventListener("result", (e) => {
          let transcript = "";
          for (let i = e.resultIndex; i < e.results.length; i++) transcript += e.results[i][0].transcript;
          input.value = transcript;
          if (e.results[e.results.length - 1].isFinal && transcript.trim()) {
            voiceTurn = true;
            sendUserMessage(transcript);
          }
        });

        micBtn.addEventListener("click", () => {
          if (canSpeak && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
          if (isListening) {
            recognition.stop();
            return;
          }
          openPanel();
          try {
            recognition.start();
          } catch (err) {
            // start() throws if already running (e.g. a fast double
            // click) — the existing session continues, nothing to do.
          }
        });
      }
    }

    // AI Reel cuts, keyed the same way DATA is (reel1..reel4) — used
    // both for the specific-cut answers and the generic "which reel?"
    // clarifying question below, so there's one source of truth for
    // the 4 cut names/order instead of two copies drifting apart.
    const REEL_TIERS = [
      { key: "reel1", label: "Quick Cut" },
      { key: "reel2", label: "Story Cut" },
      { key: "reel3", label: "Director's Cut" },
      { key: "reel4", label: "Studio Cut" },
    ];
    function reelReply(d, lang) {
      const cut = d.name.replace("AI Reel — ", "");
      const deliveryRaw = d.turnaround.split(" after")[0];
      const delivery = deliveryRaw.charAt(0).toLowerCase() + deliveryRaw.slice(1);
      if (lang === "hi")
        return `<p>Badhiya choice 🙂 Hamara <b>${escapeHtml(cut)}</b> ${fmtINR(d.basePrice)} per reel hai. ${escapeHtml(d.short)}</p><p>Isme ${d.duration.toLowerCase()} milta hai, ${d.revisions.toLowerCase()} included hai, aur usually ${escapeHtml(delivery)} mein deliver ho jaata hai.</p>`;
      return `<p>Good pick 🙂 Our <b>${escapeHtml(cut)}</b> is ${fmtINR(d.basePrice)} per reel. ${escapeHtml(d.short)}</p><p>You're looking at ${d.duration.toLowerCase()}, with ${d.revisions.toLowerCase()} included, and it's usually delivered in ${escapeHtml(delivery)}.</p>`;
    }

    // Matches "reel"/"reels" together with a pricing, turnaround, or
    // revisions word in the same message, in either order — e.g. "how
    // long does a reel take" or "revisions on a reel" — including the
    // common Hinglish phrasing of the same questions. Used to make the
    // reel-cut clarifying question actually acknowledge what was asked
    // instead of a one-size-fits-all "which one sounds right".
    const INTENT_WORDS =
      "(price|pricing|cost|how much|rate|rates|charges|kitna|kitne|kimat|keemat|daam|paisa|turnaround|delivery|deliver|how long|how fast|kab tak|samay|revision|revisions|edits?|changes|badlaav)";
    const REEL_INTENT_RE = new RegExp("\\breel\\w*\\b.*\\b" + INTENT_WORDS + "\\b|\\b" + INTENT_WORDS + "\\b.*\\breel\\w*\\b", "i");
    function reelIntentHint(text, lang) {
      text = normalizeForMatch(text);
      const isHi = lang === "hi";
      if (/price|pricing|cost|how much|rate|rates|charges|kitna|kimat|keemat|daam|paisa/i.test(text))
        return isHi ? "Pricing us baat par depend karti hai ki aap kaunsa cut lete hain" : "Pricing depends on which cut you go with";
      if (/turnaround|delivery|deliver|how long|how fast|kab tak|samay/i.test(text))
        return isHi ? "Turnaround is baat par depend karta hai ki aap kaunsa cut lete hain" : "Turnaround depends on which cut you go with";
      if (/revision|revisions|edits?|changes|badlaav/i.test(text))
        return isHi ? "Revisions ki number cut ke hisaab se alag hoti hai" : "The number of revisions depends on which cut you go with";
      return isHi ? "Ye thoda is baat par depend karta hai ki aap kaunsa cut lete hain" : "That depends a bit on which cut you go with";
    }

    /* ---- knowledge base ----
       Warm and conversational, like a helpful teammate talking someone
       through their options, not a terse fact dump, and without the
       stray em dashes and symbols that make text read as AI-written.
       Ordered so intent (what's actually being asked) beats a bare
       service mention: e.g. "how long for a reel" should answer
       turnaround, not just redirect to "which cut do you want" with
       no acknowledgement of the question. reelSpecific and reelIntent
       both sit ahead of the plain reelsGeneric catch-all for that
       reason. */
    const KB = [
      {
        id: "greeting",
        test: /\b(hi|hii+|hello+|hey+|yo|namaste|namaskar)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Namaste! 👋 Aapse baat karke khushi hui. Hamari services, pricing, ya ordering ke baare mein kuch bhi poochh sakte hain.</p>`
            : `<p>Hey there! 👋 Happy to help. Feel free to ask me anything about our services, pricing, or how ordering works.</p>`,
      },
      {
        id: "reelSpecific",
        test: /\b(quick cut|story cut|director'?s cut|studio cut)\b/i,
        reply: (text, lang) => {
          const hit = REEL_TIERS.find((t) => new RegExp(t.label.replace("'", "'?"), "i").test(text));
          return reelReply(DATA[hit.key], lang);
        },
        actions: (text, lang) => [ACTION_QUOTE(lang)],
      },
      {
        id: "reelIntent",
        test: REEL_INTENT_RE,
        reply: (text, lang) => `<p>${reelIntentHint(text, lang)}. ${lang === "hi" ? "Aap kaunsa dekh rahe hain" : "Which one are you looking at"}?</p>`,
        actions: () => REEL_TIERS.map((t) => ({ label: t.label, onClick: () => sendUserMessage(t.label) })),
      },
      {
        id: "reelsGeneric",
        test: /\b(reel|reels|ai reel)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>AI Reels hamare sabse popular formats mein se ek hain 😊 Aapko kitna creative input dena hai uske hisaab se kuch cuts available hain. Aapke liye kaunsa sahi rahega?</p>`
            : `<p>AI Reels are one of our most popular formats 😊 We've got a few cuts depending on how much creative input you'd like. Which one sounds right for you?</p>`,
        actions: () => REEL_TIERS.map((t) => ({ label: t.label, onClick: () => sendUserMessage(t.label) })),
      },
      {
        id: "catalogue",
        test: /\b(catalogue|catalog|360)\b/i,
        reply: (text, lang) => {
          const d = DATA.catalogue;
          if (lang === "hi")
            return `<p>Bilkul! Hamara <b>${escapeHtml(d.name)}</b> ${fmtINR(d.basePrice)} per SKU hai. ${escapeHtml(d.short)}</p><p>Isme ${d.duration.toLowerCase()} milta hai, ${d.revisions.toLowerCase()} included hai, aur hum usually 24 se 48 ghante mein deliver kar dete hain.</p>`;
          return `<p>Sure! Our <b>${escapeHtml(d.name)}</b> is ${fmtINR(d.basePrice)} per SKU. ${escapeHtml(d.short)}</p><p>It runs ${d.duration.toLowerCase()}, comes with ${d.revisions.toLowerCase()}, and we'd typically deliver it within 24 to 48 hours.</p>`;
        },
        actions: (text, lang) => [ACTION_QUOTE(lang)],
      },
      {
        id: "static",
        test: /\bstatic\b/i,
        reply: (text, lang) => {
          const d = DATA.static;
          if (lang === "hi")
            return `<p>Bilkul! Hamara <b>${escapeHtml(d.name)}</b> ${fmtINR(d.basePrice)} per creative hai. ${escapeHtml(d.short)}</p><p>Ye ${escapeHtml(d.format)} mein aata hai, ${d.revisions.toLowerCase()} included hai, aur karib 24 ghante mein deliver ho jaata hai.</p>`;
          return `<p>Of course! Our <b>${escapeHtml(d.name)}</b> is ${fmtINR(d.basePrice)} per creative. ${escapeHtml(d.short)}</p><p>It comes in ${escapeHtml(d.format)}, with ${d.revisions.toLowerCase()} included, and delivers within about 24 hours.</p>`;
        },
        actions: (text, lang) => [ACTION_QUOTE(lang)],
      },
      {
        id: "carousel",
        test: /\bcarousel\b/i,
        reply: (text, lang) => {
          const d = DATA.carousel;
          if (lang === "hi")
            return `<p>Zaroor madad karenge! Hamara <b>${escapeHtml(d.name)}</b> ${fmtINR(d.basePrice)} per carousel hai. ${escapeHtml(d.short)}</p><p>Isme ${d.duration.toLowerCase()} milta hai, ${d.revisions.toLowerCase()} included hai, aur usually 24 se 48 ghante mein deliver ho jaata hai.</p>`;
          return `<p>Happy to help! Our <b>${escapeHtml(d.name)}</b> is ${fmtINR(d.basePrice)} per carousel. ${escapeHtml(d.short)}</p><p>It's ${d.duration.toLowerCase()}, comes with ${d.revisions.toLowerCase()}, and usually takes 24 to 48 hours to deliver.</p>`;
        },
        actions: (text, lang) => [ACTION_QUOTE(lang)],
      },
      {
        id: "services",
        test: /\b(service|services|what do you (offer|do)|options|packages|kya services|kya milta hai|kya karte ho)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Zaroor madad karenge 🎬 Hum 4 formats mein kaam karte hain: AI Reels, 360° Catalogue Videos, Statics, aur Carousels. Kisi bhi ek ke baare mein bata sakte hain.</p><p>Aap kis baare mein jaanna chahenge?</p>`
            : `<p>We'd love to help with that 🎬 We work across 4 formats: AI Reels, 360° Catalogue Videos, Statics, and Carousels. I'm happy to walk you through any of them.</p><p>Which one would you like to know more about?</p>`,
        actions: () => [
          { label: "AI Reels", onClick: () => sendUserMessage("AI Reels") },
          { label: "Catalogue Video", onClick: () => sendUserMessage("Catalogue Video") },
          { label: "Static", onClick: () => sendUserMessage("Static") },
          { label: "Carousel", onClick: () => sendUserMessage("Carousel") },
        ],
      },
      {
        id: "minOrder",
        test: /\b(minimum|min\.?\s?order|kam se kam)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Accha sawaal! Hum ₹10,000 minimum per order rakhte hain, lekin aap kuch bhi mix-and-match karke wahan tak pahunch sakte hain. Calculator aapke liye running total dikhata rehta hai.</p>`
            : `<p>Good question! We work with a ₹10,000 minimum per order, but you're welcome to mix and match anything you like to get there. The calculator keeps a running total for you as you go.</p>`,
        actions: (text, lang) => [ACTION_QUOTE(lang)],
      },
      {
        id: "discount",
        test: /\b(discount|coupon|save10|offer|deal|chhoot)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Aap lucky hain ✨ ${fmtINR(PUBLIC_OFFER_THRESHOLD)} se zyada ke orders par automatically <b>${PUBLIC_OFFER_CODE}</b> apply ho jaata hai aur ${PUBLIC_OFFER_PCT}% off milta hai. Kuch karne ki zaroorat nahi, khud hi lag jaata hai.</p>`
            : `<p>You're in luck ✨ Orders over ${fmtINR(PUBLIC_OFFER_THRESHOLD)} automatically get <b>${PUBLIC_OFFER_CODE}</b> applied for ${PUBLIC_OFFER_PCT}% off. Nothing you need to do, it just kicks in for you.</p>`,
        actions: (text, lang) => [ACTION_QUOTE(lang)],
      },
      {
        id: "gst",
        test: /\b(gst|tax|taxes)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Koi surprise nahi hoga. GST (18%) already aapke total mein included hai, toh checkout par jo dikhega wahi aapko pay karna hoga.</p>`
            : `<p>No surprises there. GST (18%) is already included in your total, so what you see at checkout is exactly what you'll pay.</p>`,
      },
      {
        id: "pricing",
        test: /\b(price|pricing|cost|how much|rate|rates|charges|kitna|kitne|kimat|keemat|daam)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Zaroor batate hain 🙂 Roughly, Reels ${fmtINR(START_PRICE.reels)} se, Catalogue Videos ${fmtINR(START_PRICE.catalogue)} se, Statics ${fmtINR(START_PRICE.static)} se, aur Carousels ${fmtINR(START_PRICE.carousel)} se shuru hote hain.</p><p>Inme se kisi ek ki exact price chahiye?</p>`
            : `<p>Happy to break that down 🙂 Roughly, we start from ${fmtINR(START_PRICE.reels)} for Reels, ${fmtINR(START_PRICE.catalogue)} for Catalogue Videos, ${fmtINR(START_PRICE.static)} for Statics, and ${fmtINR(START_PRICE.carousel)} for Carousels.</p><p>Would you like the exact price for one of these?</p>`,
        actions: () => [
          { label: "AI Reels", onClick: () => sendUserMessage("AI Reels") },
          { label: "Catalogue Video", onClick: () => sendUserMessage("Catalogue Video") },
          { label: "Static", onClick: () => sendUserMessage("Static") },
          { label: "Carousel", onClick: () => sendUserMessage("Carousel") },
        ],
      },
      {
        id: "orderProcess",
        test: /\b(order process|how (do|to) (i|you) order|place (an|my) order|how does ordering work|how to buy|how do i buy|order kaise|kaise order|order karna hai|order karu)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Bilkul simple hai, bata dete hain 🙂</p><p>Pehle ek service choose karein aur quantity set karein, phir apne order mein add karein. Aur kuch chahiye toh wahi karte rahiye. Ready hone par bas Place Your Order dabayein aur thodi details share karein, baaki hum sambhal lenge.</p>`
            : `<p>It's pretty straightforward, happy to walk you through it 🙂</p><p>You'd start by picking a service and setting your quantity below, then add it to your order. Feel free to do that for anything else you need too. Once you're ready, just hit Place Your Order and share a few details, and we'll take it from there.</p>`,
        actions: (text, lang) => [ACTION_QUOTE(lang), ACTION_SERVICES(lang)],
      },
      {
        id: "turnaround",
        test: /\b(turnaround|delivery time|how long|how fast|when will|days? to deliver|kab tak|kitna samay|kitne din)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Ye is baat par depend karta hai ki aap kya chahte hain. Reels usually cut ke hisaab se 1 se 5 working days lete hain, baaki sab typically 24 se 48 ghante mein ho jaata hai. Waise, clock tab shuru hota hai jab hume aapse sab kuch mil jaata hai, payment date se nahi.</p>`
            : `<p>That really depends on what you're going for. Reels usually take 1 to 5 working days depending on the cut, while everything else is typically 24 to 48 hours. Just so you know, the clock starts once we've received everything we need from you, not from the payment date.</p>`,
      },
      {
        id: "revisions",
        test: /\b(revision|revisions|edits?|changes|badlaav)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Ye service ke hisaab se thoda alag hota hai, Catalogue Video mein koi revision nahi to Studio Cut reel mein 2 tak. Aapke dimaag mein kaunsa hai? Main exact number bata dunga.</p>`
            : `<p>That varies a bit by service, anywhere from no revisions on Catalogue Video up to 2 on our Studio Cut reel. Which one did you have in mind? I can give you the exact number.</p>`,
        actions: (text, lang) => [ACTION_SERVICES(lang)],
      },
      {
        id: "contact",
        test: /\b(contact|connect|talk to (a|the)? ?(human|team|sales|someone)|call (you|us)|whatsapp|email you|reach you|speak to|baat karni hai|team se|sampark)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Bilkul, connect karwa dete hain 🙂 Contact form khol rahi hoon jahan aap apni requirement bata sakte hain. Hamari team aage sambhal legi.</p>`
            : `<p>Of course, happy to connect you 🙂 Let me open our contact form so you can share a bit about what you need. Our team will take it from there.</p>`,
        actions: (text, lang) => [ACTION_TALK(lang)],
      },
      {
        id: "thanks",
        test: /\b(thank|thanks|thx|thankyou|shukriya|dhanyavaad)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Bilkul, swagat hai! Kabhi bhi madad chahiye toh bata dijiyega 🙂</p>`
            : `<p>You're very welcome! Happy to help anytime, just let me know if anything else comes to mind 🙂</p>`,
      },
      {
        id: "bye",
        test: /\b(bye|goodbye|see ya|cya|alvida)\b/i,
        reply: (text, lang) =>
          lang === "hi"
            ? `<p>Dhyan rakhiyega, aane ke liye shukriya! 👋 Kuch bhi chahiye ho toh main yahin hoon.</p>`
            : `<p>Take care, and thanks for stopping by! 👋 I'll be right here if you need anything else.</p>`,
      },
    ];

    function findAnswer(text) {
      const norm = normalizeForMatch(text);
      for (const entry of KB) {
        if (entry.test.test(norm)) return entry;
      }
      return null;
    }

    function addMessage(role, html, actions) {
      const row = document.createElement("div");
      row.className = "fasty-msg " + role;
      const bubble = document.createElement("div");
      bubble.className = "fasty-msg-bubble";
      bubble.innerHTML = html;
      if (actions && actions.length) {
        const actWrap = document.createElement("div");
        actWrap.className = "fasty-msg-actions";
        actions.forEach((a) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "fasty-msg-action";
          b.textContent = a.label;
          b.addEventListener("click", a.onClick);
          actWrap.appendChild(b);
        });
        bubble.appendChild(actWrap);
      }
      row.appendChild(bubble);
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
      const row = document.createElement("div");
      row.className = "fasty-msg bot";
      row.id = "fastyTypingRow";
      row.innerHTML = '<div class="fasty-msg-bubble"><div class="fasty-typing"><span></span><span></span><span></span></div></div>';
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping() {
      const row = document.getElementById("fastyTypingRow");
      if (row) row.remove();
    }

    // Tracked so a second unrecognized message in a row gets a
    // different, shorter nudge instead of the exact same paragraph
    // repeating verbatim, which is what actually reads as a broken
    // bot rather than one that simply didn't understand.
    let consecutiveMisses = 0;

    function respond(text) {
      showTyping();
      const delay = 380 + Math.random() * 340;
      setTimeout(() => {
        hideTyping();
        const match = findAnswer(text);
        let replyHtml;
        if (match) {
          consecutiveMisses = 0;
          replyHtml = match.reply(text, uiLang);
          addMessage("bot", replyHtml, match.actions ? match.actions(text, uiLang) : null);
        } else {
          consecutiveMisses++;
          const isHi = uiLang === "hi";
          replyHtml =
            consecutiveMisses > 1
              ? isHi
                ? `<p>Abhi bhi samajh nahi paaya, sorry. Kisi aur tarah se poochh ke dekhna chahenge, ya main seedha team se connect kar doon?</p>`
                : `<p>Still not quite catching that, sorry. Want to try asking in a different way, or should I just connect you with the team?</p>`
              : isHi
                ? `<p>Sorry, mujhe theek se samajh nahi aaya 🤔 Main services, pricing, ya ordering se related sawaalon mein sabse achi hoon. Dobara try karna chahenge, ya main aapko seedha team se connect kar doon?</p>`
                : `<p>Sorry, I'm not quite sure I caught that 🤔 I'm best with questions about our services, pricing, or how ordering works. Happy to help if you'd like to try again, or I can connect you with the team directly.</p>`;
          addMessage("bot", replyHtml, [ACTION_SERVICES(uiLang), ACTION_TALK(uiLang)]);
        }
        // Only speak the reply when this exchange started as voice —
        // a typed question still gets a silent text reply.
        if (voiceTurn) {
          voiceTurn = false;
          speak(stripHtml(replyHtml));
        }
      }, delay);
    }

    // Icon SVGs kept as plain markup strings (not a shared icon map
    // elsewhere) since these four are only ever used here, in the
    // action-grid launcher shown before the first real message.
    function getQuickStarters(lang) {
      if (lang === "hi") {
        return [
          { label: "Services aur pricing", text: "Aap kya services dete hain aur unki cost kya hai?" },
          { label: "Order kaise karein", text: "Order process kaise kaam karta hai?" },
          { label: "Turnaround time", text: "Turnaround time kya hai?" },
          { label: "Discount aur GST", text: "Discount aur GST ke baare mein batayein" },
          { label: "Team se baat karein", text: "Mujhe team se baat karni hai" },
        ];
      }
      return [
        { label: "Services & pricing", text: "What services do you offer and what do they cost?" },
        { label: "How ordering works", text: "How does the order process work?" },
        { label: "Turnaround time", text: "What's the turnaround time?" },
        { label: "Discounts & GST", text: "Tell me about discounts and GST" },
        { label: "Talk to the team", text: "I'd like to talk to the team" },
      ];
    }
    function renderQuickChips() {
      quickEl.innerHTML = "";
      getQuickStarters(uiLang).forEach((q) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "fasty-quick-chip";
        b.innerHTML = `<span class="fasty-quick-label">${escapeHtml(q.label)}</span>`;
        b.addEventListener("click", () => sendUserMessage(q.text));
        quickEl.appendChild(b);
      });
    }

    function sendUserMessage(text) {
      const trimmed = text.trim();
      if (!trimmed) return;
      // Auto-switch the active language to match what was just typed
      // or spoken, so the reply (and, for a voice turn, the spoken-
      // back audio) lands in the same language without needing a
      // manual toggle every time — the toggle stays there for getting
      // ahead of it before speaking, since recognition needs a
      // language set up front and can't guess.
      setLang(detectLang(trimmed));
      // The starter chips only earn their space before the conversation
      // has actually started — once someone's asked anything (typed or
      // tapped a starter itself), that row is just eating room the
      // messages above it could use, so it's cleared for the rest of
      // this session rather than staying pinned under every reply.
      quickEl.innerHTML = "";
      addMessage("user", escapeHtml(trimmed));
      input.value = "";
      respond(trimmed);
    }

    let seeded = false;
    function seedGreeting() {
      if (seeded) return;
      seeded = true;
      addMessage(
        "bot",
        uiLang === "hi"
          ? `<p>Namaste, main Fasty hoon 👋 Hamari services, pricing, aur ordering process mein madad ke liye yahan hoon. Aapki kya madad kar sakti hoon?</p>`
          : `<p>Hi there, I'm Fasty 👋 I'm here to help you find your way around our services, pricing, and the ordering process. What can I help you with today?</p>`
      );
      renderQuickChips();
    }

    function hideHint() {
      if (hint) hint.classList.remove("visible");
    }

    function openPanel() {
      widget.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      hideHint();
      seedGreeting();
      setTimeout(() => input.focus(), 150);
    }
    function closePanel() {
      widget.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      if (isListening) recognition.stop();
      if (canSpeak) window.speechSynthesis.cancel();
    }
    function togglePanel() {
      if (widget.classList.contains("open")) closePanel();
      else openPanel();
    }
    function toggleExpand() {
      const expanded = panel.classList.toggle("is-expanded");
      panelExpandBtn.setAttribute("aria-pressed", String(expanded));
      panelExpandBtn.setAttribute("aria-label", expanded ? "Shrink chat" : "Expand chat");
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    toggle.addEventListener("click", togglePanel);
    if (panelCloseBtn) panelCloseBtn.addEventListener("click", closePanel);
    if (panelExpandBtn) panelExpandBtn.addEventListener("click", toggleExpand);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && widget.classList.contains("open")) closePanel();
    });
    document.addEventListener("click", (e) => {
      if (!widget.classList.contains("open")) return;
      // composedPath() is captured at dispatch time, so it still lists
      // the widget as an ancestor even when a click handler earlier in
      // the same bubble phase detaches the clicked element from the DOM
      // (e.g. a quick-reply chip that clears its own parent's innerHTML
      // on click) — a live widget.contains(e.target) check would miss
      // that case, since the now-detached node no longer has the widget
      // anywhere in its (empty) ancestor chain, and incorrectly close
      // the panel out from under the very click that was inside it.
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      if (path.includes(widget) || widget.contains(e.target)) return;
      closePanel();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      sendUserMessage(input.value);
    });

    if (hintClose) {
      hintClose.addEventListener("click", (e) => {
        e.stopPropagation();
        hideHint();
      });
    }

    // A one-time nudge — badge dot + a small "Need help?" label above
    // the toggle — a few seconds after load, if the visitor hasn't
    // opened the chat yet. Quietly invites a first look rather than
    // auto-opening the panel and interrupting them. Unlike the badge,
    // the hint itself doesn't auto-dismiss on a timer — it stays up
    // (gently fading in and out) until the visitor actually opens the
    // chat or dismisses it directly.
    setTimeout(() => {
      if (widget.classList.contains("open")) return;
      if (hint) hint.classList.add("visible");
    }, 4000);
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  restoreState();
  renderShowcase("reels");
  render();
  initFasty();
})();
