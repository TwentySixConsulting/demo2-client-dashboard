import { ReactNode } from "react";

interface ScrollingShowcaseProps {
  items: ReactNode[];
  /** Lower = faster. Seconds for one full loop. */
  durationSeconds?: number;
  /** Unique id so multiple rows can run different keyframes/directions. */
  id?: string;
  /** Scroll right-to-left (default) or left-to-right. */
  reverse?: boolean;
}

/**
 * Infinite horizontal marquee. The track renders the items twice and
 * translates -50% on a linear loop, so the seam is invisible. Pauses on
 * hover and respects prefers-reduced-motion. Edges are softly masked.
 * (Pattern adapted from the June Pay & Benefits landing page.)
 */
export function ScrollingShowcase({
  items,
  durationSeconds = 60,
  id = "showcase",
  reverse = false,
}: ScrollingShowcaseProps) {
  const doubled = [...items, ...items];
  const trackClass = `showcase-track-${id}`;
  const fromX = reverse ? "-50%" : "0";
  const toX = reverse ? "0" : "-50%";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%)",
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%)",
      }}
    >
      <div
        className={`flex gap-4 w-max ${trackClass}`}
        style={{ animation: `${trackClass}-marquee ${durationSeconds}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <div key={i} aria-hidden={i >= items.length}>
            {item}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ${trackClass}-marquee {
          from { transform: translate3d(${fromX}, 0, 0); }
          to   { transform: translate3d(${toX}, 0, 0); }
        }
        .${trackClass}:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .${trackClass} { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
