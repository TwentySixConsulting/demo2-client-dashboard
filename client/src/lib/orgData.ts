import { BASE_ROSTER } from "@/lib/roster";

// Option lists + seed data for the Your Organisation page.

// Departments: the functions present in the benchmarked roster, plus common extras.
const BASE_DEPARTMENTS = ["Engineering", "Product", "Data", "Commercial", "Marketing", "Finance", "Operations", "People", "Leadership"];
export const DEPARTMENTS: string[] = Array.from(
  new Set([...BASE_ROSTER.map((r) => r.function), ...BASE_DEPARTMENTS]),
).sort();

// Job levels (client-friendly labels).
export const LEVELS = [
  { value: "Director / Head of", jobLevel: 1 },
  { value: "Senior", jobLevel: 2 },
  { value: "Mid-level", jobLevel: 3 },
  { value: "Junior / Entry", jobLevel: 4 },
];
export function levelLabel(jobLevel: number): string {
  return LEVELS.find((l) => l.jobLevel === jobLevel)?.value ?? `Level ${jobLevel}`;
}

export const LOCATIONS = ["Brighton", "London", "South East England", "Remote (UK)", "Manchester", "Other"];

export const BENEFIT_CATEGORIES = [
  "Core Benefits",
  "Working Time",
  "Health & Wellbeing",
  "Financial Support",
  "ESG & DEI",
  "Learning & Development",
];

// The established (already-benchmarked) benefits. This list MUST stay in step with
// the Benefits report's own BENEFITS array in client/public/benefits/index.html:
// same 14 benefits, same categories, same badges. They are two separate apps with
// no shared data layer, so if you add a benefit in one, add it in the other, or
// Home and Your Organisation start quoting different totals to the client.
// above/at = at-or-above market, watch = mixed, below = gap.
export type BenefitBadge = "above" | "at" | "watch" | "below";
export interface SeedBenefit { name: string; category: string; provision: string; badge: BenefitBadge; }
export const ESTABLISHED_BENEFITS: SeedBenefit[] = [
  { name: "Annual Leave", category: "Core Benefits", provision: "25 days + 2 Christmas (~27)", badge: "at" },
  { name: "Holiday Buy / Sell", category: "Core Benefits", provision: "Up to 5 days", badge: "at" },
  { name: "Employer Pension", category: "Core Benefits", provision: "10% employer DC", badge: "above" },
  { name: "Salary Sacrifice", category: "Financial Support", provision: "Pension, cycle to work, EV", badge: "at" },
  { name: "Sick Pay", category: "Core Benefits", provision: "3m full + 3m half (after 2 yr)", badge: "watch" },
  { name: "Maternity Pay", category: "Core Benefits", provision: "Enhanced", badge: "at" },
  { name: "Paternity Pay", category: "Core Benefits", provision: "2 weeks full pay", badge: "at" },
  { name: "Casual User Mileage", category: "Core Benefits", provision: "45p per mile (HMRC rate)", badge: "at" },
  { name: "Compassionate Leave", category: "Working Time", provision: "Discretionary", badge: "above" },
  { name: "Life Assurance", category: "Health & Wellbeing", provision: "3× salary", badge: "at" },
  { name: "Employee Assistance Programme", category: "Health & Wellbeing", provision: "Available to all", badge: "at" },
  { name: "Health Cash Plan", category: "Health & Wellbeing", provision: "HSF + Perkbox bundle", badge: "above" },
  { name: "Personal Development Budget", category: "Learning & Development", provision: "£150 per year", badge: "below" },
  { name: "Professional Subscriptions", category: "Learning & Development", provision: "BCS funded for all", badge: "above" },
];

export function benefitsSummary() {
  const total = ESTABLISHED_BENEFITS.length;
  const above = ESTABLISHED_BENEFITS.filter((b) => b.badge === "above").length;
  const at = ESTABLISHED_BENEFITS.filter((b) => b.badge === "at").length;
  const watch = ESTABLISHED_BENEFITS.filter((b) => b.badge === "watch").length;
  const below = ESTABLISHED_BENEFITS.filter((b) => b.badge === "below").length;
  return { total, above, at, watch, below, atOrAbove: above + at, gaps: below + watch };
}
