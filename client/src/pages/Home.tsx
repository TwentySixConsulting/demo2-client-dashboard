// Platform Home — a dashboard control-centre. On login the client sees the state
// of their reward across Pay + Benefits + Organisation with LIVE numbers (derived
// from useRoster/orgStore, so edits in Your Organisation flow through here), what
// needs attention, concise section navigation, quick actions and recent activity.
import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { clientConfig, clientNameToEmail } from "@/config/clientConfig";
import { Shell } from "@/components/Shell";
import { C, REPORT_PERIOD, LAST_UPDATED, BENEFITS_LAST_UPDATED, SUBSCRIPTION } from "@/lib/theme";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import { RoleDistribution, PayTrend, BenefitsDonut } from "@/components/HomeCharts";
import { companyInfo } from "@/lib/data";
import { useRoster } from "@/lib/roster";
import { useOrgRoles, useOrgBenefits, useBenefitOverrides } from "@/lib/orgStore";
import { BENEFIT_CATEGORIES, ESTABLISHED_BENEFITS, benefitsSummary } from "@/lib/orgData";
import {
  LineChart, Gift, Building2, ArrowRight, ArrowUpRight, Check, AlertTriangle, AlertCircle,
  ClipboardCheck, UserPlus, Search, Layers, Clock, RefreshCw, CalendarDays,
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
  const goToPayPath = (p: string) => { window.location.href = `${BASE}pay/${p}`; };
  const goToBenefits = () => { window.location.href = `${BASE}benefits/`; };
  const goToOrg = () => setLocation("/organisation");

  const m = useMemo(() => {
    const n = roster.length || 1;
    const avgDiffPct = roster.reduce((s, r) => s + r.diffPct, 0) / n;
    const belowLQ = roster.filter((r) => r.positioning.position === "below");
    const belowMed = roster.filter((r) => r.positioning.position === "below" || r.positioning.position === "lower");
    const edited = roster.filter((r) => r.edited);
    const headcount = roster.reduce((s, r) => s + r.headcount, 0) + orgRoles.reduce((s, r) => s + (r.headcount || 0), 0);
    const rolesTotal = roster.length + orgRoles.length;
    const bs = benefitsSummary();
    const reviewCount = Object.keys(benefitOverrides).length;
    const awaiting = orgRoles.length + orgBenefits.length + reviewCount;
    // Distribution of roles across the four market bands (drives the hero chart).
    const bands = { below: 0, lower: 0, upper: 0, above: 0 } as Record<string, number>;
    roster.forEach((r) => { bands[r.positioning.position] = (bands[r.positioning.position] ?? 0) + 1; });
    return { avgDiffPct, belowLQ, belowMed, edited, headcount, rolesTotal, bs, reviewCount, awaiting, bands };
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

          {/* Masthead — hero panel */}
          <div data-tour="hero" className="ts-hero rounded-[28px] px-6 py-6 lg:px-8 lg:py-7">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: C.inkMuted }}>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {REPORT_PERIOD}</span>
                  <span style={{ color: C.inkSubtle }}>·</span>
                  <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Updated {LAST_UPDATED}</span>
                  <span style={{ color: C.inkSubtle }}>·</span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: C.brassSoft, color: C.brassDeep, fontWeight: 600 }}>{SUBSCRIPTION.tier}</span>
                  <SampleDataBadge />
                </div>
                <h1 className="ts-display mt-2.5" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>
                  {companyInfo.name}
                </h1>
                <p className="mt-2 text-[14px] leading-relaxed max-w-2xl" style={{ color: C.inkMuted }}>{verdict}</p>
              </div>
              {/* quick figures */}
              <div data-tour="quick-figures" className="flex flex-wrap gap-7 lg:gap-9 lg:pl-9 lg:border-l shrink-0" style={{ borderColor: C.borderSubtle }}>
                <HeroStat label="Pay vs market" value={`${m.avgDiffPct >= 0 ? "+" : ""}${m.avgDiffPct.toFixed(1)}%`} tone={payTone} />
                <HeroStat label="Headcount" value={String(m.headcount)} sub={`${m.rolesTotal} roles`} />
                <HeroStat label="Awaiting" value={String(m.awaiting)} sub={m.awaiting ? "with consultant" : "all benchmarked"} tone={m.awaiting ? "watch" : "good"} />
              </div>
            </div>
          </div>

          {/* Working area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: attention + explore */}
            <div className="lg:col-span-2 space-y-6">
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

              <div data-tour="explore">
                <SectionLabel>Explore your dashboards</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ExploreCard icon={LineChart} title="Pay" oneLiner="Where you sit on pay, role by role." stats={[`${roster.length} roles benchmarked`, `${m.belowMed.length} below market`]} onClick={goToPay} />
                  <ExploreCard icon={Gift} title="Benefits" oneLiner="Your benefits offer vs the market." stats={[`${m.bs.total} benefits · ${BENEFIT_CATEGORIES.length} categories`, `${m.bs.atOrAbove} of ${m.bs.total} at/above`]} onClick={goToBenefits} disabled={!clientConfig.benefitsEnabled} />
                  <ExploreCard icon={Building2} title="Your Organisation" oneLiner="Manage roles, salaries & benefits." stats={[`${m.headcount} people · ${m.rolesTotal} roles`, m.awaiting ? `${m.awaiting} awaiting` : "all benchmarked"]} onClick={goToOrg} />
                </div>
              </div>
            </div>

            {/* Right: quick actions + activity */}
            <div className="space-y-6">
              <div data-tour="quick-actions">
                <SectionLabel>Quick actions</SectionLabel>
                <div className="space-y-2">
                  <Action icon={ClipboardCheck} label="Prep a pay review" onClick={() => goToPayPath("pay-review")} />
                  <Action icon={Search} label="See who's below market" onClick={() => goToPayPath("role-details?position=Below+LQ")} />
                  <Action icon={UserPlus} label="Add a role or benefit" onClick={goToOrg} />
                  <Action icon={Layers} label="Review benefit gaps" onClick={goToBenefits} />
                </div>
              </div>

              <div data-tour="activity">
                <SectionLabel>Activity & status</SectionLabel>
                <div className="ts-premium-card p-4 space-y-3">
                  {m.edited.length > 0 ? (
                    <ActivityRow icon={RefreshCw} tone="watch" title={`${m.edited.length} role${m.edited.length > 1 ? "s" : ""} recently updated`} detail={m.edited.slice(0, 2).map((r) => r.role).join(", ") + (m.edited.length > 2 ? "…" : "")} />
                  ) : (
                    <ActivityRow icon={Check} tone="good" title="No recent changes" detail="Your roster is up to date" />
                  )}
                  <ActivityRow icon={Clock} tone={m.awaiting ? "watch" : "good"} title={m.awaiting ? `${m.awaiting} item${m.awaiting > 1 ? "s" : ""} awaiting benchmark` : "Everything benchmarked"} detail={m.awaiting ? `${orgRoles.length} roles · ${orgBenefits.length} benefits · ${m.reviewCount} under review` : "Nothing with your consultant"} />
                  <ActivityRow icon={CalendarDays} tone="good" title="Data freshness" detail={`Pay ${LAST_UPDATED} · Benefits ${BENEFITS_LAST_UPDATED}`} />
                  <button onClick={goToOrg} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold pt-1" style={{ color: C.brass }}>
                    Manage your organisation <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Your reward at a glance — visual summary */}
          <div data-tour="chart-band">
            <SectionLabel>Your reward at a glance</SectionLabel>
            <div className="flex flex-col lg:flex-row gap-3 items-stretch">
              <RoleDistribution bands={m.bands} total={roster.length} belowMarket={m.belowMed.length} onOpen={() => goToPayPath("role-details")} />
              <PayTrend />
              <BenefitsDonut atOrAbove={m.bs.atOrAbove} watch={m.bs.watch} below={m.bs.below} total={m.bs.total} onOpen={goToBenefits} />
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

