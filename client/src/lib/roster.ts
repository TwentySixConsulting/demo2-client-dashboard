import { useMemo } from "react";
import { getPositioning } from "@/lib/data";
import { useRoleOverrides, type RoleOverrides } from "@/lib/orgStore";

// The canonical benchmarked roster — the SAME 25 roles the Pay app uses, so the
// organisation view and the Pay dashboards stay in step. Edits are stored as
// overrides (lib/orgStore, key "zigbert:role-overrides") which the Pay app also
// reads, so a salary change here is reflected across the site.

export interface RosterRole {
  id: string;
  role: string;
  currentSalary: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number;
  function: string;
  jobLevel: number;
  location: string;
}

export const BASE_ROSTER: RosterRole[] = [
  { id: "1", role: "Data Analyst", currentSalary: 35000, lowerQuartile: 30000, median: 34000, upperQuartile: 38000, function: "Data", jobLevel: 3, location: "London/South East" },
  { id: "2", role: "Data Researcher", currentSalary: 24000, lowerQuartile: 22500, median: 23500, upperQuartile: 24000, function: "Data", jobLevel: 4, location: "London/South East" },
  { id: "3", role: "Data Systems Engineer", currentSalary: 47500, lowerQuartile: 45000, median: 50000, upperQuartile: 55000, function: "Data", jobLevel: 3, location: "London/South East" },
  { id: "4", role: "Data Manager", currentSalary: 54600, lowerQuartile: 50000, median: 56000, upperQuartile: 62000, function: "Data", jobLevel: 2, location: "London/South East" },
  { id: "5", role: "Data Coordinator", currentSalary: 27000, lowerQuartile: 25000, median: 27500, upperQuartile: 30000, function: "Data", jobLevel: 4, location: "London/South East" },
  { id: "6", role: "Product Owner", currentSalary: 56000, lowerQuartile: 51000, median: 56000, upperQuartile: 63000, function: "Product", jobLevel: 3, location: "London/South East" },
  { id: "7", role: "Finance Director", currentSalary: 87000, lowerQuartile: 78000, median: 86000, upperQuartile: 94000, function: "Finance", jobLevel: 1, location: "London/South East" },
  { id: "8", role: "Management Accountant", currentSalary: 44000, lowerQuartile: 40000, median: 44000, upperQuartile: 48000, function: "Finance", jobLevel: 3, location: "London/South East" },
  { id: "9", role: "Commercial Director", currentSalary: 82000, lowerQuartile: 72000, median: 80000, upperQuartile: 89000, function: "Commercial", jobLevel: 1, location: "London/South East" },
  { id: "10", role: "Managing Director", currentSalary: 110000, lowerQuartile: 100000, median: 110000, upperQuartile: 120000, function: "Leadership", jobLevel: 1, location: "London/South East" },
  { id: "11", role: "Software Engineer", currentSalary: 55000, lowerQuartile: 48000, median: 55000, upperQuartile: 63000, function: "Engineering", jobLevel: 3, location: "London/South East" },
  { id: "12", role: "Senior Software Engineer", currentSalary: 72000, lowerQuartile: 62000, median: 70000, upperQuartile: 78000, function: "Engineering", jobLevel: 2, location: "London/South East" },
  { id: "13", role: "DevOps Engineer", currentSalary: 58000, lowerQuartile: 52000, median: 60000, upperQuartile: 68000, function: "Engineering", jobLevel: 3, location: "London/South East" },
  { id: "14", role: "QA Engineer", currentSalary: 38000, lowerQuartile: 35000, median: 40000, upperQuartile: 45000, function: "Engineering", jobLevel: 3, location: "London/South East" },
  { id: "15", role: "Product Manager", currentSalary: 68000, lowerQuartile: 58000, median: 65000, upperQuartile: 72000, function: "Product", jobLevel: 2, location: "London/South East" },
  { id: "16", role: "UX Designer", currentSalary: 46000, lowerQuartile: 42000, median: 48000, upperQuartile: 54000, function: "Product", jobLevel: 3, location: "London/South East" },
  { id: "17", role: "Marketing Manager", currentSalary: 52000, lowerQuartile: 45000, median: 50000, upperQuartile: 56000, function: "Commercial", jobLevel: 2, location: "London/South East" },
  { id: "18", role: "Sales Executive", currentSalary: 42000, lowerQuartile: 35000, median: 38000, upperQuartile: 42000, function: "Commercial", jobLevel: 3, location: "London/South East" },
  { id: "19", role: "Customer Success Manager", currentSalary: 38000, lowerQuartile: 36000, median: 40000, upperQuartile: 44000, function: "Commercial", jobLevel: 3, location: "London/South East" },
  { id: "20", role: "HR Manager", currentSalary: 50000, lowerQuartile: 44000, median: 48000, upperQuartile: 53000, function: "Operations", jobLevel: 2, location: "London/South East" },
  { id: "21", role: "Office Manager", currentSalary: 32000, lowerQuartile: 28000, median: 31000, upperQuartile: 34000, function: "Operations", jobLevel: 3, location: "London/South East" },
  { id: "22", role: "Finance Analyst", currentSalary: 36000, lowerQuartile: 33000, median: 37000, upperQuartile: 41000, function: "Finance", jobLevel: 3, location: "London/South East" },
  { id: "23", role: "Head of Engineering", currentSalary: 95000, lowerQuartile: 85000, median: 92000, upperQuartile: 100000, function: "Engineering", jobLevel: 1, location: "London/South East" },
  { id: "24", role: "Head of Product", currentSalary: 88000, lowerQuartile: 78000, median: 85000, upperQuartile: 93000, function: "Product", jobLevel: 1, location: "London/South East" },
  { id: "25", role: "Junior Developer", currentSalary: 28000, lowerQuartile: 26000, median: 30000, upperQuartile: 34000, function: "Engineering", jobLevel: 4, location: "London/South East" },
];

