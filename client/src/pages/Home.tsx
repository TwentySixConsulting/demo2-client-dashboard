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
import { RoleDistribution, BenefitsMix } from "@/components/HomeCharts";
import { ScrollingShowcase } from "@/components/ScrollingShowcase";
import {
  PreviewCard, PayPositionPreview, PayGapsPreview, PayRisesPreview, PayShapePreview,
  BenefitsCoveragePreview, BenefitsCategoryPreview, BenefitsActionPreview, BenefitsStrengthsPreview,
  RewardPositionSummary, OrgFunctionBars,
} from "@/components/HomePreviews";
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

  // The strips each carry four previews. The existing Home charts lead (they are
  // the most informative), then three more angles on the same area, so the
  // marquee has something new to show rather than looping one card.
  const payPreviews = useMemo(() => [
    <PreviewCard key="dist" eyebrow="Distribution" title="How your roles sit vs market">
      <RoleDistribution bands={m.bands} total={roster.length} belowMarket={m.belowMed.length} compact />
    </PreviewCard>,
    <PayPositionPreview key="pos" avgDiffPct={m.avgDiffPct} />,
    <PayGapsPreview key="gaps" roster={roster} />,
    <PayRisesPreview key="rises" />,
    <PayShapePreview key="shape" roster={roster} />,
  ], [m.bands, m.avgDiffPct, m.belowMed.length, roster]);

  const benefitsPreviews = useMemo(() => [
    <PreviewCard key="mix" eyebrow="Benefits mix" title="Your offer vs the market">
      <BenefitsMix atOrAbove={m.bs.atOrAbove} watch={m.bs.watch} below={m.bs.below} total={m.bs.total} compact />
    </PreviewCard>,
    <BenefitsCoveragePreview key="cov" atOrAbove={m.bs.atOrAbove} total={m.bs.total} />,
    <BenefitsCategoryPreview key="cat" />,
    <BenefitsActionPreview key="act" />,
    <BenefitsStrengthsPreview key="str" />,
  ], [m.bs]);

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
                {/* Pay and benefits on one shared market range — the summary
                    question a snapshot should answer. Dropped below xl rather
                    than allowed to cramp the stat row. */}
                <div className="hidden xl:block shrink-0 w-[320px] xl:pl-9 xl:border-l" style={{ borderColor: C.borderSubtle }}>
                  <RewardPositionSummary avgDiffPct={m.avgDiffPct} atOrAbove={m.bs.atOrAbove} benefitsTotal={m.bs.total} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. The three areas — front and centre ────────────────────── */}
          <div data-tour="explore" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pay and Benefits each scroll a strip of live preview graphics, the
                same marquee the marketing site uses on its pillar cards. The
                strip bleeds to the card edges (-mx-6) so cards enter and leave
                under the mask rather than inside a visible gutter. */}
            <AreaCard
              num="01" tag="Pay" icon={LineChart} accent={AREA_ACCENT.pay}
              oneLiner="Where you sit on pay, role by role."
              onClick={goToPay}
            >
              <div className="-mx-6">
                <ScrollingShowcase id="pay" durationSeconds={46} items={payPreviews} />
              </div>
            </AreaCard>

            <AreaCard
              num="02" tag="Benefits" icon={Gift} accent={AREA_ACCENT.benefits}
              oneLiner="Where your benefits stand, category by category."
              onClick={goToBenefits} disabled={!clientConfig.benefitsEnabled}
            >
              <div className="-mx-6">
                <ScrollingShowcase id="benefits" durationSeconds={46} reverse items={benefitsPreviews} />
              </div>
            </AreaCard>

            <AreaCard
              num="03" tag="Organisation" icon={Building2} accent={AREA_ACCENT.org}
              oneLiner="Your roles, people and benefits, kept up to date."
              onClick={goToOrg}
            >
              {/* No marquee for this one — it is a data-management area, not an
                  insight product. A function breakdown keeps its height in step
                  with the two boxes that now scroll. */}
              <div className="font-display font-bold mb-3" style={{ fontSize: 19, color: C.ink, lineHeight: 1.15 }}>
                {m.headcount} <span className="text-[12.5px] font-medium" style={{ color: C.inkMuted }}>people across {m.rolesTotal} roles</span>
              </div>
              <div className="space-y-1.5 mb-4">
                <OrgRow icon={Layers} label={`Benefits · ${BENEFIT_CATEGORIES.length} categories`} value={String(m.bs.total)} />
                <OrgRow icon={Clock} label={m.awaiting ? "Awaiting benchmark" : "All benchmarked"} value={m.awaiting ? String(m.awaiting) : "✓"} />
              </div>
              <OrgFunctionBars roster={roster} />
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
// what's inside) but dialled down to dashboard scale: the heading is 30px rather
// than the marketing site's 48-60px, there's no repeated period pill, and the
// preview is a live chart rather than an auto-scrolling marquee. All three fit
// on screen without scrolling, which is the point of the redesign.
function AreaCard({
  num, tag, icon: Icon, accent, oneLiner, onClick, disabled, children,
}: {
  num: string; tag: string; icon: LucideIcon;
  accent: { fg: string; tint: string };
  oneLiner: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="ts-premium-card ts-glow-host ts-nudge relative overflow-hidden p-6 text-left flex flex-col h-full disabled:opacity-55"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: accent.tint, color: accent.fg }}>
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent.fg }}>
          {num} — {tag}
        </span>
      </div>

      <h3 className="ts-display" style={{ fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.08 }}>{tag}</h3>
      <p className="mt-2 mb-5 text-[13px] font-medium leading-snug" style={{ color: accent.fg }}>{oneLiner}</p>

      <div className="flex-1">{children}</div>

      <span className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: disabled ? C.inkSubtle : C.brass }}>
        {disabled ? "Not in this package" : "Open"} {!disabled && <ArrowRight className="ts-arrow w-3.5 h-3.5" />}
      </span>
    </button>
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
