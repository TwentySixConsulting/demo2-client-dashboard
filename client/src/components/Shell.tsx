import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ChevronDown,
  LogOut,
  Mail,
  Settings,
  HelpCircle,
} from "lucide-react";
import { C } from "@/lib/theme";
import { ZigbertLogo } from "@/components/ZigbertLogo";

interface SectionTab {
  key: "home" | "pay" | "benefits" | "organisation";
  label: string;
  href: string;
  spa?: boolean; // in-shell wouter route (no full-page nav)
}

// Base-path aware so links resolve under a GitHub Pages sub-path too
// (BASE_URL is "/" in dev, "/Dashboard/" in the Pages build).
const BASE = import.meta.env.BASE_URL;
const TABS: SectionTab[] = [
  { key: "home", label: "Home", href: BASE, spa: true },
  { key: "pay", label: "Pay", href: `${BASE}pay/` },
  { key: "benefits", label: "Benefits", href: `${BASE}benefits/` },
  { key: "organisation", label: "Organisation", href: `${BASE}organisation`, spa: true },
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
        borderBottom: `1px solid ${C.border}`,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 24px -8px rgba(18,28,43,0.07)",
        fontFamily: "var(--font-sans)",
        color: C.ink,
      }}
    >
      <div
        className="h-full mx-auto px-[22px] flex items-center justify-between gap-6"
        style={{ maxWidth: 1440 }}
      >
        <a
          href={BASE}
          aria-label="Back to Home"
          onClick={handleHome}
          className="inline-flex items-center gap-3.5 py-1.5 transition-opacity hover:opacity-70"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <ZigbertLogo height={22} variant="dark" />
          <span
            className="text-[12.5px] font-medium hidden md:inline pl-3 ml-0.5"
            style={{ color: C.inkMuted, borderLeft: `1px solid ${C.border}`, paddingLeft: 12 }}
          >
            Pay &amp; Benefits Intelligence
          </span>
        </a>

        <nav
          aria-label="Sections"
          data-tour="nav"
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
              if (tab.spa) {
                e.preventDefault();
                setLocation(tab.key === "home" ? "/" : `/${tab.key}`);
              }
            };
            return (
              <a
                key={tab.key}
                href={tab.href}
                onClick={tab.spa ? handleClick : undefined}
                className="relative inline-flex items-center h-[30px] rounded-full text-[12.5px] font-medium transition-colors"
                style={{
                  paddingLeft: isActive ? 24 : 14,
                  paddingRight: 14,
                  color: isActive ? C.ink : C.inkMuted,
                  background: isActive ? C.surface : "transparent",
                  border: isActive ? `1px solid ${C.border}` : "1px solid transparent",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  boxShadow: isActive
                    ? "0 1px 2px rgba(28,24,20,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(201,120,90,0.07)";
                    (e.currentTarget as HTMLAnchorElement).style.color = C.ink;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color = C.inkMuted;
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-zigbert-tour-start
            aria-label="Take a tour of the dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-medium transition-colors"
            style={{ background: C.surface, color: C.inkMuted, border: `1px solid ${C.border}` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.surfaceSoft; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.surface; }}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Take a tour
          </button>

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
              border: `1px solid ${open ? C.brass : C.border}`,
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
                border: "1px solid rgba(201,120,90,0.30)",
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
              style={{ background: `linear-gradient(90deg, ${C.brass}, ${C.brassDeep})` }}
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
                    border: "1px solid rgba(201,120,90,0.30)",
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
      </div>
    </header>
  );
}
