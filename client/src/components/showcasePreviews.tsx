import { ReactNode } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Heart, Coins, CalendarDays, GraduationCap, Users } from "lucide-react";
import { C } from "@/lib/theme";
import { marketData, getPositioning } from "@/lib/data";

// ── palette (within the existing gold / cream / navy identity) ──────────────
const NAVY = C.ink; // #0a1929
const GOLD = C.brass; // #c9a84c
const GOLD_DEEP = C.brassDeep; // #a98a3a
const INK = C.inkMuted; // #475569
const MUTED = C.inkSubtle; // #94a3b8
const LINE = C.borderSubtle;
const CREAM = C.canvas;

const CARD_W = 280;
const CARD_H = 232;

interface PreviewShellProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

function PreviewShell({ eyebrow, title, children, footer }: PreviewShellProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col shrink-0"
      style={{
        width: CARD_W,
        height: CARD_H,
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 2px hsl(214 25% 15% / 0.04), 0 10px 26px hsl(214 25% 15% / 0.07)",
      }}
    >
      <div className="px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: LINE }}>
        <p
          className="text-[9.5px] font-semibold uppercase mb-0.5"
          style={{ color: GOLD_DEEP, letterSpacing: "0.14em" }}
        >
          {eyebrow}
        </p>
        <h3 className="text-[13px] font-semibold leading-tight" style={{ color: NAVY }}>
          {title}
        </h3>
      </div>
      <div className="flex-1 px-4 py-3 overflow-hidden">{children}</div>
      {footer && (
        <div
          className="px-4 py-2 border-t text-[10.5px]"
          style={{ borderColor: LINE, color: INK }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// ── PAY PREVIEWS ────────────────────────────────────────────────────────────

/** Role-by-role quartile position for a representative role. */
function PayRolePreview() {
  const role = marketData[0]; // Software Engineer (Senior)
  const pos = getPositioning(role.currentSalary, role.lowerQuartile, role.median, role.upperQuartile);
  const pct = Math.max(4, Math.min(96, pos.percentage));
  const k = (n: number) => `£${(n / 1000).toFixed(0)}k`;
  return (
    <PreviewShell eyebrow="Role-by-role" title={role.role} footer={`Positioned: ${pos.label}`}>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[26px] font-bold leading-none" style={{ color: NAVY }}>
            £{role.currentSalary.toLocaleString()}
          </p>
          <p className="text-[10px]" style={{ color: MUTED }}>
            Median £{role.median.toLocaleString()}
          </p>
        </div>
        <div>
          <div
            className="relative h-2.5 rounded-full overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, hsl(214 15% 80%) 0%, hsl(42 45% 78%) 50%, hsl(42 53% 55%) 100%)",
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[5px] h-4 rounded-full"
              style={{ left: `${pct}%`, background: NAVY, boxShadow: "0 0 0 2px #fff" }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] font-medium" style={{ color: MUTED }}>
            <span>LQ {k(role.lowerQuartile)}</span>
            <span>Med {k(role.median)}</span>
            <span>UQ {k(role.upperQuartile)}</span>
          </div>
        </div>
        <div className="rounded-lg px-2.5 py-1.5 text-[10.5px] leading-snug" style={{ background: CREAM, color: INK }}>
          <span style={{ color: GOLD_DEEP, fontWeight: 600 }}>Competitive</span> — room to grow
          toward the median to protect retention.
        </div>
      </div>
    </PreviewShell>
  );
}

/** Variance vs market median by function (computed from marketData). */
function PayFunctionPreview() {
  const byFn = new Map<string, { actual: number; median: number; n: number }>();
  for (const r of marketData) {
    const e = byFn.get(r.function) ?? { actual: 0, median: 0, n: 0 };
    e.actual += r.currentSalary;
    e.median += r.median;
    e.n += 1;
    byFn.set(r.function, e);
  }
  const rows = Array.from(byFn.entries())
    .map(([fn, e]) => ({ fn, variance: ((e.actual - e.median) / e.median) * 100 }))
    .sort((a, b) => b.variance - a.variance)
    .slice(0, 5);
  const maxAbs = Math.max(6, ...rows.map((r) => Math.abs(r.variance)));
  return (
    <PreviewShell eyebrow="By function" title="Pay vs market median" footer="Engineering leads; HR trails">
      <div className="space-y-2">
        {rows.map((r) => {
          const w = (Math.abs(r.variance) / maxAbs) * 50;
          const positive = r.variance >= 0;
          return (
            <div key={r.fn} className="flex items-center gap-2">
              <span className="text-[10px] font-medium w-[58px] truncate" style={{ color: INK }}>
                {r.fn}
              </span>
              <div className="flex-1 relative h-2" style={{ background: "transparent" }}>
                <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: C.border }} />
                <div
                  className="absolute top-0 h-2 rounded-full"
                  style={{
                    width: `${w}%`,
                    left: positive ? "50%" : `${50 - w}%`,
                    background: positive ? GOLD : MUTED,
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold tabular-nums w-9 text-right" style={{ color: NAVY }}>
                {positive ? "+" : ""}
                {r.variance.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </PreviewShell>
  );
}

/** Market pay-rise trend (illustrative). */
function PayTrendPreview() {
  const trend = [
    { m: "Q1", v: 3.4 },
    { m: "Q2", v: 3.8 },
    { m: "Q3", v: 4.1 },
    { m: "Q4", v: 4.0 },
    { m: "Q1", v: 4.2 },
    { m: "Q2", v: 4.2 },
  ];
  return (
    <PreviewShell eyebrow="Market" title="Average pay rise" footer="Predicted next cycle: 3.8%">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[26px] font-bold leading-none" style={{ color: NAVY }}>
          4.2%
        </p>
        <p className="text-[11px] font-semibold" style={{ color: C.success }}>
          <ArrowUpRight className="inline w-3 h-3" /> 0.4pp on Q3
        </p>
      </div>
      <ResponsiveContainer width="100%" height={96}>
        <LineChart data={trend} margin={{ top: 6, right: 8, bottom: 0, left: -34 }}>
          <XAxis dataKey="m" tick={{ fontSize: 9 }} stroke={MUTED} axisLine={false} tickLine={false} />
          <YAxis hide domain={[3, 5]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={GOLD}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: GOLD }}
            activeDot={{ r: 4, fill: NAVY }}
          />
        </LineChart>
      </ResponsiveContainer>
    </PreviewShell>
  );
}

/** Distribution donut: how all roles sit vs market (computed from marketData). */
function PayDistributionPreview() {
  const buckets: Record<string, number> = { below: 0, lower: 0, upper: 0, above: 0 };
  for (const r of marketData) {
    const p = getPositioning(r.currentSalary, r.lowerQuartile, r.median, r.upperQuartile);
    buckets[p.position] = (buckets[p.position] ?? 0) + 1;
  }
  const data = [
    { name: "Below LQ", value: buckets.below, color: MUTED },
    { name: "LQ → Median", value: buckets.lower, color: "#cbb876" },
    { name: "Median → UQ", value: buckets.upper, color: GOLD },
    { name: "Above UQ", value: buckets.above, color: NAVY },
  ].filter((d) => d.value > 0);
  const total = marketData.length;
  const atOrAbove = buckets.upper + buckets.above;
  return (
    <PreviewShell
      eyebrow="Distribution"
      title={`How your ${total} roles sit vs market`}
      footer={`${atOrAbove} of ${total} at or above median`}
    >
      <div className="flex items-center gap-2 h-full">
        <ResponsiveContainer width="48%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={28} outerRadius={46} paddingAngle={2} startAngle={90} endAngle={-270}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-[10px]" style={{ color: INK }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="truncate flex-1">{d.name}</span>
              <span className="font-semibold tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

// ── BENEFITS PREVIEWS ───────────────────────────────────────────────────────

function BenefitsProvisionPreview() {
  const data = [
    { name: "Provided", value: 24, color: GOLD },
    { name: "Not yet", value: 12, color: "hsl(214 15% 85%)" },
  ];
  return (
    <PreviewShell eyebrow="Provision" title="Total benefits coverage" footer="Above market median (62%)">
      <div className="flex items-center gap-3 h-full">
        <div className="relative">
          <ResponsiveContainer width={104} height={104}>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={34} outerRadius={50} paddingAngle={1} startAngle={90} endAngle={-270}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[18px] font-bold" style={{ color: NAVY }}>
              67%
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-[10.5px]" style={{ color: INK }}>
          <div className="flex items-baseline gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
            <span className="flex-1">Provided</span>
            <span className="font-semibold">24</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "hsl(214 15% 80%)" }} />
            <span className="flex-1">Not yet</span>
            <span className="font-semibold">12</span>
          </div>
          <div className="rounded-md px-2 py-1.5 text-[10px] mt-1" style={{ background: CREAM }}>
            <span style={{ color: GOLD_DEEP, fontWeight: 600 }}>+5%</span> above peers
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function BenefitsCategoryPreview() {
  const cats = [
    { name: "Health", pct: 92, icon: Heart },
    { name: "Financial", pct: 78, icon: Coins },
    { name: "Time off", pct: 85, icon: CalendarDays },
    { name: "Learning", pct: 64, icon: GraduationCap },
    { name: "Family", pct: 71, icon: Users },
  ];
  return (
    <PreviewShell eyebrow="By category" title="Provision by reward area" footer="Health leads at 92%">
      <div className="space-y-1.5">
        {cats.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.name} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ background: C.brassSoft }}
              >
                <Icon className="w-3 h-3" style={{ color: GOLD_DEEP }} />
              </div>
              <span className="text-[10px] font-medium w-[52px] truncate" style={{ color: INK }}>
                {c.name}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(214 15% 91%)" }}>
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: GOLD }} />
              </div>
              <span className="text-[10px] font-semibold tabular-nums w-8 text-right" style={{ color: NAVY }}>
                {c.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </PreviewShell>
  );
}

function BenefitsComparisonPreview() {
  const rows = [
    { label: "Private medical", market: 84, you: 100 },
    { label: "Enhanced pension", market: 68, you: 90 },
    { label: "Hybrid working", market: 92, you: 100 },
    { label: "Mental health", market: 56, you: 80 },
  ];
  return (
    <PreviewShell eyebrow="Comparison" title="Your offer vs market" footer="You lead on 3 of 4">
      <div className="space-y-2.5">
        {rows.map((b) => (
          <div key={b.label}>
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-[10px] font-medium truncate" style={{ color: INK }}>
                {b.label}
              </span>
              <span className="text-[9.5px]" style={{ color: MUTED }}>
                You {b.you}%
              </span>
            </div>
            <div className="relative h-2 rounded-full" style={{ background: "hsl(214 15% 91%)" }}>
              <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${b.market}%`, background: "hsl(214 15% 72%)" }} />
              <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${b.you}%`, background: GOLD, mixBlendMode: "multiply" }} />
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function BenefitsStrengthsPreview() {
  return (
    <PreviewShell eyebrow="Strengths & watch" title="Where you stand out" footer="1 clear development area">
      <div className="grid grid-cols-2 gap-2 h-full">
        <div className="rounded-lg p-2.5" style={{ background: C.sageSoft }}>
          <p className="text-[9px] font-semibold uppercase mb-1.5" style={{ color: C.success, letterSpacing: "0.08em" }}>
            Strengths
          </p>
          <ul className="space-y-1 text-[10px]" style={{ color: INK }}>
            <li>Pension 10% — top quartile</li>
            <li>Private medical — all staff</li>
            <li>Enhanced parental leave</li>
          </ul>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: C.roseSoft }}>
          <p className="text-[9px] font-semibold uppercase mb-1.5" style={{ color: C.rose, letterSpacing: "0.08em" }}>
            To watch
          </p>
          <ul className="space-y-1 text-[10px]" style={{ color: INK }}>
            <li>Wellbeing budget below median</li>
            <li>No share scheme yet</li>
          </ul>
        </div>
      </div>
    </PreviewShell>
  );
}

export const payPreviews: ReactNode[] = [
  <PayRolePreview key="role" />,
  <PayDistributionPreview key="dist" />,
  <PayFunctionPreview key="fn" />,
  <PayTrendPreview key="trend" />,
];

export const benefitsPreviews: ReactNode[] = [
  <BenefitsProvisionPreview key="prov" />,
  <BenefitsCategoryPreview key="cat" />,
  <BenefitsComparisonPreview key="cmp" />,
  <BenefitsStrengthsPreview key="sw" />,
];
