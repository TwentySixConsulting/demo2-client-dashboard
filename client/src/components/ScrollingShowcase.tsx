// Infinite marquee, ported from the zigbert.co.uk marketing site
// (zigbert-waitlist/src/components/ScrollingShowcase.tsx) so the dashboard's
// area boxes scroll their preview graphics the same way the site does.
//
// The track renders the items twice and translates -50% on a linear loop, so the
// seam is invisible. Pauses on hover, respects prefers-reduced-motion, and the
// edges are softly masked so cards fade rather than being cut off.
import type { ReactNode } from "react";

interface ScrollingShowcaseProps {
  items: ReactNode[];
  /** Lower = faster. Seconds for one full loop. */
  durationSeconds?: number;
  /** Unique id so multiple rows can run their own keyframes/direction. */
  id?: string;
  /** Reverse the scroll direction. */
  reverse?: boolean;
  className?: string;
}

export function ScrollingShowcase({
  items,
  durationSeconds = 42,
  id = "showcase",
  reverse = false,
  className = "",
}: ScrollingShowcaseProps) {
  const doubled = [...items, ...items];
  const trackClass = `zshow-${id}`;
  const from = reverse ? "-50%" : "0";
  const to = reverse ? "0" : "-50%";

  return (
    <div
      className={`relative overflow-hidden w-full min-w-0 ${className}`}
      style={{
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%)",
      }}
    >
      <div
        className={`flex gap-3 w-max ${trackClass}`}
        style={{ animation: `${trackClass}-marquee ${durationSeconds}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="shrink-0" aria-hidden={i >= items.length}>
            {item}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ${trackClass}-marquee {
          from { transform: translate3d(${from}, 0, 0); }
          to   { transform: translate3d(${to}, 0, 0); }
        }
        .${trackClass}:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .${trackClass} { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
