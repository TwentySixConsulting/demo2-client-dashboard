// A figure with an uppercase eyebrow above it, and the row that holds a set of
// them. Home's local `HeroStat` is the same shape plus a status tone, so it now
// renders through this rather than duplicating the type scale.
//
// The scale is load-bearing and deliberately small: 10px/0.14em eyebrow over a
// 26px display figure. Anything larger competes with the page h1 sitting a few
// pixels above it.
import { C } from "@/lib/theme";

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  /** Overrides the figure colour. Used for status tones; leave unset for ink. */
  color?: string;
}

export function StatTile({ label, value, sub, color }: StatTileProps) {
  return (
    <div className="min-w-0">
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: C.inkSubtle }}
      >
        {label}
      </div>
      <div
        className="font-display font-bold tabular-nums mt-1"
        style={{ fontSize: 26, lineHeight: 1, color: color ?? C.ink }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1 leading-snug" style={{ color: C.inkMuted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/**
 * A row of tiles inside a panel. Two columns on a phone rather than one, because
 * a KPI row is a comparison and stacking it into a single column turns four
 * related figures into four unrelated ones.
 */
export function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">{children}</div>
  );
}
