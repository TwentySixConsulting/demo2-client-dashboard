// Trends & Hotspots.
//
// This content used to be one page of nine in the Pay app's sidebar, which both
// hid it and mislabelled it: CPI, unemployment, wage floors and role-level demand
// are not pay-report content, they are the context every other number is read
// against. It is now a top-level section, reorganised into the three questions a
// reward lead actually asks in order (what is the economy doing, what is that
// doing to pay, what is it doing to benefits) and extended with a benefits group
// the Pay version had no room for.
//
// Every figure comes from lib/trendsData. Nothing numeric is written inline here.
// See that file's header for why.
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Coins,
  Gift,
  LineChart,
  RefreshCw,
} from "lucide-react";
import { PageFrame } from "@/components/PageFrame";
import { SectionLabel } from "@/components/SectionLabel";
import { StatRow, StatTile } from "@/components/StatTile";
import { SampleDataBadge } from "@/components/SampleDataBadge";
import { PayTrend } from "@/components/HomeCharts";
import {
  CpiTrend,
  PayRiseLandscape,
  PrevalenceDots,
  PrevalenceScaleStrip,
  PREVALENCE_RAMP,
  RolePressurePlot,
  UnemploymentTrend,
  WageFloors,
} from "@/components/TrendsCharts";
import { C, LAST_UPDATED, REPORT_PERIOD } from "@/lib/theme";
import { BENEFIT_CATEGORIES, ESTABLISHED_BENEFITS, type BenefitBadge } from "@/lib/orgData";
import {
  ALL_SECTOR_FORECAST,
  AVG_WEEKLY_EARNINGS,
  BENEFIT_PREVALENCE,
  BENEFIT_SEGMENTS,
  BENEFIT_THEMES,
  BENEFITS_GUIDANCE,
  BENEFITS_TAKEAWAY,
  BOE_TARGET,
  COOLING_SUBTITLE,
  CPI_SERIES,
  DIFFERENTIATORS,
  FULL_TIME_HOURS,
  HARD_TO_FILL,
  HEATING_SUBTITLE,
  HOW_TO_USE,
  HOW_TO_USE_CAVEAT,
  KEY_TAKEAWAY,
  LABOUR_MARKET_CONCLUSION,
  LABOUR_MARKET_LEAD,
  LABOUR_MARKET_SIGNS,
  LONDON_LIVING_WAGE,
  MARKET_SUMMARY,
  ROLE_PRESSURE,
  SECTOR_MEDIAN_TURNOVER,
  TECH_SECTOR_LEAD,
  TECH_SECTOR_NOTES,
  TECH_SECTOR_RANGE,
  UK_PAY_RISES_2026,
  UNEMPLOYMENT_SERIES,
  VARIABLE_PAY_LEAD,
  VARIABLE_PAY_TRENDS,
  WAGE_FLOORS,
  benefitsUnderPressure,
  first,
  last,
  lowestPaidVsFloor,
  payRiseLandscape,
  peak,
  pct1,
  rangeText,
  upliftPct,
  floorPremiumPts,
} from "@/lib/trendsData";

const GROUPS = [
  { id: "economy", label: "The economy", Icon: LineChart },
  { id: "pay", label: "Pay", Icon: Coins },
  { id: "benefits", label: "Benefits", Icon: Gift },
] as const;

// Status colours, matching Home's SEV scale so a badge means the same thing on
// both pages. Status never travels on colour alone, so each carries an icon.
const BADGE: Record<BenefitBadge, { label: string; fg: string; bg: string; Icon: typeof Check }> = {
  above: { label: "Above market", fg: "#2F7D5B", bg: "rgba(47,125,91,0.10)", Icon: Check },
  at: { label: "At market", fg: "#2F7D5B", bg: "rgba(47,125,91,0.10)", Icon: Check },
  watch: { label: "Mixed vs market", fg: "#B7791F", bg: "rgba(183,121,31,0.10)", Icon: AlertTriangle },
  below: { label: "Below market", fg: "#C0392B", bg: "rgba(192,57,43,0.10)", Icon: AlertTriangle },
};

/** Fill the {tokens} in a copy string from the canonical figures. */
function fill(s: string) {
  return s
    .replace("{forecast}", pct1(ALL_SECTOR_FORECAST))
    .replace("{floor}", pct1(upliftPct(WAGE_FLOORS[0])))
    .replace("{unempFrom}", `${first(UNEMPLOYMENT_SERIES).value}%`)
    .replace("{unempTo}", `${last(UNEMPLOYMENT_SERIES).value}%`);
}

