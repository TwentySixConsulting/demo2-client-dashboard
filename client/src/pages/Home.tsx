// Platform Home — a dashboard control-centre, deliberately kept to three things:
//
//   1. SNAPSHOT   where the client's reward position stands this quarter
//   2. THE THREE AREAS  Pay · Benefits · Organisation, front and centre, each
//      carrying a live chart preview of what is inside it
//   3. WHAT NEEDS ATTENTION  the ranked list of things worth acting on
//
// It used to carry six sections (adding Quick actions, Activity & status and a
// separate chart band) and read as busy. Quick actions' four destinations are all
// still one click away through the three area boxes and the attention rows, and
// the charts moved INSIDE the boxes rather than sitting in a band of their own —
// which is what the three areas being "front and centre" actually requires.
//
// All numbers are LIVE, derived from useRoster/orgStore, so edits made in Your
// Organisation flow straight through to here.
import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { clientConfig, clientNameToEmail } from "@/config/clientConfig";
import { Shell } from "@/components/Shell";
import { C, REPORT_PERIOD, LAST_UPDATED, SUBSCRIPTION } from "@/lib/theme";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import { BenefitsMix, PayTrend } from "@/components/HomeCharts";
import { SlideDeck } from "@/components/SlideDeck";
import { RolePositionCounts, PayByFunction, BenefitsByCategory, OrgFunctionBars } from "@/components/HomePreviews";
import { companyInfo } from "@/lib/data";
import { useRoster } from "@/lib/roster";
import { useOrgRoles, useOrgBenefits, useBenefitOverrides } from "@/lib/orgStore";
import { BENEFIT_CATEGORIES, ESTABLISHED_BENEFITS, benefitsSummary } from "@/lib/orgData";
import {
  LineChart, Gift, Building2, ArrowRight, Check, AlertTriangle, AlertCircle,
  Layers, Clock, Users, RefreshCw, CalendarDays,
  type LucideIcon,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const GOOD = "#2F7D5B", GOOD_BG = "rgba(47,125,91,0.10)";
const WATCH = "#B7791F", WATCH_BG = "rgba(183,121,31,0.10)";
const ACTION = "#C0392B", ACTION_BG = "rgba(192,57,43,0.10)";
type Sev = "good" | "watch" | "action";
const SEV: Record<Sev, { fg: string; bg: string; Icon: LucideIcon }> = {
  good: { fg: GOOD, bg: GOOD_BG, Icon: Check },
  watch: { fg: WATCH, bg: WATCH_BG, Icon: AlertTriangle },
  action: { fg: ACTION, bg: ACTION_BG, Icon: AlertCircle },
};
const gbpK = (n: number) => (Math.abs(n) >= 1000 ? `£${(n / 1000).toFixed(1)}k` : `£${Math.round(n)}`);

// Time-aware greeting. Addresses the ORGANISATION, not the signed-in username —
// the demo account's username is the lowercase string "brighton technologies",
// which would render as-is and look like a bug.
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// Shared slide-viewport height for all three cards, set from the tallest slide
// (the pay-rise line chart). Fixed so switching slide never reflows a card, and
// shared so the three cards stay the same height as each other.
const DECK_H = 194;

// The three areas, in the order they are presented. Each gets its own accent so
// the boxes are tellable apart at a glance: clay for Pay (the primary brand
// accent, and the area clients open first), slate for Benefits, deep slate for
// Organisation. Numbered 01/02/03 like the marketing site's pillar cards.
const AREA_ACCENT = {
  pay: { fg: "#B0603F", tint: "#F4E2D9" },
  benefits: { fg: "#5C6D8A", tint: "#DEE4EC" },
  org: { fg: "#44536B", tint: "#E2E6EC" },
} as const;

export function Home() {
  const { signOut, user, tempUser } = useAuth();
  const [, setLocation] = useLocation();
  const username = (user?.email && user.email.split("@")[0]) ?? tempUser?.username ?? clientConfig.clientName.toLowerCase();
  const email = user?.email ?? clientNameToEmail(username);

  const roster = useRoster();
  const orgRoles = useOrgRoles();
  const orgBenefits = useOrgBenefits();
  const benefitOverrides = useBenefitOverrides();

  const goToPay = () => { window.location.href = `${BASE}pay/`; };
  const goToBenefits = () => { window.location.href = `${BASE}benefits/`; };
  const goToOrg = () => setLocation("/organisation");

  const m = useMemo(() => {
    const n = roster.length || 1;
    const avgDiffPct = roster.reduce((s, r) => s + r.diffPct, 0) / n;
    const belowLQ = roster.filter((r) => r.positioning.position === "below");
    const belowMed = roster.filter((r) => r.positioning.position === "below" || r.positioning.position === "lower");
    const headcount = roster.reduce((s, r) => s + r.headcount, 0) + orgRoles.reduce((s, r) => s + (r.headcount || 0), 0);
    const rolesTotal = roster.length + orgRoles.length;
    const bs = benefitsSummary();
    const reviewCount = Object.keys(benefitOverrides).length;
    const awaiting = orgRoles.length + orgBenefits.length + reviewCount;
    // Distribution of roles across the four market bands (drives the hero chart).
    const bands = { below: 0, lower: 0, upper: 0, above: 0 } as Record<string, number>;
    roster.forEach((r) => { bands[r.positioning.position] = (bands[r.positioning.position] ?? 0) + 1; });
    return { avgDiffPct, belowLQ, belowMed, headcount, rolesTotal, bs, awaiting, bands };
  }, [roster, orgRoles, orgBenefits, benefitOverrides]);

  // Combined, ranked attention feed
  const alerts = useMemo(() => {
    type A = { id: string; sev: Sev; title: string; detail: string; metric: number; go: () => void };
    const out: A[] = [];
    m.belowLQ.slice().sort((a, b) => (a.median - a.currentSalary) - (b.median - b.currentSalary)).reverse().forEach((r) =>
      out.push({ id: `role-${r.id}`, sev: "action", title: `${r.role} is ${gbpK(r.median - r.currentSalary)} below the market median`, detail: `${r.function} · below the lower quartile`, metric: r.median - r.currentSalary, go: goToPay }),
    );
    ESTABLISHED_BENEFITS.filter((b) => b.badge === "below").forEach((b) =>
      out.push({ id: `ben-${b.name}`, sev: "action", title: `${b.name} is below market`, detail: `${b.category} · a benefits gap to review`, metric: 1, go: goToBenefits }),
    );
    const belowMedNotLQ = m.belowMed.length - m.belowLQ.length;
    if (belowMedNotLQ > 0) out.push({ id: "below-med", sev: "watch", title: `${belowMedNotLQ} more role${belowMedNotLQ > 1 ? "s" : ""} pay below the market median`, detail: "Between the lower quartile and median", metric: 0, go: goToPay });
    ESTABLISHED_BENEFITS.filter((b) => b.badge === "watch").forEach((b) =>
      out.push({ id: `benw-${b.name}`, sev: "watch", title: `${b.name} is mixed vs market`, detail: `${b.category} · worth a closer look`, metric: 0, go: goToBenefits }),
    );
    if (m.awaiting > 0) out.push({ id: "awaiting", sev: "watch", title: `${m.awaiting} item${m.awaiting > 1 ? "s" : ""} awaiting benchmark`, detail: "With your TwentySix consultant", metric: 0, go: goToOrg });
    const rank = { action: 0, watch: 1, good: 2 };
    return out.sort((a, b) => rank[a.sev] - rank[b.sev] || b.metric - a.metric).slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  const payTone: Sev = m.avgDiffPct >= 0 ? "good" : m.belowLQ.length ? "action" : "watch";
  const verdict = `Pay sits ${Math.abs(m.avgDiffPct).toFixed(1)}% ${m.avgDiffPct >= 0 ? "above" : "below"} the market median` +
    (m.belowMed.length ? `, with ${m.belowMed.length} of ${roster.length} role${m.belowMed.length > 1 ? "s" : ""} to review` : "") +
    `. Benefits are ${m.bs.atOrAbove >= m.bs.total * 0.7 ? "strong" : "mixed"}, with ${m.bs.atOrAbove} of ${m.bs.total} at or above market.`;

  return (
    <div className="min-h-screen w-full flex flex-col ts-canvas ts-sans" style={{ color: C.ink }}>
      <Shell username={username} email={email} active="home" onSignOut={() => { void signOut(); }} />

      <main className="flex-1 w-full px-6 lg:px-10 pb-16" style={{ paddingTop: 60 }}>
        <div className="max-w-[1180px] mx-auto pt-9 lg:pt-11 space-y-7 ts-anim-fade-up">

          {/* "Getting started" tour checklist — populated by shell/tour.js, empty until then.
              Sits above the masthead so a new client meets it first. */}
          <div data-zigbert-tour-checklist />

          {/* ── 1. Snapshot ─────────────────────────────────────────────── */}
          <div>
            <SectionLabel>Snapshot</SectionLabel>
            <div data-tour="hero" className="ts-hero rounded-[28px] px-6 py-6 lg:px-8 lg:py-7">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: C.inkMuted }}>
                <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {REPORT_PERIOD}</span>
                <span style={{ color: C.inkSubtle }}>·</span>
                <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Updated {LAST_UPDATED}</span>
                <span style={{ color: C.inkSubtle }}>·</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: C.brassSoft, color: C.brassDeep, fontWeight: 600 }}>{SUBSCRIPTION.tier}</span>
                <SampleDataBadge />
              </div>

              <div className="mt-4 flex flex-col xl:flex-row xl:items-start gap-6 xl:gap-9">
                <div className="min-w-0 flex-1">
                  <h1 className="ts-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>
                    <span style={{ color: C.inkMuted, fontWeight: 600 }}>{greeting()},</span> {companyInfo.name}
                  </h1>
                  <p className="mt-2 text-[14px] leading-relaxed max-w-xl" style={{ color: C.inkMuted }}>{verdict}</p>
                  <div className="flex flex-wrap gap-7 lg:gap-9 mt-5">
                    <HeroStat label="Pay vs market" value={`${m.avgDiffPct >= 0 ? "+" : ""}${m.avgDiffPct.toFixed(1)}%`} tone={payTone} />
                    <HeroStat label="Headcount" value={String(m.headcount)} sub={`${m.rolesTotal} roles`} />
                    <HeroStat label="Awaiting" value={String(m.awaiting)} sub={m.awaiting ? "with consultant" : "all benchmarked"} tone={m.awaiting ? "watch" : "good"} />
                  </div>
                </div>
                {/* How many roles sit below, at and above market. Dropped below
                    xl rather than allowed to cramp the stat row. */}
                <div className="hidden xl:block shrink-0 w-[352px] xl:pl-9 xl:border-l" style={{ borderColor: C.borderSubtle }}>
                  <RolePositionCounts bands={m.bands} total={roster.length} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. The three areas — front and centre ────────────────────── */}
          <div data-tour="explore" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Each card was stacking a headline plus two graphics, which read as
                crowded. The graphics now sit in a SlideDeck: one at a time, with
                named tabs so the second is discoverable rather than buried, and
                movement only when the reader asks for it. DECK_H is shared so all
                three cards keep the same height whichever slide is showing. */}
            <AreaCard
              num="01" tag="Pay" icon={LineChart} accent={AREA_ACCENT.pay}
              oneLiner="Where you sit on pay, role by role."
              onClick={goToPay}
            >
              <SlideDeck idBase="pay" height={DECK_H} accent={AREA_ACCENT.pay.fg} slides={[
                { label: "By function", node: <PayByFunction roster={roster} avgDiffPct={m.avgDiffPct} /> },
                { label: "Pay rises", node: <PayTrend /> },
              ]} />
            </AreaCard>

            <AreaCard
              num="02" tag="Benefits" icon={Gift} accent={AREA_ACCENT.benefits}
              oneLiner="Where your benefits stand, category by category."
              onClick={goToBenefits} disabled={!clientConfig.benefitsEnabled}
            >
              <SlideDeck idBase="ben" height={DECK_H} accent={AREA_ACCENT.benefits.fg} slides={[
                { label: "Overall", node: <BenefitsMix atOrAbove={m.bs.atOrAbove} watch={m.bs.watch} below={m.bs.below} total={m.bs.total} /> },
                { label: "By category", node: <BenefitsByCategory /> },
              ]} />
            </AreaCard>

            <AreaCard
              num="03" tag="Organisation" icon={Building2} accent={AREA_ACCENT.org}
              oneLiner="Your roles, people and benefits, kept up to date."
              onClick={goToOrg}
            >
              <SlideDeck idBase="org" height={DECK_H} accent={AREA_ACCENT.org.fg} slides={[
                { label: "People", node: <OrgFunctionBars roster={roster} /> },
                { label: "What's in here", node: (
                  <div>
                    <div className="font-display font-bold mb-3.5" style={{ fontSize: 19, color: C.ink, lineHeight: 1.15 }}>
                      {m.headcount} <span className="text-[12.5px] font-medium" style={{ color: C.inkMuted }}>people across {m.rolesTotal} roles</span>
                    </div>
                    <div className="space-y-2.5">
                      <OrgRow icon={Users} label="Roles benchmarked" value={String(m.rolesTotal)} />
                      <OrgRow icon={Layers} label={`Benefits · ${BENEFIT_CATEGORIES.length} categories`} value={String(m.bs.total)} />
                      <OrgRow icon={Clock} label={m.awaiting ? "Awaiting benchmark" : "All benchmarked"} value={m.awaiting ? String(m.awaiting) : "✓"} />
                    </div>
                  </div>
                ) },
              ]} />
            </AreaCard>
          </div>

          {/* ── 3. What needs attention ─────────────────────────────────── */}
          <div data-tour="attention">
            <SectionLabel>What needs attention</SectionLabel>
            <div className="space-y-2">
              {alerts.length === 0 && <div className="ts-premium-card p-5 text-[13px]" style={{ color: C.inkMuted }}>Nothing needs attention. Pay and benefits are at or above market.</div>}
              {alerts.map((a) => {
                const s = SEV[a.sev];
                return (
                  <button key={a.id} onClick={a.go} className="ts-premium-card ts-glow-host ts-nudge relative overflow-hidden w-full text-left pl-5 pr-4 py-3.5 flex items-center gap-3">
                    <span className="absolute top-0 bottom-0 left-0 w-[3px]" style={{ background: s.fg }} aria-hidden />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: s.bg, color: s.fg, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}><s.Icon className="w-4 h-4" /></span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] font-semibold" style={{ color: C.ink }}>{a.title}</span>
                      <span className="block text-[12px] mt-0.5" style={{ color: C.inkMuted }}>{a.detail}</span>
                    </span>
                    <ArrowRight className="ts-arrow w-4 h-4 shrink-0" style={{ color: C.inkSubtle }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-2" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div className="text-[11px] tracking-wide" style={{ color: C.inkMuted }}>
          Powered by{" "}
          <a href="https://www.twentysixconsulting.co.uk" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: C.brassDeep }}>TwentySix Consulting</a>
        </div>
        <div className="text-[11px]" style={{ color: C.inkSubtle }}>© {new Date().getFullYear()} · {clientConfig.clientName}</div>
      </footer>
    </div>
  );
}

