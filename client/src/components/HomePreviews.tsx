// Preview graphics for the Home area boxes. Each one is a small fixed-size panel
// that scrolls past inside a ScrollingShowcase, the same pattern the
// zigbert.co.uk marketing site uses on its Pay and Benefits pillar cards.
//
// Everything here reads LIVE data (roster / orgData), so the previews are the
// client's own numbers rather than the marketing site's illustrative ones.
//
// House rules carried over from HomeCharts.tsx: thin marks, 4px rounded data
// ends against a square baseline, 2px surface gaps between touching fills, 2px
// surface rings on overlapping markers, solid hairline grid, direct labels only
// where they earn it, and text in ink tokens — never in the series colour, so
// identity always comes from a mark beside the text. Status colours ship with an
// icon as well, never colour alone.
import type { ReactNode } from "react";
import { Check, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import { C, PAY_TREND, PAY_META, BENEFITS_META } from "@/lib/theme";
import type { RosterRoleView } from "@/lib/roster";
import { BENEFIT_CATEGORIES, ESTABLISHED_BENEFITS } from "@/lib/orgData";

const CLAY = "#C9785A";
const CLAY_DEEP = "#B0603F";
const CLAY_BRIGHT = "#DDA288";
const SLATE = "#7285A5";
const SLATE_DEEP = "#5C6D8A";
const SLATE_TINT = "#D9E0EA";
const GOOD = "#3F7D6A";
const WATCH = "#D18F70";
const BELOW = "#8F4D33";

const gbpK = (n: number) => `£${Math.round(n / 1000)}k`;

// The scale every "where you sit" mark is plotted on. One shared ramp so a
// position in one preview means the same thing as a position in another.
const RANGE_RAMP = `linear-gradient(90deg, ${SLATE_TINT} 0%, ${CLAY_BRIGHT} 42%, ${CLAY} 58%, ${SLATE_DEEP} 100%)`;

// ── shell ────────────────────────────────────────────────────────────────────
// An inset panel rather than a second white card: these sit inside the white
// area box, and card-on-card competes for attention.
export function PreviewCard({
  eyebrow, title, children, footer,
}: { eyebrow: string; title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    // Sized so the strip fills the area box's content height: the grid stretches
    // all three boxes to the tallest, and a short strip left a slab of dead air
    // above the Open link. Width also gives the legends room not to truncate.
    <div
      className="flex flex-col w-[232px] h-[246px] rounded-2xl overflow-hidden"
      style={{ background: C.surface, border: `1px solid ${C.borderSubtle}` }}
    >
      <div className="px-4 pt-3.5 pb-2.5" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.inkSubtle }}>{eyebrow}</div>
        <div className="mt-0.5 text-[12.5px] font-semibold leading-tight truncate" style={{ color: C.ink }}>{title}</div>
      </div>
      <div className="flex-1 px-4 py-3 min-h-0 flex flex-col justify-center">{children}</div>
      {footer && (
        <div className="px-4 py-2 text-[10px]" style={{ borderTop: `1px solid ${C.borderSubtle}`, color: C.inkMuted }}>{footer}</div>
      )}
    </div>
  );
}

// A position marker on the shared LQ→UQ ramp. `pct` is 0-100 along that scale.
function RangeBar({ pct, height = 9 }: { pct: number; height?: number }) {
  const clamped = Math.max(2, Math.min(98, pct));
  return (
    <div className="relative rounded-full" style={{ height, background: RANGE_RAMP }}>
      {/* Median tick sits at the midpoint; the marker gets a surface ring so it
          stays legible wherever it lands on the ramp. */}
      <span className="absolute top-[-2px] bottom-[-2px] w-px" style={{ left: "50%", background: "rgba(18,28,43,0.28)" }} />
      <span
        className="absolute rounded-full"
        style={{
          left: `${clamped}%`, top: -3, height: height + 6, width: 4,
          transform: "translateX(-50%)", background: C.ink,
          boxShadow: `0 0 0 2px ${C.surface}`,
        }}
      />
    </div>
  );
}

