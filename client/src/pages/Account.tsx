import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { clientConfig, clientNameToEmail } from "@/config/clientConfig";
import { Shell } from "@/components/Shell";
import { BASE_ROSTER } from "@/lib/roster";
import { useOrgRoles } from "@/lib/orgStore";
import { useToast } from "@/hooks/use-toast";
import {
  C,
  REPORT_PERIOD,
  PAY_META,
  BENEFITS_META,
  SUBSCRIPTION,
  LAST_UPDATED,
} from "@/lib/theme";
import {
  ArrowLeft,
  CheckCircle2,
  LineChart,
  Gift,
  Users,
  CreditCard,
  Building2,
  Mail,
  Phone,
  Bell,
  FileText,
  LogOut,
  Calendar,
  Receipt,
  Sparkles,
  ChevronRight,
  Download,
  Pencil,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Section heading

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div
        className="text-[10px] font-semibold uppercase mb-2"
        style={{ color: C.brass, letterSpacing: "0.26em" }}
      >
        {eyebrow}
      </div>
      <h2
        className="text-[22px] lg:text-[24px] font-semibold tracking-tight"
        style={{ color: C.ink }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-[13px] mt-1.5 max-w-[60ch]" style={{ color: C.inkMuted }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription card

interface SubscriptionCardProps {
  icon: typeof LineChart;
  title: string;
  scopeLabel: string;
  scopeValue: string;
  accent: string;
  accentSoft: string;
}

function SubscriptionCard({
  icon: Icon,
  title,
  scopeLabel,
  scopeValue,
  accent,
  accentSoft,
}: SubscriptionCardProps) {
  const { toast } = useToast();
  const consultantAction = (what: string) =>
    toast({
      title: `${what} requested`,
      description: "Your TwentySix consultant will email this over shortly — or reach them at hello@twentysixconsulting.co.uk.",
    });
  return (
    <div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 2px rgba(28,24,20,0.03)",
      }}
    >
      {/* Accent strip */}
      <div
        className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}66, transparent)` }}
        aria-hidden
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: accentSoft, border: `1px solid ${accent}40` }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
          </div>
          <div>
            <div
              className="text-[9.5px] font-semibold uppercase"
              style={{ color: C.inkMuted, letterSpacing: "0.2em" }}
            >
              Subscription
            </div>
            <div className="text-[18px] font-semibold leading-tight" style={{ color: C.ink }}>
              {title}
            </div>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-1"
          style={{
            background: "rgba(93,122,79,0.12)",
            color: C.success,
            letterSpacing: "0.1em",
          }}
        >
          <CheckCircle2 className="w-3 h-3" /> ACTIVE
        </span>
      </div>

      {/* Body */}
      <div
        className="rounded-2xl px-5 py-4 mb-4"
        style={{ background: C.surfaceSoft, border: `1px solid ${C.borderSubtle}` }}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
          <div>
            <div
              className="text-[9px] font-semibold uppercase mb-1"
              style={{ color: C.inkMuted, letterSpacing: "0.16em" }}
            >
              Last paid
            </div>
            <div className="font-semibold" style={{ color: C.ink }}>
              {SUBSCRIPTION.lastInvoice}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.inkSubtle }}>
              {SUBSCRIPTION.invoiceAmount}
            </div>
          </div>
          <div>
            <div
              className="text-[9px] font-semibold uppercase mb-1"
              style={{ color: C.inkMuted, letterSpacing: "0.16em" }}
            >
              Next renewal
            </div>
            <div className="font-semibold" style={{ color: C.ink }}>
              {SUBSCRIPTION.nextRenewal}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.inkSubtle }}>
              {SUBSCRIPTION.billingCadence}
            </div>
          </div>
          <div>
            <div
              className="text-[9px] font-semibold uppercase mb-1"
              style={{ color: C.inkMuted, letterSpacing: "0.16em" }}
            >
              Reporting period
            </div>
            <div className="font-semibold" style={{ color: C.ink }}>
              {REPORT_PERIOD}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.inkSubtle }}>
              Refreshed {LAST_UPDATED}
            </div>
          </div>
          <div>
            <div
              className="text-[9px] font-semibold uppercase mb-1"
              style={{ color: C.inkMuted, letterSpacing: "0.16em" }}
            >
              {scopeLabel}
            </div>
            <div className="font-semibold" style={{ color: C.ink }}>
              {scopeValue}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.inkSubtle }}>
              within plan
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => consultantAction("Latest invoice")}
          className="inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-[11.5px] font-medium"
          style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}` }}
        >
          <Receipt className="w-3 h-3" />
          View invoice
        </button>
        <button
          type="button"
          onClick={() => consultantAction(`${title} report`)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-[11.5px] font-medium"
          style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}` }}
        >
          <Download className="w-3 h-3" />
          Download report
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preference toggle row

// Preferences persist to localStorage so a client's choices survive a reload.
function usePersistentPref(storageKey: string, defaultOn: boolean) {
  const [on, setOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultOn;
    try {
      const v = window.localStorage.getItem(storageKey);
      return v === null ? defaultOn : v === "1";
    } catch {
      return defaultOn;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [storageKey, on]);
  return [on, setOn] as const;
}

function PreferenceRow({
  icon: Icon,
  label,
  description,
  defaultOn,
  storageKey,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  defaultOn: boolean;
  storageKey: string;
}) {
  const [on, setOn] = usePersistentPref(`demo-client-dashboard:pref:${storageKey}`, defaultOn);
  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-3.5"
      style={{ borderTop: `1px solid ${C.borderSubtle}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: C.surfaceSoft, border: `1px solid ${C.border}` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: C.inkMuted }} />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium" style={{ color: C.ink }}>
            {label}
          </div>
          <div className="text-[11px] mt-0.5 truncate" style={{ color: C.inkMuted }}>
            {description}
          </div>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className="relative rounded-full transition-colors shrink-0"
        style={{
          width: 36,
          height: 20,
          background: on ? C.brass : "#dccfae",
        }}
      >
        <span
          className="absolute top-[2px] rounded-full"
          style={{
            left: on ? 18 : 2,
            width: 16,
            height: 16,
            background: C.surface,
            transition: "left 200ms ease",
            boxShadow: "0 1px 2px rgba(28,24,20,0.18)",
          }}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing row

