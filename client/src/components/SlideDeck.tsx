// A small horizontal slide deck for the Home area cards. One graphic is visible
// at a time and the rest slide in from the side, which is what stops those cards
// reading as crowded: they were each stacking a headline plus two charts.
//
// Design decisions worth keeping:
//
//   * LABELLED TABS, not dots. Dots hide what is behind them, so on a dashboard
//     nobody clicks them. A named tab tells you what you would get, which makes
//     the second graphic discoverable rather than buried.
//   * NO AUTO-ADVANCE. An earlier version of these cards auto-scrolled and read
//     as distracting. Movement only ever happens because the reader asked for it.
//   * FIXED VIEWPORT HEIGHT, so changing slide never reflows the card or shifts
//     the three cards' shared grid height.
//   * Clicks on the tabs are stopped from bubbling, because the card behind them
//     is itself clickable.
import { useState } from "react";
import { C } from "@/lib/theme";

export interface Slide {
  /** Short tab label. Says what the slide shows, in two or three words. */
  label: string;
  node: React.ReactNode;
}

export function SlideDeck({
  slides, height, accent, idBase,
}: {
  slides: Slide[];
  /** Viewport height in px. Set from the tallest slide so nothing reflows. */
  height: number;
  accent: string;
  idBase: string;
}) {
  const [i, setI] = useState(0);
  const n = slides.length;

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden" style={{ height }}>
        <div
          className="flex h-full"
          style={{
            width: `${n * 100}%`,
            transform: `translateX(-${i * (100 / n)}%)`,
            transition: "transform 380ms cubic-bezier(0.2,0.7,0.2,1)",
          }}
        >
          {slides.map((s, idx) => (
            <div
              key={s.label}
              className="h-full flex flex-col justify-start"
              style={{ width: `${100 / n}%` }}
              role="tabpanel"
              id={`${idBase}-panel-${idx}`}
              aria-labelledby={`${idBase}-tab-${idx}`}
              // Off-screen slides leave both the accessibility tree and the tab
              // order — the pay-rise chart's svg is focusable, so without inert a
              // keyboard user would tab into an invisible slide. (React 19 takes
              // a boolean here.)
              aria-hidden={idx !== i}
              inert={idx !== i}
            >
              {s.node}
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
        <div
          className="flex items-center gap-1 mt-4"
          role="tablist"
          aria-label="Choose a view"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((s, idx) => {
            const on = idx === i;
            return (
              <button
                key={s.label}
                type="button"
                role="tab"
                id={`${idBase}-tab-${idx}`}
                aria-selected={on}
                aria-controls={`${idBase}-panel-${idx}`}
                onClick={(e) => { e.stopPropagation(); setI(idx); }}
                className="text-[10.5px] font-semibold rounded-full px-2.5 py-1 transition-colors"
                style={{
                  background: on ? accent : "transparent",
                  color: on ? "#FFFFFF" : C.inkSubtle,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
