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
     0. ACCESS MODE (public vs internal team)
     This is a static site with no backend — nothing here is real
     security, just keeping the order-building/quoting tools out of a
     public visitor's way. Two genuinely separate URLs, not one URL
     redirecting into the other:
       - creative.fastrr.com/           → public, always.
       - creative.fastrr.com/teamfastrr → internal, always — the exact
         same file is served at both paths (see the <base href="/">
         note in index.html's <head>), so landing on /teamfastrr never
         navigates anywhere; it just renders unlocked in place.
     The legacy ?team=1 query param still works too (unlocks + strips
     itself from the URL) for anyone with it bookmarked. Either path
     remembers the unlock on that device from then on via localStorage.
     Everything else on the page (showcase, service scope, the
     single-creative price calculator) stays visible to everyone —
     only the Order panel and the Message Generator section are gated,
     since those are the sales workflow, not the public-facing preview.
  ---------------------------------------------------------- */
  (function initAccessMode() {
    const UNLOCK_PARAM = "team";
    const params = new URLSearchParams(window.location.search);
    let unlocked = false;
    try {
      unlocked = localStorage.getItem("fastrr-internal") === "1";
    } catch (e) {}
    if (/^\/teamfastrr\/?$/.test(window.location.pathname)) {
      unlocked = true;
    }
    if (params.has(UNLOCK_PARAM)) {
      unlocked = true;
      params.delete(UNLOCK_PARAM);
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? "?" + newSearch : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
    if (unlocked) {
      try {
        localStorage.setItem("fastrr-internal", "1");
      } catch (e) {}
    }
    document.documentElement.classList.toggle("is-internal", unlocked);
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
      language: "Not applicable — silent, no voiceover",
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
        "SKU list with product names — which products need a rotation",
        "Reference/inspiration for the rotation style (if any)",
      ],
      deliver: "1 MP4 per SKU in the chosen aspect ratio, 8–15 sec, silent — no text, voiceover, or music — delivered via shared drive folder",
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
      deliver: "2 files — 1:1 and 9:16, PNG/JPG, print-ready resolution, delivered via shared drive folder",
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
      short: "Script from your brief, 1 minor revision included.",
      benefit: "The quickest, most affordable way into AI reels.",
      duration: "Up to 25 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (minor, in-frame changes only)", scripting: "Script written from your brief — no separate approval step",
      language: "Hindi / English voiceover",
      turnaround: "1–2 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Script written from the brief we discuss together — no separate approval step",
        "Single 9:16 export, up to 25 sec",
        "1 revision — minor, in-frame changes (e.g. text or element placement)",
      ],
      excluded: ["Script shared for approval", "Major creative changes or new concepts (new order)", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, fully discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, up to 25 sec, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Script is now written internally from the brief at every reel tier — the
      // real differentiator between tiers is whether it's shared for approval
      // (Tier 3+) and how generous the revision scope is. Writer is involved from
      // Tier 1 onward even though there's no client-facing script approval step.
      support: ["writer", "editor", "call"],
    },
    reel2: {
      name: "AI Reel — Story Cut", tier: 2, unit: "reel", basePrice: 3500,
      short: "Script from your brief, 1 limited-scope revision included.",
      benefit: "A safety net for wording & hook-length tweaks.",
      duration: "Max 25 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (limited scope — wording, hook length only)", scripting: "Script written from your brief — no separate approval step",
      language: "Hindi / English voiceover",
      turnaround: "Up to 3 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Script written from the brief we discuss together — no separate approval step",
        "Single 9:16 export, max 25 sec",
        "1 revision (limited scope — wording, hook length only)",
      ],
      excluded: ["Script shared for approval", "Major creative changes or new concepts (new order)", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, fully discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 25 sec, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Same brief-led scripting as Tier 1 (no separate approval step) — Tier 2's
      // differentiator is a slightly wider revision scope, not the scripting process.
      support: ["writer", "editor", "call"],
    },
    reel3: {
      name: "AI Reel — Director's Cut", tier: 3, unit: "reel", basePrice: 5000,
      short: "1 script option shared for approval, room for small changes.",
      benefit: "Writer + Editor input for a stronger script direction.",
      duration: "Max 30 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (small script/communication changes)", scripting: "1 script option shared for approval",
      language: "Hindi / English voiceover",
      turnaround: "Up to 4 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with Writer + Editor input",
        "Single 9:16 export, max 30 sec",
        "1 script option shared for approval",
        "Small script/communication changes accommodated — e.g. hook, CTA, minor additions/removals",
      ],
      excluded: ["Additional hook options", "Major creative rework or new concepts (new order)", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 30 sec, plus 1 script shared for approval, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Script now goes through an actual approval step (not just review), with
      // small script/communication changes accommodated as part of that approval —
      // still no Creative Director oversight or multiple hook options, which is
      // what separates this from Tier 4.
      support: ["writer", "editor", "call"],
    },
    reel4: {
      name: "AI Reel — Studio Cut", tier: 4, unit: "reel", basePrice: 8000,
      short: "1 script + 2 hook options, shared for approval.",
      benefit: "Full Creative Director involvement, top-tier polish.",
      duration: "Max 35 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (small script/communication changes)", scripting: "1 script + 2 hook options shared for approval",
      language: "Hindi / English voiceover",
      turnaround: "Up to 5 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with full Writer + Editor + Creative Director involvement",
        "Single 9:16 export, max 35 sec",
        "1 script + 2 hook options shared for approval",
        "Small script/communication changes accommodated — e.g. hook selection, CTA, minor additions/removals",
      ],
      excluded: ["Major creative rework or new concepts (new order)", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 35 sec, plus 1 script + 2 hook options for approval, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Top tier: full Writer + Editor + Creative Director involvement, 2 hook
      // options instead of Tier 3's 1, and the longest working-day window to match
      // the deeper creative oversight.
      support: ["writer", "editor", "director", "call"],
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
    "Product images — high-resolution with a clean background, or raw product images/footage, as available",
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

  function renderServiceNav() {
    svcNav.querySelectorAll(".svc-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.svc === state.service);
    });
    tierRow.classList.toggle("is-hidden", state.service !== "reels");
    if (state.service === "reels") {
      tierRow.querySelectorAll(".tier-chip").forEach((chip) => {
        chip.classList.toggle("active", Number(chip.dataset.tier) === state.tier);
      });
    }
  }

  function scopeListHTML(items) {
    return items.map((i) => `<li>${i}</li>`).join("");
  }

  const SUPPORT_ROLES = [
    { key: "writer", label: "Dedicated Content Writer" },
    { key: "editor", label: "Dedicated Video Editor" },
    { key: "director", label: "Creative Director Oversight" },
    { key: "call", label: "Call Support &amp; Requirement Discussion" },
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
    document.getElementById("svcName").textContent = d.name;
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
    const cart = computeCart();
    const list = document.getElementById("orderCartList");
    document.getElementById("ocCount").textContent =
      cart.items.length === 0 ? "0 items" : cart.items.length === 1 ? "1 item" : `${cart.items.length} items`;

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
        <p>No creatives added yet — configure one on the left and click "Add to Order."</p>
      </div>`;
    } else {
      list.innerHTML = cart.items
        .map((item) => {
          const name = item.d.name;
          const facts = keyFacts(item.d)
            .slice(0, 2)
            .map(([l, v]) => `${l}: ${v}`)
            .join("   ");
          return `<div class="cart-item" data-id="${item.id}">
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
        "No creatives have been added to this order yet — add at least one under \"03 — Quote & Price Calculator\" above to generate this message.";
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
    "Turnaround shown for each package is per single creative. For bulk orders or multiple creative types, overall delivery depends on quantity, creative type, package/tier, complexity, and final requirements.",
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
        ".svc-tab, .tier-chip, .scope-tab-btn, .showcase-tab, .qtier-chip, #qtyMinus, #qtyPlus, #obAddBtn, #orderCartList button"
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
  svcNav.querySelectorAll(".svc-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      withScrollAnchor(() => {
        state.service = btn.dataset.svc;
        render();
        switchShowcaseCat(state.service === "reels" ? "reels" : state.service);
      });
    });
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
      renderMessages();
    });
  }
  if (websiteInput) {
    websiteInput.addEventListener("input", (e) => {
      state.website = e.target.value;
      clearFieldError(websiteInput);
      renderMessages();
    });
  }
  if (brandCategorySelect) {
    brandCategorySelect.addEventListener("change", (e) => {
      state.brandCategory = e.target.value;
      clearFieldError(brandCategorySelect);
      renderMessages();
    });
  }
  const specialReqInputEl = document.getElementById("specialReqInput");
  if (specialReqInputEl) {
    specialReqInputEl.addEventListener("input", (e) => {
      state.specialReq = e.target.value;
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
      btn.textContent = ok ? "Copied ✓" : "Copy failed — select & copy manually";
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
  ---------------------------------------------------------- */
  const LEAD_EMAIL = "anmol.sharma@pickrr.com";
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("leadName").value.trim(),
        email: document.getElementById("leadEmail").value.trim(),
        phone: document.getElementById("leadPhone").value.trim(),
        brand: document.getElementById("leadBrand").value.trim(),
        requirement: document.getElementById("leadRequirement").value.trim(),
        details: document.getElementById("leadDetails").value.trim(),
      };
      if (!data.name || !data.email || !data.phone || !data.requirement) {
        setStatus("Please fill in your name, email, phone, and requirement.", "error");
        return;
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
        setStatus("Couldn't reach our form directly — opening your email app with these details instead.", "error");
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
    return isDemo
      ? `<span class="wc-demo-note">${escapeHtml(item.catlabel)}</span>`
      : `<span class="wc-cat-pill">${escapeHtml(item.catlabel || item.cat)}</span>`;
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
                setTimeout(() => vid.play && vid.play().catch(() => {}), delay);
              } else {
                vid.play && vid.play().catch(() => {});
              }
            } else {
              vid.pause && vid.pause();
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
                setTimeout(() => vid.play && vid.play().catch(() => {}), delay);
              } else {
                vid.play && vid.play().catch(() => {});
              }
            } else {
              vid.pause && vid.pause();
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

  // Footer wordmark's shine loop starts on first scroll-into-view (see
  // .footer-mark.in-view in the CSS, which flips animation-play-state
  // from paused to running) rather than running the whole time it's
  // off-screen — separate from the generic reveal-on-scroll above
  // since this drives an animation trigger, not an opacity fade.
  (function footerMarkReveal() {
    const mark = document.querySelector(".footer-mark");
    if (!mark) return;
    if (!("IntersectionObserver" in window)) {
      mark.classList.add("in-view");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mark.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(mark);
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

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  renderShowcase("reels");
  render();
})();
