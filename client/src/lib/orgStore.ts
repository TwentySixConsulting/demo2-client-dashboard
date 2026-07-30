import { useEffect, useState } from "react";

// Client-side stores for the "Your Organisation" page: roles and benefits the
// client adds for benchmarking. Persisted to localStorage with the same robust,
// cross-tab-reactive pattern as lib/userRoles.ts. No backend — an added item is
// "awaiting benchmark" until TwentySix return the market range (out of demo scope).

const ROLES_KEY = "demo-client-dashboard:org-roles";
const BENEFITS_KEY = "demo-client-dashboard:org-benefits";
// Shared with the Pay app (same origin) — edits made here flow into the Pay
// dashboards, which read this key at load. Keep the key + shape stable.
const OVERRIDES_KEY = "zigbert:role-overrides";
const BENEFIT_OVERRIDES_KEY = "zigbert:benefit-overrides";
const CHANGE_EVENT = "orgstorechange";

export interface RoleOverride {
  role?: string;
  function?: string;
  jobLevel?: number;
  location?: string;
  currentSalary?: number;
  headcount?: number;
  updatedAt: number;
}
export type RoleOverrides = Record<string, RoleOverride>;

export interface OrgRole {
  id: string;
  role: string;
  department: string;
  jobLevel: string;      // level label, e.g. "Senior"
  currentSalary: number;
  location: string;
  headcount?: number;
  submittedAt: number;
  status: "awaiting";
}

export interface OrgBenefit {
  id: string;
  name: string;
  category: string;
  provision: string;
  eligibility?: string;
  submittedAt: number;
  status: "awaiting";
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist<T>(key: string, items: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

// ── Roles ──────────────────────────────────────────────────
export function getOrgRoles(): OrgRole[] { return read<OrgRole>(ROLES_KEY); }
export function addOrgRole(role: Omit<OrgRole, "id" | "submittedAt" | "status">): OrgRole {
  const item: OrgRole = { ...role, id: `user-${Date.now()}`, submittedAt: Date.now(), status: "awaiting" };
  persist(ROLES_KEY, [...getOrgRoles(), item]);
  return item;
}
export function removeOrgRole(id: string) { persist(ROLES_KEY, getOrgRoles().filter((r) => r.id !== id)); }
export function updateOrgRole(id: string, patch: Partial<Omit<OrgRole, "id" | "submittedAt" | "status">>) {
  persist(ROLES_KEY, getOrgRoles().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

// ── Benefits ───────────────────────────────────────────────
export function getOrgBenefits(): OrgBenefit[] { return read<OrgBenefit>(BENEFITS_KEY); }
export function addOrgBenefit(b: Omit<OrgBenefit, "id" | "submittedAt" | "status">): OrgBenefit {
  const item: OrgBenefit = { ...b, id: `user-${Date.now()}`, submittedAt: Date.now(), status: "awaiting" };
  persist(BENEFITS_KEY, [...getOrgBenefits(), item]);
  return item;
}
export function removeOrgBenefit(id: string) { persist(BENEFITS_KEY, getOrgBenefits().filter((b) => b.id !== id)); }
export function updateOrgBenefit(id: string, patch: Partial<Omit<OrgBenefit, "id" | "submittedAt" | "status">>) {
  persist(BENEFITS_KEY, getOrgBenefits().map((b) => (b.id === id ? { ...b, ...patch } : b)));
}

// ── Benefit overrides (edits to established benefits → "under review") ──
export interface BenefitOverride { name?: string; category?: string; provision?: string; eligibility?: string; updatedAt: number; }
export type BenefitOverrides = Record<string, BenefitOverride>;
export function getBenefitOverrides(): BenefitOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BENEFIT_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as BenefitOverrides) : {};
  } catch { return {}; }
}
export function setBenefitOverride(key: string, patch: Omit<BenefitOverride, "updatedAt">) {
  const all = getBenefitOverrides();
  try {
    window.localStorage.setItem(BENEFIT_OVERRIDES_KEY, JSON.stringify({ ...all, [key]: { ...(all[key] || {}), ...patch, updatedAt: Date.now() } }));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch { /* ignore */ }
}
export function clearBenefitOverride(key: string) {
  const all = getBenefitOverrides(); delete all[key];
  try {
    window.localStorage.setItem(BENEFIT_OVERRIDES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch { /* ignore */ }
}

// ── Role overrides (edits to the benchmarked roster; shared with Pay) ──
export function getRoleOverrides(): RoleOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as RoleOverrides) : {};
  } catch {
    return {};
  }
}
export function setRoleOverride(id: string, patch: Omit<RoleOverride, "updatedAt">) {
  const all = getRoleOverrides();
  const next = { ...(all[id] || {}), ...patch, updatedAt: Date.now() };
  // drop empty keys so we don't store no-op overrides
  const cleaned: RoleOverride = { updatedAt: next.updatedAt };
  (["role", "function", "jobLevel", "location", "currentSalary", "headcount"] as const).forEach((k) => {
    if (next[k] !== undefined && next[k] !== "" && next[k] !== null) (cleaned as Record<string, unknown>)[k] = next[k];
  });
  try {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify({ ...all, [id]: cleaned }));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}
export function clearRoleOverride(id: string) {
  const all = getRoleOverrides();
  delete all[id];
  try {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

// ── Reactive hooks (synced across tabs + edits) ────────────
function useStore<T>(getter: () => T[]): T[] {
  const [items, setItems] = useState<T[]>(getter);
  useEffect(() => {
    const handler = () => setItems(getter());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return items;
}
export function useOrgRoles(): OrgRole[] { return useStore(getOrgRoles); }
export function useOrgBenefits(): OrgBenefit[] { return useStore(getOrgBenefits); }
export function useRoleOverrides(): RoleOverrides { return useStore2(getRoleOverrides); }
export function useBenefitOverrides(): BenefitOverrides { return useStore2(getBenefitOverrides); }
function useStore2<T>(getter: () => T): T {
  const [v, setV] = useState<T>(getter);
  useEffect(() => {
    const handler = () => setV(getter());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}
