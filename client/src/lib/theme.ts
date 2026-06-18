// Unified palette — kept in lockstep with /shell/shell.css.
// Mirrors the june-pay-and-benefits-dashboard system:
//   navy hsl(214 64% 10%) · gold hsl(42 53% 55%) · cream hsl(40 27% 95%)

export const C = {
  // Canvas + surfaces
  canvas: "#f7f5f0",       // hsl(40 27% 95%) — warm cream
  surface: "#ffffff",
  surfaceSoft: "#faf8f3",  // very light cream off-white
  // Ink — now navy, not warm-black
  ink: "#0a1929",          // hsl(214 64% 10%)
  inkMuted: "#475569",     // hsl(214 25% 35%)
  inkSubtle: "#94a3b8",    // hsl(214 16% 60%)
  border: "#d6dbe1",       // hsl(214 20% 88%)
  borderSubtle: "#e6e9ee", // hsl(214 16% 92%)
  // Primary brand accent — bright editorial gold
  brass: "#c9a84c",        // hsl(42 53% 55%)
  brassDeep: "#a98a3a",
  brassSoft: "rgba(201,168,76,0.15)",
  // Multi-hue accent set — for tiny chart variety
  sage: "#7a8c6b",
  sageSoft: "rgba(122,140,107,0.13)",
  slate: "#6b7385",
  slateSoft: "rgba(107,115,133,0.13)",
  rose: "#a87575",
  roseSoft: "rgba(168,117,117,0.13)",
  plum: "#8a6b8a",
  plumSoft: "rgba(138,107,138,0.13)",
  amber: "#c4a05e",
  amberSoft: "rgba(196,160,94,0.15)",
  success: "#15803d",
  warning: "#b45309",
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
  navy: "#0c1829",
  gold: "#c9a84c",
  pink: "#d68a96",
  pinkWash: "#fcf6f7",
  sage: "#7a9173",
  sageWash: "#f5f8f3",
  slate: "#6b7a99",
  cream: "#faf8f3",
  inkDeep: "#2a3349",
  inkSoft: "#5a6478",
} as const;

// Demo data — replace with real values once data wiring is in place.
export const REPORT_PERIOD = "Q2 2026";
export const LAST_UPDATED = "16 Jun 2026";

export const PAY_META = {
  rolesAnalysed: 40,
  employersInDataset: 47,
  medianPay: "£52,400",
  medianPayChange: "+3.1%",
  upperQuartile: "£71,200",
  lowerQuartile: "£38,900",
  // Where the client's overall pay sits in the quartile range.
  positionLabel: "Median → UQ",
  positionFrom: 50, // 0–100 along the LQ→UQ scale
  positionTo: 100,
  reportDate: "Apr — Jun 2026",
  lastRefresh: LAST_UPDATED,
};

export const BENEFITS_META = {
  recorded: 16,
  employersInDataset: 287,
  categories: 5,
  coverage: 76,
  topBenefits: 12,
  // Where the client's overall benefits offer sits in the quartile range.
  positionLabel: "LQ → Median",
  positionFrom: 0,
  positionTo: 50,
  reportDate: "Apr — Jun 2026",
  lastRefresh: LAST_UPDATED,
};

export const SUBSCRIPTION = {
  status: "Active",
  tier: "Pay & Benefits · Pro",
  lastInvoice: "01 Apr 2026",
  invoiceAmount: "£4,800",
  nextRenewal: "01 Jul 2026",
  billingContact: "finance@demo.co.uk",
  billingCadence: "Quarterly",
};