function BillingRow({
  date,
  description,
  amount,
  state,
}: {
  date: string;
  description: string;
  amount: string;
  state: "paid" | "scheduled";
}) {
  const stateColor = state === "paid" ? C.success : C.slate;
  return (
    <div
      className="grid grid-cols-[110px_1fr_90px_90px] gap-3 items-center px-5 py-3"
      style={{ borderTop: `1px solid ${C.borderSubtle}` }}
    >
      <span className="text-[11.5px] tabular-nums" style={{ color: C.inkMuted }}>
        {date}
      </span>
      <span className="text-[12.5px]" style={{ color: C.ink }}>
        {description}
      </span>
      <span className="text-[11.5px] tabular-nums font-semibold" style={{ color: C.ink }}>
        {amount}
      </span>
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 w-fit"
        style={{
          background:
            state === "paid" ? "rgba(93,122,79,0.12)" : "rgba(107,115,133,0.12)",
          color: stateColor,
          letterSpacing: "0.08em",
        }}
      >
        {state === "paid" ? "PAID" : "SCHEDULED"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Account page

export function Account() {
  const { signOut, user, tempUser } = useAuth();
  const [, setLocation] = useLocation();
  const orgRoles = useOrgRoles();
  const { toast } = useToast();

  const username =
    (user?.email && user.email.split("@")[0]) ??
    tempUser?.username ??
    clientConfig.clientName.toLowerCase();
  const email = user?.email ?? clientNameToEmail(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: C.canvas,
        color: C.ink,
        fontFamily:
          "var(--font-sans)",
      }}
    >
      <Shell
        username={username}
        email={email}
        active="none"
        onSignOut={() => {
          void signOut();
        }}
      />

      <main
        className="flex-1 w-full px-6 lg:px-10 pb-20"
        style={{ paddingTop: 60 }}
      >
        <div className="max-w-[1100px] mx-auto pt-10 lg:pt-12">
          {/* Back link */}
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium mb-6 transition-colors"
            style={{ color: C.inkMuted, background: "transparent", border: 0, cursor: "pointer" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.ink)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.inkMuted)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>

          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: C.brass }} />
            <span
              className="text-[10.5px] font-semibold uppercase"
              style={{ letterSpacing: "0.26em", color: C.brass }}
            >
              Account
            </span>
          </div>
          <h1
            className="text-[40px] lg:text-[52px] font-semibold tracking-tight leading-[1.02] mb-5"
            style={{ color: C.ink, letterSpacing: "-0.015em" }}
          >
            {clientConfig.clientName}
          </h1>

          {/* Profile snapshot */}
          <div
            className="rounded-3xl p-6 lg:p-7 flex flex-wrap items-center gap-6"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 2px rgba(28,24,20,0.03)",
            }}
          >
            <div className="flex items-center gap-4">
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: 56,
                  height: 56,
                  background: C.brassSoft,
                  color: C.brass,
                  fontSize: 18,
                  fontWeight: 700,
                  border: "1px solid #e8dcbb",
                  letterSpacing: "0.04em",
                }}
              >
                {initials}
              </span>
              <div>
                <div className="text-[16px] font-semibold" style={{ color: C.ink }}>
                  {username}
                </div>
                <div className="text-[12.5px] mt-0.5" style={{ color: C.inkMuted }}>
                  Account owner · {SUBSCRIPTION.tier}
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 min-w-[260px]">
              {[
                { label: "Email", value: email, icon: Mail },
                { label: "Organisation", value: clientConfig.clientName, icon: Building2 },
                { label: "Phone", value: "+44 1273 496 000", icon: Phone },
                { label: "Reporting cadence", value: SUBSCRIPTION.billingCadence, icon: Calendar },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label}>
                    <div
                      className="text-[9.5px] font-semibold uppercase mb-1 flex items-center gap-1"
                      style={{ color: C.inkMuted, letterSpacing: "0.18em" }}
                    >
                      <Icon className="w-3 h-3" />
                      {row.label}
                    </div>
                    <div
                      className="text-[12.5px] font-medium truncate"
                      style={{ color: C.ink }}
                      title={row.value}
                    >
                      {row.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Account managed by your consultant",
                  description: "To update your organisation's details, email hello@twentysixconsulting.co.uk and we'll take care of it.",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-[12px] font-medium"
              style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = C.surfaceSoft)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = C.surface)
              }
            >
              <Pencil className="w-3 h-3" />
              Request a change
            </button>
          </div>

          {/* Your organisation — summary + link (full management lives on /organisation) */}
          <section className="mt-12">
            <button
              type="button"
              onClick={() => setLocation("/organisation")}
              className="w-full text-left rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4 transition-all hover:-translate-y-0.5"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0" style={{ background: C.brassSoft, color: C.brassDeep }}>
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ letterSpacing: "0.22em", color: C.brass }}>Your Organisation</div>
                  <div className="font-display text-[16px] font-semibold mt-0.5" style={{ color: C.ink }}>
                    {BASE_ROSTER.length} roles · {orgRoles.length} awaiting benchmark
                  </div>
                  <div className="text-[12.5px] mt-0.5" style={{ color: C.inkMuted }}>Manage your roster and benefits, and add items for benchmarking.</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold shrink-0" style={{ color: C.brass }}>
                Manage <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </section>

          {/* Subscriptions */}
          <section className="mt-12" data-tour="subscriptions">
            <SectionHeading
              eyebrow="Subscriptions"
              title="Your active products"
              description="Each subscription covers a quarterly report refresh, supporting analysis, and consultant support."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SubscriptionCard
                icon={LineChart}
                title="Pay"
                scopeLabel="Roles benchmarked"
                scopeValue={`${PAY_META.rolesAnalysed} of ${PAY_META.rolesAnalysed}`}
                accent={C.brass}
                accentSoft={C.brassSoft}
              />
              <SubscriptionCard
                icon={Gift}
                title="Benefits"
                scopeLabel="Employer dataset"
                scopeValue={`${BENEFITS_META.employersInDataset} employers`}
                accent={C.sage}
                accentSoft={C.sageSoft}
              />
            </div>
          </section>

          {/* Billing */}
          <section className="mt-12" data-tour="billing">
            <SectionHeading
              eyebrow="Billing"
              title="Invoices &amp; renewals"
              description={`Quarterly billing — invoices are sent to ${SUBSCRIPTION.billingContact}.`}
            />
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {/* Header row */}
              <div
                className="grid grid-cols-[110px_1fr_90px_90px] gap-3 items-center px-5 py-3"
                style={{ background: C.surfaceSoft }}
              >
                <span
                  className="text-[9.5px] font-semibold uppercase"
                  style={{ color: C.inkMuted, letterSpacing: "0.18em" }}
                >
                  Date
                </span>
                <span
                  className="text-[9.5px] font-semibold uppercase"
                  style={{ color: C.inkMuted, letterSpacing: "0.18em" }}
                >
                  Description
                </span>
                <span
                  className="text-[9.5px] font-semibold uppercase"
                  style={{ color: C.inkMuted, letterSpacing: "0.18em" }}
                >
                  Amount
                </span>
                <span
                  className="text-[9.5px] font-semibold uppercase"
                  style={{ color: C.inkMuted, letterSpacing: "0.18em" }}
                >
                  Status
                </span>
              </div>
              <BillingRow
                date="01 Jul 2026"
                description="Pay & Benefits · Q3 2026"
                amount="£4,800"
                state="scheduled"
              />
              <BillingRow
                date="01 Apr 2026"
                description="Pay & Benefits · Q2 2026"
                amount="£4,800"
                state="paid"
              />
              <BillingRow
                date="02 Jan 2026"
                description="Pay & Benefits · Q1 2026"
                amount="£4,800"
                state="paid"
              />
              <BillingRow
                date="01 Oct 2025"
                description="Pay & Benefits · Q4 2025"
                amount="£4,600"
                state="paid"
              />
            </div>
          </section>

          {/* Preferences */}
          <section className="mt-12" data-tour="preferences">
            <SectionHeading
              eyebrow="Preferences"
              title="Notifications &amp; sharing"
              description="Control who hears from us and when."
            />
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <PreferenceRow
                icon={Bell}
                storageKey="report-alerts"
                label="Quarterly report email alerts"
                description="Get notified the moment a new report is published."
                defaultOn={true}
              />
              <PreferenceRow
                icon={FileText}
                storageKey="mid-quarter-updates"
                label="Mid-quarter market updates"
                description="Light-touch updates between formal reports."
                defaultOn={true}
              />
              <PreferenceRow
                icon={Building2}
                storageKey="copy-finance"
                label="Copy finance on invoices"
                description={`Copy ${SUBSCRIPTION.billingContact} on every invoice.`}
                defaultOn={false}
              />
            </div>
          </section>

          {/* Support + sign out */}
          <section className="mt-12 flex flex-wrap items-center justify-between gap-3" data-tour="support">
            <div
              className="rounded-2xl px-5 py-4 flex items-center gap-3 flex-1 min-w-[240px]"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: C.brassSoft, border: `1px solid ${C.brass}30` }}
              >
                <Users className="w-[15px] h-[15px]" style={{ color: C.brass }} />
              </div>
              <div className="min-w-0">
                <div
                  className="text-[9.5px] font-semibold uppercase"
                  style={{ color: C.inkMuted, letterSpacing: "0.18em" }}
                >
                  Your consultant
                </div>
                <div className="text-[13px] font-semibold mt-0.5" style={{ color: C.ink }}>
                  Hello at TwentySix Consulting
                </div>
                <a
                  href="mailto:hello@twentysixconsulting.co.uk"
                  className="text-[11.5px] hover:underline"
                  style={{ color: C.inkMuted }}
                >
                  hello@twentysixconsulting.co.uk
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="inline-flex items-center gap-2 rounded-full px-5 h-11 text-[12.5px] font-semibold"
              style={{
                background: C.ink,
                color: C.canvas,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#2a2520")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = C.ink)
              }
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </section>
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
