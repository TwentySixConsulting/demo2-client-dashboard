import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePageEditor } from "@/contexts/PageEditorContext";
import { GlobalEditToolbar } from "@/components/GlobalEditToolbar";
import { AddNavButton } from "@/components/AddNavButton";
import { EditableText } from "@/components/EditableText";
import { companyInfo } from "@/lib/data";
import {
  TrendingUp,
  Users,
  BarChart3,
  AlertTriangle,
  Gift,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Percent,
  Database,
  Home,
  LineChart,
  Lock,
  Pencil,
  FileText,
  Star,
  Heart,
  Briefcase,
  Calendar,
  Clock,
  Globe,
  Mail,
  Phone,
  Shield,
  Zap,
  Target,
  Settings,
  Flame,
  MapPin,
  Table,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Home, TrendingUp, BarChart3, Users, AlertTriangle, LineChart, Percent, Gift, Lightbulb,
  ArrowRight, Database, FileText, Star, Heart, Briefcase, Calendar, Clock, Globe, Mail,
  Phone, Shield, Zap, Target, Settings, Flame, MapPin, Table,
};

// THE ESSENTIALS group
const essentialNavItems = [
  { path: "/pay",                label: "Dashboard",                     icon: Home },
  { path: "/pay/risks",          label: "Your Market Position",           icon: MapPin },
  { path: "/pay/market-context", label: "Pay Benchmarking – Overview",    icon: TrendingUp },
  { path: "/pay/role-details",   label: "Pay Benchmarking – Role-by-Role",icon: Users },
  { path: "/pay/market-data",    label: "Trends & Hotspots",              icon: Flame },
  { path: "/pay/benefits",       label: "Benefit-by-Benefit Data",        icon: Gift },
];

