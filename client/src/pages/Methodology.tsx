// Methodology.
//
// Before this page there was no single answer in the product to "where does this
// data come from". There were two unrouted Data Sources pages disagreeing with
// each other and one routed page inside Pay, variously saying quarterly and
// monthly refresh, TwentySix and Zigbert, and one dated January 2026. Meanwhile
// the strongest and most current version of this content sat on zigbert.co.uk
// where an existing client would never see it.
//
// Layout only. All copy lives in lib/methodologyCopy and every figure is
// interpolated from theme.ts, so a date or a sample size can never go stale here
// independently of the rest of the dashboard.
//
// Prose is capped at max-w-3xl inside the 1180px frame. That is the marketing
// page's own measure and it is the right one: this page is read, not scanned.
import { ArrowUpRight, CalendarDays, Check, RefreshCw } from "lucide-react";
import { PageFrame } from "@/components/PageFrame";
import { SectionLabel } from "@/components/SectionLabel";
import { StatRow, StatTile } from "@/components/StatTile";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import {
  BENEFITS_LAST_UPDATED,
  BENEFITS_META,
  C,
  LAST_UPDATED,
  PAY_META,
  REPORT_PERIOD,
} from "@/lib/theme";
import {
  METHODOLOGY_CLOSING,
  METHODOLOGY_EYEBROW,
  METHODOLOGY_LEDE,
  METHODOLOGY_SECTIONS,
  METHODOLOGY_TITLE,
  type MethodSection,
} from "@/lib/methodologyCopy";

const SALARY_RECORDS = "1.5M+";

/** Fill the copy tokens from the canonical constants. */
function fill(s: string) {
  return s
    .replace("{payEmployers}", String(PAY_META.comparatorEmployers))
    .replace("{payBasis}", PAY_META.comparatorBasis)
    .replace("{benefitEmployers}", String(BENEFITS_META.employersInDataset))
    .replace("{benefitCoverage}", String(BENEFITS_META.coverage))
    .replace("{period}", REPORT_PERIOD)
    .replace("{lastUpdated}", LAST_UPDATED)
    .replace("{benefitsUpdated}", BENEFITS_LAST_UPDATED);
}

export function Methodology() {
  return (
    <PageFrame active="methodology">
      {/* ── Masthead ────────────────────────────────────────────────── */}
      <div>
        <SectionLabel>{METHODOLOGY_EYEBROW}</SectionLabel>
        <div className="ts-hero rounded-[28px] px-6 py-6 lg:px-8 lg:py-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: C.inkMuted }}>
            <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {REPORT_PERIOD}</span>
            <span style={{ color: C.inkSubtle }}>·</span>
            <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Published {LAST_UPDATED}</span>
            <SampleDataBadge />
          </div>
          <h1 className="ts-display mt-4" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>
            {METHODOLOGY_TITLE}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed max-w-2xl" style={{ color: C.inkMuted }}>
            {METHODOLOGY_LEDE}
          </p>
        </div>
      </div>

      {/* ── Stats band ──────────────────────────────────────────────────
          The marketing site's four tiles are pitched at a prospect ("1 rate",
          "Monthly"). These describe THIS dashboard instead, and they deliberately
          put 1.5M and 47 side by side, because the section below is where that
          apparent contradiction gets answered. */}
      <div className="ts-premium-card p-6">
        <StatRow>
          <StatTile label="Salary records" value={SALARY_RECORDS} sub="UK adverts behind the market rates" />
          <StatTile
            label="Your comparator"
            value={PAY_META.comparatorEmployers}
            sub={`Technology employers in ${PAY_META.comparatorBasis}`}
          />
          <StatTile
            label="Benefits dataset"
            value={BENEFITS_META.employersInDataset}
            sub={`Employers, covering ${BENEFITS_META.coverage}% of your benefits`}
          />
          <StatTile label="Specialist" value="Reviewed" sub="Before this dashboard was published" />
        </StatRow>
      </div>

      {/* ── The method, in order ────────────────────────────────────── */}
      <div className="space-y-9 lg:space-y-11">
        {METHODOLOGY_SECTIONS.map((s, i) => (
          <Section key={s.id} section={s} index={i + 1} />
        ))}
      </div>

      {/* ── Closing ─────────────────────────────────────────────────── */}
      <div className="ts-premium-card p-6 lg:p-8" style={{ borderLeft: `3px solid ${C.brass}` }}>
        <h2 className="font-display font-semibold text-[17px] mb-2" style={{ color: C.ink }}>
          {METHODOLOGY_CLOSING.heading}
        </h2>
        <p className="text-[13.5px] leading-relaxed max-w-2xl" style={{ color: C.inkMuted }}>
          {METHODOLOGY_CLOSING.body}
        </p>
        <a
          href="mailto:hello@twentysixconsulting.co.uk"
          className="inline-flex items-center gap-1.5 mt-4 text-[12.5px] font-semibold ts-nudge"
          style={{ color: C.brassDeep, textDecoration: "none" }}
        >
          Contact your consultant <ArrowUpRight className="w-3.5 h-3.5 ts-arrow" aria-hidden />
        </a>
      </div>

      {/* Validity footer, derived. Replaces the old page's hardcoded
          "January 2026", which had gone stale without anyone noticing. */}
      <p className="text-[11.5px] pt-1" style={{ color: C.inkSubtle }}>
        {REPORT_PERIOD} · Pay updated {LAST_UPDATED} · Benefits updated {BENEFITS_LAST_UPDATED} ·
        Illustrative sample data
      </p>
    </PageFrame>
  );
}

