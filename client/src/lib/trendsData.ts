// Every figure, series and market statement the Trends & Hotspots page renders.
//
// THE RULE: no number appears as a literal in Trends.tsx. Each KPI tile reads the
// LAST point of its own series and each paragraph interpolates from the same
// arrays, so a tile and its chart cannot disagree. They used to. The Pay app's
// Trends page had a CPI tile reading 3.0% while the chart beside it ended at 3.2%,
// and lib/data.ts carried a dead unemployment constant of 4.4% against a page
// rendering 5.1%. Deriving is the only way to keep those in step.
//
// This is illustrative demo data (clientConfig.sampleData) and the page carries
// <SampleDataBadge/>. The economic series are deliberately carried through to the
// end of REPORT_PERIOD, because a page inside a Q2 2026 report should not label a
// figure from eight months earlier as the "current rate".
import { PAY_TREND, REPORT_PERIOD } from "@/lib/theme";
import { BASE_ROSTER } from "@/lib/roster";
import {
  BENEFIT_CATEGORIES,
  ESTABLISHED_BENEFITS,
  type BenefitCategory,
  type BenefitBadge,
} from "@/lib/orgData";

export interface Point {
  label: string;
  value: number;
}
export interface Range {
  from: number;
  to: number;
}

export const first = <T,>(a: readonly T[]): T => a[0];
export const last = <T,>(a: readonly T[]): T => a[a.length - 1];
export const peak = (s: readonly Point[]): Point =>
  s.reduce((m, p) => (p.value > m.value ? p : m), s[0]);
export const mid = (r: Range) => (r.from + r.to) / 2;
/** En dash, not a hyphen: these are ranges, not compound words. */
export const rangeText = (r: Range) => `${r.from}–${r.to}%`;
export const pct1 = (n: number) => `${n.toFixed(1)}%`;

/* ────────────────────────────────────────────────────────────────────────────
   1. THE GENERAL ECONOMIC MARKET
   ──────────────────────────────────────────────────────────────────────────── */

// CPI, 12-month rate. Lifted from the older Market Context page and carried
// through to Jun 26 so the last point IS the tile's "current rate".
export const CPI_SERIES: readonly Point[] = [
  { label: "Dec 24", value: 2.3 },
  { label: "Feb 25", value: 2.8 },
  { label: "Apr 25", value: 3.2 },
  { label: "Jun 25", value: 3.5 },
  { label: "Aug 25", value: 3.8 }, // the peak, quoted in the prose via peak()
  { label: "Oct 25", value: 3.5 },
  { label: "Dec 25", value: 3.2 },
  { label: "Feb 26", value: 3.1 },
  { label: "Apr 26", value: 3.0 },
  { label: "Jun 26", value: 3.0 },
];
export const BOE_TARGET = 2.0;

// Unemployment. Both ENDS are read, because the 4.2% to 5.1% span is quoted in
// three places and must never be retyped.
// NB the Sep-24 point is 4.4, which is exactly what the dead `marketTrends
// .unemploymentRate` constant held. It was a stale reading of this series, not a
// rival figure, which is why it is discarded rather than reconciled.
export const UNEMPLOYMENT_SERIES: readonly Point[] = [
  { label: "Jul 24", value: 4.2 },
  { label: "Sep 24", value: 4.4 },
  { label: "Nov 24", value: 4.6 },
  { label: "Jan 25", value: 4.7 },
  { label: "Mar 25", value: 4.8 },
  { label: "May 25", value: 4.9 },
  { label: "Jul 25", value: 5.0 },
  { label: "Nov 25", value: 5.1 },
  { label: "Feb 26", value: 5.1 },
  { label: "Jun 26", value: 5.1 },
];

export const AVG_WEEKLY_EARNINGS = 698; // ONS average weekly earnings, £
export const SECTOR_MEDIAN_TURNOVER = 14.2; // % staff turnover, technology sector