function ScaleLabels({ lq, mid, uq }: { lq: string; mid: string; uq: string }) {
  return (
    <div className="flex justify-between mt-1.5 text-[9px] font-medium tabular-nums" style={{ color: C.inkSubtle }}>
      <span>{lq}</span><span>{mid}</span><span>{uq}</span>
    </div>
  );
}

// ── PAY previews ─────────────────────────────────────────────────────────────

// Overall pay position on the market range. The single most summary-level pay
// fact, and the one the Pay dashboard leads with.
export function PayPositionPreview({ avgDiffPct }: { avgDiffPct: number }) {
  // Map "% vs median" onto the LQ→UQ scale, where the median is the midpoint.
  // A typical quartile spread is about 20% of the median either side, so ±20%
  // covers the full width; clamp beyond that.
  const pct = 50 + Math.max(-48, Math.min(48, (avgDiffPct / 20) * 50));
  const above = avgDiffPct >= 0;
  return (
    <PreviewCard eyebrow="Your position" title="Overall pay vs the market" footer={`Market median ${PAY_META.medianPay}`}>
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="font-display font-bold tabular-nums" style={{ fontSize: 22, color: above ? GOOD : BELOW, lineHeight: 1 }}>
          {above ? "+" : ""}{avgDiffPct.toFixed(1)}%
        </span>
        <span className="text-[10px] font-medium" style={{ color: C.inkMuted }}>vs median</span>
      </div>
      <RangeBar pct={pct} />
      <ScaleLabels lq={PAY_META.lowerQuartile} mid="Median" uq={PAY_META.upperQuartile} />
    </PreviewCard>
  );
}