/* ── building blocks, local to this page ─────────────────────────────────── */

function Section({ section, index }: { section: MethodSection; index: number }) {
  return (
    <section id={section.id} style={{ scrollMarginTop: 76 }} className="ts-print-break">
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="font-display font-bold text-[12px] tabular-nums shrink-0"
          style={{ color: C.brassDeep, paddingTop: 2 }}
          aria-hidden
        >
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-display font-bold text-[20px] leading-snug" style={{ color: C.ink, letterSpacing: "-0.01em" }}>
          {section.heading}
        </h2>
      </div>

      <div className="max-w-3xl space-y-3.5 text-[14px] leading-relaxed" style={{ color: C.inkMuted }}>
        {section.paras.map((p) => (
          <p key={p}>{fill(p)}</p>
        ))}
      </div>

      {section.tiles && (
        <div className="max-w-3xl mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {section.tiles.map((t) => (
            <div
              key={t.title}
              className="rounded-xl p-4"
              style={{ background: C.surfaceSoft, border: `1px solid ${C.borderSubtle}` }}
            >
              <div className="text-[12.5px] font-semibold mb-1" style={{ color: C.ink }}>{t.title}</div>
              <p className="text-[12.5px] leading-snug" style={{ color: C.inkMuted }}>{t.body}</p>
            </div>
          ))}
        </div>
      )}

      {section.points && (
        <div className="max-w-3xl mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {section.points.map((p) => (
            <div key={p.head}>
              <div className="text-[12.5px] font-semibold mb-2" style={{ color: C.ink }}>{p.head}</div>
              <ul className="space-y-1.5">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: C.inkMuted }}>
                    <Check className="w-3.5 h-3.5 mt-[2px] shrink-0" style={{ color: C.slate }} aria-hidden />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {section.sources && (
        <div
          className="max-w-3xl mt-5 rounded-xl px-4 py-3.5"
          style={{ background: C.surfaceSoft, border: `1px solid ${C.borderSubtle}` }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: C.inkSubtle }}>
            {section.sources.title}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
            {section.sources.items.map((it) => (
              <li key={it} className="flex items-center gap-1.5 text-[12px]" style={{ color: C.inkMuted }}>
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: C.slate }} aria-hidden />
                {it}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
