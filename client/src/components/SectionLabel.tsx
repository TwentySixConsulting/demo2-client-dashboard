// The section-heading idiom of the dashboard: a display-face label with the
// `ts-tick` clay mark before it. Lifted out of Home.tsx once Trends and
// Methodology needed the same thing, so there is one definition rather than three
// near-identical local copies.
import { C } from "@/lib/theme";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="ts-tick font-display text-[15px] font-semibold mb-3 flex items-center"
      style={{ color: C.ink }}
    >
      {children}
    </h2>
  );
}