// The roles with the largest cash gap to the median — what a pay review would
// actually be spent on. Horizontal bars, longest first.
export function PayGapsPreview({ roster }: { roster: RosterRoleView[] }) {
  const gaps = roster
    .map((r) => ({ role: r.role, gap: r.median - r.currentSalary }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4);
  const max = Math.max(1, ...gaps.map((g) => g.gap));
  const total = roster.reduce((s, r) => s + Math.max(0, r.median - r.currentSalary), 0);

  return (
    <PreviewCard eyebrow="Biggest gaps" title="Furthest below the median" footer={`${gbpK(total)} to reach median across all roles`}>
      {gaps.length === 0 ? (
        <div className="text-[11px]" style={{ color: C.inkMuted }}>Every role is at or above the market median.</div>
      ) : (
        <div className="space-y-[7px]">
          {gaps.map((g) => (
            <div key={g.role}>
              <div className="flex items-baseline justify-between text-[10px] mb-[3px]">
                <span className="truncate pr-2" style={{ color: C.inkMuted }}>{g.role}</span>
                <span className="tabular-nums font-semibold shrink-0" style={{ color: C.ink }}>{gbpK(g.gap)}</span>
              </div>
              <div className="h-[5px] rounded-full" style={{ background: C.borderSubtle }}>
                <div className="h-full" style={{ width: `${(g.gap / max) * 100}%`, background: CLAY, borderRadius: "0 3px 3px 0" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </PreviewCard>
  );
}

// Pay-rise trend, you vs the market. A compact area/line read, sparkline scale.
export function PayRisesPreview() {
  const data = PAY_TREND;
  const W = 218, H = 66, padT = 6, padB = 14;
  const vals = data.flatMap((d) => [d.you, d.market]);
  const lo = Math.min(...vals) - 0.4, hi = Math.max(...vals) + 0.4;
  const xs = (i: number) => (i * W) / (data.length - 1);
  const ys = (v: number) => padT + ((hi - v) / (hi - lo)) * (H - padT - padB);
  const line = (k: "you" | "market") => data.map((d, i) => `${xs(i)},${ys(d[k])}`).join(" ");
  const last = data[data.length - 1];

  return (
    <PreviewCard eyebrow="Pay rises" title="You vs the market, by year" footer={`Latest: you ${last.you}% · market ${last.market}%`}>
      <div className="flex items-center gap-3 mb-1 text-[9.5px]" style={{ color: C.inkMuted }}>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-[2px] rounded" style={{ background: CLAY }} /> You</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-0 border-t-2 border-dashed" style={{ borderColor: SLATE_DEEP }} /> Market</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
        aria-label={`Average pay rise by year. ${data.map((d) => `${d.year}: you ${d.you}%, market ${d.market}%`).join(". ")}`}>
        <line x1={0} y1={ys(lo)} x2={W} y2={ys(lo)} stroke={C.borderSubtle} strokeWidth={1} />
        <polyline points={line("market")} fill="none" stroke={SLATE_DEEP} strokeWidth={2} strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={line("you")} fill="none" stroke={CLAY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs(data.length - 1)} cy={ys(last.market)} r={3.5} fill={SLATE_DEEP} stroke={C.surface} strokeWidth={2} />
        <circle cx={xs(data.length - 1)} cy={ys(last.you)} r={3.5} fill={CLAY} stroke={C.surface} strokeWidth={2} />
        {data.map((d, i) => (
          <text key={d.year} x={xs(i)} y={H - 3} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            fontSize={8.5} fill={C.inkSubtle} style={{ fontVariantNumeric: "tabular-nums" }}>{d.year}</text>
        ))}
      </svg>
    </PreviewCard>
  );
}

// Headcount by function — where the pay bill actually sits.
export function PayShapePreview({ roster }: { roster: RosterRoleView[] }) {
  const byFn: Record<string, { heads: number; bill: number }> = {};
  roster.forEach((r) => {
    const f = r.function || "Other";
    byFn[f] = byFn[f] || { heads: 0, bill: 0 };
    byFn[f].heads += 1;
    byFn[f].bill += r.currentSalary;
  });
  const rows = Object.entries(byFn).sort((a, b) => b[1].bill - a[1].bill).slice(0, 5);
  const max = Math.max(1, ...rows.map(([, v]) => v.bill));

  return (
    <PreviewCard eyebrow="Where pay sits" title="Salary bill by function" footer={`${rows.length} of ${Object.keys(byFn).length} functions shown`}>
      <div className="space-y-[6px]">
        {rows.map(([fn, v], i) => (
          <div key={fn} className="flex items-center gap-2">
            <span className="w-[62px] shrink-0 truncate text-[10px]" style={{ color: C.inkMuted }}>{fn}</span>
            <span className="flex-1 h-[5px] rounded-full" style={{ background: C.borderSubtle }}>
              <span className="block h-full" style={{ width: `${(v.bill / max) * 100}%`, background: i === 0 ? CLAY : SLATE, borderRadius: "0 3px 3px 0" }} />
            </span>
            <span className="w-[30px] text-right text-[10px] tabular-nums font-semibold" style={{ color: C.ink }}>{gbpK(v.bill)}</span>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

// ── ORGANISATION ─────────────────────────────────────────────────────────────

// Headcount by function, for the Organisation box. Not a scrolling preview —
// Organisation is a static box — but it keeps that box's height in step with the
// two that now carry a marquee, and it makes the shape of the workforce readable
// rather than just stating a total.
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
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: C.inkSubtle }}>People by function</div>
      <div className="space-y-[6px]">
        {shown.map(([fn, v], i) => (
          <div key={fn} className="flex items-center gap-2">
            <span className="w-[70px] shrink-0 truncate text-[10px]" style={{ color: C.inkMuted }}>{fn}</span>
            <span className="flex-1 h-[5px] rounded-full" style={{ background: C.borderSubtle }}>
              <span className="block h-full" style={{ width: `${(v / max) * 100}%`, background: i === 0 ? SLATE_DEEP : SLATE, borderRadius: "0 3px 3px 0" }} />
            </span>
            <span className="w-[20px] text-right text-[10px] tabular-nums font-semibold" style={{ color: C.ink }}>{v}</span>
          </div>
        ))}
        {rest > 0 && (
          <div className="text-[9.5px] pt-0.5" style={{ color: C.inkSubtle }}>
            plus {rest} across {rows.length - 5} other function{rows.length - 5 > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ── BENEFITS previews ────────────────────────────────────────────────────────

// Coverage as a donut. One figure, and the arc makes the proportion readable
// without doing arithmetic on the legend.
export function BenefitsCoveragePreview({ atOrAbove, total }: { atOrAbove: number; total: number }) {
  const r = 34, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  const frac = total ? atOrAbove / total : 0;
  return (
    <PreviewCard eyebrow="Coverage" title="Benefits at or above market" footer={`${total} benefits across ${BENEFIT_CATEGORIES.length} categories`}>
      <div className="flex items-center gap-3.5">
        <svg viewBox="0 0 88 88" className="w-[76px] h-[76px] shrink-0 -rotate-90" role="img"
          aria-label={`${atOrAbove} of ${total} benefits at or above market`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.borderSubtle} strokeWidth={9} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={GOOD} strokeWidth={9} strokeLinecap="round"
            strokeDasharray={`${frac * circ} ${circ}`} />
          <g transform="rotate(90 44 44)">
            <text x={44} y={42} textAnchor="middle" fontSize={19} fontWeight={700} fontFamily="var(--font-display)" fill={C.ink}>{atOrAbove}</text>
            <text x={44} y={55} textAnchor="middle" fontSize={9} fill={C.inkMuted}>of {total}</text>
          </g>
        </svg>
        <div className="min-w-0 text-[10.5px] leading-snug" style={{ color: C.inkMuted }}>
          <span className="font-semibold" style={{ color: C.ink }}>{Math.round(frac * 100)}%</span> of your
          benefits match or beat typical market practice.
        </div>
      </div>
    </PreviewCard>
  );
}

// Strength by category — where the offer is strong and where it thins out.
export function BenefitsCategoryPreview() {
  const rows = BENEFIT_CATEGORIES.map((cat) => {
    const inCat = ESTABLISHED_BENEFITS.filter((b) => b.category === cat);
    const good = inCat.filter((b) => b.badge === "above" || b.badge === "at").length;
    return { cat, good, total: inCat.length };
  }).filter((r) => r.total > 0).sort((a, b) => (b.good / b.total) - (a.good / a.total));

  return (
    <PreviewCard eyebrow="By category" title="Strength across your offer" footer="Share of each category at or above market">
      <div className="space-y-[5px]">
        {rows.slice(0, 5).map((r) => {
          const frac = r.good / r.total;
          return (
            <div key={r.cat} className="flex items-center gap-2">
              <span className="w-[72px] shrink-0 truncate text-[9.5px]" style={{ color: C.inkMuted }}>{r.cat}</span>
              <span className="flex-1 h-[5px] rounded-full" style={{ background: C.borderSubtle }}>
                <span className="block h-full" style={{ width: `${frac * 100}%`, background: frac === 1 ? GOOD : frac >= 0.5 ? SLATE : WATCH, borderRadius: "0 3px 3px 0" }} />
              </span>
              <span className="w-[26px] text-right text-[9.5px] tabular-nums font-semibold" style={{ color: C.ink }}>{r.good}/{r.total}</span>
            </div>
          );
        })}
      </div>
    </PreviewCard>
  );
}

// The specific things to act on. Status, so every row carries an icon.
export function BenefitsActionPreview() {
  const gaps = ESTABLISHED_BENEFITS.filter((b) => b.badge === "below");
  const watch = ESTABLISHED_BENEFITS.filter((b) => b.badge === "watch");
  const rows = [
    ...gaps.map((b) => ({ ...b, Icon: AlertCircle, fg: BELOW, note: "Below market" })),
    ...watch.map((b) => ({ ...b, Icon: AlertTriangle, fg: WATCH, note: "Mixed vs market" })),
  ].slice(0, 3);

  return (
    <PreviewCard eyebrow="To act on" title="Your benefit gaps" footer={`${gaps.length} below market · ${watch.length} to watch`}>
      {rows.length === 0 ? (
        <div className="text-[11px]" style={{ color: C.inkMuted }}>No gaps. Every benefit is at or above market.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((b) => (
            <div key={b.name} className="flex items-start gap-2">
              <b.Icon className="w-3 h-3 shrink-0 mt-[1px]" style={{ color: b.fg }} aria-hidden />
              <div className="min-w-0">
                <div className="text-[10.5px] font-semibold truncate" style={{ color: C.ink }}>{b.name}</div>
                <div className="text-[9.5px] truncate" style={{ color: C.inkMuted }}>{b.note} · {b.category}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PreviewCard>
  );
}

// The strongest benefits — the recruitment story, not just the gaps.
export function BenefitsStrengthsPreview() {
  const strong = ESTABLISHED_BENEFITS.filter((b) => b.badge === "above").slice(0, 4);
  return (
    <PreviewCard eyebrow="Your strengths" title="Clearly above market" footer={`${ESTABLISHED_BENEFITS.filter((b) => b.badge === "above").length} benefits beat the market`}>
      <div className="space-y-[7px]">
        {strong.map((b) => (
          <div key={b.name} className="flex items-start gap-2">
            <Check className="w-3 h-3 shrink-0 mt-[1px]" style={{ color: GOOD }} aria-hidden />
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold truncate" style={{ color: C.ink }}>{b.name}</div>
              <div className="text-[9.5px] truncate" style={{ color: C.inkMuted }}>{b.provision}</div>
            </div>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

// ── SNAPSHOT graphic ─────────────────────────────────────────────────────────

// Pay AND benefits on one shared market range. This replaced the pay-rise line
// chart in the Snapshot panel: a trend over time is a Pay-area fact and now
// scrolls inside the Pay box, whereas the summary question a snapshot should
// answer is "where do we sit, on both products, right now". Nothing else on the
// page puts the two side by side on the same scale.
export function RewardPositionSummary({
  avgDiffPct, atOrAbove, benefitsTotal,
}: { avgDiffPct: number; atOrAbove: number; benefitsTotal: number }) {
  // Both rows plot the BENCHMARKED position band from the report metadata, which
  // is the same LQ→UQ scale for each. An earlier version placed benefits by its
  // share at-or-above market (12/14 → 86%) on a quartile axis, which is a
  // different quantity wearing a quartile label — 86% of benefits being fine is
  // not "86% of the way from LQ to UQ". The share is stated as text instead.
  const rows = [
    { label: "Pay", from: PAY_META.positionFrom, to: PAY_META.positionTo, band: PAY_META.positionLabel,
      value: `${avgDiffPct >= 0 ? "+" : ""}${avgDiffPct.toFixed(1)}%`,
      note: avgDiffPct >= 0 ? "vs median" : "vs median", tone: avgDiffPct >= 0 ? GOOD : BELOW },
    { label: "Benefits", from: BENEFITS_META.positionFrom, to: BENEFITS_META.positionTo, band: BENEFITS_META.positionLabel,
      value: `${atOrAbove}/${benefitsTotal}`, note: "at or above", tone: GOOD },
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] mb-3.5" style={{ color: C.inkSubtle }}>
        <TrendingUp className="w-3 h-3" aria-hidden /> Where you sit vs the market
      </div>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[11.5px] font-semibold" style={{ color: C.ink }}>{r.label}</span>
              <span className="text-[11px]">
                <span className="font-semibold tabular-nums" style={{ color: r.tone }}>{r.value}</span>
                <span style={{ color: C.inkMuted }}> {r.note}</span>
              </span>
            </div>
            <BandBar from={r.from} to={r.to} />
            <div className="flex justify-between mt-1 text-[9px] font-medium" style={{ color: C.inkSubtle }}>
              <span>LQ</span>
              <span style={{ color: C.inkMuted, fontWeight: 600 }}>{r.band}</span>
              <span>UQ</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// A shaded band across the part of the LQ→UQ range the position sits in, on a
// recessive track. A band, not a point, because the report states a range.
function BandBar({ from, to }: { from: number; to: number }) {
  const left = Math.max(0, Math.min(100, from));
  const width = Math.max(4, Math.min(100 - left, to - from));
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: C.borderSubtle }}>
      <div className="absolute inset-y-0 rounded-full" style={{ left: `${left}%`, width: `${width}%`, background: RANGE_RAMP }} />
      {/* median rule sits on top of the band so the midpoint stays readable */}
      <span className="absolute inset-y-0 w-px" style={{ left: "50%", background: "rgba(18,28,43,0.30)" }} />
    </div>
  );
}
