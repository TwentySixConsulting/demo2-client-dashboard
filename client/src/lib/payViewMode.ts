// Pay view mode: "role" (one row per benchmarked role) or "person" (one row per
// individual). Twin of the vendored Pay app's lib/payViewMode.ts — same key and
// event names, so toggling here syncs into the Pay dashboards (same origin) and
// vice-versa. Persisted to localStorage.
import { useEffect, useState } from "react";

export type ViewMode = "role" | "person";

const KEY = "zigbert:pay-view-mode";
const EVENT = "payviewmodechange";

export function getPayViewMode(): ViewMode {
  if (typeof window === "undefined") return "role";
  try {
    return window.localStorage.getItem(KEY) === "person" ? "person" : "role";
  } catch {
    return "role";
  }
}

export function setPayViewMode(mode: ViewMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function usePayViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(getPayViewMode());
  useEffect(() => {
    const sync = () => setMode(getPayViewMode());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [mode, setPayViewMode];
}