export interface WageFloor {
  name: string;
  source: string;
  from: number;
  to: number;
  effective: string;
}
// The two statutory/voluntary floors. Their uplift percentages (+4.1% and +4.4%
// in the source page) are DERIVED below rather than typed beside the figures they
// describe: 12.71/12.21 = 4.09% and 13.15/12.60 = 4.37%, which round to the
// published numbers.
export const WAGE_FLOORS: readonly WageFloor[] = [
  {
    name: "National Living Wage (21+)",
    source: "Statutory",
    from: 12.21,
    to: 12.71,
    effective: "April 2026",
  },
  {
    name: "Real Living Wage",
    source: "Living Wage Foundation",
    from: 12.60,
    to: 13.15,
    effective: "October 2026",
  },
];
export const LONDON_LIVING_WAGE = 13.85;
export const upliftPct = (f: WageFloor) => ((f.to - f.from) / f.from) * 100;

// A wage floor means nothing to an HR reader as an hourly rate: they compare
// against a roster of annual salaries. 12.21 x 37.5 x 52 = 23,809.50, which is
// exactly the dead `minimumSalary37_5` constant, so that figure is salvaged by
// deriving it rather than by being copied forward.
export const FULL_TIME_HOURS = 37.5;
export const annualised = (hourly: number) => hourly * FULL_TIME_HOURS * 52;

/**
 * The incoming statutory floor against the roster's lowest benchmarked salary.
 * This is the one place a market-context page legitimately touches client data:
 * everything else here is public context, but whether the floor overtakes your
 * lowest-paid role is a fact about you, and it is the fact that decides whether
 * any of the above needs acting on this year.
 */
export function lowestPaidVsFloor() {
  const floor = annualised(WAGE_FLOORS[0].to);
  const lowest = BASE_ROSTER.reduce((m, r) =>
    r.currentSalary < m.currentSalary ? r : m,
  );
  return {
    floor,
    effective: WAGE_FLOORS[0].effective,
    role: lowest.role,
    salary: lowest.currentSalary,
    gap: floor - lowest.currentSalary,
    breaches: floor > lowest.currentSalary,
  };
}

export const LABOUR_MARKET_LEAD =
  "The UK labour market is weakening, which means there is more supply than demand for workers. That shows up as:";
export const LABOUR_MARKET_SIGNS: readonly string[] = [
  "Rising unemployment",
  "Slowing job growth",
  "Fewer job vacancies",
  "Slower wage growth",
];
export const LABOUR_MARKET_CONCLUSION =
  "That has eased recruitment pressure for some organisations, because the candidate pool has grown significantly, particularly for entry-level jobs. There is still a skill shortage, and application quality has fallen relative to twelve months ago.";

/* ────────────────────────────────────────────────────────────────────────────
   2. PAY
   ──────────────────────────────────────────────────────────────────────────── */

export const ALL_SECTOR_FORECAST = 3.0; // CIPD Labour Market Outlook
export const ALL_SECTOR_SOURCE = "CIPD Labour Market Outlook";
export const TECH_SECTOR_RANGE: Range = { from: 3.5, to: 4.5 };

export interface PayRiseRow {
  label: string;
  detail: string;
  pct: number;
  range?: Range;
  /** The dashed reference line the others are read against. */
  reference?: boolean;
}
// The 2026 pay-rise landscape, ranked. Deliberately EXCLUDES you-vs-market:
// PAY_TREND answers that in its own chart, and 3.6 against 3.4 as two more bars
// here would be two indistinguishable marks restating it.
export function payRiseLandscape(): PayRiseRow[] {
  const rows: PayRiseRow[] = [
    {
      label: "Real Living Wage",
      detail: `voluntary, from ${WAGE_FLOORS[1].effective}`,
      pct: upliftPct(WAGE_FLOORS[1]),
    },
    {
      label: "National Living Wage",
      detail: `statutory, from ${WAGE_FLOORS[0].effective}`,
      pct: upliftPct(WAGE_FLOORS[0]),
    },
    {
      label: "Technology sector",
      detail: "median pay rise, 2025/26",
      pct: mid(TECH_SECTOR_RANGE),
      range: TECH_SECTOR_RANGE,
    },
    {
      label: "All-sector pay rises",
      detail: ALL_SECTOR_SOURCE,
      pct: ALL_SECTOR_FORECAST,
      reference: true,
    },
  ];
  return rows.sort((a, b) => b.pct - a.pct);
}
/** How much faster the statutory floor is rising than the average pay rise. */
export const floorPremiumPts = () =>
  upliftPct(WAGE_FLOORS[0]) - ALL_SECTOR_FORECAST;

