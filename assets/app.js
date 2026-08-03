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
      language: "Not applicable",
      turnaround: "5–7 business days after we receive everything needed from you",
      included: [
        "AI-generated 360° rotation per SKU",
        "Silent, looped motion, 8–15 sec",
        "1 aspect ratio of your choice",
        "Clean/white or brand-background finish",
      ],
      excluded: [
        "Revisions of any kind",
        "Scripting, voiceover or text overlay",
        "Model or human presenter",
        "Additional aspect ratios (quoted separately)",
      ],
      need: [
        "High-resolution product images (white background, multiple angles preferred)",
        "SKU list with product names",
        "Product page/link for reference",
      ],
      deliver: "1 MP4 per SKU in the chosen aspect ratio, 8–15 sec, silent, delivered via shared drive folder",
      // No scripting step on this service (see `scripting: "No scripting"` above), so
      // no dedicated writer or Creative Director script sign-off applies — only the
      // editor building the rotation and the standard brief/requirement call.
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
      turnaround: "3–5 business days after we receive everything needed from you",
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
        "Brand logo",
        "Colour palette & font family (if any)",
        "High-res product images (white background)",
        "Key message/offer to highlight",
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
      turnaround: "5–7 business days after we receive everything needed from you",
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
        "Brand logo & guidelines (if available)",
        "Up to 5 key points/features to spotlight",
        "High-res product images (white background)",
      ],
      deliver: "Up to 5 slides × 2 sizes, PNG/JPG set, numbered & sequenced, delivered via shared drive folder",
      // Same reasoning as Static — design-only, `scripting: "Not applicable"`.
      support: ["editor", "call"],
    },
    reel1: {
      name: "AI Reel — Tier 1", tier: 1, unit: "reel", basePrice: 2000,
      short: "Brief-only build, fastest turnaround.",
      benefit: "The quickest, most affordable way into AI reels.",
      duration: "Max 20 sec", format: "9:16 (1 dimension)",
      revisions: "No revision", scripting: "No scripting approval",
      language: "Hindi / English voiceover",
      turnaround: "24 working hours after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built strictly from the discussed client brief",
        "Single 9:16 export, max 20 sec",
      ],
      excluded: ["Any revision", "Script shared for approval", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, fully discussed brief before work starts (no script will be shared on this tier)",
        "Product images / footage",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 20 sec, delivered via shared drive folder",
      dimNote: "Includes 1 dimension only (9:16). Additional dimensions are charged separately depending on requirement.",
      // `excluded` explicitly rules out "Script shared for approval" and there's no
      // writer/CD mention in `included` — brief-only build, editor assembles it.
      support: ["editor", "call"],
    },
    reel2: {
      name: "AI Reel — Tier 2", tier: 2, unit: "reel", basePrice: 3500,
      short: "1 limited-scope revision included.",
      benefit: "A safety net for wording & hook-length tweaks.",
      duration: "Max 25 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (limited scope)", scripting: "No scripting approval",
      language: "Hindi / English voiceover",
      turnaround: "24 working hours after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built strictly from the discussed client brief",
        "Single 9:16 export, max 25 sec",
        "1 revision (limited scope — wording, hook length only)",
      ],
      excluded: ["Script shared for approval", "Additional dimensions (quoted separately)"],
      need: [
        "A clear, fully discussed brief before work starts (no script will be shared on this tier)",
        "Product images / footage",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 25 sec, delivered via shared drive folder",
      dimNote: "Includes 1 dimension only (9:16). Additional dimensions are charged separately depending on requirement.",
      // Adds a limited-scope revision but `excluded` still rules out "Script shared
      // for approval" — no writer/CD role beyond Tier 1.
      support: ["editor", "call"],
    },
    reel3: {
      name: "AI Reel — Tier 3", tier: 3, unit: "reel", basePrice: 5000,
      short: "1 script shared for review, not approval.",
      benefit: "Writer + Editor input for a stronger script direction.",
      duration: "Max 30 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (limited scope)", scripting: "1 script shared for review (not approval)",
      language: "Hindi / English voiceover",
      turnaround: "48 working hours after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with Writer + Editor input",
        "Single 9:16 export, max 30 sec",
        "1 revision (limited scope)",
        "1 script option shared for review (not approval)",
      ],
      excluded: ["Script sign-off/approval (review only)", "Additional dimensions (quoted separately)", "Hook options"],
      need: [
        "A clear, discussed brief before work starts",
        "Product images / footage",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 30 sec, plus 1 script shared for review, delivered via shared drive folder",
      dimNote: "Includes 1 dimension only (9:16). Additional dimensions are charged separately depending on requirement.",
      // `included` explicitly says "Reel built with Writer + Editor input" — writer
      // added. `excluded` rules out "Script sign-off/approval (review only)", so no
      // Creative Director oversight yet — that arrives at Tier 4.
      support: ["writer", "editor", "call"],
    },
    reel4: {
      name: "AI Reel — Tier 4", tier: 4, unit: "reel", basePrice: 8000,
      short: "1 script + 2 hooks, shared for approval.",
      benefit: "Full Creative Director involvement, top-tier polish.",
      duration: "Max 35 sec", format: "9:16 (1 dimension)",
      revisions: "1 revision (limited scope)", scripting: "1 script + 2 hooks shared for approval",
      language: "Hindi / English voiceover",
      turnaround: "54 working hours after we receive everything needed from you",
      included: [
        "AI voiceover, in Hindi or English",
        "Reel built with full Writer + Editor + Creative Director involvement",
        "Single 9:16 export, max 35 sec",
        "1 revision (limited scope)",
        "1 script + 2 hooks shared for approval",
      ],
      excluded: ["Additional dimensions (quoted separately)"],
      need: [
        "A clear, discussed brief before work starts",
        "Product images / footage",
        "Key selling points & tone direction",
        "Preferred voiceover language (Hindi/English)",
      ],
      deliver: "1 MP4, 9:16, max 35 sec, plus 1 script + 2 hook options for approval, delivered via shared drive folder",
      dimNote: "Includes 1 dimension only (9:16). Additional dimensions are charged separately depending on requirement.",
      // `included` explicitly says "full Writer + Editor + Creative Director
      // involvement" — all four support roles are covered at this tier.
      support: ["writer", "editor", "director", "call"],
    },
  };

  const REEL_TIER_KEYS = ["reel1", "reel2", "reel3", "reel4"];
  const SERVICE_META = {
    reels: { label: "AI Reels", dataKeyForTier: (t) => "reel" + t, startPrice: 2000 },
    catalogue: { label: "360° Catalogue Video", dataKey: "catalogue" },
    static: { label: "Static Creative", dataKey: "static" },
    carousel: { label: "Carousel Creative", dataKey: "carousel" },
  };

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
    service: "reels", // reels | catalogue | static | carousel
    tier: 3, // only relevant when service === 'reels'
    qty: 1,
    discountPct: 0,
    scopeTab: "inc", // inc | exc | need
    brandName: "",
    website: "",
    brandCategory: "",
    specialReq: "",
  };

  function currentKey() {
    return state.service === "reels" ? "reel" + state.tier : state.service;
  }
  function currentData() {
    return DATA[currentKey()];
  }

  function computeQuote() {
    const d = currentData();
    const qty = Math.max(1, state.qty || 1);
    const pct = Math.min(100, Math.max(0, state.discountPct || 0));
    const subtotal = d.basePrice * qty;
    const discountAmt = subtotal * (pct / 100);
    const final = subtotal - discountAmt;
    return { d, qty, pct, subtotal, discountAmt, final };
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
    tierRow.style.display = state.service === "reels" ? "flex" : "none";
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
        <span class="support-badge">${badge}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${role.icon}</svg>
        <span>${role.label}</span>
        <em class="support-state-label">${included ? "Included" : "Not Included"}</em>
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
      html = `<ul class="scope-list scope-need">${scopeListHTML(d.need)}</ul>${
        d.dimNote ? `<p class="scope-note">${d.dimNote}</p>` : ""
      }`;
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

    // Reel comparison table highlight
    const table = document.getElementById("reelCompareTable");
    if (table) {
      table.style.display = state.service === "reels" ? "" : "none";
      table.querySelectorAll("[data-tier-col]").forEach((cell) => {
        cell.classList.toggle("ct-sel", Number(cell.dataset.tierCol) === state.tier);
      });
    }
  }

  /* ----------------------------------------------------------
     4. RENDER: CALCULATOR
  ---------------------------------------------------------- */
  function renderCalculator() {
    const q = computeQuote();
    const isReel = state.service === "reels";

    // Single breadcrumb-style summary — reads state directly, so it can
    // never disagree with the chip/select below it (this replaces the old
    // "Tier " + qTierVal.textContent concatenation that produced the
    // garbled "Tier TIER 1" label — a second, independently-updated copy
    // of the same information that could drift out of sync).
    document.getElementById("qSelectionSummary").textContent =
      SERVICE_META[state.service].label + (isReel ? " · Tier " + state.tier : "");

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
    // .active, driven directly from state.tier (previously this class was
    // never touched here at all, so whichever chip happened to be marked
    // "active" in the static HTML markup stayed highlighted forever,
    // regardless of the actual selection).
    document.getElementById("qTierField").style.display = isReel ? "" : "none";
    if (isReel) {
      document.querySelectorAll(".qtier-chip").forEach((chip) => {
        chip.classList.toggle("active", Number(chip.dataset.tier) === state.tier);
      });
    }

    document.getElementById("qUnitPrice").textContent = fmtINR(q.d.basePrice) + " / " + (q.d.unit || "pkg");
    document.getElementById("qQtyInput").value = q.qty;
    document.getElementById("qDiscountInput").value = state.discountPct;
    document.getElementById("qSubtotal").textContent = fmtINR(q.subtotal);
    document.getElementById("qDiscountAmt").textContent = "− " + fmtINR(q.discountAmt);
    document.getElementById("qFinal").textContent = fmtINR(q.final);

    // Only show pills for fields that actually apply to this package —
    // e.g. skip Script/Language for services that don't have a scripting
    // or voiceover step, instead of always rendering a fixed 4-pill set.
    const pillCandidates = [
      ["Revisions", q.d.revisions],
      ["Duration", q.d.duration],
      ["Turnaround", q.d.turnaround.split(" after")[0]],
      ["Format", q.d.format],
      ["Script", q.d.scripting && !/^(no scripting|not applicable)/i.test(q.d.scripting) ? q.d.scripting : null],
      ["Language", q.d.language && q.d.language !== "Not applicable" ? q.d.language : null],
    ];
    document.getElementById("qMetaPills").innerHTML = pillCandidates
      .filter(([, v]) => v)
      .map(([l, v]) => `<div class="meta-pill"><span class="dot"></span>${l}: <b>${v}</b></div>`)
      .join("");

    document.getElementById("qDeliver").textContent = q.d.deliver;
  }

  /* ----------------------------------------------------------
     5. RENDER: MESSAGE TEMPLATES
  ---------------------------------------------------------- */
  function renderMessages() {
    const q = computeQuote();
    const d = q.d;
    const brandName = state.brandName.trim() || "[Client / Brand Name]";
    const clientName = brandName;
    const website = state.website.trim() || "[Website]";
    const brandCategory = state.brandCategory.trim() || "[Brand Category]";
    const packageDetails = SERVICE_META[state.service].label + (state.service === "reels" ? " — Tier " + state.tier : "");
    const packageDetailsEl = document.getElementById("packageDetailsVal");
    if (packageDetailsEl) packageDetailsEl.textContent = packageDetails;
    const qtyLine = q.qty > 1 ? `${q.qty} × ${d.name}` : d.name;

    const priceBlock = [
      `Subtotal: ${fmtINR(q.subtotal)}`,
      q.pct > 0 ? `Discount (${q.pct}%): − ${fmtINR(q.discountAmt)}` : null,
      `Total: ${fmtINR(q.final)} (excl. GST)`,
    ]
      .filter(Boolean)
      .join("\n");

    const clientMsg = `Hi ${clientName},

Brand: ${brandName}
Website: ${website}

As discussed, we'll be delivering:

Service: ${SERVICE_META[state.service].label}${state.service === "reels" ? " / Package: Tier " + state.tier : ""}
Quantity: ${q.qty}
Duration: ${d.duration}
Revision: ${d.revisions}${d.scripting && d.scripting !== "Not applicable" ? `\nScript: ${d.scripting}` : ""}
Format: ${d.format}${d.language && d.language !== "Not applicable" ? `\nLanguage: ${d.language}` : ""}
Timeline: ${d.turnaround}

${priceBlock}

Deliverables: ${d.deliver}
${d.dimNote ? "\n" + d.dimNote : ""}

Please share the required assets/details so we can initiate production:
${d.need.map((n) => "- " + n).join("\n")}

Let us know if you have any questions before we begin!`;

    const internalMsg = `INTERNAL PURCHASE BRIEF — for Creative Team

Client / Brand: ${brandName} (${brandCategory})
Website: ${website}
Package Details: ${packageDetails}
Service: ${SERVICE_META[state.service].label}${state.service === "reels" ? " / Tier: Tier " + state.tier : ""}
Quantity: ${q.qty}
Final Price: ${fmtINR(q.final)}${q.pct > 0 ? ` (Discount applied: ${q.pct}% / − ${fmtINR(q.discountAmt)} off subtotal ${fmtINR(q.subtotal)})` : ""}

Deliverables: ${d.deliver}
Duration: ${d.duration}
Revision: ${d.revisions}
Script requirement: ${d.scripting}
${state.service === "reels" && state.tier === 4 ? "Hooks: 2 hook options for approval\n" : ""}Language: ${d.language || "Not applicable"}
Dimension / Format: ${d.format}
Timeline: ${d.turnaround}

Client assets required:
${d.need.map((n) => "- " + n).join("\n")}

Special requirements: ${state.specialReq.trim() || "None noted"}

— Generated by Fastrr Creative Quotation Platform`;

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

  const qDiscountInput = document.getElementById("qDiscountInput");
  qDiscountInput.addEventListener("input", () => {
    state.discountPct = Math.min(100, Math.max(0, parseFloat(qDiscountInput.value) || 0));
    render();
  });

  // calculator service/tier mirror controls
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

  function wireCopyButton(btnId, sourceId) {
    const btn = document.getElementById(btnId);
    btn.addEventListener("click", async () => {
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
          <span class="wc-badge">${item.cat === "demo" ? "Sample layout" : "Carousel"} · ${item.slides.length} Slides</span>
          <div class="wc-dots">${slideDots}</div>
        </div>
        <div class="wc-info">
          <span class="wc-cat">${escapeHtml(item.catlabel || item.cat)}</span>
          <p class="wc-hook">${escapeHtml(item.hook)}</p>
        </div>
      </article>`;
    }
    return `
      <article class="work-card ${arClass}" data-idx="${idx}" style="--i:${idx}">
        <div class="wc-media-wrap">
          ${mediaTagHTML(item, "wc-media")}
          <span class="wc-badge">${item.dur ? item.dur : ""}</span>
        </div>
        <div class="wc-info">
          <span class="wc-cat">${escapeHtml(item.catlabel || item.cat)}</span>
          <p class="wc-hook">${escapeHtml(item.hook)}</p>
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
      lbCaption.innerHTML = `<span class="lb-cat">${escapeHtml(item.catlabel || item.cat)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.hook)} — Slide ${lbSlideIndex + 1} of ${item.slides.length}</p>`;
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
          ${isVertical && !item.video ? `<span class="lb-play-badge">▶ ${item.dur || ""}</span>` : ""}
        </div>`;
      lbCaption.innerHTML = `<span class="lb-cat">${escapeHtml(item.catlabel || item.cat)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.hook)}</p>`;
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

    const heroVideo = REELS.find((r) => r.video && r.video.includes("bang-bang-reel"));
    const catVideo = CATALOGUE.find((c) => c.video && c.video.includes("apex-edge"));
    const catStill = CATALOGUE.find((c) => c.video && c.video.includes("aurex"));
    const carouselFirst = CAROUSELS[0];

    // Curated tile layout — all offsets are px, relative to the fixed
    // 420x600 .hero-visual composition box (see CSS), not the full
    // stage. That keeps every tile's overlap/spacing deliberate and
    // consistent instead of scattering tiles across the whole stage
    // height with loose percentages. Tiles are arranged in two loosely
    // overlapping columns so each one touches or overlaps its neighbor
    // by a similar ~15-30px margin, with no large empty gaps between
    // clusters. {top/right px, w/h px, r deg rotate, z z-index,
    // d entrance-delay s, depth {mx,my,sy} parallax factors}
    const tiles = [
      {
        top: "0px", right: "0px", w: 210, h: 270, r: -4, z: 6, d: 0.05,
        depth: { mx: 14, my: 9, sy: 0.03 }, extraClass: "tile-hero",
        kind: "video", item: heroVideo, badge: heroVideo ? (heroVideo.dur || "") : "",
      },
      {
        top: "-6px", right: "196px", w: 164, h: 196, r: 7, z: 3, d: 0.14,
        depth: { mx: 9, my: 6, sy: 0.022 },
        kind: "img", item: REELS[1],
      },
      {
        top: "240px", right: "6px", w: 196, h: 186, r: 3, z: 5, d: 0.1,
        depth: { mx: 12, my: 8, sy: 0.028 },
        kind: "video", item: catVideo, badge: "360°",
      },
      {
        top: "170px", right: "246px", w: 132, h: 150, r: -10, z: 2, d: 0.2,
        depth: { mx: 7, my: 5, sy: 0.018 },
        kind: "carousel", item: carouselFirst,
      },
      {
        top: "300px", right: "210px", w: 168, h: 168, r: -6, z: 3, d: 0.28,
        depth: { mx: 8, my: 6, sy: 0.02 },
        kind: "img", item: STATICS[0],
      },
      {
        top: "400px", right: "0px", w: 180, h: 198, r: 5, z: 4, d: 0.34,
        depth: { mx: 10, my: 7, sy: 0.024 },
        kind: "img", item: STATICS[2],
      },
      {
        top: "462px", right: "280px", w: 110, h: 110, r: 9, z: 1, d: 0.4,
        depth: { mx: 6, my: 4, sy: 0.014 },
        kind: "img", item: catStill,
      },
    ].filter((t) => t.item);

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
        const style = [
          `top:${t.top}`, `right:${t.right}`, `width:${t.w}px`, `height:${t.h}px`,
          `z-index:${t.z}`, `--r:${t.r}deg`, `--d:${t.d}s`,
        ].join(";");
        return `<div class="hero-tile${t.extraClass ? " " + t.extraClass : ""}" data-i="${i}" style="${style}">
          <div class="hero-tile-inner">${mediaHTML(t)}${t.badge ? `<span class="hero-tile-badge">${t.badge}</span>` : ""}</div>
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
  ---------------------------------------------------------- */
  (function buildHeroFilmstrip() {
    const wrap = document.getElementById("heroFilmstrip");
    if (!wrap) return;

    const rowA = []
      .concat(REELS.slice(0, 8).map((r) => r.thumb))
      .concat(STATICS.slice(0, 4).map((s) => s.thumb));
    const rowB = []
      .concat(STATICS.map((s) => s.thumb))
      .concat(REELS.slice(8).map((r) => r.thumb))
      .concat(CATALOGUE.map((c) => c.thumb))
      .concat(CAROUSELS.map((c) => (c.slides ? c.slides[0] : null)).filter(Boolean));

    function rowHTML(imgs, dir, dur) {
      if (!imgs.length) return "";
      const doubled = imgs.concat(imgs); // seamless loop
      const tiles = doubled
        .map((src) => `<div class="filmstrip-tile"><img src="${src}" loading="lazy" alt=""></div>`)
        .join("");
      return `<div class="filmstrip-row dir-${dir}" style="--dur:${dur}s"><div class="filmstrip-track">${tiles}</div></div>`;
    }

    wrap.innerHTML = rowHTML(rowA, "left", 48) + rowHTML(rowB, "right", 60);

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
