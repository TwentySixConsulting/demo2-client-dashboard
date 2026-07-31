/* TwentySix · Zigbert guided cross-app tour.
 * Framework-agnostic: loaded on the React app AND the static Pay/Benefits pages.
 * Drives a spotlight coachmark tour from a single ordered step list, persisting
 * progress to localStorage ("zigbert:tour") so it resumes across the full-page
 * navigations between the three apps. Exposes window.ZigbertTour = {start,stop,resume}.
 */
(function () {
  "use strict";
  if (window.ZigbertTour) return; // already loaded

  var KEY = "zigbert:tour";
  var SEEN = "zigbert:tour-seen";

  // ── shared state ─────────────────────────────────────────────
  function getState() {
    try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : { active: false, step: 0 }; }
    catch (e) { return { active: false, step: 0 }; }
  }
  function setState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function markSeen() { try { localStorage.setItem(SEEN, String(Date.now())); } catch (e) {} }
  function hasSeen() { try { return !!localStorage.getItem(SEEN); } catch (e) { return false; } }
  function authed() {
    try {
      if (localStorage.getItem("demo-client-dashboard:temp-auth")) return true;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("sb-") === 0 && k.indexOf("-auth-token") !== -1) return true;
      }
    } catch (e) {}
    return false;
  }

  // ── location helpers (base-path aware: works at "/" and "/Dashboard/") ──
  function siteRoot() {
    var p = location.pathname;
    p = p.replace(/\/index\.html$/, "/");
    p = p.replace(/\/(pay|benefits)(\/.*)?$/, "/");
    p = p.replace(/\/(organisation|account)\/?$/, "/");
    if (p.charAt(p.length - 1) !== "/") p += "/";
    return p;
  }
  function here() {
    var p = location.pathname;
    if (/\/pay(\/|$)/.test(p)) return { app: "pay", path: "pay" };
    if (/\/benefits(\/|$)/.test(p)) return { app: "benefits", path: "benefits" };
    if (/\/organisation\/?$/.test(p)) return { app: "react", path: "/organisation" };
    if (/\/account\/?$/.test(p)) return { app: "react", path: "/account" };
    return { app: "react", path: "/" };
  }
  function urlFor(step) {
    var root = siteRoot();
    if (step.app === "pay") return root + "pay/";
    if (step.app === "benefits") return root + "benefits/";
    if (step.path === "/organisation") return root + "organisation";
    if (step.path === "/account") return root + "account";
    return root;
  }
  function matchesHere(step) {
    var h = here();
    if (step.app !== h.app) return false;
    if (step.app === "react") return step.path === h.path;
    return true;
  }

  // ── the tour ─────────────────────────────────────────────────
  var STEPS = [
    { id: "welcome", app: "react", path: "/", selector: null,
      title: "Welcome to your dashboard",
      html: "This is your live view of how your organisation's <b>pay and benefits</b> compare to the market, built by TwentySix. This quick tour, about two minutes, shows you around. You can leave anytime with <b>Esc</b> or “Skip”." },

    // ── Home ──
    { id: "hero", app: "react", path: "/", selector: "[data-tour='hero']", placement: "bottom",
      title: "Your home", html: "A snapshot of your reward position, refreshed each quarter. The headline is the single most important takeaway from the latest data." },
    { id: "quick-figures", app: "react", path: "/", selector: "[data-tour='quick-figures']", placement: "bottom",
      title: "The key figures", html: "How your pay sits versus the market median, your total headcount, and anything still awaiting benchmarking." },
    { id: "attention", app: "react", path: "/", selector: "[data-tour='attention']", placement: "top",
      title: "What needs attention", html: "The most important actions, ranked straight from your data. Click any item to jump to the detail behind it." },
    { id: "explore", app: "react", path: "/", selector: "[data-tour='explore']", placement: "top",
      title: "Your three areas", html: "<b>Pay</b>, <b>Benefits</b> and <b>Your Organisation</b>. Open any card to dive in." },
    { id: "quick-actions", app: "react", path: "/", selector: "[data-tour='quick-actions']", placement: "left",
      title: "Quick actions", html: "Common jobs, one click away: prep a pay review, see who's below market, or add a role." },
    { id: "activity", app: "react", path: "/", selector: "[data-tour='activity']", placement: "left",
      title: "Activity & freshness", html: "Recent changes to your data, and when each dataset was last refreshed." },
    { id: "charts", app: "react", path: "/", selector: "[data-tour='chart-band']", placement: "top",
      title: "Your reward at a glance", html: "A visual summary: how your roles sit against the market, your pay-rise trend versus the market, and your benefits mix." },
    { id: "nav", app: "react", path: "/", selector: "[data-tour='nav']", placement: "bottom",
      title: "Getting around", html: "Switch between Home, Pay, Benefits and Your Organisation up here at any time. Next, let's open your <b>Pay</b> dashboard." },

    // ── Pay (static app) ──
    { id: "pay-sidebar", app: "pay", path: "pay", selector: "[data-testid='nav-home']", placement: "right", waitFor: true,
      title: "Your Pay dashboard", html: "Pay is organised into sections down this sidebar: your market position, role-by-role detail, trends and more." },
    { id: "pay-kpis", app: "pay", path: "pay", selector: "[data-testid='kpi-overall']", placement: "bottom", waitFor: true,
      title: "Your headline position", html: "How your overall pay compares to the market, with the roles below market and your total pay bill alongside." },
    { id: "pay-search", app: "pay", path: "pay", selector: "[data-testid='today-search']", placement: "bottom", waitFor: true,
      title: "Find any role", html: "Search a job title to see exactly where its pay sits within the market range." },
    { id: "pay-toggle", app: "pay", path: "pay", selector: "[role='group'][aria-label='View pay by role or by person']", placement: "bottom", waitFor: true,
      title: "By role or by person", html: "Switch the whole dashboard between role-level benchmarks and individual people (with their FTE), handy when several people share a role." },
    { id: "pay-review", app: "pay", path: "pay", selector: "[data-testid='nav-pay-review']", placement: "right", waitFor: true,
      title: "Prep a pay review", html: "Model the cost of lifting roles or people to a market target (lower quartile, median or upper quartile) and export it. Next, let's look at <b>Benefits</b>." },

    // ── Benefits (static app) ──
    { id: "ben-sidebar", app: "benefits", path: "benefits", selector: ".sidebar-nav", placement: "right", waitFor: true,
      title: "Your Benefits report", html: "Your benefits are grouped into categories down the left: core, working time, wellbeing, financial support, ESG & DEI and learning." },
    { id: "ben-verdict", app: "benefits", path: "benefits", selector: "#bx-verdict", placement: "bottom", waitFor: true,
      title: "Your benefits position", html: "The headline: how competitive your overall benefits offer is against the market." },
    { id: "ben-search", app: "benefits", path: "benefits", selector: "#bx-search", placement: "bottom", waitFor: true,
      title: "Find a benefit", html: "Search any benefit, like pension, sick pay or leave, to see how yours compares." },
    { id: "ben-plan", app: "benefits", path: "benefits", selector: ".navlink[data-page='action-plan']", placement: "right", waitFor: true,
      title: "Your action plan", html: "A prioritised plan of where to focus your benefits investment, ready to export. Next, let's set up <b>Your Organisation</b>." },

    // ── Your Organisation (React) ──
    { id: "org-summary", app: "react", path: "/organisation", selector: "[data-tour='summary']", placement: "bottom", waitFor: true,
      title: "Your organisation", html: "A summary of your roles, people and benefits, and anything awaiting benchmarking with your consultant." },
    { id: "org-toggle", app: "react", path: "/organisation", selector: "[aria-label='View by role or by person']", placement: "bottom",
      title: "Roles or people", html: "Manage your data by role, or by individual person and FTE, the same choice you saw in Pay." },
    { id: "org-add", app: "react", path: "/organisation", selector: "[data-tour^='add']", placement: "bottom",
      title: "Add for benchmarking", html: "Add a role, a person or a benefit and send it to your TwentySix consultant to benchmark." },
    { id: "org-table", app: "react", path: "/organisation", selector: "[data-tour='roles-table']", placement: "top",
      title: "Edit your data", html: "Edit a salary or detail here and it flows straight through to your Pay dashboards." },
    { id: "org-benefits", app: "react", path: "/organisation", selector: "[data-tour='benefits']", placement: "top", waitFor: true,
      title: "Your benefits", html: "Review, edit and add benefits here too. Finally, let's look at your <b>Account</b>." },

    // ── Account (React) ──
    { id: "acct-subs", app: "react", path: "/account", selector: "[data-tour='subscriptions']", placement: "bottom", waitFor: true,
      title: "Your subscriptions", html: "The products you're subscribed to, and what each one covers." },
    { id: "acct-billing", app: "react", path: "/account", selector: "[data-tour='billing']", placement: "top",
      title: "Billing", html: "Your invoices and upcoming renewals, all in one place." },
    { id: "acct-prefs", app: "react", path: "/account", selector: "[data-tour='preferences']", placement: "top",
      title: "Preferences", html: "Choose which updates you'd like to receive from us." },
    { id: "acct-support", app: "react", path: "/account", selector: "[data-tour='support']", placement: "top", waitFor: true,
      title: "Help is always here", html: "Your TwentySix consultant's details, and you can replay this tour anytime from <b>“Take a tour”</b> in the top bar." },

    { id: "finish", app: "react", path: "/account", selector: null,
      title: "You're all set", html: "That's the tour. Explore freely, and the <b>“Take a tour”</b> button up top brings it back whenever you need a refresher." },
  ];

  // ── DOM ──────────────────────────────────────────────────────
  var root = null, hole = null, card = null, catcher = null;
  var reposition = null, findTimer = null, navigating = false;

  function build() {
    if (root) return;
    root = document.createElement("div");
    root.className = "ztour-root";
    root.innerHTML =
      '<div class="ztour-catch"></div>' +
      '<div class="ztour-hole"></div>' +
      '<div class="ztour-card" role="dialog" aria-modal="true" aria-labelledby="ztour-title">' +
        '<button class="ztour-close" aria-label="Close tour">×</button>' +
        '<div class="ztour-progress"><span class="ztour-bar"></span></div>' +
        '<div class="ztour-count"></div>' +
        '<h3 class="ztour-title" id="ztour-title"></h3>' +
        '<div class="ztour-body"></div>' +
        '<div class="ztour-foot">' +
          '<button class="ztour-skip" type="button">Skip tour</button>' +
          '<div class="ztour-nav">' +
            '<button class="ztour-back" type="button">Back</button>' +
            '<button class="ztour-next ztour-primary" type="button">Next</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    hole = root.querySelector(".ztour-hole");
    card = root.querySelector(".ztour-card");
    catcher = root.querySelector(".ztour-catch");

    catcher.addEventListener("click", stop);
    root.querySelector(".ztour-close").addEventListener("click", stop);
    root.querySelector(".ztour-skip").addEventListener("click", stop);
    root.querySelector(".ztour-back").addEventListener("click", back);
    root.querySelector(".ztour-next").addEventListener("click", next);
    card.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("keydown", onKey, true);
  }

  function teardown() {
    if (reposition) { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); reposition = null; }
    if (findTimer) { clearInterval(findTimer); findTimer = null; }
    document.removeEventListener("keydown", onKey, true);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = hole = card = catcher = null;
  }

  function onKey(e) {
    if (!root) return;
    if (e.key === "Escape") { e.preventDefault(); stop(); }
    else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
  }

  // ── rendering a step ─────────────────────────────────────────
  function findTarget(sel, cb) {
    if (findTimer) { clearInterval(findTimer); findTimer = null; }
    var el = sel ? document.querySelector(sel) : null;
    if (el || !sel) { cb(el); return; }
    var tries = 0;
    findTimer = setInterval(function () {
      tries++;
      var found = document.querySelector(sel);
      if (found || tries > 40) { clearInterval(findTimer); findTimer = null; cb(found || null); }
    }, 100); // up to ~4s for late-rendered targets
  }

  function place(el) {
    if (reposition) { window.removeEventListener("scroll", reposition, true); window.removeEventListener("resize", reposition); }
    reposition = function () { position(el); };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    position(el);
  }

  function position(el) {
    if (!root) return;
    var vw = window.innerWidth, vh = window.innerHeight, pad = 8, gap = 14;
    if (!el) {
      hole.style.display = "none";
      card.style.left = Math.round((vw - card.offsetWidth) / 2) + "px";
      card.style.top = Math.round((vh - card.offsetHeight) / 2) + "px";
      return;
    }
    var r = el.getBoundingClientRect();
    hole.style.display = "block";
    hole.style.left = (r.left - pad) + "px";
    hole.style.top = (r.top - pad) + "px";
    hole.style.width = (r.width + pad * 2) + "px";
    hole.style.height = (r.height + pad * 2) + "px";

    var cw = card.offsetWidth, ch = card.offsetHeight;
    var pref = card.getAttribute("data-place") || "bottom";
    var spot = { bottom: vh - r.bottom, top: r.top, right: vw - r.right, left: r.left };
    var order = [pref, "bottom", "top", "right", "left"];
    var chosen = "bottom";
    for (var i = 0; i < order.length; i++) {
      var p = order[i];
      if ((p === "bottom" || p === "top") && spot[p] >= ch + gap + pad) { chosen = p; break; }
      if ((p === "left" || p === "right") && spot[p] >= cw + gap + pad) { chosen = p; break; }
    }
    var left, top;
    if (chosen === "bottom" || chosen === "top") {
      left = r.left + r.width / 2 - cw / 2;
      top = chosen === "bottom" ? r.bottom + gap : r.top - ch - gap;
    } else {
      top = r.top + r.height / 2 - ch / 2;
      left = chosen === "right" ? r.right + gap : r.left - cw - gap;
    }
    left = Math.max(pad, Math.min(left, vw - cw - pad));
    top = Math.max(pad, Math.min(top, vh - ch - pad));
    card.style.left = Math.round(left) + "px";
    card.style.top = Math.round(top) + "px";
  }

  function showStep(i) {
    var step = STEPS[i];
    build();
    card.setAttribute("data-place", step.placement || "bottom");
    root.querySelector(".ztour-title").innerHTML = step.title;
    root.querySelector(".ztour-body").innerHTML = step.html;
    root.querySelector(".ztour-count").textContent = (i + 1) + " of " + STEPS.length;
    root.querySelector(".ztour-bar").style.width = Math.round(((i + 1) / STEPS.length) * 100) + "%";
    root.querySelector(".ztour-back").style.visibility = i === 0 ? "hidden" : "visible";
    var nextBtn = root.querySelector(".ztour-next");
    if (i === STEPS.length - 1) nextBtn.textContent = "Finish";
    else {
      var nx = STEPS[i + 1];
      nextBtn.textContent = (nx.app !== step.app) ? ("Open " + (nx.app === "pay" ? "Pay" : nx.app === "benefits" ? "Benefits" : "next") + " ▸")
        : (nx.path !== step.path ? "Continue ▸" : "Next");
    }
    findTarget(step.selector, function (el) {
      if (!root) return;
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
      // let smooth-scroll settle, then place
      setTimeout(function () { place(el); root.classList.add("ztour-in"); }, el ? 260 : 0);
    });
  }

  // core: show the current step here, or navigate to where it lives
  function render() {
    var s = getState();
    if (!s.active) { teardown(); return; }
    var i = Math.max(0, Math.min(s.step, STEPS.length - 1));
    var step = STEPS[i];
    if (matchesHere(step)) {
      navigating = false;
      try { sessionStorage.removeItem("ztour-nav"); } catch (e) {}
      showStep(i);
    } else if (!navigating) {
      // Loop guard: if we just navigated here for this same step and got
      // bounced back (e.g. the target page's engine didn't load), end the
      // tour gracefully instead of ping-ponging forever.
      var g = null;
      try { g = JSON.parse(sessionStorage.getItem("ztour-nav") || "null"); } catch (e) {}
      if (g && g.step === i && (Date.now() - g.t) < 5000) { stop(); return; }
      try { sessionStorage.setItem("ztour-nav", JSON.stringify({ step: i, t: Date.now() })); } catch (e) {}
      navigating = true;
      window.location.href = urlFor(step);
    }
  }

  function go(delta) {
    var s = getState();
    var i = Math.max(0, Math.min(s.step + delta, STEPS.length - 1));
    setState({ active: true, step: i });
    render();
  }
  function next() {
    var s = getState();
    if (s.step >= STEPS.length - 1) { stop(); return; }
    go(1);
  }
  function back() { go(-1); }

  function start() { markSeen(); setState({ active: true, step: 0 }); navigating = false; render(); }
  function stop() { setState({ active: false, step: 0 }); markSeen(); teardown(); }
  function resume() { render(); }

  // ── first-run welcome prompt (Home only, once) ───────────────
  function maybeWelcome() {
    if (!authed() || hasSeen() || getState().active) return;
    if (here().app !== "react" || here().path !== "/") return;
    var w = document.createElement("div");
    w.className = "ztour-welcome";
    w.innerHTML =
      '<div class="ztour-welcome-title">New here? \u{1F44B}</div>' +
      '<div class="ztour-welcome-body">Take a quick 2-minute tour and we\'ll show you around your pay & benefits dashboard.</div>' +
      '<div class="ztour-welcome-foot">' +
        '<button class="ztour-welcome-later" type="button">Maybe later</button>' +
        '<button class="ztour-welcome-start ztour-primary" type="button">Start tour</button>' +
      '</div>';
    document.body.appendChild(w);
    requestAnimationFrame(function () { w.classList.add("ztour-in"); });
    function close() { markSeen(); if (w.parentNode) w.parentNode.removeChild(w); }
    w.querySelector(".ztour-welcome-later").addEventListener("click", close);
    w.querySelector(".ztour-welcome-start").addEventListener("click", function () { close(); start(); });
  }

  // ── launcher buttons anywhere: [data-zigbert-tour-start] ─────
  document.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== document.body) {
      if (t.getAttribute && t.getAttribute("data-zigbert-tour-start") !== null) { e.preventDefault(); start(); return; }
      t = t.parentNode;
    }
  });

  window.ZigbertTour = { start: start, stop: stop, resume: resume };

  function init() {
    if (getState().active) { navigating = false; render(); }
    else { setTimeout(maybeWelcome, 900); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