export const TECH_SECTOR_LEAD =
  "The UK technology sector continues to see pay growth moderately above the cross-sector average. Median pay increases for tech roles in 2025/26 are running at 3.5–4.5%, driven by sustained demand for specialist skills in AI/ML, cloud infrastructure and cybersecurity.";
export const TECH_SECTOR_NOTES: readonly string[] = [
  "SaaS and platform companies are budgeting 4–5% increases for engineering and product roles to remain competitive",
  "Data and analytics functions are seeing above-average rises of 4–6% as demand outstrips supply",
  "Support and administrative tech roles are tracking closer to the UK average at 3–3.5%",
  "Remote-first companies are increasingly benchmarking against London salaries regardless of employee location",
];

// The three source paragraphs. {forecast} and {floor} are interpolated at render
// time from ALL_SECTOR_FORECAST and upliftPct(WAGE_FLOORS[0]).
export const UK_PAY_RISES_2026: readonly string[] = [
  "Pay rises as a whole are forecast to sit in the region of {forecast} (CIPD Labour Market Outlook). The latest estimate for the statutory minimum wage is an increase of {floor}.",
  "We anticipate that continued increases in the statutory and Real Living Wages will dominate the pay landscape throughout 2026.",
  "This upward pressure at the bottom of the market will have a longer term transformational effect on the labour market.",
];

export type Direction = "heating" | "cooling";
export interface RolePressure {
  role: string;
  direction: Direction;
  /** null where the source quotes no percentage: renders a "Flat" chip, never an invented bar. */
  range: Range | null;
  note: string;
}
// One array, replacing the source's two separate "Heating Up" and "Cooling Down"
// lists: same ten roles, same ten sentences, same seven ranges, with direction
// carried as data so a single graphic can sort and colour by it.
export const ROLE_PRESSURE: readonly RolePressure[] = [
  {
    role: "AI / Machine Learning Engineers",
    direction: "heating",
    range: { from: 8, to: 12 },
    note: "Salaries up 8–12% year on year. Fierce competition from US-funded companies offering remote roles at premium rates.",
  },
  {
    role: "Cybersecurity Specialists",
    direction: "heating",
    range: { from: 6, to: 10 },
    note: "Regulatory pressure and a rising threat landscape are driving 6–10% increases, with significant signing bonuses.",
  },
  {
    role: "Data Engineers & Analytics Leads",
    direction: "heating",
    range: { from: 5, to: 8 },
    note: "Growing 5–8% as organisations invest heavily in data infrastructure and real-time analytics capabilities.",
  },
  {
    role: "Cloud / DevOps Engineers",
    direction: "heating",
    range: { from: 5, to: 8 },
    note: "Multi-cloud expertise in high demand, with 5–8% pay growth. AWS and Azure certifications command a premium.",
  },
  {
    role: "Product Managers (SaaS)",
    direction: "heating",
    range: { from: 4, to: 7 },
    note: "Experienced PMs with commercial acumen are seeing 4–7% increases as SaaS firms prioritise product-led growth.",
  },
  {
    role: "Project Managers (Generalist)",
    direction: "cooling",
    range: { from: 1, to: 3 },
    note: "Agile transformation is reducing the need for traditional PMs. Pay growth is stalling at 1–3% unless paired with a technical specialism.",
  },
  {
    role: "Junior / Graduate Developers",
    direction: "cooling",
    range: { from: 1, to: 2 },
    note: "Increased supply from bootcamps and university programmes. Pay rises slowing to 1–2%, with longer hiring cycles.",
  },
  {
    role: "IT Support & Helpdesk",
    direction: "cooling",
    range: null,
    note: "Automation and AI chatbots are reducing headcount needs. Pay is flat, or tracking the statutory minimum only.",
  },
  {
    role: "QA / Manual Testing",
    direction: "cooling",
    range: null,
    note: "The shift to automated testing is reducing demand. Roles are increasingly consolidated into development teams.",
  },
  {
    role: "General Admin / Data Entry",
    direction: "cooling",
    range: null,
    note: "AI-assisted workflows and process automation are reducing volume. Roles are being redesigned with broader scope.",
  },
];
export const HEATING_SUBTITLE = "Increasing demand and upward pay pressure";
export const COOLING_SUBTITLE = "Easing demand or flattening pay growth";
/** Roles the sector reports as hardest to fill. Corroborates the heating list. */
export const HARD_TO_FILL: readonly string[] = [
  "Engineering roles",
  "Senior leadership",
  "Data specialists",
];

