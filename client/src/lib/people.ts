// Per-person pay records for the "Your Organisation" page's By person view.
//
// The seed dataset describes the org role by role, so we expand each role's
// headcount into individuals with a DETERMINISTIC jitter — the SAME algorithm as
// the vendored Pay app's lib/people.ts, keyed off the shared role ids + salaries,
// so both generate identical people before the client edits anything. Client edits
// are persisted to same-origin localStorage under "zigbert:people", which the Pay
// dashboards read to drive their By person analysis.
import { useEffect, useState } from "react";
import { BASE_ROSTER, HEADCOUNTS } from "@/lib/roster";

const PEOPLE_KEY = "zigbert:people";
const CHANGE_EVENT = "orgstorechange"; // shared with orgStore so views stay in sync

export interface Person {
  id: string;
  roleId: string; // links to BASE_ROSTER / Pay marketData id ("1".."25")
  salary: number; // ACTUAL annual base (pro-rated for part-timers)
  fte: number; // 0 < fte <= 1
  location?: string;
}

// Must match the Pay app's SALARY_JITTER / seededFte exactly.
const SALARY_JITTER = [0, -0.05, 0.04, -0.08, 0.06, -0.02, 0.09, -0.06, 0.03, -0.09];
function seededFte(globalIdx: number): number {
  if (globalIdx % 7 === 4) return 0.6;
  if (globalIdx % 11 === 3) return 0.8;
  if (globalIdx % 13 === 6) return 0.5;
  return 1;
}

export function generateSeedPeople(
  roles: Array<{ id: string; currentSalary: number; location?: string }>,
  headcounts: Record<string, number> = HEADCOUNTS,
): Person[] {
  const people: Person[] = [];
  let globalIdx = 0;
  for (const role of roles) {
    const n = headcounts[role.id] ?? 1;
    for (let k = 0; k < n; k++) {
      const offset = SALARY_JITTER[globalIdx % SALARY_JITTER.length];
      const fte = seededFte(globalIdx);
      const equiv = role.currentSalary * (1 + offset);
      const salary = Math.round((equiv * fte) / 50) * 50;
      people.push({ id: `p-${role.id}-${k + 1}`, roleId: role.id, salary, fte, location: role.location });
      globalIdx++;
    }
  }
  return people;
}

export const BASE_PEOPLE: Person[] = generateSeedPeople(BASE_ROSTER);

function readPeople(): Person[] {
  if (typeof window === "undefined") return BASE_PEOPLE;
  try {
    const raw = window.localStorage.getItem(PEOPLE_KEY);
    if (!raw) return BASE_PEOPLE;
    const parsed = JSON.parse(raw) as Person[];
    return Array.isArray(parsed) ? parsed : BASE_PEOPLE;
  } catch {
    return BASE_PEOPLE;
  }
}

function persist(people: Person[]) {
  try {
    window.localStorage.setItem(PEOPLE_KEY, JSON.stringify(people));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Persist the deterministic seed once, so the Pay app reads the same people set. */
export function ensurePeopleSeeded() {
  if (typeof window === "undefined") return;
  try {
    if (!window.localStorage.getItem(PEOPLE_KEY)) persist(BASE_PEOPLE);
  } catch {
    /* ignore */
  }
}

export function getPeople(): Person[] { return readPeople(); }

export function addPerson(p: Omit<Person, "id">): Person {
  const item: Person = { ...p, id: `p-user-${Date.now()}` };
  persist([...readPeople(), item]);
  return item;
}
export function updatePerson(id: string, patch: Partial<Omit<Person, "id">>) {
  persist(readPeople().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}
export function removePerson(id: string) {
  persist(readPeople().filter((p) => p.id !== id));
}

/** Reactive people list (seeded if the client hasn't persisted any yet). */
export function usePeople(): Person[] {
  const [items, setItems] = useState<Person[]>(readPeople);
  useEffect(() => {
    const handler = () => setItems(readPeople());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return items;
}
