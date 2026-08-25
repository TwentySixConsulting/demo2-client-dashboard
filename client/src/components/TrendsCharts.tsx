// Charts for the Trends & Hotspots page. Hand-rolled SVG in the same idiom as
// HomeCharts.tsx, and importing its `Readout` and `niceTicks` rather than
// re-deriving them.
//
// Why not recharts, which is already a dependency: HomeCharts established a house
// style (thin marks, 4px rounded data-ends over a square baseline, 2px surface
// gaps and marker rings, solid hairline grid, a legend whenever there are two or
// more series, and text never painted in a series colour). recharts' defaults
// contradict every one of those, so a recharts chart here would visibly not match
// the charts on Home. Coherence, not bundle size, is the argument.
//
// Every palette below was validated rather than eyeballed, against the white card
// surface, under protanopia and deuteranopia:
//
//   Two-series comparison   #C9785A / #5C6D8A  — CVD dE 12.6, normal 19.5, contrast pass
//   Diverging about a rule  #8F4D33 #C9785A | #7285A5 #4B5870 — CVD dE 11.3, normal 15.5
//   Prevalence ORDINAL ramp #A7B3C8 #8D9BB5 #7285A5 #5C6D8A #44536B — monotone lightness,
//                           every step dL >= 0.06, hue spread 3 degrees
//
// The prevalence ramp replaces the source page's purple/amber/cyan/slate/green
// chips. Five unrelated hues for a five-step ORDERED scale destroys the ordering
// the scale exists to convey; an ordinal quantity needs one hue and monotone
// lightness. Slate's chroma sits under the validator's floor at every step, which
// is the deviation HomeCharts already documents and discharges the same way: the
// scale strip is always visible and every mark is directly labelled.
import { useRef, useState } from "react";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { C } from "@/lib/theme";
import { Readout, niceTicks } from "@/components/HomeCharts";
import {
  BENEFIT_SEGMENTS,
  CLIENT_SEGMENT,
  REFERENCE_SEGMENT,
  PREVALENCE_SCALE,
  rangeText,
  type Point,
  type PayRiseRow,
  type PrevalenceRow,
  type Prevalence,
  type RolePressure,
  type WageFloor,
} from "@/lib/trendsData";

const SURFACE = C.surface;
const GRID = C.borderSubtle;

const SUBJECT = "#C9785A"; // clay — the thing being measured
const CONTEXT = "#5C6D8A"; // calm slate — what it is measured against
const HEATING = "#B0603F"; // clay-deep — above the reference rule
const COOLING = "#7285A5"; // slate — below it

export const PREVALENCE_RAMP: Record<Prevalence, string> = {
  Rare: "#A7B3C8",
  Emerging: "#8D9BB5",
  Growing: "#7285A5",
  Moderate: "#5C6D8A",
  Common: "#44536B",
};

// ── shared bits ──────────────────────────────────────────────────────────────

function ChartTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-2.5">
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: C.inkSubtle }}
      >
        {children}
      </div>
      {sub && (
        <div className="text-[11.5px] mt-1" style={{ color: C.inkMuted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]" style={{ color: C.inkMuted }}>
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {i.dashed ? (
            <span className="inline-block w-3.5 h-0 border-t-2 border-dashed" style={{ borderColor: i.color }} />
          ) : (
            <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: i.color }} />
          )}
          {i.label}
        </span>
      ))}
    </div>
  );
}