// ── small building blocks ─────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="ts-tick font-display text-[15px] font-semibold mb-3 flex items-center" style={{ color: C.ink }}>{children}</h2>;
}

function HeroStat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: Sev }) {
  const color = tone ? SEV[tone].fg : C.ink;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.inkSubtle }}>{label}</div>
      <div className="font-display font-bold tabular-nums mt-1" style={{ fontSize: 26, lineHeight: 1, color }}>{value}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: C.inkMuted }}>{sub}</div>}
    </div>
  );
}

// One of the three area boxes. Modelled on the marketing site's pillar cards
// (numbered eyebrow, icon tile, display heading, accent one-liner, a preview of
// what's inside) but dialled down to dashboard scale: the heading is 26px rather
// than the marketing site's 48-60px, and there's no repeated period pill.
//
// It's a DIV, not a button. The graphics now sit in a SlideDeck whose tabs are
// themselves buttons, and a button cannot contain a button. The whole card stays
// clickable for convenience, with the footer "Open" as the real control that
// keyboard and screen-reader users get.
function AreaCard({
  num, tag, icon: Icon, accent, oneLiner, onClick, disabled, children,
}: {
  num: string; tag: string; icon: LucideIcon;
  accent: { fg: string; tint: string };
  oneLiner: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`ts-premium-card ts-glow-host relative overflow-hidden p-6 text-left flex flex-col h-full ${disabled ? "opacity-55" : "ts-nudge cursor-pointer"}`}
    >
      <div className="flex items-center gap-2.5 mb-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: accent.tint, color: accent.fg }}>
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent.fg }}>
          {num} — {tag}
        </span>
      </div>

      <h3 className="ts-display" style={{ fontSize: 26, fontWeight: 700, color: C.ink, lineHeight: 1.08 }}>{tag}</h3>
      <p className="mt-1.5 mb-5 text-[12.5px] font-medium leading-snug" style={{ color: accent.fg }}>{oneLiner}</p>

      <div className="flex-1 flex flex-col">{children}</div>

      <button
        type="button"
        onClick={disabled ? undefined : (e) => { e.stopPropagation(); onClick(); }}
        disabled={disabled}
        className="mt-5 self-start inline-flex items-center gap-1 text-[12.5px] font-semibold"
        style={{ color: disabled ? C.inkSubtle : C.brass }}
      >
        {disabled ? "Not in this package" : `Open ${tag}`} {!disabled && <ArrowRight className="ts-arrow w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// A legend-style row for the Organisation box, matched to the icon+label+count
// rhythm the two chart legends use so all three boxes read as one family.
function OrgRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: C.inkMuted }}>
      <Icon className="w-3 h-3 shrink-0" style={{ color: C.inkSubtle }} aria-hidden />
      <span className="flex-1 truncate">{label}</span>
      <span className="tabular-nums font-semibold" style={{ color: C.ink }}>{value}</span>
    </div>
  );
}
