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
      basePrice: 1500,
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
      name: "AI Reel — Tier 1", tier: 1, unit: "reel", basePrice: 2000,
      short: "Script from your brief, 1 minor revision included.",
      benefit: "The quickest, most affordable way into AI reels.",
      duration: "Max 20 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (minor, in-frame changes only)", scripting: "Script written from your brief — no separate approval step",
      language: "Hindi / English voiceover",
      turnaround: "1–2 working days per reel after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Script written from the brief we discuss together — no separate approval step",
        "Single 9:16 export, max 20 sec",
        "1 revision — minor, in-frame changes (e.g. text or element placement)",
      ],
      excluded: ["Script shared for approval", "Major creative changes or new concepts (new order)", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, fully discussed brief before work starts",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 20 sec, delivered via shared drive folder",
      dimNote: "Includes 1 dimension (9:16). Additional dimensions can be added and are quoted separately depending on requirement.",
      // Script is now written internally from the brief at every reel tier — the
      // real differentiator between tiers is whether it's shared for approval
      // (Tier 3+) and how generous the revision scope is. Writer is involved from
      // Tier 1 onward even though there's no client-facing script approval step.
      support: ["writer", "editor", "call"],
    },
    reel2: {
      name: "AI Reel — Tier 2", tier: 2, unit: "reel", basePrice: 3500,
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
      name: "AI Reel — Tier 3", tier: 3, unit: "reel", basePrice: 5000,
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
      name: "AI Reel — Tier 4", tier: 4, unit: "reel", basePrice: 8000,
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
  const COMMON_NEED = [
    "Brand logo",
    "Brand colour palette (if available)",
    "Brand fonts (if available)",
    "Selected product(s) to be featured",
    "Product page / website link",
    "Product images — high-resolution with a clean background, or raw product images/footage, as available",
  ];

  function fmtINR(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

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
    discountPct: 0, // order-level discount, applied once to the whole cart's subtotal
    scopeTab: "inc", // inc | exc | need
    brandName: "",
    website: "",
    brandCategory: "",
    specialReq: "",
  };
  let cartIdSeq = 1;

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
    const pct = Math.min(100, Math.max(0, state.discountPct || 0));
    const discountAmt = subtotal * (pct / 100);
    const taxable = subtotal - discountAmt;
    const gstAmt = taxable * GST_RATE;
    const final = taxable + gstAmt;
    return { items, subtotal, pct, discountAmt, taxable, gstAmt, final };
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

  // Loads a cart line back into the builder for reconfiguring (service,
  // tier, qty) and removes it from the cart — re-adding is then just
  // clicking "Add to Order" again, so editing a tier doesn't need its
  // own inline tier-picker duplicated on every row.
  function editCartItem(id) {
    const item = state.cart.find((i) => i.id === id);
    if (!item) return;
    state.service = item.service;
    if (item.tier) state.tier = item.tier;
    state.qty = item.qty;
    state.cart = state.cart.filter((i) => i.id !== id);
    render();
    switchShowcaseCat(state.service === "reels" ? "reels" : state.service);
    document.getElementById("qServiceSelect").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ----------------------------------------------------------
     3. RENDER: SERVICE SELECTOR + SCOPE PANEL
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
    {
      key: "writer",
      label: "Dedicated Content Writer",
      icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
    },
    {
      key: "editor",
      label: "Dedicated Video Editor",
      icon: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
    },
    {
      key: "director",
      label: "Creative Director Oversight",
      icon: '<circle cx="12" cy="8" r="4"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
    },
    {
      key: "call",
      label: "Call Support &amp; Requirement Discussion",
      icon: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    },
  ];

  function renderSupportBlock() {
    const d = currentData();
    const support = d.support || [];
    const wrap = document.getElementById("supportBlock");
    wrap.innerHTML = SUPPORT_ROLES.map((role) => {
      const included = support.indexOf(role.key) !== -1;
      const state = included ? "is-included" : "is-excluded";
      const badge = included ? "✓" : "✕";
      return `<div class="support-item ${state}">
        <div class="support-icon-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${role.icon}</svg>
          <span class="support-badge">${badge}</span>
        </div>
        <div class="support-item-body">
          <span>${role.label}</span>
          <em class="support-state-label">${included ? "Included" : "Not Included"}</em>
        </div>
      </div>`;
    }).join("");
  }

  function renderServiceSummary() {
    const d = currentData();
    document.getElementById("svcName").textContent = d.name;
    document.getElementById("svcStartPrice").textContent = fmtINR(d.basePrice) + " / " + (d.unit || "package");
    document.getElementById("svcShort").textContent = d.short || "";
    document.getElementById("svcBenefit").textContent = d.benefit || "";
    renderSupportBlock();
  }

  function renderScopePanel() {
    const d = currentData();
    scopePanel.querySelectorAll(".scope-tab-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === state.scopeTab)
    );
    let html = "";
    if (state.scopeTab === "inc") {
      html = `<ul class="scope-list">${scopeListHTML(d.included)}</ul>`;
    } else if (state.scopeTab === "exc") {
      html = `<ul class="scope-list scope-exc">${scopeListHTML(d.excluded)}</ul>`;
    } else {
      // Split into brand/product assets (identical for every package, so
      // labeled as a one-time ask) vs. what's specific to this creative —
      // same split the requirements message uses for a multi-item order,
      // shown here for whoever's just browsing a single package.
      html = `
        <div class="scope-need-group">
          <span class="scope-need-label">Brand &amp; product assets — once per order</span>
          <ul class="scope-list scope-need">${scopeListHTML(COMMON_NEED)}</ul>
        </div>
        <div class="scope-need-group">
          <span class="scope-need-label">Specific to this creative</span>
          <ul class="scope-list scope-need">${scopeListHTML(d.need)}</ul>
        </div>
        ${d.dimNote ? `<p class="scope-note">${d.dimNote}</p>` : ""}
      `;
    }
    document.getElementById("scopeListWrap").innerHTML = html;

    const metaWrap = document.getElementById("scopeMeta");
    const rows = [
      ["Price", fmtINR(d.basePrice) + " / " + (d.unit || "package")],
      ["Revisions", d.revisions],
      ["Duration", d.duration],
      ["Dimensions / Format", d.format],
      ["Turnaround", d.turnaround],
      ["Script / Approval", d.scripting],
    ];
    if (d.language) rows.push(["Language", d.language]);
    metaWrap.innerHTML = rows
      .map(
        ([k, v]) =>
          `<div class="scope-meta-row"><span>${k}</span><b>${v}</b></div>`
      )
      .join("");
    document.getElementById("scopeDeliver").textContent = d.deliver;

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
    // change from outside this control (e.g. the Services section's own
    // svc-tab buttons), and previously nothing here ever wrote back to
    // qServiceSelect.value, so the dropdown could silently show a
    // different service than the one actually active/priced below it.
    const qServiceSelect = document.getElementById("qServiceSelect");
    if (qServiceSelect.value !== state.service) qServiceSelect.value = state.service;

    // Tier chips only apply to AI Reel — hide the whole field for
    // tier-less services (matches how the Services section's #tierRow
    // hides itself for the same case), and keep exactly one chip marked
    // .active, driven directly from state.tier.
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
            .map(([l, v]) => `<span>${l}: ${v}</span>`)
            .join("");
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
              <button type="button" class="ci-edit" data-action="edit" title="Edit" aria-label="Edit">✎</button>
              <button type="button" class="ci-remove" data-action="remove" title="Remove" aria-label="Remove">✕</button>
            </div>
          </div>`;
        })
        .join("");
    }

    document.getElementById("qDiscountInput").value = state.discountPct;
    document.getElementById("qSubtotal").textContent = fmtINR(cart.subtotal);
    document.getElementById("qDiscountAmt").textContent = "− " + fmtINR(cart.discountAmt);
    document.getElementById("qGstAmt").textContent = "+ " + fmtINR(cart.gstAmt);
    document.getElementById("qFinal").textContent = fmtINR(cart.final);
  }

  /* ----------------------------------------------------------
     5. RENDER: MESSAGE TEMPLATES
  ---------------------------------------------------------- */
  function renderMessages() {
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
      cart.pct > 0 ? `Discount (${cart.pct}%): − ${fmtINR(cart.discountAmt)}` : null,
      `GST (18%): + ${fmtINR(cart.gstAmt)}`,
      `Total: ${fmtINR(cart.final)} (incl. GST)`,
    ]
      .filter(Boolean)
      .join("\n");

    // Message 1 — Package Summary. One block per creative type/tier in
    // the order (deliverables/duration/revisions/script/format/language/
    // timeline), then a single combined pricing breakdown for the whole
    // order — readable by client AND creative team alike in one shared
    // WhatsApp group. Deliberately excludes the client-requirements
    // checklist (that's message 2's job only, no overlap between the two).
    const orderBlock = cart.items
      .map((item, idx) => {
        const d = item.d;
        return `${idx + 1}. ${d.name} — Qty ${item.qty} — ${fmtINR(item.lineSubtotal)}
Deliverables: ${d.deliver}
Duration: ${d.duration}
Revisions: ${d.revisions}${d.scripting && !/^(no scripting|not applicable)/i.test(d.scripting) ? `\nScript / Approval: ${d.scripting}` : ""}
Format / Dimensions: ${d.format}${d.language && !/^not applicable/i.test(d.language) ? `\nLanguage: ${d.language}` : ""}
Timeline: ${d.turnaround}${d.dimNote ? "\n" + d.dimNote : ""}`;
      })
      .join("\n\n");

    const clientMsg = `Package Summary — ${brandName}

Brand: ${brandName} (${brandCategory})
Website: ${website}

Order:
${orderBlock}

Pricing:
${priceBlock}`;

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
     6. MASTER RENDER
  ---------------------------------------------------------- */
  function render() {
    renderServiceNav();
    renderServiceSummary();
    renderScopePanel();
    renderCalculator();
    renderCart();
    renderMessages();
  }

  /* ----------------------------------------------------------
     7. WIRE UP CONTROLS
  ---------------------------------------------------------- */
  svcNav.querySelectorAll(".svc-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.service = btn.dataset.svc;
      render();
      switchShowcaseCat(state.service === "reels" ? "reels" : state.service);
    });
  });

  tierRow.querySelectorAll(".tier-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.tier = Number(chip.dataset.tier);
      render();
    });
  });

  scopePanel.querySelectorAll(".scope-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.scopeTab = btn.dataset.tab;
      renderScopePanel();
    });
  });

  const qQtyInput = document.getElementById("qQtyInput");
  qQtyInput.addEventListener("input", () => {
    state.qty = Math.max(1, parseInt(qQtyInput.value, 10) || 1);
    render();
  });
  document.getElementById("qtyMinus").addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    render();
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    state.qty = state.qty + 1;
    render();
  });

  // Order-level discount — applies once to the combined cart subtotal,
  // not per line item.
  const qDiscountInput = document.getElementById("qDiscountInput");
  qDiscountInput.addEventListener("input", () => {
    state.discountPct = Math.min(100, Math.max(0, parseFloat(qDiscountInput.value) || 0));
    renderCart();
    renderMessages();
  });

  // order-builder service/tier controls
  document.getElementById("qServiceSelect").addEventListener("change", (e) => {
    state.service = e.target.value;
    render();
    switchShowcaseCat(state.service);
  });
  document.querySelectorAll(".qtier-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.tier = Number(chip.dataset.tier);
      render();
    });
  });

  document.getElementById("obAddBtn").addEventListener("click", addToOrder);

  // Delegated so it keeps working as cart rows are added/removed/re-rendered.
  document.getElementById("orderCartList").addEventListener("click", (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = Number(row.dataset.id);
    const action = e.target.closest("button")?.dataset.action;
    if (action === "inc") changeCartQty(id, 1);
    else if (action === "dec") changeCartQty(id, -1);
    else if (action === "remove") removeCartItem(id);
    else if (action === "edit") editCartItem(id);
  });

  const brandNameInput = document.getElementById("brandNameInput");
  const websiteInput = document.getElementById("websiteInput");
  const brandCategorySelect = document.getElementById("brandCategorySelect");
  const REQUIRED_FIELDS = [brandNameInput, websiteInput, brandCategorySelect];

  function clearFieldError(el) {
    el.classList.remove("input-error");
  }
  brandNameInput.addEventListener("input", (e) => {
    state.brandName = e.target.value;
    clearFieldError(brandNameInput);
    renderMessages();
  });
  websiteInput.addEventListener("input", (e) => {
    state.website = e.target.value;
    clearFieldError(websiteInput);
    renderMessages();
  });
  brandCategorySelect.addEventListener("change", (e) => {
    state.brandCategory = e.target.value;
    clearFieldError(brandCategorySelect);
    renderMessages();
  });
  document.getElementById("specialReqInput").addEventListener("input", (e) => {
    state.specialReq = e.target.value;
    renderMessages();
  });

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

  /* ----------------------------------------------------------
     8. THEME TOGGLE (persisted)
  ---------------------------------------------------------- */
  (function initTheme() {
    const root = document.documentElement;
    const btn = document.getElementById("themeToggle");
    let saved = null;
    try {
      saved = localStorage.getItem("fastrr-theme");
    } catch (e) {}
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial = saved || (prefersLight ? "light" : "dark");
    root.setAttribute("data-theme", initial);

    btn.addEventListener("click", () => {
      const isLight = root.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("fastrr-theme", next); } catch (e) {}
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

  // Card face shows only what's genuinely useful to identify a creative at
  // a glance — its name, category, and type — instead of a duration badge
  // stamped over the media and a marketing-style "hook" tagline that read
  // inconsistently from one creative to the next. Category sits in a pill
  // (an "eyebrow" above the title) rather than as plain inline text, and
  // every text block has a reserved height, so a row of cards with titles
  // of different lengths still lines up card-for-card instead of each
  // info panel settling to its own height. Demo/placeholder items (not
  // real delivered work) show their own explanatory label instead of a
  // category, so they're never mistaken for one of the categories above.
  function workCardMetaHTML(item) {
    const typeLabel = SHOWCASE_TYPE_LABEL[activeShowcaseCat] || "";
    const isDemo = item.cat === "demo";
    // Demo/placeholder copy is a full sentence, not a short label — forcing
    // it into a pill alongside real categories would look broken, so it
    // gets a plain muted caption instead, with no type row underneath.
    const catHTML = isDemo
      ? `<span class="wc-demo-note">${escapeHtml(item.catlabel)}</span>`
      : `<span class="wc-cat-pill">${escapeHtml(item.catlabel || item.cat)}</span>`;
    return `<div class="wc-info">
        ${catHTML}
        <h5 class="wc-title">${escapeHtml(item.title)}</h5>
        ${isDemo ? "" : `<span class="wc-type-tag">${escapeHtml(typeLabel)}</span>`}
      </div>`;
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
          <button class="wc-mini-prev" aria-label="Previous slide">‹</button>
          <button class="wc-mini-next" aria-label="Next slide">›</button>
          <div class="wc-dots">${slideDots}</div>
        </div>
        ${workCardMetaHTML(item)}
      </article>`;
    }
    return `
      <article class="work-card ${arClass}" data-idx="${idx}" style="--i:${idx}">
        <div class="wc-media-wrap">
          ${mediaTagHTML(item, "wc-media")}
        </div>
        ${workCardMetaHTML(item)}
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
    tab.addEventListener("click", () => renderShowcase(tab.dataset.cat));
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
        ? `<video src="${item.video}" poster="${item.thumb || ""}" controls playsinline preload="metadata"></video>`
        : `<img src="${item.thumb}" alt="${escapeHtml(item.title)}">`;
      lbMedia.innerHTML = `
        <div class="lb-frame ${lbFrameClass}">
          ${mediaEl}
          ${isVertical && !item.video ? `<span class="lb-play-badge">▶</span>` : ""}
        </div>`;
      lbCaption.innerHTML = `<span class="lb-cat">${escapeHtml(item.catlabel || item.cat)} · ${SHOWCASE_TYPE_LABEL[activeShowcaseCat] || ""}</span><h3>${escapeHtml(item.title)}</h3>`;
    }
  }

  function openLightbox(idx) {
    lbIndex = idx;
    lbSlideIndex = 0;
    renderLightboxMedia();
    lb.classList.add("open");
    document.body.classList.add("lb-locked");
  }
  function closeLightbox() {
    lb.classList.remove("open");
    document.body.classList.remove("lb-locked");
  }
  function navLightbox(delta) {
    const total = activeShowcaseList.length;
    if (!total) return;
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
      // restrained gradient-glow accent. Every other column's tiles are
      // drawn from the pools so the whole wall stays a real mix of shots.
      const pattern =
        c === 0
          ? [{ kind: "video", item: heroVideo, extraClass: "tile-hero" }, { kind: "img" }, { kind: "video" }, { kind: "img" }]
          : c === 1
          ? [{ kind: "video", item: catVideo, extraClass: "tile-secondary" }, { kind: "img" }, { kind: "video" }, { kind: "img" }]
          : [{ kind: "video" }, { kind: "img" }, { kind: "video" }, { kind: "img" }];

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

    // Lazy-start real video tiles only once visible.
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const vid = entry.target.querySelector("video");
            if (!vid) return;
            if (entry.isIntersecting) {
              vid.play && vid.play().catch(() => {});
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
    if ("IntersectionObserver" in window) {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const vid = entry.target.querySelector("video");
            if (!vid) return;
            if (entry.isIntersecting && !prefersReducedMotion) {
              vid.play && vid.play().catch(() => {});
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
