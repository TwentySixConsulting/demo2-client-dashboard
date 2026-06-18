import { useEffect, useState } from "react";
import { MarketDataRole, marketData } from "./data";

// Client-side store for roles the user adds to their Pay benchmark, on top of
// the benchmarked ("submitted") set in data.ts. Persisted to localStorage, same
// robust try/catch pattern as the temp-auth store in AuthContext.
const STORAGE_KEY = "demo-client-dashboard:user-roles";
const CHANGE_EVENT = "userroleschange";

export const USER_ROLE_PREFIX = "user-";

export function isUserRole(id: string): boolean {
  return id.startsWith(USER_ROLE_PREFIX);
}

export function getUserRoles(): MarketDataRole[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MarketDataRole[]) : [];
  } catch {
    return [];
  }
}

function persist(roles: MarketDataRole[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function addUserRole(role: Omit<MarketDataRole, "id">): MarketDataRole {
  const withId: MarketDataRole = { ...role, id: `${USER_ROLE_PREFIX}${Date.now()}` };
  persist([...getUserRoles(), withId]);
  return withId;
}

export function removeUserRole(id: string) {
  persist(getUserRoles().filter((r) => r.id !== id));
}

/** The benchmarked (submitted) roles plus any the client has added. */
export function getAllRoles(): MarketDataRole[] {
  return [...marketData, ...getUserRoles()];
}

/** Reactive view of the user-added roles, kept in sync across tabs and edits. */
export function useUserRoles(): MarketDataRole[] {
  const [roles, setRoles] = useState<MarketDataRole[]>(getUserRoles);
  useEffect(() => {
    const handler = () => setRoles(getUserRoles());
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return roles;
}