const money0 = (n: number) =>
  n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function Trends() {
  const active = useGroupSpy();
  const floor = lowestPaidVsFloor();
  const cpiPeak = peak(CPI_SERIES);
  const cpiNow = last(CPI_SERIES);
  const underPressure = benefitsUnderPressure();

  return (
    <PageFrame active="trends">
      {/* ── Masthead ────────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Market intelligence</SectionLabel>
        <div className="ts-hero rounded-[28px] px-6 py-6 lg:px-8 lg:py-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: C.inkMuted }}>
            <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {REPORT_PERIOD}</span>
            <span style={{ color: C.inkSubtle }}>·</span>
            <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Updated {LAST_UPDATED}</span>
            <SampleDataBadge />
          </div>
          <h1 className="ts-display mt-4" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>
            Trends &amp; Hotspots
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed max-w-2xl" style={{ color: C.inkMuted }}>
            What the wider market is doing right now, and what it means for pay and benefits.
            Nothing here is specific to your organisation, apart from where it is named as such.
          </p>
        </div>
      </div>

      {/* ── Sticky group rail ───────────────────────────────────────── */}
      <nav
        aria-label="Sections of this page"
        className="ts-print-hide sticky z-[300] -mx-2 px-2 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2"
        style={{ top: 60, background: C.canvas, borderBottom: `1px solid ${C.borderSubtle}` }}
      >
        {GROUPS.map((g) => {
          const on = active === g.id;
          return (
            <a
              key={g.id}
              href={`#${g.id}`}
              className={`inline-flex items-center gap-2 text-[13px] transition-colors ${on ? "ts-tick font-semibold" : ""}`}
              style={{ color: on ? C.ink : C.inkMuted, textDecoration: "none" }}
              aria-current={on ? "true" : undefined}
            >
              {!on && <g.Icon className="w-3.5 h-3.5" style={{ opacity: 0.7 }} aria-hidden />}
              {g.label}
            </a>
          );
        })}
      </nav>

      {/* ══ 1. THE GENERAL ECONOMIC MARKET ═══════════════════════════ */}
      <Group id="economy" title="The general economic market">
        <Panel>
          <StatRow>
            {/* pct1, not `${value}%`: CPI at 3.0 would render "3%" beside a
                neighbouring tile reading "3.0%". */}
            <StatTile label="CPI inflation" value={pct1(cpiNow.value)} sub={`12-month rate, ${cpiNow.label}`} />
            <StatTile
              label="Unemployment"
              value={`${last(UNEMPLOYMENT_SERIES).value}%`}
              sub={`Up from ${first(UNEMPLOYMENT_SERIES).value}% in ${first(UNEMPLOYMENT_SERIES).label}`}
            />
            <StatTile label="All-sector pay rises" value={pct1(ALL_SECTOR_FORECAST)} sub="CIPD forecast for 2026" />
            <StatTile label="Technology sector" value={rangeText(TECH_SECTOR_RANGE)} sub="Median pay rises, 2025/26" />
          </StatRow>
          <Footnote>
            Average weekly earnings {money0(AVG_WEEKLY_EARNINGS)} · median technology sector staff turnover {SECTOR_MEDIAN_TURNOVER}%
          </Footnote>
        </Panel>

        <TwoUp>
          <Panel>
            <h3 className="ts-h3">Inflation</h3>
            <Prose>
              <p>
                Twelve-month inflation in the Consumer Prices Index is {pct1(cpiNow.value)}. It ran higher
                than expected through 2025, peaking at {pct1(cpiPeak.value)} in {cpiPeak.label} from{" "}
                {pct1(first(CPI_SERIES).value)} at the end of 2024.
              </p>
              <p>
                It has come down since and has held flat for two quarters, but it still sits above the
                Bank of England target of {BOE_TARGET}%.
              </p>
              <p>Inflation at this level keeps upward pressure on pay rises.</p>
            </Prose>
            <div className="mt-5">
              <CpiTrend series={CPI_SERIES} target={BOE_TARGET} />
            </div>
          </Panel>

          <Panel>
            <h3 className="ts-h3">The labour market</h3>
            <Prose>
              <p>{LABOUR_MARKET_LEAD}</p>
            </Prose>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {LABOUR_MARKET_SIGNS.map((s) => (
                <li key={s} className="flex items-start gap-2 text-[12.5px]" style={{ color: C.ink }}>
                  <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.brass }} aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
            <Prose className="mt-3">
              <p>{LABOUR_MARKET_CONCLUSION}</p>
            </Prose>
            <div className="mt-5">
              <UnemploymentTrend series={UNEMPLOYMENT_SERIES} />
            </div>
          </Panel>
        </TwoUp>

        <Panel>
          <h3 className="ts-h3">Wage floors</h3>
          <Prose>
            <p>
              Both the statutory floor and the voluntary Real Living Wage are rising faster than the
              average pay rise, which is what makes them the dominant force in the 2026 pay landscape
              rather than a footnote to it.
            </p>
          </Prose>
          <div className="mt-5">
            <WageFloors floors={WAGE_FLOORS} upliftPct={upliftPct} londonRate={LONDON_LIVING_WAGE} />
          </div>
        </Panel>

        {/* The one place this page touches client data, and the reason it is worth
            doing: whether the incoming floor overtakes the lowest-paid role is a
            fact about this organisation, and it decides whether any of the above
            needs acting on before April. */}
        <Panel accent>
          <div className="flex items-start gap-3.5">
            <span
              className="inline-flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 34, height: 34, background: C.brassSoft, color: C.brassDeep }}
            >
              <AlertTriangle className="w-4 h-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="ts-h3 mb-1.5">The floor against your lowest-paid role</h3>
              <p className="text-[13.5px] leading-relaxed" style={{ color: C.inkMuted }}>
                At {FULL_TIME_HOURS} hours a week the {floor.effective} National Living Wage annualises to{" "}
                <strong style={{ color: C.ink }}>{money0(floor.floor)}</strong>. Your lowest benchmarked
                salary is <strong style={{ color: C.ink }}>{money0(floor.salary)}</strong> for {floor.role}.
                {floor.breaches
                  ? ` That is ${money0(floor.gap)} below the incoming floor, so the role needs repricing before ${floor.effective}.`
                  : ` That clears the incoming floor by ${money0(Math.abs(floor.gap))}.`}
              </p>
            </div>
          </div>
        </Panel>
      </Group>

      {/* ══ 2. PAY ═══════════════════════════════════════════════════ */}
      <Group id="pay" title="Pay">
        <Panel>
          <h3 className="ts-h3">UK pay rises in 2026</h3>
          <Prose>
            {UK_PAY_RISES_2026.map((p) => (
              <p key={p}>{fill(p)}</p>
            ))}
          </Prose>
          <div className="mt-5">
            <PayRiseLandscape rows={payRiseLandscape()} reference={ALL_SECTOR_FORECAST} />
          </div>
          <Footnote>
            The statutory floor is rising {floorPremiumPts().toFixed(1)} percentage points faster than the
            average pay rise.
          </Footnote>
        </Panel>

        <TwoUp>
          <Panel>
            <h3 className="ts-h3">Your pay rises against the market</h3>
            <Prose>
              <p>
                The landscape above is the market in 2026. This is your own trajectory through it, which
                is a different question and worth reading separately.
              </p>
            </Prose>
            <div className="mt-4">
              <PayTrend />
            </div>
          </Panel>

          <Panel>
            <h3 className="ts-h3">The technology sector</h3>
            <Prose>
              <p>{TECH_SECTOR_LEAD}</p>
            </Prose>
            <ul className="mt-3 space-y-2">
              {TECH_SECTOR_NOTES.map((n) => (
                <li key={n} className="flex items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: C.inkMuted }}>
                  <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.brass }} aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          </Panel>
        </TwoUp>

        <Panel>
          <h3 className="ts-h3">Bonus and variable pay</h3>
          <Prose>
            <p>{VARIABLE_PAY_LEAD}</p>
          </Prose>
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {VARIABLE_PAY_TRENDS.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[12.5px] leading-snug" style={{ color: C.inkMuted }}>
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.slate }} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <RolePressurePlot
            rows={ROLE_PRESSURE}
            reference={ALL_SECTOR_FORECAST}
            headingFor={(d) =>
              d === "heating"
                ? { title: "Heating up", sub: HEATING_SUBTITLE }
                : { title: "Cooling down", sub: COOLING_SUBTITLE }
            }
          />
          <Footnote>Hardest roles to fill across the sector: {HARD_TO_FILL.join(", ").toLowerCase()}.</Footnote>
        </Panel>

        <div>
          <SectionLabel>The market in summary</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MARKET_SUMMARY.map((s, i) => (
              <div key={s.title} className="ts-premium-card p-5">
                <span
                  className="inline-flex items-center justify-center rounded-full text-[11px] font-bold mb-3"
                  style={{ width: 26, height: 26, background: C.brassSoft, color: C.brassDeep }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <h4 className="font-display font-semibold text-[14px] mb-1.5" style={{ color: C.ink }}>{s.title}</h4>
                <p className="text-[12.5px] leading-relaxed" style={{ color: C.inkMuted }}>{fill(s.body)}</p>
              </div>
            ))}
          </div>
        </div>

        <Panel accent>
          <h3 className="ts-h3 mb-1.5">Key takeaway</h3>
          <p className="text-[13.5px] leading-relaxed max-w-3xl" style={{ color: C.inkMuted }}>{KEY_TAKEAWAY}</p>
        </Panel>
      </Group>

      {/* ══ 3. BENEFITS ══════════════════════════════════════════════ */}
      <Group id="benefits" title="Benefits">
        <Panel>
          <h3 className="ts-h3">How common each benefit is</h3>
          <Prose>
            <p>
              Employer size changes what counts as normal more than sector does. These are the two
              comparators that matter for an organisation of your size: employers like you today, and
              what the same benefit looks like once an employer is large.
            </p>
          </Prose>
          <div className="mt-5">
            <PrevalenceDots rows={BENEFIT_PREVALENCE} />
          </div>

          {/* The other four segments live here rather than as four more marks on
              the chart: they are context, and four recessive marks on a white
              surface fail contrast. */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
              <caption className="text-left text-[11px] mb-2" style={{ color: C.inkSubtle }}>
                Percentage of employers offering each benefit, by employer type
              </caption>
              <thead>
                <tr>
                  <th className="text-left font-semibold py-2 pr-3 whitespace-nowrap" style={{ color: C.inkMuted, borderBottom: `1px solid ${C.border}` }}>
                    Benefit
                  </th>
                  {BENEFIT_SEGMENTS.map((s) => (
                    <th
                      key={s.key}
                      className="text-right font-semibold py-2 px-2 whitespace-nowrap"
                      style={{ color: C.inkMuted, borderBottom: `1px solid ${C.border}` }}
                    >
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENEFIT_PREVALENCE.map((r, i) => (
                  <tr key={r.name} style={{ background: i % 2 ? C.surfaceSoft : "transparent" }}>
                    <td className="py-2 pr-3" style={{ color: C.ink }}>{r.name}</td>
                    {BENEFIT_SEGMENTS.map((s) => (
                      <td key={s.key} className="py-2 px-2 text-right tabular-nums" style={{ color: C.inkMuted }}>
                        {r[s.key]}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div>
          <SectionLabel>Where the market is moving</SectionLabel>
          <p className="text-[13px] leading-relaxed max-w-3xl mb-4" style={{ color: C.inkMuted }}>
            {underPressure.length} of your {ESTABLISHED_BENEFITS.length} benchmarked benefits sit in
            areas where the market is still rising. Being at market today and standing still is how a
            benefit becomes a gap, so these are the ones worth a decision rather than a review.
          </p>
          <div className="space-y-2.5">
            {underPressure.map((b) => {
              const badge = BADGE[b.badge];
              return (
                <div key={b.name} className="ts-premium-card p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display font-semibold text-[13.5px]" style={{ color: C.ink }}>{b.name}</span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
                      style={{ background: badge.bg, color: badge.fg }}
                    >
                      <badge.Icon className="w-3 h-3" aria-hidden /> {badge.label}
                    </span>
                    <span className="text-[11.5px]" style={{ color: C.inkSubtle }}>Yours: {b.provision}</span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed mt-1.5" style={{ color: C.inkMuted }}>{b.evidence}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>What is changing, by area</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {BENEFIT_CATEGORIES.map((cat) => {
              const theme = BENEFIT_THEMES[cat];
              return (
                <div key={cat} className="ts-premium-card p-5 flex flex-col">
                  <h4 className="font-display font-semibold text-[14px] mb-2" style={{ color: C.ink }}>{cat}</h4>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: C.inkMuted }}>{theme.marketMove}</p>
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.borderSubtle}` }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: C.inkSubtle }}>
                      Ideas to consider
                    </div>
                    <ul className="space-y-1.5">
                      {theme.ideas.map((idea) => (
                        <li key={idea} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: C.inkMuted }}>
                          <span className="mt-[6px] w-1 h-1 rounded-full shrink-0" style={{ background: C.slate }} aria-hidden />
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Panel>
          <h3 className="ts-h3">Less common benefits</h3>
          <Prose>
            <p>
              Benefits that can differentiate an offer, ordered by how established they are. The rare
              end is where a small employer can still be unusual; the common end is table stakes.
            </p>
          </Prose>
          <div className="mt-4">
            <PrevalenceScaleStrip />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.name}
                className="rounded-xl p-3"
                style={{ background: C.surfaceSoft, border: `1px solid ${C.borderSubtle}` }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-[5px] w-2.5 h-2.5 rounded-[3px] shrink-0"
                    style={{ background: PREVALENCE_RAMP[d.prevalence] }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium leading-snug" style={{ color: C.ink }}>{d.name}</div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] mt-1" style={{ color: C.inkSubtle }}>
                      {d.prevalence}
                    </div>
                    {d.evidence && (
                      <p className="text-[11.5px] leading-snug mt-1.5" style={{ color: C.inkMuted }}>{d.evidence}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <TwoUp>
          <Panel>
            <h3 className="ts-h3">Using this guidance</h3>
            <div className="space-y-3 mt-1">
              {BENEFITS_GUIDANCE.map((g) => (
                <div key={g.head}>
                  <div className="text-[12.5px] font-semibold" style={{ color: C.ink }}>{g.head}</div>
                  <p className="text-[12.5px] leading-relaxed mt-0.5" style={{ color: C.inkMuted }}>{g.body}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel accent>
            <h3 className="ts-h3 mb-1.5">Key takeaway</h3>
            <p className="text-[13.5px] leading-relaxed" style={{ color: C.inkMuted }}>{BENEFITS_TAKEAWAY}</p>
          </Panel>
        </TwoUp>
      </Group>

      {/* ── How to use this ─────────────────────────────────────────── */}
      <Panel>
        <h3 className="ts-h3">How to use this page</h3>
        <Prose>
          {HOW_TO_USE.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Prose>
        <Footnote>{HOW_TO_USE_CAVEAT}</Footnote>
      </Panel>
    </PageFrame>
  );
}

/* ── layout building blocks, local to this page ──────────────────────────── */

/** One of the three groups. `scrollMarginTop` clears the fixed Shell plus the
 *  sticky rail, so an anchor jump does not land the heading underneath them. */
function Group({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 118 }} className="ts-print-break space-y-5">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

function Panel({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="ts-premium-card p-6"
      style={accent ? { borderLeft: `3px solid ${C.brass}` } : undefined}
    >
      {children}
    </div>
  );
}

function TwoUp({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{children}</div>;
}

function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`space-y-2.5 text-[13.5px] leading-relaxed max-w-prose ${className}`}
      style={{ color: C.inkMuted }}
    >
      {children}
    </div>
  );
}

function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11.5px] mt-4 pt-3" style={{ color: C.inkSubtle, borderTop: `1px solid ${C.borderSubtle}` }}>
      {children}
    </p>
  );
}

/**
 * Which group is in view, for the sticky rail.
 *
 * The rule is "the last group heading that has passed under the rail". An
 * IntersectionObserver on the sections themselves does NOT work here: these
 * sections are thousands of pixels tall, so the first one is still intersecting
 * any sensible observation band long after you have scrolled into the second,
 * and the rail stays stuck on it. Measuring heading positions against a fixed
 * line is the rule that survives sections of wildly different heights.
 */
function useGroupSpy() {
  const [active, setActive] = useState<string>(GROUPS[0].id);

  useEffect(() => {
    // 60px Shell + the sticky rail, plus a little air.
    const LINE = 132;

    // Measured synchronously rather than inside requestAnimationFrame. Three
    // getBoundingClientRect reads per scroll event is nothing, rAF adds a moving
    // part for no gain, and React already batches the setState.
    const measure = () => {
      let current: string = GROUPS[0].id;
      for (const g of GROUPS) {
        const el = document.getElementById(g.id);
        if (el && el.getBoundingClientRect().top <= LINE) current = g.id;
      }
      setActive(current);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return active;
}
