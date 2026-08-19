// The three supporting graphics on Home, beyond the benefits mix in HomeCharts.
// Each renders BARE — no card, title or action of its own — because each sits
// inside a panel that already supplies those.
//
// All read LIVE roster/orgData, so these are the client's own numbers.
//
// House rules carried over from HomeCharts.tsx: thin marks, 4px rounded data ends
// against a square baseline, 2px surface gaps between touching fills, recessive
// tracks, no gradients, and text in ink tokens — never in the series colour, so
// identity always comes from a mark beside the text.
//
// (An earlier version of this file also held eight preview cards for a scrolling
// marquee in the Pay and Benefits boxes. The motion was dropped as distracting,
// and the cards with it; they are in git history at 447f6b2 if wanted.)
import { C } from "@/lib/theme";
import type { RosterRoleView } from "@/lib/roster";
import { BENEFIT_CATEGORIES, ESTABLISHED_BENEFITS } from "@/lib/orgData";

const CLAY = "#C9785A";
const SLATE = "#7285A5";
const SLATE_DEEP = "#5C6D8A";
const GOOD = "#3F7D6A";


// ── Snapshot: how many roles sit below, at and above market ───────────────────
//
// The boundaries matter, so they are worth writing down. The four benchmarked
// bands are: below LQ, LQ→median, median→UQ, above UQ. Collapsing those into
// three buckets only works one way on real data:
//
//   * "within LQ→UQ = at market" gives 0 / 25 / 0 on this roster — every role is
//     inside the interquartile range, so the graphic says nothing.
//   * a ±5% tolerance around the median gives 1 / 23 / 1, no better.
//   * the median as the boundary gives 9 / 16 / 0, which is informative AND is
//     the same "9 of 25 below market" figure the verdict sentence, the attention
//     feed and the Pay app all quote. Consistency wins: a client who sees 9 in
//     one place and 7 in another stops trusting both.
//
// So: below market = under the median · at market = median to upper quartile ·
// above market = above the upper quartile. A zero is real information here, not
// a broken chart.
const POSITION_BUCKETS = [
  { key: "below", label: "Below market", note: "under the median", color: CLAY },
  { key: "at", label: "At market", note: "median to UQ", color: SLATE },
  { key: "above", label: "Above market", note: "above UQ", color: "#4B5870" },
] as const;

export function RolePositionCounts({ bands, total }: { bands: Record<string, number>; total: number }) {
  const counts: Record<string, number> = {
    below: (bands.below ?? 0) + (bands.lower ?? 0),
    at: bands.upper ?? 0,
    above: bands.above ?? 0,
  };
  const sum = POSITION_BUCKETS.reduce((s, b) => s + counts[b.key], 0) || 1;
  const shown = POSITION_BUCKETS.filter((b) => counts[b.key] > 0);

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3.5" style={{ color: C.inkSubtle }}>
        Where your {total} roles sit
      </div>

      {/* The counts lead: the number is the point, the label supports it. */}
      <div className="flex items-stretch">
        {POSITION_BUCKETS.map((b, i) => (
          <div key={b.key} className={`flex-1 min-w-0 ${i > 0 ? "pl-3.5 ml-3.5 border-l" : ""}`}
            style={i > 0 ? { borderColor: C.borderSubtle } : undefined}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-block w-2 h-2 rounded-[2px] shrink-0" style={{ background: b.color }} />
              <span className="font-display font-bold tabular-nums" style={{ fontSize: 23, color: C.ink, lineHeight: 1 }}>
                {counts[b.key]}
              </span>
            </div>
            <div className="text-[10.5px] font-semibold leading-tight" style={{ color: C.ink }}>{b.label}</div>
            <div className="text-[9.5px] leading-tight mt-0.5" style={{ color: C.inkSubtle }}>{b.note}</div>
          </div>
        ))}
      </div>

      {/* Proportional bar. Zero buckets are dropped so they cannot leave a stray
          surface gap; square at the baseline, 4px rounded at the data end. */}
      <div className="flex mt-4" style={{ height: 8, gap: 2 }} role="img"
        aria-label={POSITION_BUCKETS.map((b) => `${b.label} ${counts[b.key]} of ${total}`).join(", ")}>
        {shown.map((b, i) => (
          <div key={b.key} style={{
            flexGrow: counts[b.key], flexBasis: 0, minWidth: 4, background: b.color,
            borderRadius: i === shown.length - 1 ? "0 4px 4px 0" : 0,
          }} />
        ))}
      </div>
      <div className="mt-2 text-[10.5px]" style={{ color: C.inkMuted }}>
        {Math.round((counts.below / sum) * 100)}% of roles pay below the market median
      </div>
    </div>
  );
}

