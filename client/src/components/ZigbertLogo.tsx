// Zigbert logo — the benchmark/"divide" mark (slate dot, two offset navy bars,
// clay dot) + Poppins wordmark. Rendered inline as SVG so it's crisp, transparent
// and recolourable. Swap for the official PNG/SVG asset if/when one is dropped in.

const NAVY = "#121C2B";
const CREAM = "#F4F1EA";
const SLATE = "#7285A5";
const CLAY = "#C9785A";
const CLAY_DEEP = "#B0603F";
const CLAY_BRIGHT = "#DDA288";

export function ZigbertMark({
  size = 28,
  variant = "dark",
}: {
  size?: number;
  variant?: "dark" | "light";
}) {
  const bar = variant === "light" ? CREAM : NAVY;
  return (
    <svg
      width={(size * 44) / 58}
      height={size}
      viewBox="0 0 44 58"
      fill="none"
      role="img"
      aria-label="Zigbert"
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle cx="15" cy="9" r="6.5" fill={SLATE} />
      <rect x="4" y="20" width="28" height="8" rx="4" fill={bar} />
      <rect x="12" y="32" width="28" height="8" rx="4" fill={bar} />
      <circle cx="29" cy="49" r="6.5" fill={CLAY} />
    </svg>
  );
}

interface ZigbertLogoProps {
  /** Height of the mark in px (wordmark scales to it). */
  height?: number;
  /** dark = navy wordmark for light backgrounds; light = cream for dark backgrounds. */
  variant?: "dark" | "light";
  /** Show the "Pay & Benefits Intelligence" descriptor under the wordmark. */
  tagline?: boolean;
  className?: string;
}

export function ZigbertLogo({
  height = 28,
  variant = "dark",
  tagline = false,
  className,
}: ZigbertLogoProps) {
  const ink = variant === "light" ? CREAM : NAVY;
  const eyebrow = variant === "light" ? CLAY_BRIGHT : CLAY_DEEP;
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className ?? ""}`}
      style={{ lineHeight: 1 }}
    >
      <ZigbertMark size={height} variant={variant} />
      <span className="inline-flex flex-col" style={{ gap: tagline ? 4 : 0 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: ink,
            fontSize: height * 0.82,
            lineHeight: 1,
          }}
        >
          Zigbert
        </span>
        {tagline && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: eyebrow,
              fontSize: Math.max(8, height * 0.2),
              lineHeight: 1,
            }}
          >
            Pay &amp; Benefits Intelligence
          </span>
        )}
      </span>
    </span>
  );
}
