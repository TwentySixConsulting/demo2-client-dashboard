import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { clientConfig, clientNameToEmail } from "@/config/clientConfig";
import { Shell } from "@/components/Shell";
import {
  C,
  PAY_GEMS,
  BENEFITS_TINTS,
  REPORT_PERIOD,
  PAY_META,
  BENEFITS_META,
  LAST_UPDATED,
} from "@/lib/theme";
import {
  ArrowRight,
  LineChart,
  Gift,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Star,
  Briefcase,
  Coins,
  TrendingUp,
  Activity,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Time-aware greeting

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ─────────────────────────────────────────────────────────────────────────────
// Carousel

interface Slide {
  key: string;
  node: React.ReactNode;
  caption: string;
  pageRef: string;
}

interface CarouselProps {
  slides: Slide[];
  intervalMs?: number;
  height?: number;
  accent?: string;
}

function Carousel({ slides, intervalMs = 6000, height = 280, accent = C.brass }: CarouselProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [paused, total, intervalMs]);

  const go = (delta: number) => setIdx((i) => (i + delta + total) % total);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: C.surfaceSoft,
          border: `1px solid ${C.borderSubtle}`,
          height,
        }}
      >
        {/* Track. translateX % is computed against the track's OWN width
            (total * 100% of the viewport), so shifting by one slide width
            means translateX(-${100/total}%) per index, not -100% per index. */}
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${idx * (100 / total)}%)`,
            transition: "transform 700ms cubic-bezier(0.65, 0, 0.35, 1)",
            width: `${total * 100}%`,
          }}
        >
          {slides.map((s) => (
            <div
              key={s.key}
              className="h-full flex-shrink-0"
              style={{ width: `${100 / total}%` }}
            >
              <div className="h-full p-4">{s.node}</div>
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity z-20"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${C.border}`,
                color: C.ink,
                opacity: 0.6,
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.6")}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity z-20"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${C.border}`,
                color: C.ink,
                opacity: 0.6,
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.6")}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 px-1 gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="text-[10px] font-semibold uppercase rounded-full px-2 py-0.5 whitespace-nowrap"
            style={{
              color: accent,
              background: `${accent}14`,
              letterSpacing: "0.16em",
            }}
          >
            {slides[idx]?.pageRef}
          </span>
          <span className="text-[12px] font-medium truncate" style={{ color: C.ink }}>
            {slides[idx]?.caption}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            aria-label={paused ? "Play carousel" : "Pause carousel"}
            onClick={(e) => {
              e.stopPropagation();
              setPaused((p) => !p);
            }}
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ color: C.inkSubtle, background: "transparent" }}
          >
            {paused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
          </button>
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i);
              }}
              className="rounded-full transition-all"
              style={{
                width: i === idx ? 18 : 5,
                height: 5,
                background: i === idx ? accent : "#d0d8df",
                border: 0,
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAY SLIDES (faithful, unchanged structurally)

function PaySlideGemGrid() {
  const cards: Array<{
    title: string;
    sub: string;
    gem: keyof typeof PAY_GEMS;
    icon: typeof Briefcase;
  }> = [
    { title: "Market Comparison", sub: `${PAY_META.rolesAnalysed} roles`, gem: "blue", icon: TrendingUp },
    { title: "Role Details", sub: "LQ → UQ", gem: "teal", icon: Briefcase },
    { title: "Bonus & Variable", sub: "Tier mix", gem: "purple", icon: Coins },
    { title: "Trends & Hotspots", sub: PAY_META.medianPayChange, gem: "yellow", icon: Activity },
  ];
  return (
    <div className="h-full grid grid-cols-2 grid-rows-2 gap-2.5">
      {cards.map((c) => {
        const g = PAY_GEMS[c.gem];
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="rounded-xl p-3 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
              border: `1px solid ${g.border}40`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 8px 24px -16px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${g.border}45 0%, transparent 70%)`,
              }}
              aria-hidden
            />
            <div className="flex items-center gap-1.5 relative">
              <Icon className="w-3 h-3" style={{ color: g.accent }} />
              <span
                className="text-[8.5px] font-semibold uppercase"
                style={{ color: g.accent, letterSpacing: "0.18em" }}
              >
                Explore
              </span>
            </div>
            <div className="relative">
              <div
                className="text-[13.5px] font-semibold leading-tight"
                style={{ color: "#fff", letterSpacing: "-0.005em" }}
              >
                {c.title}
              </div>
              <div className="flex items-end justify-between gap-1 mt-1">
                <span className="text-[10.5px]" style={{ color: g.accent, opacity: 0.9 }}>
                  {c.sub}
                </span>
                <ArrowUpRight className="w-3 h-3" style={{ color: g.accent }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaySlideRoleBar() {
  return (
    <div
      className="h-full rounded-xl flex flex-col"
      style={{ background: "#fff", border: "1px solid #e2e8f0" }}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between rounded-t-xl"
        style={{
          background: "rgba(167, 243, 208, 0.35)",
          borderBottom: "1px solid rgba(110, 231, 183, 0.5)",
        }}
      >
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className="text-[9px] font-semibold uppercase truncate"
            style={{ color: "#0f766e", letterSpacing: "0.16em" }}
          >
            Engineering · Senior
          </span>
          <span className="text-[13px] font-semibold mt-0.5 truncate" style={{ color: "#0f172a" }}>
            Senior Software Engineer
          </span>
        </div>
        <span
          className="text-[9px] font-bold rounded-full px-2 py-1 shrink-0"
          style={{
            background: "rgba(16,185,129,0.18)",
            color: "#047857",
            letterSpacing: "0.08em",
          }}
        >
          ABOVE UQ
        </span>
      </div>
      <div className="px-4 pt-6 pb-4 flex-1 flex flex-col justify-between">
        <div className="flex items-end justify-between text-[9.5px] mb-2" style={{ color: "#64748b" }}>
          <span>LQ £38,900</span>
          <span>Median £52,400</span>
          <span>UQ £71,200</span>
        </div>
        <div className="relative px-1 py-2">
          <div
            className="relative h-3 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #fecaca 0%, #fde68a 35%, #a7f3d0 70%, #bfdbfe 100%)",
            }}
          >
            {[0, 35, 70, 100].map((p) => (
              <span
                key={p}
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${p}%`, background: "rgba(15,23,42,0.18)" }}
              />
            ))}
            <span
              className="absolute"
              style={{
                left: "72%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#c9a84c",
                boxShadow: "0 0 0 2.5px #fff, 0 2px 6px rgba(201,168,76,0.5)",
              }}
              aria-hidden
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-[10.5px] mt-1">
          <span style={{ color: "#0f172a" }}>
            Your salary{" "}
            <span className="font-bold" style={{ color: "#9a7d2e" }}>
              £61,800
            </span>
          </span>
          <span
            className="font-semibold rounded-full px-2 py-0.5"
            style={{ background: "rgba(16,185,129,0.14)", color: "#047857" }}
          >
            +17.9% vs median
          </span>
        </div>
      </div>
    </div>
  );
}

function PaySlideFunctionBars() {
  const rows = [
    { fn: "Engineering", pct: 8.4 },
    { fn: "Product", pct: 5.1 },
    { fn: "Operations", pct: 1.8 },
    { fn: "Finance", pct: -0.6 },
    { fn: "People", pct: -3.2 },
  ];
  const max = 10;
  return (
    <div
      className="h-full rounded-xl p-4 flex flex-col"
      style={{ background: "#fff", border: "1px solid #e2e8f0" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-3 h-3" style={{ color: "#64748b" }} />
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: "#475569", letterSpacing: "0.14em" }}
          >
            Position by function
          </span>
        </div>
        <span className="text-[9.5px]" style={{ color: "#64748b" }}>
          % vs median
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-between gap-1">
        {rows.map((r) => {
          const positive = r.pct >= 0;
          const widthPct = (Math.abs(r.pct) / max) * 50;
          return (
            <div key={r.fn} className="grid grid-cols-[80px_1fr_44px] items-center gap-2">
              <span className="text-[10.5px] font-medium truncate" style={{ color: "#1e293b" }}>
                {r.fn}
              </span>
              <div className="relative h-3 flex items-center">
                <div className="absolute inset-y-1 inset-x-0 rounded-full" style={{ background: "#f1f5f9" }} />
                <div
                  className="absolute left-1/2 top-0 bottom-0 w-px"
                  style={{
                    background:
                      "repeating-linear-gradient(180deg, #94a3b8 0 2px, transparent 2px 4px)",
                  }}
                  aria-hidden
                />
                <div
                  className="absolute h-2.5 rounded-sm"
                  style={{
                    left: positive ? "50%" : `${50 - widthPct}%`,
                    width: `${widthPct}%`,
                    background: positive ? "#10b981" : "#f59e0b",
                  }}
                />
              </div>
              <span
                className="text-[10px] font-semibold tabular-nums text-right"
                style={{ color: positive ? "#047857" : "#b45309" }}
              >
                {positive ? "+" : ""}
                {r.pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div
        className="mt-2.5 pt-2 flex items-center justify-center gap-4 text-[9px]"
        style={{ color: "#64748b", borderTop: "1px solid #f1f5f9" }}
      >
        <span>−10%</span>
        <span className="font-semibold">Market median</span>
        <span>+10%</span>
      </div>
    </div>
  );
}

function PaySlideMarketBento() {
  const tiles = [
    { v: "3.0%", l: "UK pay rise", bg: "#eff6ff", border: "#bfdbfe", color: "#1e3a8a" },
    { v: "3.5%", l: "CPI inflation", bg: "#f5f3ff", border: "#ddd6fe", color: "#5b21b6" },
    { v: "5.1%", l: "Unemployment", bg: "#ecfeff", border: "#a5f3fc", color: "#155e75" },
    { v: PAY_META.medianPayChange, l: "Your median", bg: "#fff1f2", border: "#fecdd3", color: "#9f1239" },
  ];
  return (
    <div
      className="h-full rounded-xl p-3.5 flex flex-col"
      style={{ background: "#fff", border: "1px solid #e2e8f0" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3" style={{ color: "#64748b" }} />
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: "#475569", letterSpacing: "0.14em" }}
          >
            Market overview · {REPORT_PERIOD}
          </span>
        </div>
        <span className="text-[9.5px]" style={{ color: "#94a3b8" }}>
          UK aggregate
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {tiles.map((t) => (
          <div
            key={t.l}
            className="rounded-lg px-2.5 py-3 flex flex-col justify-between"
            style={{ background: t.bg, border: `1px solid ${t.border}` }}
          >
            <span
              className="text-[19px] font-bold leading-none tabular-nums"
              style={{ color: t.color, letterSpacing: "-0.015em" }}
            >
              {t.v}
            </span>
            <span
              className="text-[9px] font-semibold uppercase leading-tight"
              style={{ color: t.color, opacity: 0.8, letterSpacing: "0.12em" }}
            >
              {t.l}
            </span>
          </div>
        ))}
      </div>
      <div
        className="mt-3 rounded-lg px-3 py-2 flex items-center justify-between text-[10px]"
        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }}
      >
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
          <strong style={{ fontWeight: 600 }}>Heating up:</strong> Engineering
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#0ea5e9" }} />
          <strong style={{ fontWeight: 600 }}>Cooling:</strong> Finance
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFITS SLIDES

function BenefitsSlideProvisionStrip() {
  const T = BENEFITS_TINTS;
  const stats = [
    { v: 14, l: "Benefits in place", bg: T.navy, color: "#ffffff" },
    { v: 1, l: "Below market", bg: T.pinkWash, color: T.pink, border: "#ead4d7" },
    { v: 1, l: "Mixed", bg: "#fbf6e8", color: "#a08438", border: "#ead8b0" },
    { v: 8, l: "At market", bg: T.sageWash, color: T.sage, border: "#d3e1ce" },
    { v: 4, l: "Above market", bg: "#f7eaef", color: T.pink, border: "#ead4d7" },
  ];
  return (
    <div
      className="h-full rounded-xl p-4 flex flex-col gap-3"
      style={{ background: T.cream, border: "1px solid #ece6da" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase"
          style={{ color: T.inkSoft, letterSpacing: "0.18em" }}
        >
          {clientConfig.clientName} · Benefits provision
        </span>
        <span
          className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
          style={{ background: T.navy, color: T.gold, letterSpacing: "0.08em" }}
        >
          {REPORT_PERIOD}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 flex-1">
        {stats.map((s) => (
          <div
            key={s.l}
            className="rounded-xl px-2.5 py-2.5 flex flex-col items-start justify-between min-w-0"
            style={{
              background: s.bg,
              border: s.border ? `1px solid ${s.border}` : "none",
            }}
          >
            <span
              className="text-[26px] font-bold leading-none tabular-nums"
              style={{ color: s.color, letterSpacing: "-0.025em" }}
            >
              {s.v}
            </span>
            <span
              className="text-[8.5px] font-semibold uppercase leading-tight mt-2"
              style={{ color: s.color, opacity: 0.9, letterSpacing: "0.1em" }}
            >
              {s.l}
            </span>
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between text-[10px] rounded-md px-3 py-1.5"
        style={{ background: "#fff", border: "1px solid #ece6da", color: T.inkSoft }}
      >
        <span>
          <strong style={{ color: T.navy }}>{BENEFITS_META.employersInDataset}</strong> employers
          in dataset
        </span>
        <span>
          <strong style={{ color: T.navy }}>{BENEFITS_META.categories}</strong> categories ·{" "}
          <strong style={{ color: T.navy }}>{BENEFITS_META.coverage}%</strong> coverage
        </span>
      </div>
    </div>
  );
}

function BenefitsSlidePositioning() {
  const T = BENEFITS_TINTS;
  return (
    <div
      className="h-full rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#fff", border: "1px solid #ece6da" }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid #ece6da" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: T.pinkWash, border: "1px solid #ead4d7" }}
          >
            <Coins className="w-3.5 h-3.5" style={{ color: T.pink }} />
          </div>
          <div className="leading-tight min-w-0">
            <div
              className="text-[9px] font-semibold uppercase truncate"
              style={{ color: T.inkSoft, letterSpacing: "0.16em" }}
            >
              Financial support
            </div>
            <div
              className="text-[14px] font-semibold mt-0.5 truncate"
              style={{ color: T.navy, letterSpacing: "-0.005em" }}
            >
              Pension contribution
            </div>
          </div>
        </div>
        <span
          className="text-[9.5px] font-semibold rounded-full px-2 py-1 shrink-0"
          style={{
            background: T.pinkWash,
            color: T.pink,
            border: "1px solid #ead4d7",
            letterSpacing: "0.06em",
          }}
        >
          ABOVE MARKET
        </span>
      </div>
      <div className="px-4 pt-3 pb-3 flex-1 flex flex-col gap-2">
        <div className="relative" style={{ height: 26 }}>
          <div
            className="absolute"
            style={{ left: "72%", transform: "translateX(-50%)" }}
            aria-hidden
          >
            <div
              className="px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap"
              style={{
                background: T.pink,
                color: "#fff",
                letterSpacing: "0.04em",
                boxShadow: "0 2px 6px rgba(214,138,150,0.4)",
              }}
            >
              {clientConfig.clientName} · 10%
            </div>
            <div className="w-px mx-auto mt-0.5" style={{ height: 8, background: T.pink }} />
          </div>
        </div>
        <div className="relative h-2.5">
          <div className="absolute inset-0 rounded-full" style={{ background: "#f1ece0" }} />
          {[0, 50, 100].map((p) => (
            <span
              key={p}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${p}%`, background: T.gold, opacity: 0.55 }}
            />
          ))}
        </div>
        <div
          className="flex justify-between text-[9px] uppercase font-semibold"
          style={{ color: T.inkSoft, letterSpacing: "0.16em" }}
        >
          <span>LQ</span>
          <span>Median</span>
          <span>UQ</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[
            { l: "LQ", v: "5%", desc: "Statutory min" },
            { l: "Median", v: "6%", desc: "Market norm" },
            { l: "UQ", v: "8%", desc: "Top quartile", highlight: true },
          ].map((q) => (
            <div
              key={q.l}
              className="rounded-lg px-2.5 py-1.5 flex flex-col items-start"
              style={{
                background: q.highlight ? T.pinkWash : "#faf6ec",
                border: `1px solid ${q.highlight ? "#ead4d7" : "#ece6da"}`,
              }}
            >
              <span
                className="text-[16px] font-bold leading-none tabular-nums"
                style={{ color: q.highlight ? T.pink : T.navy }}
              >
                {q.v}
              </span>
              <span className="text-[8.5px] mt-1" style={{ color: T.inkSoft }}>
                {q.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BenefitsSlideTable() {
  const T = BENEFITS_TINTS;
  const rows = [
    { label: "Annual leave", lq: "25 days", med: "27 days", uq: "30 days", hover: true },
    { label: "Pension contribution", lq: "5%", med: "6%", uq: "8%", hover: false },
    { label: "Private medical", lq: "Self", med: "Self", uq: "Self + family", hover: false },
    { label: "Parental leave", lq: "16 wks", med: "16 wks", uq: "20 wks", hover: false },
  ];
  return (
    <div
      className="h-full rounded-xl overflow-hidden flex flex-col"
      style={{ background: "#fff", border: "1px solid #ece6da" }}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: T.cream, borderBottom: "1px solid #ece6da" }}
      >
        <span
          className="text-[10px] font-semibold uppercase"
          style={{ color: T.navy, letterSpacing: "0.16em" }}
        >
          Market comparison
        </span>
        <span className="text-[9.5px]" style={{ color: T.inkSoft }}>
          {BENEFITS_META.employersInDataset} employers
        </span>
      </div>
      <div
        className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-[10px] font-bold uppercase"
        style={{ letterSpacing: "0.12em" }}
      >
        <div className="px-3 py-2" style={{ background: T.navy, color: "#fff" }}>
          Benefit
        </div>
        <div className="px-3 py-2 text-center" style={{ background: "#2a3d5a", color: "#fff" }}>
          LQ
        </div>
        <div
          className="px-3 py-2 flex items-center justify-center gap-1"
          style={{ background: T.gold, color: T.navy }}
        >
          <Star className="w-2.5 h-2.5" />
          Median
        </div>
        <div className="px-3 py-2 text-center" style={{ background: T.slate, color: "#fff" }}>
          UQ
        </div>
      </div>
      <div className="flex-1 divide-y" style={{ borderColor: "#ece6da" }}>
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-[10.5px] items-center"
            style={{ background: r.hover ? T.pinkWash : "transparent" }}
          >
            <div className="px-3 py-2 font-semibold truncate" style={{ color: T.navy }}>
              {r.label}
            </div>
            <div className="px-3 py-2 text-center tabular-nums" style={{ color: T.inkSoft }}>
              {r.lq}
            </div>
            <div className="px-3 py-2 text-center font-semibold tabular-nums" style={{ color: T.navy }}>
              {r.med}
            </div>
            <div className="px-3 py-2 text-center tabular-nums" style={{ color: T.inkSoft }}>
              {r.uq}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitsSlideStrengthsWatch() {
  const T = BENEFITS_TINTS;
  const strengths = [
    "Pension at 10% — top quartile",
    "Private medical for self + family",
    "Hybrid working policy",
    "20-week parental leave",
  ];
  const watch = [
    "Wellness budget below median",
    "Learning allowance modest",
    "Annual leave at 25 days",
  ];
  return (
    <div className="h-full grid grid-cols-2 gap-3">
      <div
        className="rounded-xl p-3.5 flex flex-col"
        style={{ background: T.sageWash, border: "1px solid #d3e1ce" }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Star className="w-3 h-3" style={{ color: T.sage }} />
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: T.sage, letterSpacing: "0.16em" }}
          >
            Headline strengths
          </span>
        </div>
        <div
          className="text-[13.5px] font-semibold mb-2.5 leading-tight"
          style={{ color: T.navy, letterSpacing: "-0.005em" }}
        >
          Where you lead
        </div>
        <ul className="space-y-1.5 flex-1">
          {strengths.map((s) => (
            <li
              key={s}
              className="text-[10.5px] leading-snug flex gap-1.5"
              style={{ color: T.inkDeep }}
            >
              <span className="shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: T.sage }} />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="rounded-xl p-3.5 flex flex-col"
        style={{ background: T.pinkWash, border: "1px solid #ead4d7" }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Activity className="w-3 h-3" style={{ color: T.pink }} />
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ color: T.pink, letterSpacing: "0.16em" }}
          >
            Areas to watch
          </span>
        </div>
        <div
          className="text-[13.5px] font-semibold mb-2.5 leading-tight"
          style={{ color: T.navy, letterSpacing: "-0.005em" }}
        >
          Closer look needed
        </div>
        <ul className="space-y-1.5 flex-1">
          {watch.map((w) => (
            <li
              key={w}
              className="text-[10.5px] leading-snug flex gap-1.5"
              style={{ color: T.inkDeep }}
            >
              <span className="shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: T.pink }} />
              {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section card — june's `SectionCard` pattern, with carousel embedded.

interface SectionCardProps {
  eyebrow: string;
  title: string;
  oneLiner: string;
  scope: string;
  bullets: string[];
  icon: typeof LineChart;
  slides: Slide[];
  accent: string;
  ctaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  disabledNote?: string;
  delay: number;
}

function SectionCard({
  eyebrow,
  title,
  oneLiner,
  scope,
  bullets,
  icon: Icon,
  slides,
  accent,
  ctaLabel,
  onClick,
  disabled,
  disabledNote,
  delay,
}: SectionCardProps) {
  return (
    <div
      className={`ts-premium-card ts-glow-host ts-anim-fade-up p-7 lg:p-8 h-full flex flex-col overflow-hidden ${
        disabled ? "opacity-60" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header — icon + eyebrow */}
      <div className="flex items-center justify-between gap-3 mb-5 relative">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: `${accent}15`,
              border: `1px solid ${accent}30`,
            }}
          >
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <span
            className="text-[10.5px] font-semibold uppercase"
            style={{ color: C.brass, letterSpacing: "0.22em" }}
          >
            {eyebrow}
          </span>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: C.surfaceSoft, border: `1px solid ${C.borderSubtle}` }}
        >
          <CalendarClock className="w-3 h-3" style={{ color: C.inkMuted, opacity: 0.8 }} />
          <span
            className="text-[10.5px] font-semibold"
            style={{ color: C.ink, letterSpacing: "0.02em" }}
          >
            {REPORT_PERIOD}
          </span>
        </div>
      </div>

      {/* Title + one-liner */}
      <h2
        className="ts-display text-[40px] lg:text-[48px] mb-3 relative"
        style={{ color: C.ink }}
      >
        {title}
      </h2>
      <p
        className="text-[15px] mb-2 leading-relaxed relative"
        style={{ color: C.brassDeep, fontWeight: 500 }}
      >
        {oneLiner}
      </p>
      <p
        className="text-[14px] leading-relaxed mb-6 relative"
        style={{ color: C.inkMuted }}
      >
        {scope}
      </p>

      {/* Carousel */}
      <div className="mb-6 relative">
        <Carousel slides={slides} accent={accent} />
      </div>

      {/* Checkmark bullets */}
      <ul className="space-y-2.5 mb-7 relative">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2.5 text-[13.5px] leading-snug"
            style={{ color: C.inkMuted }}
          >
            <CheckCircle2
              className="w-[15px] h-[15px] shrink-0 mt-[2px]"
              style={{ color: disabled ? "#bfb39a" : C.brass }}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* Gold gradient CTA */}
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        title={disabled ? disabledNote : undefined}
        className="ts-gold-cta group/btn relative w-full h-12 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 mt-auto"
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          border: 0,
        }}
      >
        {disabled ? (disabledNote ?? "Coming soon") : ctaLabel}
        {!disabled && (
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero status pill — pulsing gold dot

function StatusPill() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1"
      style={{
        background: "rgba(201,168,76,0.12)",
        border: "1px solid rgba(201,168,76,0.3)",
        color: C.brassDeep,
      }}
    >
      <span className="relative inline-flex w-2 h-2" aria-hidden>
        <span
          className="absolute inline-flex w-full h-full rounded-full animate-ping"
          style={{ background: C.brass, opacity: 0.55 }}
        />
        <span
          className="relative inline-flex w-2 h-2 rounded-full"
          style={{ background: C.brass }}
        />
      </span>
      <span
        className="text-[10.5px] font-semibold uppercase"
        style={{ letterSpacing: "0.2em" }}
      >
        {REPORT_PERIOD} · {clientConfig.sampleData ? "Sample data" : "Live"}
      </span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlights row

interface HighlightProps {
  eyebrow: string;
  headline: string;
  body: string;
  accent: string;
}

function Highlight({ eyebrow, headline, body, accent }: HighlightProps) {
  return (
    <div
      className="ts-premium-card ts-glow-host p-6 flex flex-col h-full overflow-hidden relative"
      style={{ borderRadius: 24 }}
    >
      <div
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full"
        style={{ background: accent }}
        aria-hidden
      />
      <div
        className="text-[10px] font-semibold uppercase mb-2 pl-3 relative"
        style={{ color: accent, letterSpacing: "0.22em" }}
      >
        {eyebrow}
      </div>
      <div
        className="ts-display text-[20px] mb-2 pl-3 relative"
        style={{ color: C.ink, fontWeight: 700, letterSpacing: "-0.025em" }}
      >
        {headline}
      </div>
      <div className="text-[13px] leading-relaxed pl-3 relative" style={{ color: C.inkMuted }}>
        {body}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hot bar — 6 dashboard tiles

/** Refined quartile band — wider track, brighter highlighted segment with a
 *  drop-shadow glow, a dot pinned at the right edge of the highlight to act
 *  as a "you are here" indicator, and uppercase LQ/Med/UQ ticks underneath. */
function PositionBand({
  from,
  to,
  accent,
}: {
  from: number;
  to: number;
  accent: string;
}) {
  return (
    <div className="w-full">
      <div
        className="relative h-2.5 rounded-full"
        style={{
          background: "#ece6da",
          boxShadow: "inset 0 1px 1px rgba(10,25,41,0.06)",
        }}
      >
        {/* Quartile ticks at LQ (0), Median (50), UQ (100) */}
        {[0, 50, 100].map((p) => (
          <span
            key={p}
            className="absolute -top-1 -bottom-1 w-px"
            style={{ left: `${p}%`, background: "rgba(10,25,41,0.18)" }}
            aria-hidden
          />
        ))}
        {/* Highlighted segment with a soft glow */}
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${from}%`,
            width: `${to - from}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}dd)`,
            boxShadow: `0 0 12px ${accent}55, 0 1px 3px ${accent}66`,
          }}
        />
        {/* "You are here" dot at the leading edge of the highlight */}
        <span
          className="absolute"
          style={{
            left: `${to}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#fff",
            border: `2px solid ${accent}`,
            boxShadow: `0 0 0 2px ${C.surface}, 0 2px 5px ${accent}99`,
          }}
          aria-hidden
        />
      </div>
      <div
        className="flex justify-between text-[8.5px] mt-2 font-semibold"
        style={{ color: C.inkSubtle, letterSpacing: "0.12em" }}
      >
        <span>LQ</span>
        <span>MED</span>
        <span>UQ</span>
      </div>
    </div>
  );
}

/** Inline sparkline — tiny line chart with a soft area fill underneath and
 *  a dot at the latest point. Used for Median pay trend. */
function Sparkline({ values, accent }: { values: number[]; accent: string }) {
  const w = 100;
  const h = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.001, max - min);
  const step = w / (values.length - 1);
  const points = values.map((v, i) => ({
    x: i * step,
    y: h - 3 - ((v - min) / range) * (h - 5),
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-${accent.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${accent.replace("#", "")})`} />
      <path d={line} stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2" fill="#fff" stroke={accent} strokeWidth="1.5" />
    </svg>
  );
}

/** Quarter-status pill — a pulsing green dot + "LIVE" label. Sits inside the
 *  Quarter hot-bar tile in place of an icon, signalling that the report is
 *  live and fresh. */
function LivePill() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1"
      style={{
        background: "rgba(21,128,61,0.1)",
        border: "1px solid rgba(21,128,61,0.25)",
      }}
    >
      <span className="relative inline-flex w-1.5 h-1.5" aria-hidden>
        <span
          className="absolute inline-flex w-full h-full rounded-full animate-ping"
          style={{ background: C.success, opacity: 0.6 }}
        />
        <span
          className="relative inline-flex w-1.5 h-1.5 rounded-full"
          style={{ background: C.success }}
        />
      </span>
      <span
        className="text-[8.5px] font-bold uppercase"
        style={{ color: C.success, letterSpacing: "0.18em" }}
      >
        Live
      </span>
    </div>
  );
}

interface HotTileProps {
  icon?: typeof Briefcase;
  eyebrow: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" };
  band?: { from: number; to: number };
  sparkline?: number[];
  accent: string;
  /** Show the LIVE pulse in place of the icon (Quarter tile). */
  live?: boolean;
  delay?: number;
}

function HotTile({
  icon: Icon,
  eyebrow,
  value,
  caption,
  trend,
  band,
  sparkline,
  accent,
  live,
  delay = 0,
}: HotTileProps) {
  return (
    <div
      className="relative px-5 py-4 flex-1 min-w-[180px] flex flex-col gap-2.5 ts-anim-fade-up overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top accent rule */}
      <div
        className="absolute top-0 left-5 right-5 h-[2px] rounded-b-full"
        style={{
          background: `linear-gradient(90deg, ${accent}, ${accent}55, transparent)`,
        }}
        aria-hidden
      />

      {/* Header: icon or LIVE pill + eyebrow */}
      <div className="flex items-center gap-2">
        {live ? (
          <LivePill />
        ) : Icon ? (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${accent}15`,
              border: `1px solid ${accent}33`,
            }}
          >
            <Icon className="w-[13px] h-[13px]" style={{ color: accent }} />
          </div>
        ) : null}
        <span
          className="text-[9.5px] font-semibold uppercase truncate"
          style={{ color: C.inkMuted, letterSpacing: "0.2em" }}
        >
          {eyebrow}
        </span>
      </div>

      {/* Value + trend */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <div
          className="text-[22px] font-bold leading-none tabular-nums"
          style={{ color: C.ink, letterSpacing: "-0.025em" }}
        >
          {value}
        </div>
        {trend && (
          <span
            className="inline-flex items-center text-[10.5px] font-semibold rounded-full px-1.5 py-0.5"
            style={{
              color: trend.direction === "up" ? C.success : C.warning,
              background:
                trend.direction === "up"
                  ? "rgba(21,128,61,0.12)"
                  : "rgba(180,83,9,0.12)",
            }}
          >
            <ArrowUpRight
              className="w-2.5 h-2.5"
              style={{ transform: trend.direction === "down" ? "rotate(90deg)" : "none" }}
            />
            {trend.value}
          </span>
        )}
      </div>

      {/* Bottom: band / sparkline / caption */}
      {band ? (
        <PositionBand from={band.from} to={band.to} accent={accent} />
      ) : sparkline ? (
        <Sparkline values={sparkline} accent={accent} />
      ) : (
        <div
          className="text-[11px] truncate leading-tight"
          style={{ color: C.inkSubtle }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}

function HotBar() {
  // Pay group uses gold; Benefits group uses sage — colour coding so the
  // user can see at a glance which side of the report each stat belongs to.
  const tiles: HotTileProps[] = [
    {
      eyebrow: "Quarter",
      value: REPORT_PERIOD,
      caption: `Refreshed ${LAST_UPDATED}`,
      accent: C.brass,
      live: true,
      delay: 0,
    },
    {
      icon: Briefcase,
      eyebrow: "Roles benchmarked",
      value: PAY_META.rolesAnalysed.toString(),
      caption: "Fully in scope",
      accent: C.brass,
      delay: 60,
    },
    {
      icon: TrendingUp,
      eyebrow: "Median pay",
      value: PAY_META.medianPay,
      trend: { value: PAY_META.medianPayChange, direction: "up" },
      sparkline: [48.0, 48.6, 49.4, 50.2, 50.8, 51.6, 52.4],
      accent: C.brass,
      delay: 120,
    },
    {
      icon: LineChart,
      eyebrow: "Pay position",
      value: PAY_META.positionLabel,
      band: { from: PAY_META.positionFrom, to: PAY_META.positionTo },
      accent: C.brass,
      delay: 180,
    },
    {
      icon: Gift,
      eyebrow: "Benefits recorded",
      value: BENEFITS_META.recorded.toString(),
      caption: `Across ${BENEFITS_META.categories} categories`,
      accent: C.sage,
      delay: 240,
    },
    {
      icon: Star,
      eyebrow: "Benefits position",
      value: BENEFITS_META.positionLabel,
      band: { from: BENEFITS_META.positionFrom, to: BENEFITS_META.positionTo },
      accent: C.sage,
      delay: 300,
    },
  ];

  return (
    <div
      className="relative rounded-2xl flex flex-wrap items-stretch overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #fbf9f3 100%)",
        border: `1px solid ${C.border}`,
        boxShadow:
          "0 1px 2px hsl(214 25% 15% / 0.04), 0 16px 40px -20px hsl(214 25% 15% / 0.14)",
      }}
    >
      {tiles.map((t, i) => {
        // Visual break between the Pay group (tiles 0-3) and the Benefits
        // group (tiles 4-5): a slightly thicker divider with a tiny accent
        // dot — quiet but legible.
        const isGroupBreak = i === 3;
        return (
          <div
            key={t.eyebrow}
            className="relative flex items-stretch"
            style={{
              borderRight:
                i === tiles.length - 1
                  ? "none"
                  : `1px solid ${C.borderSubtle}`,
              flex: 1,
              minWidth: 180,
            }}
          >
            <HotTile {...t} />
            {isGroupBreak && (
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: C.brassDeep, opacity: 0.4 }}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home

export function Home() {
  const { signOut, user, tempUser } = useAuth();

  const username =
    (user?.email && user.email.split("@")[0]) ??
    tempUser?.username ??
    clientConfig.clientName.toLowerCase();
  const email = user?.email ?? clientNameToEmail(username);

  const goToPay = () => {
    window.location.href = "/pay/";
  };
  const goToBenefits = () => {
    window.location.href = "/benefits/";
  };

  const paySlides: Slide[] = [
    { key: "gem", node: <PaySlideGemGrid />, caption: "Where you can explore inside Pay", pageRef: "Executive summary" },
    { key: "role", node: <PaySlideRoleBar />, caption: "Salary position, role by role", pageRef: "Role details" },
    { key: "function", node: <PaySlideFunctionBars />, caption: "How each function sits vs market", pageRef: "Position by function" },
    { key: "market", node: <PaySlideMarketBento />, caption: "Headline UK market indicators", pageRef: "Market overview" },
  ];

  const benefitsSlides: Slide[] = [
    { key: "strip", node: <BenefitsSlideProvisionStrip />, caption: "Your provision at a glance", pageRef: "Provision summary" },
    { key: "pos", node: <BenefitsSlidePositioning />, caption: "Where you sit on each benefit", pageRef: "Positioning panel" },
    { key: "table", node: <BenefitsSlideTable />, caption: "Side-by-side market comparison", pageRef: "Comparison table" },
    { key: "sw", node: <BenefitsSlideStrengthsWatch />, caption: "Headline strengths & areas to watch", pageRef: "Highlights" },
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col ts-canvas ts-sans"
      style={{ color: C.ink }}
    >
      <Shell
        username={username}
        email={email}
        active="home"
        onSignOut={() => {
          void signOut();
        }}
      />

      <main
        className="flex-1 w-full px-6 lg:px-10 pb-20"
        style={{ paddingTop: 60 }}
      >
        <div className="max-w-[1240px] mx-auto pt-14 lg:pt-20">
          {/* Hero */}
          <div
            className="ts-anim-fade-up max-w-[820px]"
            style={{ animationDelay: "0ms" }}
          >
            <div className="mb-5 flex items-center gap-3 flex-wrap">
              <StatusPill />
              <span
                className="text-[10.5px] font-semibold uppercase"
                style={{ color: C.inkMuted, letterSpacing: "0.22em" }}
              >
                {greeting()}, {username}
              </span>
            </div>
            <h1
              className="ts-display text-[56px] lg:text-[80px] mb-5"
              style={{ color: C.ink }}
            >
              Your reward intelligence.
            </h1>
            <p
              className="text-[16px] lg:text-[17px] max-w-[62ch] leading-relaxed"
              style={{ color: C.inkMuted }}
            >
              {PAY_META.rolesAnalysed} roles benchmarked, {BENEFITS_META.employersInDataset} employers
              in your benefits dataset, refreshed{" "}
              <strong style={{ color: C.ink, fontWeight: 600 }}>{LAST_UPDATED}</strong>.
              Pick a section to dive in — Pay and Benefits live below.
            </p>
          </div>

          {/* Hot bar — 6 stats with embedded position bands */}
          <div
            className="mt-10 ts-anim-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <HotBar />
          </div>

          {/* Section cards */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
            <SectionCard
              eyebrow="01 — Pay"
              title="Pay"
              oneLiner="Where you sit on pay, role by role."
              scope={`Market data and benchmarks across ${PAY_META.employersInDataset} employers — quartile position, trends, and hotspots.`}
              bullets={[
                `${PAY_META.rolesAnalysed} roles benchmarked, fully in scope`,
                "Quartile position, role-by-role analysis",
                `Last refreshed ${PAY_META.lastRefresh}`,
              ]}
              icon={LineChart}
              slides={paySlides}
              accent={C.brass}
              ctaLabel="Open Pay report"
              onClick={goToPay}
              delay={240}
            />
            <SectionCard
              eyebrow="02 — Benefits"
              title="Benefits"
              oneLiner="Your benefits offer, through the market's eyes."
              scope={`Benchmarked across ${BENEFITS_META.employersInDataset} employers and ${BENEFITS_META.categories} categories — where you over- or under-provide.`}
              bullets={[
                `${BENEFITS_META.employersInDataset} employers, ${BENEFITS_META.categories} categories`,
                "Where you over- or under-provide",
                `Last refreshed ${BENEFITS_META.lastRefresh}`,
              ]}
              icon={Gift}
              slides={benefitsSlides}
              accent={C.brass}
              ctaLabel="Open Benefits report"
              onClick={goToBenefits}
              disabled={!clientConfig.benefitsEnabled}
              disabledNote="Not in this package"
              delay={360}
            />
          </div>

          {/* Highlights row */}
          <div
            className="mt-14 ts-anim-fade-up"
            style={{ animationDelay: "480ms" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className="text-[10.5px] font-semibold uppercase"
                style={{ color: C.brass, letterSpacing: "0.28em" }}
              >
                Highlights this quarter
              </div>
              <span className="text-[10.5px]" style={{ color: C.inkSubtle }}>
                Auto-extracted from your reports
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Highlight
                eyebrow="Pay momentum"
                headline={`${PAY_META.medianPayChange} median pay vs Q1`}
                body="Engineering and Product saw the largest movements. Three roles climbed a quartile this quarter."
                accent={C.sage}
              />
              <Highlight
                eyebrow="Benefits strength"
                headline="81% health coverage — above market"
                body="Your private medical and parental leave outpace the market median by a clear margin."
                accent={C.rose}
              />
              <Highlight
                eyebrow="Watchlist"
                headline="2 roles slipped below market"
                body="Worth a closer look in the role-by-role view — both sit just below Q2 with rising market rates."
                accent={C.plum}
              />
            </div>
          </div>
        </div>
      </main>

      <footer
        className="w-full px-6 lg:px-10 py-6 flex items-center justify-between"
        style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
      >
        <div className="text-[11px] tracking-wide" style={{ color: C.inkMuted }}>
          Powered by{" "}
          <a
            href="https://www.twentysixconsulting.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
            style={{ color: C.ink }}
          >
            TwentySix Consulting
          </a>
        </div>
        <div className="text-[11px]" style={{ color: C.inkMuted }}>
          © {new Date().getFullYear()} · {clientConfig.clientName}
        </div>
      </footer>
    </div>
  );
}