// Variable pay. The range is the Benefits report's own market read for
// annual-bonus in both the small-private and large-private segments.
export const VARIABLE_PAY_RANGE: Range = { from: 5, to: 20 };
export const VARIABLE_PAY_LEAD =
  "Across the technology sector a profit share or performance bonus is common, typically worth 5–20% of salary depending on the role and the organisation.";
export const VARIABLE_PAY_TRENDS: readonly string[] = [
  "Bonuses become more common, and the percentages higher, as seniority increases",
  "Bonuses remain common, but technology companies are moving towards team-based or organisation-wide bonuses",
  "Bonuses and performance-related pay are increasingly linked to ESG and social impact measures",
  "One-off recognition payments are growing in popularity",
];

export interface SummaryCard {
  title: string;
  body: string;
}
// Four cards. The Pay app's version had three and the older Market Context page
// had a different three; "Market flattening" existed only in the latter and was
// lost when Trends moved into Pay. This is the union of both.
export const MARKET_SUMMARY: readonly SummaryCard[] = [
  {
    title: "Differential pay rises",
    body: "The lion's share of any increased pay pot is going to those at the bottom of the market, which has left some senior salaries showing small or no increases. The statutory minimum wage rise of {floor} continues to push entry-level pay up faster than mid-career roles.",
  },
  {
    title: "Pay compression",
    body: "Compression between the bottom grades and those just above is making it hard to set out clear career paths, particularly for supervisory roles. The gap between entry-level and experienced professionals is narrowing across many sectors.",
  },
  {
    title: "Market flattening",
    body: "The distinction in pay between different sectors, and between different regions, has largely gone for roles at the bottom of the market outside London and the inner South East.",
  },
  {
    title: "Labour market softening",
    body: "Unemployment has risen from {unempFrom} to {unempTo}. Vacancy numbers are falling and hiring cycles are lengthening. Specialist technical and data roles remain tight, with quality candidates in short supply.",
  },
];

export const KEY_TAKEAWAY =
  "These labour market conditions should moderate the upward pressure on pay caused by inflation staying sticky. The balance to strike for 2026 is between the two.";

export const HOW_TO_USE: readonly string[] = [
  "This page covers the wider market environment. It is not specific to your organisation, and it is here so the numbers elsewhere in the dashboard can be read against the forces shaping them.",
  "Pay rise forecasts inform budget planning for the next review cycle. If the market is moving at 3–4%, a 2% budget leaves you falling behind.",
  "Where pay pressure is building shows where supply and demand imbalances are pushing rates up or holding them down. A role of yours in a heating category is one where waiting has a cost.",
];
export const HOW_TO_USE_CAVEAT = `These trends reflect market intelligence as at ${REPORT_PERIOD} and will shift over time.`;

/* ────────────────────────────────────────────────────────────────────────────
   3. BENEFITS
   ──────────────────────────────────────────────────────────────────────────── */

export const BENEFIT_SEGMENTS = [
  { key: "small_private", label: "Small private" },
  { key: "large_private", label: "Large private" },
  { key: "small_nfp", label: "Small not-for-profit" },
  { key: "large_nfp", label: "Large not-for-profit" },
  { key: "public", label: "Public" },
  { key: "large_public", label: "Public (large)" },
] as const;
export type SegmentKey = (typeof BENEFIT_SEGMENTS)[number]["key"];

// Brighton Technologies is ~58 people in the private sector, so small private is
// the primary comparator and large private the reference for where a benefit goes
// as an employer scales. That is the same sp/lp pair the Benefits report shows.
export const CLIENT_SEGMENT: SegmentKey = "small_private";
export const REFERENCE_SEGMENT: SegmentKey = "large_private";

