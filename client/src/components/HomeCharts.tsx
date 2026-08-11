// Home dashboard charts. Hand-rolled SVG/flex so there's no chart-lib weight and
// full control of the aesthetic.
//
// Colour is assigned by the JOB it does, and every palette below was validated
// rather than eyeballed (OKLab ΔE under protanopia/deuteranopia, lightness band,
// contrast vs the white card surface):
//
//   1. Roles vs market  → DIVERGING about the market median. Two hues that read as
//      opposite (warm clay below, cool slate above), two equal steps per arm, and
//      no hue at the midpoint — the midpoint is the centre rule, not a band.
//      Worst adjacent pair: CVD ΔE 11.3, normal-vision 15.5, all steps ≥ 3:1.
//   2. Pay rises        → 2 series. You in the clay accent, the market in a calm
//      slate as context. CVD ΔE 12.6, normal-vision 19.5, contrast 5.24:1.
//   3. Benefits mix     → STATUS (good / watch / below). Reserved meaning, so it
//      always ships icon + label and never colour alone. CVD ΔE 11.3,
//      normal-vision 21.5. The watch step sits at 2.67:1, below the 3:1 mark
//      floor, so the legend's visible counts are the required relief channel.
//
// House rules applied throughout: thin marks, 4px rounded data-end and a square
// baseline, 2px surface gaps between touching fills, 2px surface rings on markers,
// solid hairline grid, a legend whenever there are two or more series, direct
// labels only where they earn it, and text in ink tokens — never in the series
// colour, so identity always comes from a mark beside the text.
import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { C, PAY_TREND } from "@/lib/theme";

const SURFACE = C.surface;        // the colour the 2px gaps and rings are painted in
const GRID = C.borderSubtle;      // hairline, one step off the surface
const BAR_H = 18;                 // well under the 24px cap; the leftover is air
const GAP = 2;                    // one consistent surface gap across a stack

// ── 1. Roles vs market — diverging arms about the median ─────────────────────
const MARKET_BANDS = [
  { key: "below", short: "Below LQ", label: "Below the lower quartile", color: "#8F4D33" },
  { key: "lower", short: "LQ to median", label: "Lower quartile to median", color: "#C9785A" },
  { key: "upper", short: "Median to UQ", label: "Median to upper quartile", color: "#7285A5" },
  { key: "above", short: "Above UQ", label: "Above the upper quartile", color: "#4B5870" },
] as const;

// ── 3. Benefits mix — status, so each row carries an icon as well as a colour ──
const BENEFIT_STATUS = [
  { key: "atOrAbove", label: "At or above market", color: "#3F7D6A", Icon: Check },
  { key: "watch", label: "Mixed vs market", color: "#D18F70", Icon: AlertTriangle },
  { key: "below", label: "Below market", color: "#8F4D33", Icon: AlertCircle },
] as const;

