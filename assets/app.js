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
    clientName: "",
    brandName: "",
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

  function renderServiceSummary() {
    const d = currentData();
    document.getElementById("svcName").textContent = d.name;
    document.getElementById("svcStartPrice").textContent = fmtINR(d.basePrice) + " / " + (d.unit || "package");
    document.getElementById("svcShort").textContent = d.short || "";
    document.getElementById("svcBenefit").textContent = d.benefit || "";
    document.getElementById("supportBlock").style.display = state.service === "reels" ? "" : "none";
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
    document.getElementById("qServiceVal").textContent = SERVICE_META[state.service].label;
    document.getElementById("qTierVal").parentElement.style.display =
      state.service === "reels" ? "" : "none";
    document.getElementById("qTierVal").textContent = "Tier " + state.tier;
    document.getElementById("qUnitPrice").textContent = fmtINR(q.d.basePrice) + " / " + (q.d.unit || "pkg");
    document.getElementById("qQtyInput").value = q.qty;
    document.getElementById("qDiscountInput").value = state.discountPct;
    document.getElementById("qSubtotal").textContent = fmtINR(q.subtotal);
    document.getElementById("qDiscountAmt").textContent = "− " + fmtINR(q.discountAmt);
    document.getElementById("qFinal").textContent = fmtINR(q.final);

    const pills = [
      ["Revisions", q.d.revisions],
      ["Duration", q.d.duration],
      ["Turnaround", q.d.turnaround.split(" after")[0]],
      ["Format", q.d.format],
    ];
    document.getElementById("qMetaPills").innerHTML = pills
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
    const clientName = state.clientName.trim() || "[Client Name]";
    const brandName = state.brandName.trim() || "[Brand Name]";
    const qtyLine = q.qty > 1 ? `${q.qty} × ${d.name}` : d.name;

    const priceBlock = [
      `Subtotal: ${fmtINR(q.subtotal)}`,
      q.pct > 0 ? `Discount (${q.pct}%): − ${fmtINR(q.discountAmt)}` : null,
      `Total: ${fmtINR(q.final)} (excl. GST)`,
    ]
      .filter(Boolean)
      .join("\n");

    const clientMsg = `Hi ${clientName},

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

Client / Brand: ${brandName}
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

  document.getElementById("clientNameInput").addEventListener("input", (e) => {
    state.clientName = e.target.value;
    renderMessages();
  });
  document.getElementById("brandNameInput").addEventListener("input", (e) => {
    state.brandName = e.target.value;
    renderMessages();
  });
  document.getElementById("specialReqInput").addEventListener("input", (e) => {
    state.specialReq = e.target.value;
    renderMessages();
  });

  function wireCopyButton(btnId, sourceId) {
    const btn = document.getElementById(btnId);
    btn.addEventListener("click", async () => {
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

  function workCardHTML(item, idx) {
    if (item.type === "carousel") {
      const slideDots = item.slides
        .map((_, i) => `<span class="wc-dot${i === 0 ? " active" : ""}" data-slide="${i}"></span>`)
        .join("");
      return `
      <article class="work-card carousel-card" data-idx="${idx}" data-slide="0" style="--i:${idx}">
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
      <article class="work-card" data-idx="${idx}" style="--i:${idx}">
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
      const mediaEl = item.video
        ? `<video src="${item.video}" poster="${item.thumb || ""}" controls playsinline preload="metadata"></video>`
        : `<img src="${item.thumb}" alt="${escapeHtml(item.title)}">`;
      lbMedia.innerHTML = `
        <div class="lb-frame ${isVertical ? "lb-frame-vertical" : "lb-frame-square"}">
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