// ── 1. CPI, against the Bank of England target ───────────────────────────────
// Question: how far is inflation from target, and which way is it moving?
export function CpiTrend({ series, target }: { series: readonly Point[]; target: number }) {
  const [idx, setIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 420, H = 168;
  const padL = 28, padR = 40, padT = 12, padB = 26;
  const ticks = niceTicks(Math.min(target, ...series.map((d) => d.value)) - 0.4, Math.max(...series.map((d) => d.value)) + 0.4);
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const xs = (i: number) => padL + (i * (W - padL - padR)) / (series.length - 1);
  const ys = (v: number) => padT + ((hi - v) / (hi - lo)) * (H - padT - padB);
  const end = series[series.length - 1];

  const line = series.map((d, i) => `${xs(i)},${ys(d.value)}`).join(" ");
  // Closed under the line for the area fill, back along the baseline.
  const area = `${line} ${xs(series.length - 1)},${ys(lo)} ${xs(0)},${ys(lo)}`;

  function pick(clientX: number) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((clientX - box.left) / box.width) * W;
    let best = 0, bestD = Infinity;
    series.forEach((_, i) => {
      const d = Math.abs(xs(i) - px);
      if (d < bestD) { bestD = d; best = i; }
    });
    setIdx(best);
  }

  return (
    <div className="w-full">
      <ChartTitle>CPI inflation, 12-month rate</ChartTitle>
      <Legend items={[{ color: CONTEXT, label: "CPI" }, { color: C.inkSubtle, label: `Bank of England target ${target}%`, dashed: true }]} />
      <div className="relative mt-1">
        {idx != null && (
          <Readout
            x={(xs(idx) / W) * 100}
            place="plot"
            rows={[{ color: CONTEXT, label: series[idx].label, value: `${series[idx].value}%` }]}
          />
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto outline-none"
          role="img"
          tabIndex={0}
          aria-label={`CPI inflation. ${series.map((d) => `${d.label}: ${d.value}%`).join(". ")}. Bank of England target ${target}%.`}
          onMouseMove={(e) => pick(e.clientX)}
          onMouseLeave={() => setIdx(null)}
          onFocus={() => setIdx(series.length - 1)}
          onBlur={() => setIdx(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); setIdx((i) => Math.min((i ?? 0) + 1, series.length - 1)); }
            if (e.key === "ArrowLeft") { e.preventDefault(); setIdx((i) => Math.max((i ?? series.length - 1) - 1, 0)); }
          }}
        >
          <defs>
            <linearGradient id="cpiFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CONTEXT} stopOpacity={0.16} />
              <stop offset="100%" stopColor={CONTEXT} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} y1={ys(t)} x2={W - padR} y2={ys(t)} stroke={GRID} strokeWidth={1} />
              <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize={9} fill={C.inkSubtle} style={{ fontVariantNumeric: "tabular-nums" }}>{t}%</text>
            </g>
          ))}

          <polygon points={area} fill="url(#cpiFill)" />

          {/* The target is the thing the reader is judging distance FROM, so it is
              directly labelled rather than left to the legend alone. */}
          <line x1={padL} y1={ys(target)} x2={W - padR} y2={ys(target)} stroke={C.inkSubtle} strokeWidth={1} strokeDasharray="5 4" />
          <text x={W - padR + 4} y={ys(target) + 3} fontSize={9} fontWeight={600} fill={C.inkSubtle}>Target</text>

          {idx != null && <line x1={xs(idx)} y1={padT} x2={xs(idx)} y2={H - padB} stroke={C.border} strokeWidth={1} />}

          <polyline points={line} fill="none" stroke={CONTEXT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          <circle cx={xs(series.length - 1)} cy={ys(end.value)} r={4} fill={CONTEXT} stroke={SURFACE} strokeWidth={2} />
          {idx != null && idx !== series.length - 1 && (
            <circle cx={xs(idx)} cy={ys(series[idx].value)} r={4} fill={CONTEXT} stroke={SURFACE} strokeWidth={2} />
          )}
          {/* One decimal always, so a whole number does not render as "3%" beside
              a tile reading "3.0%". */}
          <text x={xs(series.length - 1) + 8} y={ys(end.value) + 3.5} fontSize={10.5} fontWeight={700} fill={C.ink} style={{ fontVariantNumeric: "tabular-nums" }}>{end.value.toFixed(1)}%</text>

          {/* Every other label only: ten dates at 9px would collide. */}
          {series.map((d, i) =>
            i % 2 === 0 || i === series.length - 1 ? (
              <text key={d.label} x={xs(i)} y={H - 8} textAnchor="middle" fontSize={9} fill={C.inkSubtle}>{d.label}</text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}

// ── 2. Unemployment ──────────────────────────────────────────────────────────
// Question: is the supply of workers loosening? A different measure from CPI, so
// the two charts are not restating one fact in two forms.
export function UnemploymentTrend({ series }: { series: readonly Point[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 420, H = 168;
  const padL = 28, padR = 40, padT = 14, padB = 26;
  const vals = series.map((d) => d.value);
  const lo = Math.floor((Math.min(...vals) - 0.3) * 2) / 2;
  const hi = Math.ceil((Math.max(...vals) + 0.3) * 2) / 2;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += 0.5) ticks.push(Number(v.toFixed(1)));
  const xs = (i: number) => padL + (i * (W - padL - padR)) / (series.length - 1);
  const ys = (v: number) => padT + ((hi - v) / (hi - lo)) * (H - padT - padB);
  const start = series[0], end = series[series.length - 1];

  function pick(clientX: number) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((clientX - box.left) / box.width) * W;
    let best = 0, bestD = Infinity;
    series.forEach((_, i) => {
      const d = Math.abs(xs(i) - px);
      if (d < bestD) { bestD = d; best = i; }
    });
    setIdx(best);
  }

  return (
    <div className="w-full">
      <ChartTitle sub={`Rising from ${start.value}% (${start.label}) to ${end.value}% (${end.label})`}>
        Unemployment rate
      </ChartTitle>
      <div className="relative mt-1">
        {idx != null && (
          <Readout
            x={(xs(idx) / W) * 100}
            place="plot"
            rows={[{ color: SUBJECT, label: series[idx].label, value: `${series[idx].value}%` }]}
          />
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto outline-none"
          role="img"
          tabIndex={0}
          aria-label={`Unemployment rate. ${series.map((d) => `${d.label}: ${d.value}%`).join(". ")}`}
          onMouseMove={(e) => pick(e.clientX)}
          onMouseLeave={() => setIdx(null)}
          onFocus={() => setIdx(series.length - 1)}
          onBlur={() => setIdx(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); setIdx((i) => Math.min((i ?? 0) + 1, series.length - 1)); }
            if (e.key === "ArrowLeft") { e.preventDefault(); setIdx((i) => Math.max((i ?? series.length - 1) - 1, 0)); }
          }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} y1={ys(t)} x2={W - padR} y2={ys(t)} stroke={GRID} strokeWidth={1} />
              {/* Half-point ticks, so every label gets one decimal or the axis
                  reads "4.5%, 5%, 5.5%". */}
              <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize={9} fill={C.inkSubtle} style={{ fontVariantNumeric: "tabular-nums" }}>{t.toFixed(1)}%</text>
            </g>
          ))}

          {idx != null && <line x1={xs(idx)} y1={padT} x2={xs(idx)} y2={H - padB} stroke={C.border} strokeWidth={1} />}

          <polyline
            points={series.map((d, i) => `${xs(i)},${ys(d.value)}`).join(" ")}
            fill="none" stroke={SUBJECT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Both ENDS carry a marker and a label: the span is the point of the chart. */}
          <circle cx={xs(0)} cy={ys(start.value)} r={4} fill={SUBJECT} stroke={SURFACE} strokeWidth={2} />
          <circle cx={xs(series.length - 1)} cy={ys(end.value)} r={4} fill={SUBJECT} stroke={SURFACE} strokeWidth={2} />
          {idx != null && idx !== 0 && idx !== series.length - 1 && (
            <circle cx={xs(idx)} cy={ys(series[idx].value)} r={4} fill={SUBJECT} stroke={SURFACE} strokeWidth={2} />
          )}
          <text x={xs(0)} y={ys(start.value) - 9} textAnchor="start" fontSize={10} fontWeight={600} fill={C.inkMuted} style={{ fontVariantNumeric: "tabular-nums" }}>{start.value}%</text>
          <text x={xs(series.length - 1) + 8} y={ys(end.value) + 3.5} fontSize={10.5} fontWeight={700} fill={C.ink} style={{ fontVariantNumeric: "tabular-nums" }}>{end.value}%</text>

          {series.map((d, i) =>
            i % 2 === 0 || i === series.length - 1 ? (
              <text key={d.label} x={xs(i)} y={H - 8} textAnchor="middle" fontSize={9} fill={C.inkSubtle}>{d.label}</text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}

// ── 3. Wage floors, as a dumbbell ────────────────────────────────────────────
// Question: how far is the floor moving, and where does it land? A before/after
// pair per item is what a dumbbell is for; two side-by-side bars would make the
// reader compute the gap that the connector draws for them.
export function WageFloors({
  floors, upliftPct, londonRate,
}: {
  floors: readonly WageFloor[];
  upliftPct: (f: WageFloor) => number;
  londonRate: number;
}) {
  const lo = 12.0;
  const hi = Math.max(londonRate, ...floors.map((f) => f.to)) + 0.25;
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;

  return (
    <div className="w-full">
      <ChartTitle>Hourly wage floors, now and from the effective date</ChartTitle>
      <Legend
        items={[
          { color: CONTEXT, label: "Current rate" },
          { color: SUBJECT, label: "New rate" },
          { color: C.inkSubtle, label: `London Living Wage £${londonRate.toFixed(2)}`, dashed: true },
        ]}
      />

      <div className="mt-4 space-y-5">
        {floors.map((f) => {
          const x1 = pos(f.from), x2 = pos(f.to);
          return (
            <div key={f.name}>
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold truncate" style={{ color: C.ink }}>{f.name}</div>
                  <div className="text-[11px]" style={{ color: C.inkSubtle }}>{f.source}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12.5px] font-semibold tabular-nums" style={{ color: C.ink }}>
                    £{f.from.toFixed(2)} <ArrowRight className="inline w-3 h-3 mb-px" style={{ color: C.inkSubtle }} /> £{f.to.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-semibold tabular-nums" style={{ color: C.brassDeep }}>
                    +{upliftPct(f).toFixed(1)}% from {f.effective}
                  </div>
                </div>
              </div>

              <div className="relative h-[18px]" role="img" aria-label={`${f.name} rising from £${f.from.toFixed(2)} to £${f.to.toFixed(2)}, up ${upliftPct(f).toFixed(1)}% from ${f.effective}`}>
                {/* track */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full" style={{ background: C.surfaceSoft }} />
                {/* the move */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-[3px]"
                  style={{ left: `${x1}%`, width: `${x2 - x1}%`, background: SUBJECT, opacity: 0.45 }}
                />
                {/* London annotation, an unrelated reference so it stays a hairline */}
                <div
                  className="absolute top-0 bottom-0 border-l border-dashed"
                  style={{ left: `${pos(londonRate)}%`, borderColor: C.inkSubtle }}
                  aria-hidden
                />
                {/* endpoints, 2px surface rings so they read where they nearly touch */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
                  style={{ left: `${x1}%`, width: 10, height: 10, background: CONTEXT, boxShadow: `0 0 0 2px ${SURFACE}` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
                  style={{ left: `${x2}%`, width: 12, height: 12, background: SUBJECT, boxShadow: `0 0 0 2px ${SURFACE}` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[10px] tabular-nums" style={{ color: C.inkSubtle }}>
        <span>£{lo.toFixed(2)}</span>
        <span>£{hi.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ── 4. The 2026 pay-rise landscape ───────────────────────────────────────────
// Question: which pay floors are rising faster than the average pay rise? The
// source chart compared two bars, which is a comparison rather than a landscape;
// four ranked rows against a reference rule is the same data doing more work.
// Width of the trailing value column plus its gap. The reference rule has to be
// positioned inside a box of exactly the bar track's width: putting `left: X%` on
// the full-width row instead lands the rule to the right of the bar value it is
// meant to mark, by however wide this column is.
const VALUE_COL = 84; // w-[74px] + gap-2.5

export function PayRiseLandscape({ rows, reference }: { rows: PayRiseRow[]; reference: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(5, ...rows.map((r) => r.range?.to ?? r.pct));
  const pos = (v: number) => (v / max) * 100;

  return (
    <div className="w-full">
      <ChartTitle sub={`Read against the ${reference.toFixed(1)}% all-sector forecast`}>
        Announced and forecast pay rises, 2026
      </ChartTitle>

      <div className="relative mt-3 space-y-3">
        {/* the reference rule, behind the bars and aligned to the bar track */}
        <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ right: VALUE_COL }} aria-hidden>
          <div className="absolute inset-y-0 border-l border-dashed" style={{ left: `${pos(reference)}%`, borderColor: C.inkSubtle }} />
        </div>

        {rows.map((r) => {
          const isRef = r.reference;
          const color = isRef ? C.inkSubtle : r.pct >= reference ? HEATING : COOLING;
          const dim = hovered != null && hovered !== r.label;
          return (
            <div
              key={r.label}
              onMouseEnter={() => setHovered(r.label)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: dim ? 0.55 : 1, transition: "opacity .15s ease" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-[12.5px] font-semibold" style={{ color: C.ink }}>{r.label}</span>
                <span className="text-[11px] shrink-0" style={{ color: C.inkSubtle }}>{r.detail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 h-[14px]">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-[14px]"
                    style={{
                      left: 0, width: `${pos(r.pct)}%`, background: color,
                      // square at the baseline, 4px rounded at the data end
                      borderRadius: "0 4px 4px 0",
                    }}
                    role="img"
                    aria-label={`${r.label}: ${r.pct.toFixed(1)} per cent`}
                  />
                  {/* Where the source quotes a range, a whisker shows it rather
                      than the midpoint bar pretending to be a single figure. */}
                  {r.range && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-[2px]"
                      style={{ left: `${pos(r.range.from)}%`, width: `${pos(r.range.to) - pos(r.range.from)}%`, background: C.ink, opacity: 0.5 }}
                      aria-hidden
                    />
                  )}
                </div>
                <span className="text-[12px] font-semibold tabular-nums w-[74px] text-right shrink-0" style={{ color: C.ink }}>
                  {r.range ? rangeText(r.range) : `${r.pct.toFixed(1)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Legend
        items={[
          { color: HEATING, label: "Above the all-sector forecast" },
          { color: COOLING, label: "At or below it" },
          { color: C.inkSubtle, label: "All-sector forecast", dashed: true },
        ]}
      />
    </div>
  );
}

// ── 5. Where pay pressure is building ────────────────────────────────────────
// Question: which roles are moving faster or slower than the market average?
//
// This graphic IS the two source lists. Keeping "Heating Up" and "Cooling Down"
// as prose AND charting them would state the same thing twice, which the "no two
// charts restate the same fact" rule forbids. So one graphic carries all ten role
// names, all ten explanatory sentences, all seven ranges and both direction
// labels, and the duplication never exists.
const ROLE_VALUE_COL = 74; // w-[64px] + gap-2.5

export function RolePressurePlot({
  rows, reference, headingFor,
}: {
  rows: readonly RolePressure[];
  reference: number;
  headingFor: (d: RolePressure["direction"]) => { title: string; sub: string };
}) {
  const max = Math.max(...rows.map((r) => r.range?.to ?? 0), 12);
  const pos = (v: number) => (v / max) * 100;
  const groups: RolePressure["direction"][] = ["heating", "cooling"];

  return (
    <div className="w-full">
      <ChartTitle sub={`Annual pay movement, against the ${reference.toFixed(1)}% all-sector forecast`}>
        Pay pressure by role
      </ChartTitle>

      <div className="space-y-6 mt-3">
        {groups.map((dir) => {
          const head = headingFor(dir);
          const Icon = dir === "heating" ? TrendingUp : TrendingDown;
          const color = dir === "heating" ? HEATING : COOLING;
          return (
            <div key={dir}>
              <div className="flex items-baseline gap-2 mb-3">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} aria-hidden />
                <span className="text-[12.5px] font-semibold" style={{ color: C.ink }}>{head.title}</span>
                <span className="text-[11px]" style={{ color: C.inkSubtle }}>{head.sub}</span>
              </div>

              <div className="relative space-y-5">
                {/* One shared axis across both groups, so a cooling row and a
                    heating row are directly comparable rather than each group
                    being scaled to itself. Inset by the value column, as above. */}
                <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ right: ROLE_VALUE_COL }} aria-hidden>
                  <div className="absolute inset-y-0 border-l border-dashed" style={{ left: `${pos(reference)}%`, borderColor: C.inkSubtle }} />
                </div>

                {/* Name, then bar, then note. The bar used to lead, which put it
                    closer to the previous role's note than to its own name and
                    made every bar look like it belonged to the row above. */}
                {rows.filter((r) => r.direction === dir).map((r) => (
                  <div key={r.role} className="relative">
                    <div className="text-[12.5px] font-semibold" style={{ color: C.ink }}>{r.role}</div>
                    {/* The range is direct-labelled at the bar's end rather than in
                        a right-hand column: bars here start at different offsets,
                        so an aligned column leaves a long empty gap between a short
                        bar and its own number. */}
                    <div className="relative h-[12px] mt-1.5" style={{ marginRight: ROLE_VALUE_COL }}>
                      {r.range ? (
                        <>
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-[12px] rounded-[3px]"
                            style={{ left: `${pos(r.range.from)}%`, width: `${Math.max(pos(r.range.to) - pos(r.range.from), 1.5)}%`, background: color }}
                            role="img"
                            aria-label={`${r.role}: ${rangeText(r.range)}`}
                          />
                          <span
                            className="absolute top-1/2 -translate-y-1/2 text-[11.5px] font-semibold tabular-nums whitespace-nowrap"
                            style={{ left: `${pos(r.range.to)}%`, paddingLeft: 8, color: C.ink }}
                          >
                            {rangeText(r.range)}
                          </span>
                        </>
                      ) : (
                        // No published range in the source. A "Flat" chip is the
                        // honest render; a bar here would be an invented figure.
                        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1" style={{ left: 0 }}>
                          <Minus className="w-3 h-3" style={{ color: C.inkSubtle }} aria-hidden />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.inkSubtle }}>Flat</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11.5px] leading-snug mt-1.5" style={{ color: C.inkMuted, paddingRight: ROLE_VALUE_COL }}>
                      {r.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis labels sit over the bar track, not the value column. */}
      <div className="flex justify-between mt-3 text-[10px] tabular-nums" style={{ color: C.inkSubtle, paddingRight: ROLE_VALUE_COL }}>
        <span>0%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

// ── 6. Benefit prevalence, client segment vs the reference segment ───────────
// Question: how common is this benefit for employers like us, and how does that
// change for bigger ones?
//
// Only two of the six segments are plotted. The other four are context, not
// comparison, and four extra recessive marks against a white surface fail both
// the lightness-band and contrast checks, so they belong in the table beneath.
export function PrevalenceDots({ rows }: { rows: readonly PrevalenceRow[] }) {
  const clientLabel = BENEFIT_SEGMENTS.find((s) => s.key === CLIENT_SEGMENT)!.label;
  const refLabel = BENEFIT_SEGMENTS.find((s) => s.key === REFERENCE_SEGMENT)!.label;

  return (
    <div className="w-full">
      <ChartTitle>Employers offering each benefit</ChartTitle>
      <Legend items={[{ color: SUBJECT, label: clientLabel }, { color: CONTEXT, label: refLabel }]} />

      <div className="mt-4 space-y-4">
        {rows.map((r) => {
          const a = r[CLIENT_SEGMENT];
          const b = r[REFERENCE_SEGMENT];
          const leftIsA = a <= b;
          return (
            <div key={r.name}>
              <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: C.ink }}>{r.shortName}</div>
              <div className="relative h-[16px]" role="img" aria-label={`${r.name}: ${clientLabel} ${a} per cent, ${refLabel} ${b} per cent`}>
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full" style={{ background: C.surfaceSoft }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-[3px]"
                  style={{ left: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%`, background: C.border }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full" style={{ left: `${b}%`, width: 10, height: 10, background: CONTEXT, boxShadow: `0 0 0 2px ${SURFACE}` }} />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full" style={{ left: `${a}%`, width: 11, height: 11, background: SUBJECT, boxShadow: `0 0 0 2px ${SURFACE}` }} />
                {/* Both values direct-labelled, thrown to opposite sides of their
                    own dot so they cannot collide however close the pair sits. */}
                <span
                  className="absolute text-[10.5px] font-semibold tabular-nums"
                  style={{ left: `${a}%`, transform: leftIsA ? "translate(-100%, -50%)" : "translate(0, -50%)", top: "50%", paddingLeft: leftIsA ? 0 : 9, paddingRight: leftIsA ? 9 : 0, color: C.ink }}
                >
                  {a}%
                </span>
                <span
                  className="absolute text-[10.5px] font-semibold tabular-nums"
                  style={{ left: `${b}%`, transform: leftIsA ? "translate(0, -50%)" : "translate(-100%, -50%)", top: "50%", paddingLeft: leftIsA ? 8 : 0, paddingRight: leftIsA ? 0 : 8, color: C.inkMuted }}
                >
                  {b}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[10px] tabular-nums" style={{ color: C.inkSubtle }}>
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/** The ordinal scale strip. Always rendered, because it is the relief channel
 *  for a ramp whose chroma sits under the validator's floor. */
export function PrevalenceScaleStrip() {
  return (
    <div className="flex items-center gap-3 flex-wrap text-[11px]" style={{ color: C.inkMuted }}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.inkSubtle }}>
        Less common
      </span>
      <div className="inline-flex items-center" style={{ gap: 2 }}>
        {PREVALENCE_SCALE.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5 pr-2">
            <span className="inline-block w-2.5 h-2.5 rounded-[3px]" style={{ background: PREVALENCE_RAMP[p] }} />
            {p}
          </span>
        ))}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.inkSubtle }}>
        More common
      </span>
    </div>
  );
}
