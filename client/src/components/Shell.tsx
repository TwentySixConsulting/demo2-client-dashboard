import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ChevronDown,
  LogOut,
  Mail,
  Clock,
  Settings,
} from "lucide-react";
import { C } from "@/lib/theme";

interface SectionTab {
  key: "home" | "pay" | "benefits";
  label: string;
  href: string;
}

const TABS: SectionTab[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "pay", label: "Pay", href: "/pay/" },
  { key: "benefits", label: "Benefits", href: "/benefits/" },
];

interface ShellProps {
  username: string;
  email: string;
  active: SectionTab["key"] | "none";
  onSignOut: () => void;
}

export function Shell({ username, email, active, onSignOut }: ShellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const initials = username.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === "/" || window.location.pathname === "/account") {
      e.preventDefault();
      setLocation("/");
    }
  };

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-[400]"
      style={{
        height: 60,
        background: C.surface,
        borderBottom: "1px solid #ebe2cc",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 24px -8px rgba(28,24,20,0.06)",
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        color: C.ink,
      }}
    >
      <div
        className="h-full mx-auto px-[22px] flex items-center justify-between gap-6"
        style={{ maxWidth: 1440 }}
      >
        <a
          href="/"
          aria-label="Back to Home"
          onClick={handleHome}
          className="inline-flex items-center gap-3.5 py-1.5 transition-opacity hover:opacity-70"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <span className="inline-flex flex-col leading-none gap-[3px]">
            <span
              className="text-[9px] font-semibold uppercase"
              style={{ letterSpacing: "0.26em", color: C.brass }}
            >
              Zigbert
            </span>
            <span
              className="text-[13px] font-semibold hidden sm:inline"
              style={{ color: C.ink, letterSpacing: "-0.005em" }}
            >
              Pay &amp; Benefits Intelligence
            </span>
          </span>
        </a>

        <nav
          aria-label="Sections"
          className="inline-flex items-center gap-[2px] rounded-full"
          style={{
            padding: 4,
            background: C.surfaceSoft,
            border: `1px solid ${C.borderSubtle}`,
          }}
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (tab.key === "home") {
                e.preventDefault();
                setLocation("/");
              }
            };
            return (
              <a
                key={tab.key}
                href={tab.href}
                onClick={tab.key === "home" ? handleClick : undefined}
                className="relative inline-flex items-center h-[30px] rounded-full text-[12.5px] font-medium transition-colors"
                style={{
                  paddingLeft: isActive ? 24 : 14,
                  paddingRight: 14,
                  color: isActive ? C.ink : "#76695a",
                  background: isActive ? C.surface : "transparent",
                  border: isActive ? "1px solid #ebe2cc" : "1px solid transparent",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  boxShadow: isActive
                    ? "0 1px 2px rgba(28,24,20,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(138,107,62,0.06)";
                    (e.currentTarget as HTMLAnchorElement).style.color = C.ink;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#76695a";
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute rounded-full"
                    style={{ left: 14, width: 5, height: 5, background: C.brass }}
                    aria-hidden
                  />
                )}
                {tab.label}
              </a>
            );
          })}
        </nav>

        {/* User pill */}
        <div ref={ref} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2.5 pl-1 pr-3 h-9 rounded-full transition-colors"
            style={{
              background: open ? C.surfaceSoft : C.surface,
              border: `1px solid ${open ? "#cdbf95" : "#ebe2cc"}`,
              color: C.ink,
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <span
              className="inline-flex items-center justify-center rounded-full"
              style={{
                width: 28,
                height: 28,
                background: C.brassSoft,
                color: C.brass,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
                border: "1px solid #e8dcbb",
              }}
            >
              {initials}
            </span>
            <span className="hidden sm:inline" style={{ letterSpacing: "0.01em" }}>
              {username}
            </span>
            <ChevronDown
              className="w-3 h-3 transition-transform"
              style={{
                opacity: open ? 0.85 : 0.55,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          <div
            role="menu"
            data-open={open}
            className="absolute right-0 z-[401] rounded-2xl overflow-hidden"
            style={{
              top: "calc(100% + 10px)",
              minWidth: 280,
              background: C.surface,
              color: C.ink,
              border: `1px solid ${C.border}`,
              boxShadow:
                "0 1px 2px rgba(28,24,20,0.04), 0 24px 60px -16px rgba(28,24,20,0.16)",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(-4px)",
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 160ms ease, transform 160ms ease",
            }}
          >
            <div
              className="h-[2px]"
              style={{ background: "linear-gradient(90deg, #8a6b3e, #c0a173)" }}
            />
            <div className="px-[18px] pt-4 pb-[18px]">
              <div className="flex items-center gap-3 mb-3.5">
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 38,
                    height: 38,
                    background: C.brassSoft,
                    color: C.brass,
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid #e8dcbb",
                  }}
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-[13px] font-semibold leading-tight truncate"
                    style={{ color: C.ink }}
                  >
                    {username}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: "rgba(28,24,20,0.5)" }}>
                    Signed in
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl px-3.5 py-2.5 mb-3.5 flex flex-col gap-1.5"
                style={{ background: C.surfaceSoft, border: `1px solid ${C.borderSubtle}` }}
              >
                <div className="flex items-center gap-2 text-[11.5px] leading-tight break-all">
                  <Mail className="w-3 h-3 flex-none" style={{ opacity: 0.55 }} />
                  <span style={{ color: C.ink }}>{email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] leading-tight">
                  <Clock className="w-3 h-3 flex-none" style={{ opacity: 0.55 }} />
                  <span style={{ color: C.ink }}>Last sign-in · today</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setLocation("/account");
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors mb-2"
                style={{
                  height: 36,
                  background: C.surface,
                  color: C.ink,
                  fontSize: 12.5,
                  border: `1px solid ${C.border}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = C.surfaceSoft;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = C.surface;
                }}
              >
                <Settings className="w-3.5 h-3.5" />
                Account &amp; subscription
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors"
                style={{ height: 38, background: C.ink, color: C.canvas, fontSize: 12.5 }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#2a2520";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = C.ink;
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