// ── shared shell ─────────────────────────────────────────────────────────────
function CardShell({ title, action, onOpen, children, className = "" }: { title: string; action?: string; onOpen?: () => void; children: React.ReactNode; className?: string }) {
  const Tag = onOpen ? "button" : "div";
  return (
    <Tag onClick={onOpen} className={`ts-premium-card ${onOpen ? "ts-nudge" : ""} relative p-5 text-left flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.inkMuted }}>{title}</span>
        {action && <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: C.brass }}>{action} <ArrowRight className="ts-arrow w-3 h-3" /></span>}
      </div>
      {children}
    </Tag>
  );
}

// A stat-tile style headline: the number leads, the qualifier follows in muted ink.
function Headline({ value, children }: { value: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 font-display font-bold" style={{ fontSize: 19, color: C.ink, lineHeight: 1.15 }}>
      {value} <span className="text-[12.5px] font-medium" style={{ color: C.inkMuted }}>{children}</span>
    </div>
  );
}

// Floating readout. Values lead, labels follow, series keyed by a short stroke.
// `x` is the hovered position as a percentage of the plot width. Two placements,
// because the two chart types have different things worth not covering:
//
//   "segment" — above the hovered mark. Centred on it, EXCEPT within 22% of either
//      end, where it anchors flush to that edge instead. Centring a readout on the
//      last segment of a stacked bar pushes half of it outside the card, where it
//      gets clipped: the card is the frame, so the tooltip has to respect it.
//   "plot" — pinned to the top of the plot area and thrown to the side OPPOSITE
//      the crosshair. Floating it above the plot instead would land it on the
//      legend, and the legend is what tells the reader which row is which — the
//      tooltip must never obscure the key needed to read the tooltip.
function Readout({ x, rows, place = "segment" }: { x: number; rows: { color: string; label: string; value: string }[]; place?: "segment" | "plot" }) {
  const pos: React.CSSProperties =
    place === "plot"
      ? { top: 0, ...(x < 50 ? { right: 0 } : { left: 0 }) }
      : {
          bottom: "100%", marginBottom: 6,
          ...(x <= 22 ? { left: 0 } : x >= 78 ? { right: 0 } : { left: `${x}%`, transform: "translateX(-50%)" }),
        };
  return (
    <div
      className="pointer-events-none absolute z-20 rounded-lg px-2.5 py-1.5"
      style={{
        ...pos,
        background: SURFACE, border: `1px solid ${C.border}`,
        boxShadow: "0 8px 22px -10px rgba(18,28,43,0.35)", whiteSpace: "nowrap",
      }}
    >
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 text-[11.5px] leading-[1.5]">
          <span className="inline-block h-[2px] w-3 rounded-full shrink-0" style={{ background: r.color }} />
          <span className="font-semibold tabular-nums" style={{ color: C.ink }}>{r.value}</span>
          <span style={{ color: C.inkMuted }}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

// Part-to-whole stacked bar. Zero-value segments are dropped entirely so they
// can't leave a stray surface gap behind, and no label is drawn inside a segment
// (at 14px tall nothing fits without clipping) — the legend carries every value,
// which is also the relief channel for the sub-3:1 status step.
function StackBar({
  segments, ariaLabel, hovered, onHover,
}: {
  segments: { key: string; label: string; value: number; color: string }[];
  ariaLabel: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  const shown = segments.filter((s) => s.value > 0);
  const total = shown.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className="relative">
      <div className="flex w-full" style={{ height: BAR_H, gap: GAP }} role="img" aria-label={ariaLabel}>
        {shown.map((s, i) => {
          const isLast = i === shown.length - 1;
          return (
            <div
              key={s.key}
              onMouseEnter={() => onHover(s.key)}
              onMouseLeave={() => onHover(null)}
              style={{
                flexGrow: s.value, flexBasis: 0, minWidth: 4, background: s.color,
                // square at the baseline (left), 4px rounded at the data end (right)
                borderRadius: isLast ? "0 4px 4px 0" : 0,
                filter: hovered === s.key ? "brightness(1.08)" : undefined,
                transition: "filter .15s ease",
              }}
            />
          );
        })}
      </div>
      {hovered && (() => {
        const seg = shown.find((s) => s.key === hovered);
        if (!seg) return null;
        // centre the readout over the hovered segment
        const before = shown.slice(0, shown.findIndex((s) => s.key === hovered)).reduce((s, x) => s + x.value, 0);
        const mid = ((before + seg.value / 2) / total) * 100;
        return <Readout x={mid} rows={[{ color: seg.color, label: seg.label, value: String(seg.value) }]} />;
      })()}
    </div>
  );
}

// ── 1. Role distribution ─────────────────────────────────────────────────────
export function RoleDistribution({ bands, total, belowMarket, onOpen }: { bands: Record<string, number>; total: number; belowMarket: number; onOpen: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const segments = MARKET_BANDS.map((b) => ({ key: b.key, label: b.label, value: bands[b.key] ?? 0, color: b.color }));
  const below = (bands.below ?? 0) + (bands.lower ?? 0);
  const above = (bands.upper ?? 0) + (bands.above ?? 0);

  return (
    <CardShell title="Roles vs market" action="Explore" onOpen={onOpen} className="w-full lg:w-[340px] shrink-0">
      {/* These cards sit in a row with the taller trend chart, so distribute the
          three blocks down the card rather than leaving a slab of air beneath. */}
      <div className="flex-1 flex flex-col justify-between">
      <Headline value={belowMarket}>of {total} roles below market</Headline>

      <StackBar
        segments={segments}
        ariaLabel={`Distribution of ${total} roles across the market range: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`}
        hovered={hovered}
        onHover={setHovered}
      />

      {/* Which side of the median each arm sits on — the diverging axis, in words. */}
      <div className="flex items-center justify-between mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.inkSubtle }}>
        <span>{below} below median</span>
        <span>{above} at or above</span>
      </div>

      {/* Legend: the dependable identity channel, and where every value is readable. */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3.5">
        {MARKET_BANDS.map((b) => (
          <div
            key={b.key}
            onMouseEnter={() => setHovered(b.key)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: C.inkMuted, opacity: hovered && hovered !== b.key ? 0.55 : 1, transition: "opacity .15s ease" }}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: b.color }} />
            <span className="flex-1 truncate">{b.short}</span>
            <span className="tabular-nums font-semibold" style={{ color: C.ink }}>{bands[b.key] ?? 0}</span>
          </div>
        ))}
      </div>
      </div>
    </CardShell>
  );
}

// ── 2. Pay-rise trend, you vs the market ─────────────────────────────────────
const YOU = "#C9785A";      // clay accent — the subject of the chart
const MARKET = "#5C6D8A";   // calm slate — the benchmark it's read against

function niceTicks(lo: number, hi: number) {
  const from = Math.floor(lo), to = Math.ceil(hi);
  const out: number[] = [];
  for (let v = from; v <= to; v += 1) out.push(v);
  return out;
}

export function PayTrend() {
  const data = useMemo(() => PAY_TREND.map((d) => ({ ...d })), []);
  const [idx, setIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 340, H = 150;
  const padL = 26, padR = 34, padT = 12, padB = 26;   // padB includes the x-axis band
  const vals = data.flatMap((d) => [d.you, d.market]);
  const ticks = niceTicks(Math.min(...vals) - 0.35, Math.max(...vals) + 0.35);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const xs = (i: number) => padL + (i * (W - padL - padR)) / (data.length - 1);
  const ys = (v: number) => padT + ((hi - v) / (hi - lo)) * (H - padT - padB);
  const path = (key: "you" | "market") => data.map((d, i) => `${xs(i)},${ys(d[key])}`).join(" ");
  const last = data[data.length - 1];

  // The crosshair finds the X: the reader aims at a year, never at a 2px line.
  function pick(clientX: number) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((clientX - box.left) / box.width) * W;
    let best = 0, bestD = Infinity;
    data.forEach((_, i) => { const d = Math.abs(xs(i) - px); if (d < bestD) { bestD = d; best = i; } });
    setIdx(best);
  }

  const active = idx == null ? null : data[idx];

  return (
    <CardShell title="Pay rises: you vs the market" className="flex-1">
      {/* Two series, so a legend is always present. Lines keyed with a stroke. */}
      <div className="flex items-center gap-4 mb-1 text-[11.5px]" style={{ color: C.inkMuted }}>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3.5 h-[2px] rounded" style={{ background: YOU }} /> You</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3.5 h-0 border-t-2 border-dashed" style={{ borderColor: MARKET }} /> Market</span>
      </div>

      <div className="relative">
        {active && (
          <Readout
            x={(xs(idx!) / W) * 100}
            place="plot"
            rows={[
              { color: YOU, label: `You · ${active.year}`, value: `${active.you}%` },
              { color: MARKET, label: `Market · ${active.year}`, value: `${active.market}%` },
            ]}
          />
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto outline-none"
          role="img"
          tabIndex={0}
          aria-label={`Average pay rise, your organisation versus the market. ${data.map((d) => `${d.year}: you ${d.you}%, market ${d.market}%`).join(". ")}`}
          onMouseMove={(e) => pick(e.clientX)}
          onMouseLeave={() => setIdx(null)}
          onFocus={() => setIdx(data.length - 1)}
          onBlur={() => setIdx(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); setIdx((i) => Math.min((i ?? 0) + 1, data.length - 1)); }
            if (e.key === "ArrowLeft") { e.preventDefault(); setIdx((i) => Math.max((i ?? data.length - 1) - 1, 0)); }
          }}
        >
          {/* Solid hairline grid + y ticks, so the values I don't label directly are still readable. */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} y1={ys(t)} x2={W - padR} y2={ys(t)} stroke={GRID} strokeWidth={1} />
              <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize={9} fill={C.inkSubtle} style={{ fontVariantNumeric: "tabular-nums" }}>{t}%</text>
            </g>
          ))}

          {/* crosshair behind the marks */}
          {idx != null && <line x1={xs(idx)} y1={padT} x2={xs(idx)} y2={H - padB} stroke={C.border} strokeWidth={1} />}

          <polyline points={path("market")} fill="none" stroke={MARKET} strokeWidth={2} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={path("you")} fill="none" stroke={YOU} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {/* Endpoint markers, ≥8px with a 2px surface ring so they read where lines cross. */}
          <circle cx={xs(data.length - 1)} cy={ys(last.market)} r={4} fill={MARKET} stroke={SURFACE} strokeWidth={2} />
          <circle cx={xs(data.length - 1)} cy={ys(last.you)} r={4} fill={YOU} stroke={SURFACE} strokeWidth={2} />

          {/* the hovered position gets markers on both series */}
          {idx != null && idx !== data.length - 1 && (
            <>
              <circle cx={xs(idx)} cy={ys(data[idx].market)} r={4} fill={MARKET} stroke={SURFACE} strokeWidth={2} />
              <circle cx={xs(idx)} cy={ys(data[idx].you)} r={4} fill={YOU} stroke={SURFACE} strokeWidth={2} />
            </>
          )}

          {/* Direct-label the endpoints only, in ink — the dot beside each carries identity.
              The two series converge here, so when the labels would collide they get
              pushed to a minimum separation and a leader line keeps each tied to its
              own line-end rather than floating free. */}
          {(() => {
            const xEnd = xs(data.length - 1);
            const yY = ys(last.you), yM = ys(last.market);
            const MIN = 13;
            let lyY = yY, lyM = yM;
            if (Math.abs(yY - yM) < MIN) {
              const mid = (yY + yM) / 2;
              const youOnTop = yY <= yM;
              lyY = youOnTop ? mid - MIN / 2 : mid + MIN / 2;
              lyM = youOnTop ? mid + MIN / 2 : mid - MIN / 2;
            }
            const nudged = lyY !== yY || lyM !== yM;
            return (
              <>
                {nudged && (
                  <>
                    <line x1={xEnd + 4} y1={yY} x2={xEnd + 7} y2={lyY} stroke={YOU} strokeWidth={1} />
                    <line x1={xEnd + 4} y1={yM} x2={xEnd + 7} y2={lyM} stroke={MARKET} strokeWidth={1} />
                  </>
                )}
                <text x={xEnd + 9} y={lyY + 3.5} fontSize={10.5} fontWeight={700} fill={C.ink} style={{ fontVariantNumeric: "tabular-nums" }}>{last.you}%</text>
                <text x={xEnd + 9} y={lyM + 3.5} fontSize={10} fontWeight={600} fill={C.inkMuted} style={{ fontVariantNumeric: "tabular-nums" }}>{last.market}%</text>
              </>
            );
          })()}

          {data.map((d, i) => (
            <text key={d.year} x={xs(i)} y={H - 8} textAnchor="middle" fontSize={9.5} fill={C.inkSubtle} style={{ fontVariantNumeric: "tabular-nums" }}>{d.year}</text>
          ))}
        </svg>
      </div>
    </CardShell>
  );
}

// ── 3. Benefits mix ──────────────────────────────────────────────────────────
export function BenefitsMix({ atOrAbove, watch, below, total, onOpen }: { atOrAbove: number; watch: number; below: number; total: number; onOpen: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const counts: Record<string, number> = { atOrAbove, watch, below };
  const segments = BENEFIT_STATUS.map((s) => ({ key: s.key, label: s.label, value: counts[s.key] ?? 0, color: s.color }));

  return (
    <CardShell title="Benefits mix" action="Review" onOpen={onOpen} className="w-full lg:w-[300px] shrink-0">
      <div className="flex-1 flex flex-col justify-between">
      <Headline value={atOrAbove}>of {total} at or above market</Headline>

      <StackBar
        segments={segments}
        ariaLabel={`${total} benefits benchmarked: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`}
        hovered={hovered}
        onHover={setHovered}
      />

      {/* Status never travels on colour alone: every row is icon + label + count. */}
      <div className="space-y-1.5 mt-3.5">
        {BENEFIT_STATUS.map((s) => (
          <div
            key={s.key}
            onMouseEnter={() => setHovered(s.key)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5 text-[11.5px]"
            style={{ color: C.inkMuted, opacity: hovered && hovered !== s.key ? 0.55 : 1, transition: "opacity .15s ease" }}
          >
            <s.Icon className="w-3 h-3 shrink-0" style={{ color: s.color }} aria-hidden />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="tabular-nums font-semibold" style={{ color: C.ink }}>{counts[s.key] ?? 0}</span>
          </div>
        ))}
      </div>
      </div>
    </CardShell>
  );
}