// Seed headcount (people in each role) so the org has a realistic size (~58).
// Exported so lib/people.ts can expand it into individual person records that
// match the vendored Pay app's identical seed.
export const HEADCOUNTS: Record<string, number> = {
  "1": 4, "2": 2, "3": 2, "4": 1, "5": 2, "6": 2, "7": 1, "8": 2, "9": 1, "10": 1,
  "11": 8, "12": 5, "13": 2, "14": 3, "15": 2, "16": 2, "17": 1, "18": 4, "19": 3,
  "20": 1, "21": 1, "22": 2, "23": 1, "24": 1, "25": 4,
};

export interface RosterRoleView extends RosterRole {
  headcount: number;
  edited: boolean;
  positioning: ReturnType<typeof getPositioning>;
  diffPct: number;
}

function applyOverrides(overrides: RoleOverrides): RosterRoleView[] {
  return BASE_ROSTER.map((base) => {
    const o = overrides[base.id];
    const merged: RosterRole = o
      ? {
          ...base,
          role: o.role ?? base.role,
          function: o.function ?? base.function,
          jobLevel: o.jobLevel ?? base.jobLevel,
          location: o.location ?? base.location,
          currentSalary: o.currentSalary ?? base.currentSalary,
        }
      : base;
    return {
      ...merged,
      headcount: o?.headcount ?? HEADCOUNTS[base.id] ?? 1,
      edited: !!o,
      positioning: getPositioning(merged.currentSalary, merged.lowerQuartile, merged.median, merged.upperQuartile),
      diffPct: ((merged.currentSalary - merged.median) / merged.median) * 100,
    };
  });
}

/** Reactive roster with the user's edits applied. */
export function useRoster(): RosterRoleView[] {
  const overrides = useRoleOverrides();
  return useMemo(() => applyOverrides(overrides), [overrides]);
}