export interface PrevalenceRow {
  name: string;
  shortName: string;
  small_private: number;
  large_private: number;
  small_nfp: number;
  large_nfp: number;
  public: number;
  large_public: number;
}
/** Percentage of employers offering each benefit, by employer type. */
export const BENEFIT_PREVALENCE: readonly PrevalenceRow[] = [
  { name: "Pension (employer contribution 5%+)", shortName: "Pension", small_private: 65, large_private: 88, small_nfp: 78, large_nfp: 95, public: 98, large_public: 99 },
  { name: "Annual leave (25+ days)", shortName: "Annual leave", small_private: 58, large_private: 82, small_nfp: 72, large_nfp: 89, public: 95, large_public: 97 },
  { name: "Hybrid or remote working", shortName: "Hybrid / remote", small_private: 78, large_private: 90, small_nfp: 85, large_nfp: 92, public: 75, large_public: 82 },
  { name: "Death in service (life assurance)", shortName: "Death in service", small_private: 48, large_private: 85, small_nfp: 55, large_nfp: 82, public: 65, large_public: 78 },
  { name: "Car allowance or company car", shortName: "Car allowance", small_private: 42, large_private: 58, small_nfp: 15, large_nfp: 35, public: 22, large_public: 38 },
  { name: "Enhanced maternity and paternity", shortName: "Enhanced parental", small_private: 45, large_private: 72, small_nfp: 62, large_nfp: 78, public: 85, large_public: 88 },
];

export type MarketDirection = "rising" | "stable";
export interface MarketMove {
  dir: MarketDirection;
  evidence: string;
}
// Where the market is moving on each benefit the client already has. Keyed on the
// ESTABLISHED_BENEFITS names so the join is checkable, with the evidence taken
// from the Benefits report's own market read (its HA_Q quartiles and its
// small-private / large-private narratives). Two benefits are marked noMarket in
// the report and say so here rather than borrowing a comparator they do not have.
export const BENEFIT_MARKET_DIRECTION: Record<string, MarketMove> = {
  "Paternity Pay": {
    dir: "rising",
    evidence:
      "Two weeks full pay is still the typical benefit, but around half of large private employers are considering extending it to match maternity pay. The upper quartile is already at four to six weeks.",
  },
  "Annual Leave": {
    dir: "rising",
    evidence:
      "25 days is the market entry point and the median is 27 to 28 days. Around half of large private employers now increase leave with service.",
  },
  "Personal Development Budget": {
    dir: "rising",
    evidence:
      "The market median is £200 to £350 per person a year and the upper quartile is £500 to £1,000 or more. £150 sits at the lower quartile.",
  },
  "Health Cash Plan": {
    dir: "rising",
    evidence:
      "Increasingly common among smaller private employers as a lower-cost alternative to private medical cover, which is what larger employers reach for instead.",
  },
  "Salary Sacrifice": {
    dir: "rising",
    evidence:
      "No market comparator is benchmarked for this yet. Large private employers have broadened salary sacrifice well beyond pension, most commonly to electric vehicles and technology.",
  },
  "Maternity Pay": {
    dir: "rising",
    evidence:
      "The market median is full pay for 8 to 12 weeks, then statutory. Large private employers typically run six months full pay, and 12 weeks full pay is becoming the small-private norm.",
  },
  "Employer Pension": {
    dir: "stable",
    evidence:
      "The market median is 8 to 10% employer contribution. Large private employers typically contribute 5 to 7% with matching up to around 8%; small private employers mostly sit at auto-enrolment levels.",
  },
  "Sick Pay": {
    dir: "stable",
    evidence:
      "The market median is 8 weeks full pay then 8 weeks half. Large private employers typically run three months full and three months half, with permanent health insurance behind it.",
  },
  "Life Assurance": {
    dir: "stable",
    evidence:
      "3x salary is the market median and flat-rating it across the organisation rather than varying by grade is the norm. The upper quartile is 4x.",
  },
  "Employee Assistance Programme": {
    dir: "stable",
    evidence:
      "Near universal in both small and large private employers. The upper quartile adds face-to-face counselling, financial and legal advice and usage reporting.",
  },
  "Holiday Buy / Sell": {
    dir: "stable",
    evidence:
      "Buy is more common than sell among small private employers. Large private employers typically offer up to five days each way, which is the market median.",
  },
  "Professional Subscriptions": {
    dir: "stable",
    evidence:
      "Employer-paid subscriptions are standard practice in both small and large private employers. The upper quartile funds every relevant subscription plus study support.",
  },
  "Compassionate Leave": {
    dir: "stable",
    evidence:
      "The market median is three to five days. Small private employers usually keep it discretionary; large private employers formalise it at up to five days.",
  },
  "Casual User Mileage": {
    dir: "stable",
    evidence:
      "No market comparator is benchmarked for this. HMRC approved rates are the norm and the rate itself has not moved.",
  },
};

