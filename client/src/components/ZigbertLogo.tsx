// Zigbert logo — the official brand asset (navy notched-bar mark + heavy
// wordmark). Rendered from the real PNG so it matches zigbert.co.uk exactly.
// Dark variant = navy logo for light backgrounds; light variant = cream logo
// for dark backgrounds.
import logoDark from "@/assets/zigbert-logo.png";
import logoLight from "@/assets/zigbert-logo-light.png";
import markDark from "@/assets/zigbert-mark.png";
import markLight from "@/assets/zigbert-mark-light.png";

const CLAY_DEEP = "#B0603F";
const CLAY_BRIGHT = "#DDA288";

// Aspect ratios of the source art (px).
const MARK_RATIO = 113 / 152;

export function ZigbertMark({
  size = 28,
  variant = "dark",
}: {
  size?: number;
  variant?: "dark" | "light";
}) {
  return (
    <img
      src={variant === "light" ? markLight : markDark}
      alt="Zigbert"
      width={Math.round(size * MARK_RATIO)}
      height={size}
      style={{ display: "block", flexShrink: 0, width: "auto", height: size }}
    />
  );
}

interface ZigbertLogoProps {
  /** Height of the logo in px (width scales to the art's aspect ratio). */
  height?: number;
  /** dark = navy logo for light backgrounds; light = cream logo for dark backgrounds. */
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
  const eyebrow = variant === "light" ? CLAY_BRIGHT : CLAY_DEEP;
  return (
    <span
      className={`inline-flex flex-col ${className ?? ""}`}
      style={{ lineHeight: 1, gap: tagline ? 6 : 0 }}
    >
      <img
        src={variant === "light" ? logoLight : logoDark}
        alt="Zigbert"
        height={height}
        style={{ display: "block", width: "auto", height }}
      />
      {tagline && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: eyebrow,
            fontSize: Math.max(8, height * 0.19),
            lineHeight: 1,
            paddingLeft: 2,
          }}
        >
          Pay &amp; Benefits Intelligence
        </span>
      )}
    </span>
  );
}