// ── Pay box: average position vs the median, by function ──────────────────────
//
// DIVERGING about the market median, which is a real zero: warm clay to the left
// for below, cool slate to the right for above, and no hue at the midpoint.
//
// This replaced a "roles furthest below the median" bar list. On this roster the
// cash gaps are £2,500 once and £2,000 five times over, so that chart was five
// near-identical bars labelled £2k — it looked like data but carried none. By
// function there is a genuine spread (-1.5% to +3.7%), and it answers the box's
// own one-liner, "where you sit on pay", rather than repeating the Snapshot's
// count of positions.
export function PayByFunction({ roster, avgDiffPct }: { roster: RosterRoleView[]; avgDiffPct: number }) {
  const byFn: Record<string, number[]> = {};
  roster.forEach((r) => { (byFn[r.function || "Other"] ||= []).push(r.diffPct); });
  const rows = Object.entries(byFn)
    .map(([fn, v]) => ({ fn, avg: v.reduce((a, b) => a + b, 0) / v.length, n: v.length }))
    .sort((a, b) => a.avg - b.avg);

  // Symmetric scale so left and right are directly comparable, rounded out to a
  // whole percent so the axis is a number a reader would choose themselves.
  const scale = Math.max(2, Math.ceil(Math.max(...rows.map((r) => Math.abs(r.avg)))));

  return (
    <div>
      <div className="font-display font-bold mb-1" style={{ fontSize: 19, color: C.ink, lineHeight: 1.15 }}>
        {avgDiffPct >= 0 ? "+" : ""}{avgDiffPct.toFixed(1)}%{" "}
        <span className="text-[12.5px] font-medium" style={{ color: C.inkMuted }}>overall vs the market median</span>
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mt-3.5 mb-2.5" style={{ color: C.inkSubtle }}>
        By function
      </div>
      <div className="space-y-[7px]">
        {rows.map((r) => {
          const frac = Math.min(1, Math.abs(r.avg) / scale);
          const below = r.avg < 0;
          return (
            <div key={r.fn} className="flex items-center gap-2">
              <span className="w-[70px] shrink-0 truncate text-[10.5px]" style={{ color: C.inkMuted }}>{r.fn}</span>
              {/* Two half-tracks meeting at the median rule. */}
              <span className="relative flex-1 flex items-center" style={{ height: 6 }}>
                <span className="absolute inset-0 rounded-full" style={{ background: C.borderSubtle }} />
                <span className="absolute" style={{ left: "50%", top: -2, bottom: -2, width: 1, background: "rgba(18,28,43,0.30)" }} />
                <span className="absolute" style={{
                  height: 6, background: below ? CLAY : SLATE,
                  width: `${frac * 50}%`,
                  left: below ? `${50 - frac * 50}%` : "50%",
                  borderRadius: below ? "3px 0 0 3px" : "0 3px 3px 0",
                }} />
              </span>
              <span className="w-[38px] text-right text-[10.5px] tabular-nums font-semibold" style={{ color: C.ink }}>
                {r.avg >= 0 ? "+" : ""}{r.avg.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[9.5px]" style={{ color: C.inkSubtle }}>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-[2px]" style={{ background: CLAY }} /> Below median</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-[2px]" style={{ background: SLATE }} /> Above median</span>
        <span className="ml-auto tabular-nums">±{scale}%</span>
      </div>
    </div>
  );
}

// ── Benefits box: strength by category ────────────────────────────────────────
// Sits under the status mix, which on its own left the box noticeably shorter
// than the other two. Share of each category at or above market, worst last so
// the eye lands on where the work is.
export function BenefitsByCategory() {
  const rows = BENEFIT_CATEGORIES.map((cat) => {
    const inCat = ESTABLISHED_BENEFITS.filter((b) => b.category === cat);
    const good = inCat.filter((b) => b.badge === "above" || b.badge === "at").length;
    return { cat, good, total: inCat.length };
  }).filter((r) => r.total > 0).sort((a, b) => (b.good / b.total) - (a.good / a.total));

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2.5" style={{ color: C.inkSubtle }}>
        By category
      </div>
      <div className="space-y-[7px]">
        {rows.map((r) => {
          const frac = r.good / r.total;
          return (
            <div key={r.cat} className="flex items-center gap-2">
              <span className="w-[92px] shrink-0 truncate text-[10.5px]" style={{ color: C.inkMuted }}>{r.cat}</span>
              <span className="flex-1 h-[5px] rounded-full" style={{ background: C.borderSubtle }}>
                <span className="block h-full" style={{
                  width: `${Math.max(frac * 100, frac > 0 ? 4 : 0)}%`,
                  background: frac === 1 ? GOOD : frac >= 0.5 ? SLATE : CLAY,
                  borderRadius: "0 3px 3px 0",
                }} />
              </span>
              <span className="w-[30px] text-right text-[10.5px] tabular-nums font-semibold" style={{ color: C.ink }}>{r.good}/{r.total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Organisation box: headcount by function ───────────────────────────────────
// The shape of the workforce, rather than just a total. Keeps this box's height
// in step with the other two.
export function OrgFunctionBars({ roster }: { roster: RosterRoleView[] }) {
  const byFn: Record<string, number> = {};
  roster.forEach((r) => {
    const f = r.function || "Other";
    byFn[f] = (byFn[f] || 0) + (r.headcount ?? 1);
  });
  const rows = Object.entries(byFn).sort((a, b) => b[1] - a[1]);
  const shown = rows.slice(0, 5);
  const rest = rows.slice(5).reduce((s, [, v]) => s + v, 0);
  const max = Math.max(1, ...rows.map(([, v]) => v));

  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2.5" style={{ color: C.inkSubtle }}>
        People by function
      </div>
      <div className="space-y-2">
        {shown.map(([fn, v], i) => (
          <div key={fn} className="flex items-center gap-2.5">
            <span className="w-[74px] shrink-0 truncate text-[11px]" style={{ color: C.inkMuted }}>{fn}</span>
            <span className="flex-1 h-[5px] rounded-full" style={{ background: C.borderSubtle }}>
              <span className="block h-full" style={{ width: `${(v / max) * 100}%`, background: i === 0 ? SLATE_DEEP : SLATE, borderRadius: "0 3px 3px 0" }} />
            </span>
            <span className="w-[20px] text-right text-[11px] tabular-nums font-semibold" style={{ color: C.ink }}>{v}</span>
          </div>
        ))}
        {rest > 0 && (
          <div className="text-[10px] pt-0.5" style={{ color: C.inkSubtle }}>
            plus {rest} across {rows.length - 5} other function{rows.length - 5 > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