// These two lists are hand-maintained in different files and must agree, so make
// a drift show up in development rather than as a benefit silently missing from
// the page.
if (import.meta.env.DEV) {
  const known = new Set(ESTABLISHED_BENEFITS.map((b) => b.name));
  Object.keys(BENEFIT_MARKET_DIRECTION).forEach((k) => {
    if (!known.has(k)) {
      console.warn(`trendsData: "${k}" has a market direction but is not in ESTABLISHED_BENEFITS`);
    }
  });
  ESTABLISHED_BENEFITS.forEach((b) => {
    if (!BENEFIT_MARKET_DIRECTION[b.name]) {
      console.warn(`trendsData: no market direction written for "${b.name}"`);
    }
  });
}

const BADGE_RANK: Record<BenefitBadge, number> = { below: 0, watch: 1, at: 2, above: 3 };
export interface BenefitUnderPressure {
  name: string;
  category: string;
  provision: string;
  badge: BenefitBadge;
  evidence: string;
}
/**
 * Benefits the market is moving on, worst-positioned first. The derived fact
 * neither source page could state: not "where are we today" but "where are we
 * standing still while the market rises underneath us".
 */
export function benefitsUnderPressure(): BenefitUnderPressure[] {
  return ESTABLISHED_BENEFITS.filter(
    (b) => BENEFIT_MARKET_DIRECTION[b.name]?.dir === "rising",
  )
    .map((b) => ({ ...b, evidence: BENEFIT_MARKET_DIRECTION[b.name].evidence }))
    .sort((a, b) => BADGE_RANK[a.badge] - BADGE_RANK[b.badge]);
}

export interface BenefitTheme {
  marketMove: string;
  ideas: readonly string[];
}
// Keyed to the canonical BENEFIT_CATEGORIES union, so the six-category count is
// never typed and adding a category without a theme fails the typecheck.
export const BENEFIT_THEMES: Record<BenefitCategory, BenefitTheme> = {
  "Core Benefits": {
    marketMove:
      "Pension and leave are where the market is least willing to fall behind, and both have crept up. 25 days leave is now the entry point rather than a selling point, and service-related increases are spreading through large private employers.",
    ideas: [
      "Additional leave purchase schemes",
      "Service-related annual leave increases",
      "Employer pension matching above auto-enrolment",
      "Enhanced parental leave across maternity, paternity and adoption",
      "Sick pay backed by permanent health insurance",
    ],
  },
  "Working Time": {
    marketMove:
      "Flexibility remains the most valued benefit, and the focus has shifted from where people work to genuine autonomy over when. Formal flexitime and compressed hours are now common in larger private employers.",
    ideas: [
      "Core hours with flexible start and finish times",
      "Compressed working weeks, for example a nine-day fortnight",
      "Summer hours or an early Friday finish",
      "Sabbatical options after long service",
      "Carers' leave policies",
    ],
  },
  "Health & Wellbeing": {
    marketMove:
      "Supporting physical and mental health is a baseline expectation. Employers are moving past a standalone EAP towards proactive provision, and health cash plans are becoming the small-employer answer to private medical cover.",
    ideas: [
      "Mental health first aiders and manager training",
      "Wellbeing days additional to sick leave",
      "Health cash plans or private medical options",
      "Menopause support policies and awareness",
      "Access to counselling or therapy sessions",
      "Digital GP access, usually bundled with a cash plan",
    ],
  },
  "Financial Support": {
    marketMove:
      "Cost of living pressure has moved financial wellbeing from a nice-to-have to a live agenda, and support now reaches beyond pension into immediate resilience. Salary sacrifice has broadened well past pension into electric vehicles and technology.",
    ideas: [
      "Salary advance or earned wage access schemes",
      "Financial education and guidance, often through the EAP provider",
      "Savings schemes with employer matching",
      "Retail discount platforms",
      "Season ticket and low-cost item loans",
    ],
  },
  "ESG & DEI": {
    marketMove:
      "Benefits that align with environmental and social values carry weight, particularly with younger employees. Around half of large private employers now offer paid volunteering, averaging one and a half days.",
    ideas: [
      "Paid volunteering days, typically one to three per year",
      "Charity matching schemes",
      "Electric vehicle salary sacrifice",
      "Cycle to work schemes",
      "An ethical or ESG pension fund option",
    ],
  },
  "Learning & Development": {
    marketMove:
      "Learning budgets are increasingly employee-directed rather than allocated, and the gap between the median employer and the upper quartile is wide. Employer-paid professional subscriptions are now standard practice.",
    ideas: [
      "Personal learning budgets",
      "Study leave and exam support",
      "Mentoring and coaching programmes",
      "Internal mobility and secondment opportunities",
      "A curated digital learning platform",
    ],
  },
};

