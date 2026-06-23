import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, LucideIcon } from "lucide-react";

interface SectionOverviewProps {
  eyebrow?: string;
  title: string;
  icon: LucideIcon;
  paragraphs: ReactNode[];
  bullets?: string[];
  ctaLabel: string;
  onCta: () => void;
}

export function SectionOverview({
  eyebrow,
  title,
  icon: Icon,
  paragraphs,
  bullets,
  ctaLabel,
  onCta,
}: SectionOverviewProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(40 27% 95%)" }}>
      <div className="px-8 lg:px-16 pt-10">
        <Link href="/">
          <button
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "hsl(214 25% 35%)" }}
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 lg:px-16 py-12">
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "hsl(16 51% 57% / 0.15)",
                border: "1px solid hsl(16 51% 57% / 0.3)",
              }}
            >
              <Icon className="w-7 h-7" style={{ color: "hsl(17 47% 47%)" }} />
            </div>
            <div>
              {eyebrow && (
                <p
                  className="text-xs font-semibold uppercase tracking-[0.14em] mb-1"
                  style={{ color: "hsl(17 47% 42%)" }}
                >
                  {eyebrow}
                </p>
              )}
              <h1
                className="text-3xl lg:text-4xl font-bold leading-tight"
                style={{ color: "hsl(214 64% 10%)" }}
              >
                {title}
              </h1>
            </div>
          </div>

          <div className="space-y-4 mb-8 text-base lg:text-lg leading-relaxed" style={{ color: "hsl(214 25% 25%)" }}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {bullets && bullets.length > 0 && (
            <ul className="space-y-2 mb-10 text-sm lg:text-base" style={{ color: "hsl(214 25% 25%)" }}>
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "hsl(15 50% 54%)" }}
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={onCta}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, hsl(15 50% 54%), hsl(18 56% 64%))",
              color: "hsl(214 64% 8%)",
            }}
            data-testid="button-section-cta"
          >
            {ctaLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
