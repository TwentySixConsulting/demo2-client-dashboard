// Home dashboard charts — lightweight hand-rolled SVG so there's no chart-lib
// weight and full control of the aesthetic. All three read live data and share
// one visual language: thin marks, rounded ends, status colours WITH labels
// (identity never colour-alone), recessive grid, direct value labels.
import { ArrowRight } from "lucide-react";
import { C, PAY_TREND } from "@/lib/theme";

// Ordered market bands (below → above). Status colours, always shown with a label.
const BANDS = [
  { key: "below", label: "Below lower quartile", short: "Below LQ", color: "#C0392B" },
  { key: "lower", label: "LQ to median", short: "LQ–Median", color: "#B7791F" },
  { key: "upper", label: "Median to UQ", short: "Median–UQ", color: "#2F7D5B" },
  { key: "above", label: "Above upper quartile", short: "Above UQ", color: "#7285A5" },
] as const;

function CardShell({ title, action, onOpen, children, className = "" }: { title: string; action?: string; onOpen?: () => void; children: React.ReactNode; className?: string }) {
  const Tag = onOpen ? "button" : "div";
  return (
    <Tag
      onClick={onOpen}
      className={`ts-premium-card ${onOpen ? "ts-nudge" : ""} p-5 text-left flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.inkMuted }}>{title}</span>
        {action && <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: C.brass }}>{action} <ArrowRight className="ts-arrow w-3 h-3" /></span>}
      </div>
      {children}
    </Tag>
  );
}

// ── 1. Role distribution across market bands (horizontal bars) ──────────────
export function RoleDistribution({ bands, total, belowMarket, onOpen }: { bands: Record<string, number>; total: number; belowMarket: number; onOpen: () => void }) {
  const max = Math.max(1, ...BANDS.map((b) => bands[b.key] ?? 0));
  return (
    <CardShell title="Roles vs market" action="Explore" onOpen={onOpen} className="w-full lg:w-[340px] shrink-0">
      <div className="mb-3.5 font-display font-bold" style={{ fontSize: 18, color: C.ink, lineHeight: 1.15 }}>
        {belowMarket} <span className="text-[12.5px] font-medium" style={{ color: C.inkMuted }}>of {total} roles below market</span>
      </div>
      <div className="space-y-2.5">
        {BANDS.map((b) => {
          const c = bands[b.key] ?? 0;
          const w = Math.max(c > 0 ? 6 : 0, (c / max) * 100);
          return (
            <div key={b.key} className="flex items-center gap-2.5">
              <span className="w-[92px] shrink-0 text-[11.5px] flex items-center gap-1.5" style={{ color: C.inkMuted }}>
                <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
                {b.short}
              </span>
              <span className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: C.borderSubtle }}>
                <span className="block h-full rounded-full" style={{ width: `${w}%`, background: b.color }} />
              </span>
              <span className="w-4 text-right text-[12px] font-semibold tabular-nums" style={{ color: C.ink }}>{c}</span>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ── 2. Pay-rise trend, you vs market (2-series line) ────────────────────────
export function PayTrend() {
  const data = PAY_TREND;
  const W = 340, H = 132;
  const padL = 12, padR = 40, padT = 16, padB = 22;
  const xs = (i: number) => padL + (i * (W - padL - padR)) / (data.length - 1);
  const vals = data.flatMap((d) => [d.you, d.market]);
  const lo = Math.floor(Math.min(...vals) - 0.6);
  const hi = Math.ceil(Math.max(...vals) + 0.6);
  const ys = (v: number) => padT + ((hi - v) / (hi - lo)) * (H - padT - padB);
  const line = (key: "you" | "market") => data.map((d, i) => `${xs(i)},${ys(d[key])}`).join(" ");
  const clay = "#C9785A", slate = "#5F79A1";
  const last = data[data.length - 1];
  // Keep the two end-labels from overlapping when the last values are close.
  const yYou = ys(last.you), yMkt = ys(last.market);
  const close = Math.abs(yYou - yMkt) < 14;
  const youTop = last.you >= last.market;
  const youLabelY = close ? (youTop ? Math.min(yYou, yMkt) - 3 : Math.max(yYou, yMkt) + 11) : yYou + 3;
  const mktLabelY = close ? (youTop ? Math.max(yYou, yMkt) + 11 : Math.min(yYou, yMkt) - 3) : yMkt + 3;

  return (
    <CardShell title="Pay rises: you vs the market" className="flex-1">
      {/* legend */}
      <div className="flex items-center gap-4 mb-1 text-[11.5px]" style={{ color: C.inkMuted }}>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3.5 h-[2px] rounded" style={{ background: clay }} /> You</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3.5 h-0 border-t-2 border-dashed" style={{ borderColor: slate }} /> Market</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Average pay rise, your organisation versus the market, 2022 to 2026">
        {/* recessive gridlines */}
        {[0, 0.5, 1].map((t) => {
          const y = padT + t * (H - padT - padB);
          return <line key={t} x1={padL} y1={y} x2={W - padR} y2={y} stroke={C.borderSubtle} strokeWidth={1} />;
        })}
        {/* market (dashed slate) */}
        <polyline points={line("market")} fill="none" stroke={slate} strokeWidth={2} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />
        {/* you (solid clay) */}
        <polyline points={line("you")} fill="none" stroke={clay} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.year}>
            <circle cx={xs(i)} cy={ys(d.you)} r={3} fill={clay} stroke="#fff" strokeWidth={1.5} />
            <text x={xs(i)} y={H - 6} textAnchor="middle" fontSize={9.5} fill={C.inkSubtle}>{d.year}</text>
            {/* hover target + tooltip */}
            <rect x={xs(i) - 14} y={0} width={28} height={H - padB} fill="transparent">
              <title>{`${d.year} · you ${d.you}% · market ${d.market}%`}</title>
            </rect>
          </g>
        ))}
        {/* end labels (offset apart when the values are close) */}
        <text x={xs(data.length - 1) + 5} y={youLabelY} fontSize={10.5} fontWeight={700} fill={clay}>{last.you}%</text>
        <text x={xs(data.length - 1) + 5} y={mktLabelY} fontSize={10} fontWeight={600} fill={slate}>{last.market}%</text>
      </svg>
    </CardShell>
  );
}

// ── 3. Benefits mix (donut) ─────────────────────────────────────────────────
export function BenefitsDonut({ atOrAbove, watch, below, total, onOpen }: { atOrAbove: number; watch: number; below: number; total: number; onOpen: () => void }) {
  const segs = [
    { label: "At or above market", value: atOrAbove, color: "#2F7D5B" },
    { label: "Mixed vs market", value: watch, color: "#B7791F" },
    { label: "Below market", value: below, color: "#C0392B" },
  ];
  const t = total || 1;
  const r = 46, cx = 60, cy = 60, circ = 2 * Math.PI * r, gap = 3;
  let offset = 0;
  return (
    <CardShell title="Benefits mix" action="Review" onOpen={onOpen} className="w-full lg:w-[300px] shrink-0">
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 120 120" className="w-[104px] h-[104px] shrink-0 -rotate-90" role="img" aria-label={`${atOrAbove} of ${total} benefits at or above market`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.borderSubtle} strokeWidth={12} />
          {segs.map((s) => {
            if (s.value <= 0) return null;
            const len = (s.value / t) * circ;
            const dash = Math.max(0, len - gap);
            const el = (
              <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={12} strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}>
                <title>{`${s.label}: ${s.value} of ${total}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
          {/* centre number (counter-rotated back upright) */}
          <g transform="rotate(90 60 60)">
            <text x={60} y={57} textAnchor="middle" fontSize={26} fontWeight={700} fontFamily="var(--font-display)" fill={C.ink}>{atOrAbove}</text>
            <text x={60} y={74} textAnchor="middle" fontSize={10} fill={C.inkMuted}>of {total}</text>
          </g>
        </svg>
        <div className="min-w-0 space-y-1.5">
          {segs.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: C.inkMuted }}>
              <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="tabular-nums font-semibold" style={{ color: C.ink }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
