# Demo Client Dashboard — Product Review & Premium Improvement Report

**Prepared for:** TwentySix Consulting
**Product:** Zigbert — Pay & Benefits Intelligence (demo-client-dashboard)
**Author:** Claude (Opus 4.8) · commissioned review
**Status:** Analysis & recommendations — no production code changed in producing this report

---

## 0. Context — why this report exists

This is a detailed, ambitious critique of the **demo-client-dashboard** (the "Zigbert" product) across the entire journey — sign-in → home → Pay report → Benefits report — from several perspectives but **above all the client's**. The goal is to understand what the product *is*, who it's *for*, where it falls short of "premium," and how to make it a product people genuinely love. The brief gave full creative freedom, so this report is deliberately expansive and opinionated. It is a menu, not a contract — we'll pick what's worth building when we make the working copy.

This report is based on a full read of the codebase (auth/home/shell, the Pay SPA, the Benefits static app, and the design system). Key files are referenced inline.

---

## 0.1 Approved design direction (locked with the client)

These decisions were confirmed before finalising the report and govern the work.

- **Branding — keep the existing identity, elevate the premium feel.** Retain the current **Zigbert palette**: warm-cream canvas `#F7F5F0`, white cards, deep navy `#0C1829`, and **gold `#C9A84C`** as the signature accent. We are **not** changing the colours. The goal is to make the *existing* identity feel materially more premium — depth, finish, spacing, typography discipline, richer micro-interactions, consistent on-brand chart styling, and removing the unfinished/template tells called out below.
- **Charts — on-brand.** Bring all data-viz onto the existing palette (**navy + gold**, slate for muted series, semantic red/amber for risk/warning) and remove the off-brand Recharts indigo `#6366f1`.
- **Demo client identity — "Brighton Technologies".** Replace both the generic `clientName: "Demo"` and the **leftover "Penge Churches"** in the Benefits report with a single coherent demo persona, **Brighton Technologies**, matching the Brighton-based roles already in the Pay demo data. (This is a content fix — removing a previous client's name — not a colour change.)

Everything else in this report is approved in full. *(Note: an earlier-considered move away from navy toward an emerald accent has been shelved — we are staying with the gold + cream + navy identity for now and focusing purely on premium polish + functional/UX improvements.)*

---

## 1. What the product is (and what it's *for*)

**Zigbert** is a **client-facing reward-intelligence portal** built by TwentySix Consulting. A reward/HR client is given a username + password, signs in, and is shown a calm "What do you want to do today?" home page with two doors:

- **Pay** → a benchmarking dashboard: where each role sits against the market (lower quartile / median / upper quartile), role-by-role detail, market context (inflation, unemployment, pay-rise forecasts), bonus norms, and recommended next steps.
- **Benefits** → a benchmarking report: how the client's benefits offer compares to the market across categories (core, time off, health & wellbeing, financial, ESG/DEI, L&D), with strengths and areas to watch.

Consultants (logged-in admins) can **edit any text inline** via an "Edit as Admin" CMS mode, so the same template can be re-skinned and re-worded per client without code changes. The template is cloned per client by editing `client/src/config/clientConfig.ts` (`clientName`, `benefitsEnabled`, `auth.emailDomain`).

**The real-world job it does:** it turns a consulting engagement's findings into a *living, branded, self-serve deliverable*. Historically a reward consultancy hands over a PDF or a deck. Zigbert's bet is that an interactive portal is more premium, more sticky, and more upsell-friendly ("upgrade to bespoke analysis"). That's the product's reason to exist — and it's the lens the whole report is judged through.

### Who the client actually is (personas)

1. **The HR/Reward lead (primary user).** Mid-senior, time-poor, not a data analyst. Wants to know *"are we paying fairly, where are my risks, and what do I do Monday morning?"* — fast, defensible, board-ready.
2. **The CFO / CEO (the over-the-shoulder audience).** Sees this for ~90 seconds. Wants the headline: *are we over- or under-paying, what's it costing us, what's the risk?*
3. **The TwentySix consultant (admin/editor).** Needs to stand up a client instance quickly, tailor the narrative, look impeccable, and create a natural path to more paid work.

### The jobs-to-be-done

- *"Tell me where I stand"* (positioning, at a glance).
- *"Tell me what's wrong / at risk"* (the 2–3 things that matter).
- *"Tell me what to do and what it costs"* (action + budget).
- *"Let me prove it to my board"* (export, share, defend the methodology).
- *"Make me feel I'm in expensive, expert hands"* (premium feel, trust).

**The central insight for everything below:** the product today is built around *browsing data*. A premium reward product should be built around *delivering decisions*. Most of the high-value recommendations push the experience from "here is your data, explore it" toward "here is what it means and what to do."

---

## 2. Overall verdict

**The bones are genuinely good.** The visual language (warm cream canvas, navy ink, accent highlights), the editorial typography, the quartile-band visualisation, the home-page hot bar and carousel, and the micro-interactions (staggered fade-ups, card elevate, CTA glow) already read as a premium product on first glance. The login page in particular is a strong, confident first impression.

**But it's a beautifully dressed *template*, not yet a *product clients love*.** The gap is in four areas:

1. **Coherence** — there are effectively *two different apps* stitched together (the React shell + Pay SPA in Inter; the Benefits app in Plus Jakarta Sans/Space Grotesk), with full-page reloads between them and a leftover **"Penge Churches"** client name still hardcoded in the Benefits report. This breaks the illusion of one premium product instantly.
2. **Meaning over data** — the dashboards show numbers and charts but rarely tell the client *what it means for them* or *what to do*. The "insights" are static demo copy, not derived from the data.
3. **Trust & finish** — placeholder data everywhere, no methodology/sample-size signals, generic chart colours that ignore the brand, no real PDF/board export, and several unfinished flows (forgot-password, empty/error states).
4. **Interactivity** — tables and charts are read-only; no filtering, search, drill-down, scenario modelling, or comparison-over-time — the things that make a portal worth more than a PDF.

Scored loosely: **First impression 8/10, depth of experience 5/10, coherence 4/10, "would a client love it" 5/10.** The recommendations below are about closing those gaps.

---

## 3. The experience, surface by surface

### 3.1 Sign-in — `client/src/components/LoginPage.tsx`

**Strong.** Dual-panel editorial layout, warm palette, refined type, tagline *"The market, decoded — role by role, benefit by benefit."* This is the best-finished screen in the app.

Gaps that undercut "premium":

- Placeholder copy is hardcoded **"demo"** in the username field — looks unfinished on a real client deployment.
- **No "forgot password"** flow — only a generic *"Email hello@…"* fallback.
- **No show/hide password** toggle; no field-level validation; one generic error string for every failure (*"Those credentials didn't work."*).
- A **temp-auth fallback with hardcoded credentials** (`demo`/`Demo26`) lives in client code — fine for demo, must never ship to a real client build.
- The left panel is static; a premium portal could make it feel *alive and personalised the moment you land*.

### 3.2 Home / landing — `client/src/pages/Home.tsx`

**Ambitious and mostly excellent.** Time-of-day greeting, a "live" status pill, a big editorial headline (*"Your reward intelligence."*), a **Hot Bar** of 6 KPI tiles (quarter, roles benchmarked, median pay, pay position band, benefits recorded, benefits position band), two large **Pay / Benefits choice cards** each with an auto-playing 4-slide carousel preview, and a **Highlights** row (pay momentum / benefits strength / watchlist).

Gaps:

- The **Highlights and Hot Bar numbers are static demo copy**, not derived from the underlying data. This is the single biggest "make it real" opportunity — these should be the personalised headline of the whole engagement.
- The Benefits card, when `benefitsEnabled:false`, simply **greys out with "Not in this package"** — a dead end where there should be an *upsell*.
- Carousel captions are thin ("Where you can explore inside Pay") — preview value is low.
- No clear **"start here / what changed this quarter / your 3 actions"** entry — the page shows breadth before telling the user where to look first.

### 3.3 Navigation & app shell — `client/src/App.tsx`, `Shell.tsx`, `Layout.tsx`

The React app owns `/`, `/account`, `/report/draft`. **`/pay/*` and `/benefits/*` are entirely separate static builds**, reached by `window.location.href` — i.e. **full page reloads**, not SPA transitions. There are two different navigation chrome systems (top-tab `Shell` for home; a 288px navy `Sidebar` with "The Essentials" / "For When You Need More" groups for Pay).

Gaps:

- The full-reload jump between Home and Pay/Benefits is the **most jarring premium-breaking moment** in the product — a white flash and a context reset between "apps."
- **No breadcrumbs / "you are here"** persistence across the boundary; deep pages like `/pay/role-details` can feel orphaned.
- Two nav models (top tabs vs left sidebar) for one product = cognitive load.
- No global **search / quick-jump** (e.g. "jump to Software Engineer").

### 3.4 Pay report — `client/src/pages/*` (served as a static SPA under `/pay/`)

Good coverage: Market Comparison, Role-by-Role detail cards, Risks/position distribution, Market Context (CPI, unemployment, pay-rise forecast), Bonus, Benchmarking + a "Quartiles Explained" educational graphic, a Benefits-market breakdown, and a Next Steps page with a Targeted-vs-Bespoke comparison (the upsell).

Strengths: the **quartile band + "you are here" marker** is intuitive and reused well; role detail cards are nicely composed; PNG and CSV export exist per chart/table.

Gaps:

- **All data is fictional placeholder** (12 roles, all "Brighton", made-up employer counts). Necessary for a demo, but the framing/labels don't say "sample."
- **Charts use generic indigo `#6366f1` / slate `#94a3b8`** — *off-brand*. They ignore the navy/accent palette the rest of the app is built on.
- **Read-only**: hover tooltips only. No drill-down from a chart to the role, **no filtering/sorting/search** in role tables (won't scale past ~12 rows), no comparison over time.
- **Recommendations are generic** ("Worth a closer look") — never *"Software Engineer is 8% below median; moving to median costs ~£X across N people."*
- Terminology overload: "position" means quartile-band in some places and could read as job/location in others; "Above UQ" vs "Above upper quartile" vs "ABOVE UQ" inconsistently.
- **No real report/PDF/board-pack export** — only per-chart PNG and raw CSV.
- No empty/error states; charts assume data always exists.

### 3.5 Benefits report — `client/public/benefits/index.html`

A **5,300-line standalone static HTML report** inherited from "pengechurchesv3," with its *own* fonts (Plus Jakarta Sans + Space Grotesk), its own 260px navy sidebar, and color-coded category cards. As a document it's handsome and editorial.

Gaps (some serious):

- **It still says "Penge Churches" throughout** — a previous client's name hardcoded into the demo. This is a **showstopper bug** for any client-facing use and erodes trust instantly if seen. (→ rebrand to **Brighton Technologies**.)
- **It's a different design system** from the React app (different typeface, different nav, different spacing) — the seam between "Pay product" and "Benefits product" is obvious.
- It's **not driven by the same config/data** as the rest of the app — editing it means editing raw HTML, outside the CMS edit mode that governs everything else.
- Accessibility: thin semantic structure, focus states unclear.

### 3.6 Design system & brand — `client/src/index.css`, `lib/theme.ts`, `components/ui/*`

A real, documented **"Zigbert" system**: Navy `#0c1829` / Gold `#c9a84c` / Cream `#f7f5f0`, HSL tokens, a 5-level navy-tinted shadow scale, a 12px base radius, tasteful keyframe animations, gold focus rings, 57 shadcn/ui components. Genuinely premium foundations.

Loose ends:

- **Three fonts loaded; Inter used, Fraunces loaded-but-unused, Plus Jakarta Sans only in shell chrome** → typographic split across the product.
- **Dark mode variant defined but never activated** (orphaned).
- **CSS duplication** (`.premium-card` vs `.ts-premium-card`, etc.).
- Brand identity lives in *comments and `theme.ts`*, while chart colours and some components drift off-palette.
- Multiple large brand PNGs in `attached_assets/` are **not referenced** anywhere — no hero imagery is actually used.

> **Redesign note:** the new direction re-tokenises this system to **navy (punctuation) + cream/white (field) + emerald accent**, and unifies the Benefits report onto it.

---

## 4. Recommendations

Organised by theme. Each item notes *why it matters to the client*. Tagging: **[Quick win]** (hours), **[Project]** (days), **[Strategic]** (the ambitious, product-defining bets).

### 4.1 Coherence — make it feel like *one* premium product

- **[Strategic] Fold Pay & Benefits into the single React app** (or, at minimum, make the transition feel seamless). Eliminate `window.location` full reloads; use client-side routing and a shared shell. The white-flash app-switch is the biggest thing standing between "polished template" and "premium product."
- **[Quick win] Purge the "Penge Churches" leftover** from the Benefits report and rebrand the whole demo as **Brighton Technologies**, driven from `clientConfig`. No client should ever see another client's name, and the demo persona should match the Brighton-based roles already in the Pay data.
- **[Project] Unify the design system across Pay, Benefits and Home** — one typeface strategy, one nav model, one set of tokens, all on the **existing Zigbert system (navy / gold / cream)**. Re-skin the Benefits report in this system (or rebuild it as React sections) so the seam disappears.
- **[Quick win] One navigation model.** Decide between persistent left sidebar vs top tabs and apply it everywhere; add breadcrumbs / "you are here" so deep pages aren't orphaned.

### 4.2 Meaning over data — the highest-value theme

- **[Strategic] An "Insights" / "Your quarter in 3 things" engine.** Replace the static Highlights with **data-derived** headlines: *"3 roles slipped below market," "Median pay +3.1% vs Q1," "Benefits spend is top-quartile on pension, below market on wellbeing."* This is what the HR lead and the CFO actually came for.
- **[Strategic] Prescriptive recommendations with cost.** For every flagged role: *"X is 8% below median (£Y). Moving N people to median costs ~£Z/yr."* Turn "Risks" from a chart into an **action list with a price tag** — this is what justifies the engagement and seeds the upsell.
- **[Project] A genuine "Total Reward" view** that combines pay position *and* benefits value into one picture — the thing a consultancy uniquely can say that a salary survey can't.
- **[Quick win] Sharper, client-specific copy** on every page; retire generic lines like "Understand the economic factors shaping pay decisions."

### 4.3 Interactivity & functionality — earn the right to be a portal, not a PDF

- **[Project] Filter / sort / search** role and benefit tables (by function, level, location, position band). Essential the moment a client has >15 roles.
- **[Project] Drill-down**: click a bar/role in any chart → the role detail. Click a benefit → the market breakdown.
- **[Strategic] Scenario modelling** ("what-if"): a slider/inputs to model *"bring all below-median roles to median"* and instantly see total cost and new distribution. This is a genuine "wow," board-meeting feature.
- **[Strategic] Comparison over time** — quartile-by-quarter trend, "what changed since last report," so the portal compounds in value each engagement.
- **[Project] Real export**: a branded, board-ready **PDF / board-pack** (not just per-chart PNG), plus "email me this report." This is the artifact the client forwards to their CEO.

### 4.4 Trust & credibility

- **[Quick win] Data provenance & freshness everywhere**: sources, sample sizes / "n=", "as at" dates, and a clear **"sample data" badge** on the demo so it's never mistaken for real.
- **[Quick win] Built-in methodology & glossary** (what a quartile is, how roles were matched) — reachable from any term, so the client can defend the numbers to their board.
- **[Quick win] Confidence signalling** — flag thin-sample roles so clients trust the strong numbers and discount the weak ones.

### 4.5 Sign-in & account

- **[Quick win] Finish the auth screen**: real "forgot password," show/hide password, field-level validation, specific error messages, remove hardcoded "demo" placeholder, and ensure the temp-auth hardcoded creds never ship to a real client build.
- **[Project] A real Account area**: subscription/package, what's included, billing/renewal contact, data export, and a clean **upgrade path** where the Benefits card is currently a dead "Not in this package" grey-out.
- **[Strategic] Personalised, white-glove first-run**: a short guided tour / "here's your report, here are your 3 headlines, here's how to read a quartile" the first time a client lands.

### 4.6 Aesthetics & finish

- **[Quick win] Bring charts onto brand** — navy/gold/slate from the existing token set, not Recharts default indigo (`#6366f1`). Consistent axis/legend/tooltip styling.
- **[Quick win] Elevate the premium feel within the gold/cream/navy identity** — richer depth and layered shadows, tighter spacing rhythm, typographic discipline, more considered hover/active/focus states, and gold used with restraint as a true accent (not decoration).
- **[Quick win] Tidy the design system**: one font strategy (drop unused Fraunces or use it intentionally for display), remove CSS duplication, either ship or remove dark mode.
- **[Project] Use the brand imagery** sitting unused in `attached_assets/`, or commission light editorial illustration, so the product has visual identity beyond micro-interactions.
- **[Project] Mobile polish** — the carousel and rotated chart labels get cramped; reward leads *do* open these on a phone before a meeting.
- **[Quick win] Accessibility pass** — semantic structure in the Benefits report, contrast on faint borders, keyboard nav, ARIA on charts.

### 4.7 Admin / editor experience (the consultant's product)

- **[Project] Bring the Benefits report under the same CMS** so consultants don't hand-edit 5,000 lines of HTML.
- **[Project] A proper instance-setup flow** (client name, package, branding, data load) instead of editing config files by hand — this is how TwentySix scales the product to many clients.
- **[Quick win] Richer edit affordances** (the current inline edit is plain-text only; "Undo all" is the only undo).

### 4.8 Ambitious "make them love it" bets (the north star)

- **Decision-first dashboard**: lead with *"Your 3 priorities this quarter,"* each with impact + cost + a one-click "add to action plan."
- **Action plan / tracker** the client builds inside the portal and revisits — turning a one-off report into an ongoing relationship surface.
- **Scenario & budget planner** (see 4.3) as the headline interactive feature.
- **Quarterly "what changed" digest** + optional email notification when new data lands — a reason to return.
- **Board-pack generator** — one click → a beautifully branded PDF the client presents as their own work (with TwentySix credited). The single most shareable, upsell-generating feature.
- **Total-reward storytelling** — pay + benefits woven into one narrative, the consultancy's unique value.

---

## 5. Suggested roadmap (when we build the working copy)

**Phase 0 — Integrity, rebrand & finish (quick wins, do first):**
Rebrand everything to **Brighton Technologies** and purge "Penge Churches"; **keep the gold/cream/navy identity and elevate its premium feel**; bring the charts onto the existing brand (navy/gold); finish auth (forgot-password, validation, remove demo placeholder/hardcoded creds from real builds); add "sample data" + freshness/source badges; tidy fonts/CSS/dark-mode; add a glossary/methodology link.

**Phase 1 — Coherence:**
Remove full-reload app switches; one nav model + breadcrumbs; re-skin/rebuild Benefits in the unified design system; bring Benefits under config/CMS.

**Phase 2 — Meaning:**
Data-derived Highlights/Hot Bar; prescriptive recommendations with cost; sharper per-client copy; real account/upgrade path.

**Phase 3 — Interactivity & the "wow":**
Filter/sort/search + drill-down; branded PDF/board-pack export; comparison-over-time; scenario/budget modelling; total-reward view; first-run guided tour.

**Verification approach for any build:** run locally (`npm run dev` after `rm node_modules && npm install`, since `node_modules` is currently a symlink to `Dashboard-temp`), walk the full journey (sign-in → home → Pay pages → Benefits) on desktop and mobile widths, confirm no cross-client data leaks, validate exports open correctly, and check brand/token consistency across the previously-separate Benefits app.

---

## 6. Top 10, if we only did ten things

1. Rebrand the whole demo to **Brighton Technologies**, remove the "Penge Churches" leftover, and drive all names from config. **[Quick win]**
2. Bring all charts onto the existing brand palette (navy/gold) and tighten design-system consistency for a more premium feel. **[Quick win]**
3. Kill the full-page-reload jump between Home and Pay/Benefits. **[Strategic]**
4. Replace static Highlights with data-derived "Your 3 things this quarter." **[Strategic]**
5. Add prescriptive, costed recommendations to Risks. **[Strategic]**
6. Unify Benefits into the shared design system. **[Project]**
7. Branded PDF / board-pack export. **[Strategic]**
8. Filter / sort / search + drill-down on tables and charts. **[Project]**
9. Finish the auth screen + a real Account/upgrade area. **[Project]**
10. Scenario/budget "what-if" modelling. **[Strategic]**

---

*End of report. A styled, print-to-PDF version is available as `docs/UX-REVIEW.html`.*