// Prevalence is an ORDERED scale, so it gets an ordinal ramp rather than five
// unrelated hues. Order matters: the array index IS the position on the scale.
export const PREVALENCE_SCALE = ["Rare", "Emerging", "Growing", "Moderate", "Common"] as const;
export type Prevalence = (typeof PREVALENCE_SCALE)[number];
export interface Differentiator {
  name: string;
  prevalence: Prevalence;
  evidence?: string;
}
export const DIFFERENTIATORS: readonly Differentiator[] = [
  { name: "Home office equipment budget", prevalence: "Common" },
  {
    name: "Career break or sabbatical schemes",
    prevalence: "Moderate",
    evidence: "Three to twelve months after three to five years' service is established in large private employers, and rare in small ones.",
  },
  {
    name: "Paid volunteering days",
    prevalence: "Moderate",
    evidence: "Around half of large private employers offer this, averaging 1.5 days.",
  },
  { name: "Wellbeing apps such as Headspace or Calm", prevalence: "Growing" },
  { name: "Pet-friendly policies", prevalence: "Growing" },
  {
    name: "Fertility treatment support and leave",
    prevalence: "Emerging",
  },
  {
    name: "Financial coaching",
    prevalence: "Emerging",
    evidence: "Increasingly common, and usually offered through the EAP provider.",
  },
  {
    name: "Earned wage access",
    prevalence: "Emerging",
    evidence: "11% of respondents to the CIPD Reward Management Survey offer this.",
  },
  { name: "Grandparent leave", prevalence: "Emerging" },
  { name: "Four-day week trials", prevalence: "Rare" },
  { name: "Unlimited annual leave", prevalence: "Rare" },
  { name: "Climate perks, such as extra leave for low-carbon travel", prevalence: "Rare" },
  { name: "Formal equity or share schemes", prevalence: "Rare", evidence: "Rare in small private employers and mostly used by founder-led organisations. SIP and SAYE are the norm once an employer is large." },
];

export const BENEFITS_TAKEAWAY =
  "The benefits people value most are the ones that show genuine care for their lives outside work. Flexibility, recognition and development build engagement without the standing cost of a salary increase, so they are worth exhausting before premium benefits.";
export const BENEFITS_GUIDANCE: readonly { head: string; body: string }[] = [
  {
    head: "Prioritisation",
    body: "Start from what fits the organisation's values and its workforce. Not every benefit suits every employer.",
  },
  {
    head: "Implementation",
    body: "Pilot before rolling out. Gather feedback and measure uptake, then refine.",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Re-export so the page reads one module
   ──────────────────────────────────────────────────────────────────────────── */
export { PAY_TREND, BENEFIT_CATEGORIES };
export type { BenefitCategory, BenefitBadge };
