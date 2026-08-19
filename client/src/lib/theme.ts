// Zigbert design system — "trusted but fresh".
//   ink/navy #121C2B · white canvas · clay (the only accent) #C9785A · slate #7285A5
// NB: legacy keys (brass*, sage*, rose*, plum*, amber*) are retained as names but
// remapped onto the clay/slate brand so existing inline styles rebrand in place.
//
// The canvas is pure white and the neutrals are COOL greys. The old warm/beige
// neutrals (canvas #FAFAF8, surfaceSoft #FBF8F2, border #E7E0D4) read as dated
// and, on a white page, tan borders look dirty. Clay and slate still carry all
// the warmth — the neutrals stay out of the way.
export const C = {
  // Canvas + surfaces
  canvas: "#FFFFFF",        // page background
  surface: "#FFFFFF",
  surfaceSoft: "#F6F7F9",   // neutral wash — card tint, hover, inset panels
  // Ink — navy
  ink: "#121C2B",
  inkMuted: "#4B5563",
  inkSubtle: "#8A93A2",
  border: "#DEE1E6",        // neutral hairline (brand "steel tint")
  borderSubtle: "#E7EAEF",
  // Primary brand accent — clay (the single accent)
  brass: "#C9785A",         // clay
  brassDeep: "#B0603F",     // clay deep
  brassSoft: "rgba(201,120,90,0.15)", // clay tint
  // Supporting tone — slate (calm secondary, never a second shout)
  sage: "#7285A5",          // remapped → slate
  sageSoft: "rgba(114,133,165,0.14)",
  slate: "#7285A5",
  slateSoft: "rgba(114,133,165,0.13)",
  // "Watch"/soft-alert — warm clay-deep
  rose: "#B0603F",
  roseSoft: "rgba(176,96,63,0.12)",
  plum: "#7285A5",          // remapped → slate
  plumSoft: "rgba(114,133,165,0.13)",
  amber: "#C9785A",         // remapped → clay
  amberSoft: "rgba(201,120,90,0.15)",
  success: "#3F7D6A",       // muted teal-green for positive states
  warning: "#B0603F",       // clay-deep for caution
} as const;

// Pay-gem palette — mirrors the ExecutiveSummary launcher cards in the actual
// Pay report so the preview slides feel like cut-outs of the real page.
// Each entry is the gradient pair from the live demo-dashboard source.
export const PAY_GEMS = {
  blue: { from: "#305880", to: "#264a72", accent: "#a5d5fc", border: "#8ec8fa" },
  teal: { from: "#226055", to: "#1a5045", accent: "#98eeca", border: "#7de8ba" },
  purple: { from: "#453478", to: "#3a2868", accent: "#d9ccf8", border: "#b8a4f0" },
  pink: { from: "#7a3658", to: "#5e2842", accent: "#f5b6cf", border: "#e879a8" },
  yellow: { from: "#6b5a14", to: "#544515", accent: "#fde68a", border: "#eab308" },
  cyan: { from: "#155e75", to: "#0c4a5a", accent: "#a5f3fc", border: "#22d3ee" },
} as const;

// Benefits accent washes — quote the actual values from benefits/index.html.
export const BENEFITS_TINTS = {
  navy: "#121C2B",
  gold: "#C9785A",         // remapped → clay
  pink: "#C9785A",
  pinkWash: "#fbf3ef",
  sage: "#7285A5",         // remapped → slate
  sageWash: "#f3f6fa",
  slate: "#7285A5",
  cream: "#FFFFFF",   // mirror of the Benefits report --cream (text on navy)
  inkDeep: "#1f2c40",
  inkSoft: "#5a6478",
} as const;

// Demo data — replace with real values once data wiring is in place.
export const REPORT_PERIOD = "Q2 2026";
export const LAST_UPDATED = "16 Jun 2026";
// Benefits refresh on a separate cycle to pay — kept as a token so surfaces agree.
export const BENEFITS_LAST_UPDATED = "May 2026";

// Average pay-rise (%) — the organisation vs the market, by year. Demo data.
export const PAY_TREND = [
  { year: "2022", you: 3.8, market: 4.5 },
  { year: "2023", you: 5.0, market: 5.5 },
  { year: "2024", you: 4.2, market: 4.0 },
  { year: "2025", you: 3.5, market: 3.8 },
  { year: "2026", you: 3.6, market: 3.4 },
] as const;

export const PAY_META = {
  // NB: no rolesAnalysed here. The roster IS the benchmarked set, so anything that
  // needs a role count reads BASE_ROSTER.length rather than a constant that can
  // drift out of step with the data (it used to say 40 while the roster held 25).
  employersInDataset: 47,
  medianPay: "£52,400",
  medianPayChange: "+3.1%",
  upperQuartile: "£71,200",
  lowerQuartile: "£38,900",
  // Where the client's overall pay sits in the quartile range.
  positionLabel: "Median → UQ",
  positionFrom: 50, // 0–100 along the LQ→UQ scale
  positionTo: 100,
  reportDate: "April to June 2026",
  lastRefresh: LAST_UPDATED,
};

export const BENEFITS_META = {
  // NB: no benefit or category counts here, for the same reason as PAY_META above.
  // Counts come from ESTABLISHED_BENEFITS / BENEFIT_CATEGORIES in lib/orgData, which
  // mirror the Benefits report. The old `categories: 5` and `topBenefits: 12` said
  // 12 benefits across 5 categories while the report showed 14 across 6.
  employersInDataset: 287,
  coverage: 76,
  // Where the client's overall benefits offer sits in the quartile range.
  positionLabel: "LQ → Median",
  positionFrom: 0,
  positionTo: 50,
  reportDate: "April to June 2026",
  lastRefresh: LAST_UPDATED,
};

export const SUBSCRIPTION = {
  status: "Active",
  tier: "Pay & Benefits · Pro",
  lastInvoice: "01 Apr 2026",
  // No invoice amounts anywhere in the demo: showing a figure to a prospect reads
  // as a quote. Dates, cadence and status only.
  nextRenewal: "01 Jul 2026",
  billingContact: "finance@brightontechnologies.co.uk",
  billingCadence: "Quarterly",
};