function ExploreCard({ icon: Icon, title, oneLiner, stats, onClick, disabled }: { icon: LucideIcon; title: string; oneLiner: string; stats: string[]; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} className="ts-premium-card ts-glow-host ts-nudge relative overflow-hidden p-5 text-left flex flex-col h-full disabled:opacity-55">
      <Icon className="absolute -right-4 -bottom-4 w-28 h-28 pointer-events-none" style={{ color: C.brass, opacity: 0.05 }} aria-hidden />
      <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${disabled ? "" : "ts-chip"}`} style={disabled ? { background: C.brassSoft, color: C.inkSubtle } : undefined}><Icon className="w-5 h-5" /></span>
      <div className="font-display text-[16px] font-semibold" style={{ color: C.ink }}>{title}</div>
      <div className="text-[12.5px] mt-0.5 mb-3" style={{ color: C.inkMuted }}>{oneLiner}</div>
      <div className="space-y-1 flex-1">
        {stats.map((st, i) => <div key={i} className="text-[12px] tabular-nums" style={{ color: C.inkMuted }}>{st}</div>)}
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: disabled ? C.inkSubtle : C.brass }}>
        {disabled ? "Not in this package" : "Open"} {!disabled && <ArrowRight className="ts-arrow w-3.5 h-3.5" />}
      </span>
    </button>
  );
}

function Action({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="ts-premium-card ts-nudge w-full px-4 py-3 flex items-center gap-3 text-left">
      <span className="ts-chip flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"><Icon className="w-4 h-4" /></span>
      <span className="flex-1 text-[13.5px] font-medium" style={{ color: C.ink }}>{label}</span>
      <ArrowRight className="ts-arrow w-4 h-4" style={{ color: C.inkSubtle }} />
    </button>
  );
}

function ActivityRow({ icon: Icon, tone, title, detail }: { icon: LucideIcon; tone: Sev; title: string; detail: string }) {
  const s = SEV[tone];
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: s.bg, color: s.fg }}><Icon className="w-3.5 h-3.5" /></span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold" style={{ color: C.ink }}>{title}</div>
        <div className="text-[11.5px] mt-0.5" style={{ color: C.inkMuted }}>{detail}</div>
      </div>
    </div>
  );
}