// FOR WHEN YOU NEED MORE group
const moreNavItems = [
  { path: "/pay/market-comparison", label: "Internal × External Market",  icon: Globe },
  { path: "/pay/bonus",             label: "Market Analysis",             icon: BarChart3 },
  { path: "/pay/benefits-trends",   label: "Benefit Trends & Ideas",      icon: Lightbulb },
  { path: "/pay/next-steps",        label: "Next Steps",                  icon: ArrowRight },
  { path: "/pay/data-sources",      label: "Our Data",                    icon: Database },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isEditMode, setEditMode, trackChange, pendingChanges } = useAuth();
  const { addNavItem, navItems: customNavItems } = usePageEditor();

  const handleAddNav = (newNav: { path: string; label: string; icon: string }) => {
    addNavItem({ path: newNav.path, label: newNav.label, icon: newNav.icon, visible: true });
  };

  const renderNavItem = (item: { path: string; label: string; icon: any }, idx: number) => {
    const isActive = location === item.path;
    const IconComponent = item.icon;
    const navKey = `nav-label-${item.path.replace("/", "") || "home"}`;
    const hasChange = pendingChanges.has(navKey);

    return (
      <Link href={item.path} key={item.path + idx}>
        <div
          data-testid={`nav-${item.path.replace("/", "") || "home"}`}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
            isActive
              ? "bg-sidebar-primary/15 text-white border-l-2 border-sidebar-primary"
              : "text-sidebar-foreground/65 hover:bg-white/8 hover:text-sidebar-foreground",
            hasChange && "ring-1 ring-amber-400"
          )}
        >
          <IconComponent
            className={cn("w-4 h-4 shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")}
          />
          {isEditMode ? (
            <EditableText
              contentKey={navKey}
              defaultValue={item.label}
              className="text-sm font-medium flex-1 leading-tight"
              as="span"
              page="layout"
            />
          ) : (
            <span className={cn("text-sm font-medium flex-1 leading-tight", isActive && "text-white")}>
              {item.label}
            </span>
          )}
          <ChevronRight
            className={cn(
              "w-3 h-3 opacity-0 transition-all shrink-0",
              isActive ? "opacity-60 text-sidebar-primary" : "group-hover:opacity-40"
            )}
          />
        </div>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-72 bg-sidebar text-sidebar-foreground fixed h-screen overflow-y-auto flex flex-col">

        {/* Wordmark */}
        <Link href="/">
          <div className="px-5 py-5 border-b border-sidebar-border/40 cursor-pointer hover:bg-white/5 transition-colors">
            <span
              className="zigbert-wordmark leading-none"
              style={{ fontSize: "1.75rem" }}
            >
              TwentySix
            </span>
            <p className="text-xs text-sidebar-foreground/40 mt-1 font-medium tracking-wide uppercase">
              Pay &amp; Benefits Intelligence
            </p>
          </div>
        </Link>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Group 1 — The Essentials */}
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-sidebar-foreground/30 mb-2 px-3">
            The Essentials
          </p>
          <nav className="space-y-0.5 mb-5">
            {essentialNavItems.map((item, i) => renderNavItem(item, i))}
            {isEditMode && (
              <div className="pt-1">
                <AddNavButton onAddNav={handleAddNav} />
              </div>
            )}
          </nav>

          {/* Divider */}
          <div className="border-t border-sidebar-border/25 my-3" />

          {/* Group 2 — For When You Need More */}
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-sidebar-foreground/30 mb-2 px-3 mt-4">
            For When You Need More
          </p>
          <nav className="space-y-0.5">
            {moreNavItems.map((item, i) => renderNavItem(item, i + 100))}
            {customNavItems.filter(c => c.visible).map((c, i) => {
              const icon = iconMap[c.icon] || FileText;
              return renderNavItem({ path: c.path, label: c.label, icon }, i + 200);
            })}
          </nav>
        </div>

        {/* Footer — client info */}
        <div className="border-t border-sidebar-border/30 p-4">
          <div className="bg-sidebar-accent/40 rounded-lg p-3 mb-3">
            {isEditMode ? (
              <>
                <EditableText contentKey="sidebar-prepared-label" defaultValue="Prepared for" className="text-[10px] text-sidebar-foreground/50 mb-1 block uppercase tracking-wide" as="p" page="layout" />
                <EditableText contentKey="sidebar-client-name" defaultValue={companyInfo.name} className="font-semibold text-sm block text-sidebar-foreground/90" as="p" page="layout" />
                <EditableText contentKey="sidebar-dataset" defaultValue={companyInfo.dataset} className="text-[10px] text-sidebar-foreground/50 mt-0.5 block" as="p" page="layout" />
                <EditableText contentKey="sidebar-date" defaultValue={companyInfo.reportDate} className="text-[10px] text-sidebar-foreground/40 mt-0.5 block" as="p" page="layout" />
              </>
            ) : (
              <>
                <p className="text-[10px] text-sidebar-foreground/50 mb-1 uppercase tracking-wide">Prepared for</p>
                <p className="font-semibold text-sm text-sidebar-foreground/90">{companyInfo.name}</p>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">{companyInfo.dataset}</p>
                <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">{companyInfo.reportDate}</p>
              </>
            )}
          </div>

          {user && !isEditMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-xs text-yellow-400/80 hover:text-yellow-300 transition-colors w-full px-2 py-1"
              data-testid="button-enter-edit-mode"
            >
              <Pencil className="w-3 h-3" />
              <span>Enter Edit Mode</span>
            </button>
          ) : user ? (
            <div className="flex items-center gap-2 text-xs text-yellow-400 px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span>Edit Mode Active</span>
            </div>
          ) : null}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-72 flex flex-col min-h-screen">

        {/* Edit Mode Banner */}
        {isEditMode && (
          <div className="bg-amber-500/95 text-white px-8 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              <span className="font-semibold">Edit Mode Active</span>
              <span className="text-white/80">— Click any text to edit it</span>
            </div>
          </div>
        )}

        {/* Top Navigation Bar — navy */}
        <div className="sticky top-0 z-10 zigbert-header px-8 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[
                { path: "/", label: "Home" },
                { path: "/pay", label: "Dashboard" },
                { path: "/pay/risks", label: "Market Position" },
                { path: "/pay/role-details", label: "Role Detail" },
                { path: "/pay/market-data", label: "Trends" },
                { path: "/pay/benefits", label: "Benefits" },
                { path: "/pay/next-steps", label: "Next Steps" },
              ].map((item) => (
                <Link key={item.path} href={item.path}>
                  <span className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    location === item.path
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white/90"
                  )}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            <div>
              {user && !isEditMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-yellow-300/90 hover:bg-white/10 rounded-md transition-colors"
                  data-testid="button-enter-edit-mode"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Mode</span>
                </button>
              ) : user ? (
                <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-yellow-300">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span>Editing</span>
                </div>
              ) : null}
            </div>
          </nav>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8 lg:p-12 pb-0">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-border px-8 py-4 mt-8 text-center text-xs text-muted-foreground">
          Delivered by{" "}
          <a href="https://www.twentysixconsulting.co.uk" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/70 hover:underline">
            TwentySix Consulting
          </a>
          {" · "}
          <a href="https://www.twentysixconsulting.co.uk" target="_blank" rel="noopener noreferrer" className="hover:underline">
            www.twentysixconsulting.co.uk
          </a>
        </footer>
      </main>

      <GlobalEditToolbar />
    </div>
  );
}
