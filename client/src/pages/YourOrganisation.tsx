import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { clientConfig, clientNameToEmail } from "@/config/clientConfig";
import { Shell } from "@/components/Shell";
import { C } from "@/lib/theme";
import { companyInfo, getPositioning } from "@/lib/data";
import { useRoster } from "@/lib/roster";
import { usePayViewMode } from "@/lib/payViewMode";
import { usePeople, addPerson, updatePerson, removePerson, ensurePeopleSeeded } from "@/lib/people";
import { DEPARTMENTS, LEVELS, LOCATIONS, BENEFIT_CATEGORIES, ESTABLISHED_BENEFITS, levelLabel } from "@/lib/orgData";
import {
  useOrgRoles, addOrgRole, removeOrgRole, updateOrgRole,
  useOrgBenefits, addOrgBenefit, removeOrgBenefit, updateOrgBenefit,
  setRoleOverride, clearRoleOverride,
  useBenefitOverrides, setBenefitOverride, clearBenefitOverride,
} from "@/lib/orgStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, Building2, Clock, Check, ArrowUpRight, Send, MapPin, Briefcase, Hourglass,
  Pencil, RefreshCw, Search, X, LayoutGrid, Users,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const GBP = (n: number) => `£${Math.round(n).toLocaleString()}`;
const GOOD = "#2F7D5B"; const GOOD_BG = "rgba(47,125,91,0.10)";
const WATCH = "#B7791F"; const WATCH_BG = "rgba(183,121,31,0.10)";
const UPD = "#5C6D8A"; const UPD_BG = "rgba(92,109,138,0.12)";

type Status = "benchmarked" | "updated" | "awaiting" | "review" | "awaiting-data";
function StatusBadge({ kind }: { kind: Status }) {
  const map = {
    benchmarked: { c: GOOD, bg: GOOD_BG, label: "Benchmarked", Icon: Check },
    updated: { c: UPD, bg: UPD_BG, label: "Updated", Icon: RefreshCw },
    awaiting: { c: WATCH, bg: WATCH_BG, label: "Awaiting benchmark", Icon: Hourglass },
    "awaiting-data": { c: WATCH, bg: WATCH_BG, label: "Awaiting market data", Icon: Hourglass },
    review: { c: UPD, bg: UPD_BG, label: "Under review", Icon: RefreshCw },
  }[kind];
  const { Icon } = map;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap" style={{ color: map.c, background: map.bg }}>
      <Icon className="w-3 h-3" /> {map.label}
    </span>
  );
}

function StatCell({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.inkMuted }}>
        {tone && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: tone }} />}{label}
      </div>
      <div className="font-display font-bold tabular-nums mt-1.5" style={{ fontSize: 24, lineHeight: 1.1, color: C.ink }}>{value}</div>
      {note && <div className="text-[11.5px] mt-1" style={{ color: C.inkMuted }}>{note}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] font-semibold uppercase mb-1.5 block" style={{ color: C.inkMuted, letterSpacing: "0.1em" }}>{label}</Label>
      {children}
    </div>
  );
}

const EMPTY_ROLE = { role: "", department: "", jobLevel: "", currentSalary: "", location: "Brighton", headcount: "" };
const EMPTY_BENEFIT = { name: "", category: "", provision: "", eligibility: "" };
const EMPTY_PERSON = { roleId: "", salary: "", fte: "1", location: "Brighton" };
type EditState = { id: string; kind: "roster" | "added"; role: string; department: string; jobLevel: string; location: string; currentSalary: string; headcount: string } | null;

export function YourOrganisation() {
  const { signOut, user, tempUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const username = (user?.email && user.email.split("@")[0]) ?? tempUser?.username ?? clientConfig.clientName.toLowerCase();
  const email = user?.email ?? clientNameToEmail(username);

  const roster = useRoster();
  const orgRoles = useOrgRoles();
  const orgBenefits = useOrgBenefits();
  const benefitOverrides = useBenefitOverrides();

  // Role ⇄ Person view. People are seeded once (shared with the Pay app via
  // localStorage "zigbert:people") then editable here.
  const [payMode, setPayMode] = usePayViewMode();
  const isPerson = payMode === "person";
  const people = usePeople();
  useEffect(() => { ensurePeopleSeeded(); }, []);

  const rosterById = useMemo(() => {
    const m = new Map<string, (typeof roster)[number]>();
    roster.forEach((r) => m.set(r.id, r));
    return m;
  }, [roster]);

  type PersonView = {
    id: string; roleId: string; label: string; role: string; function: string;
    level: string; location: string; fte: number; salary: number; fteAdjusted: number;
    positioning: ReturnType<typeof getPositioning> | null;
  };
  const peopleView: PersonView[] = useMemo(() => {
    const seq: Record<string, number> = {};
    return people.map((p) => {
      const role = rosterById.get(p.roleId);
      const n = (seq[p.roleId] = (seq[p.roleId] ?? 0) + 1);
      const fte = p.fte > 0 ? p.fte : 1;
      const fteAdjusted = Math.round(p.salary / fte);
      return {
        id: p.id,
        roleId: p.roleId,
        label: `${role?.role ?? "Unassigned"} #${n}`,
        role: role?.role ?? "Unassigned",
        function: role?.function ?? "—",
        level: role ? levelLabel(role.jobLevel) : "—",
        location: p.location ?? role?.location ?? "",
        fte,
        salary: p.salary,
        fteAdjusted,
        positioning: role ? getPositioning(fteAdjusted, role.lowerQuartile, role.median, role.upperQuartile) : null,
      };
    });
  }, [people, rosterById]);

  // Unified benefits view: established (with any edit → "under review") + added.
  type BenefitRow = { key: string; established: boolean; name: string; category: string; provision: string; eligibility?: string; status: "benchmarked" | "review" | "awaiting-data" };
  const benefitRows: BenefitRow[] = useMemo(() => {
    const est: BenefitRow[] = ESTABLISHED_BENEFITS.map((b) => {
      const o = benefitOverrides[b.name];
      return { key: b.name, established: true, name: o?.name ?? b.name, category: o?.category ?? b.category, provision: o?.provision ?? b.provision, eligibility: o?.eligibility, status: o ? "review" : "benchmarked" };
    });
    const added: BenefitRow[] = orgBenefits.map((b) => ({ key: b.id, established: false, name: b.name, category: b.category, provision: b.provision, eligibility: b.eligibility, status: "awaiting-data" }));
    return [...est, ...added];
  }, [benefitOverrides, orgBenefits]);
  const reviewCount = benefitRows.filter((b) => b.status === "review").length;

  const editedCount = roster.filter((r) => r.edited).length;
  const headcount = roster.reduce((s, r) => s + r.headcount, 0) + orgRoles.reduce((s, r) => s + (r.headcount || 0), 0);
  const rolesTotal = roster.length + orgRoles.length;
  const benefitsTotal = ESTABLISHED_BENEFITS.length + orgBenefits.length;
  const awaiting = orgRoles.length + orgBenefits.length + reviewCount;

  // filters
  const [q, setQ] = useState("");
  const [fDept, setFDept] = useState("All");
  const [fLevel, setFLevel] = useState("All");
  const [fStatus, setFStatus] = useState("All");
  const departments = useMemo(() => Array.from(new Set(roster.map((r) => r.function))).sort(), [roster]);

  function matches(name: string, fn: string, level: string, status: Status): boolean {
    if (q.trim() && !`${name} ${fn}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (fDept !== "All" && fn !== fDept) return false;
    if (fLevel !== "All" && level !== fLevel) return false;
    if (fStatus !== "All" && status !== fStatus) return false;
    return true;
  }
  const rosterRows = roster.filter((r) => matches(r.role, r.function, levelLabel(r.jobLevel), r.edited ? "updated" : "benchmarked"));
  const addedRows = orgRoles.filter((r) => matches(r.role, r.department, r.jobLevel, "awaiting"));
  const anyFilter = q.trim() !== "" || fDept !== "All" || fLevel !== "All" || fStatus !== "All";
  const shown = rosterRows.length + addedRows.length;

  // Person-mode filtering (reuses the search + department + level filters).
  const peopleRows = peopleView.filter((pv) => {
    if (q.trim() && !`${pv.label} ${pv.function} ${pv.role}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (fDept !== "All" && pv.function !== fDept) return false;
    if (fLevel !== "All" && pv.level !== fLevel) return false;
    return true;
  });
  const peopleTotal = peopleView.length;

  // dialogs
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [roleErr, setRoleErr] = useState<string | null>(null);
  const [benOpen, setBenOpen] = useState(false);
  const [benForm, setBenForm] = useState(EMPTY_BENEFIT);
  const [benErr, setBenErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>(null);
  const [editErr, setEditErr] = useState<string | null>(null);
  // benefit filters + edit
  const [bq, setBq] = useState(""); const [bCat, setBCat] = useState("All"); const [bStatus, setBStatus] = useState("All");
  const [benEdit, setBenEdit] = useState<{ key: string; established: boolean; name: string; category: string; provision: string; eligibility: string } | null>(null);
  const [benEditErr, setBenEditErr] = useState<string | null>(null);
  const benAnyFilter = bq.trim() !== "" || bCat !== "All" || bStatus !== "All";
  const filteredBenefits = benefitRows.filter((b) => {
    if (bq.trim() && !`${b.name} ${b.category}`.toLowerCase().includes(bq.trim().toLowerCase())) return false;
    if (bCat !== "All" && b.category !== bCat) return false;
    if (bStatus !== "All" && b.status !== bStatus) return false;
    return true;
  });
  function openBenEdit(b: BenefitRow) {
    setBenEditErr(null);
    setBenEdit({ key: b.key, established: b.established, name: b.name, category: b.category, provision: b.provision, eligibility: b.eligibility ?? "" });
  }
  function submitBenEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!benEdit) return;
    if (!benEdit.name.trim() || !benEdit.provision.trim()) { setBenEditErr("Benefit name and current provision are required."); return; }
    const patch = { name: benEdit.name.trim(), category: benEdit.category, provision: benEdit.provision.trim(), eligibility: benEdit.eligibility.trim() || undefined };
    if (benEdit.established) setBenefitOverride(benEdit.key, patch);
    else updateOrgBenefit(benEdit.key, patch);
    setBenEdit(null);
  }

  // person add / edit dialogs
  const [personOpen, setPersonOpen] = useState(false);
  const [personForm, setPersonForm] = useState(EMPTY_PERSON);
  const [personErr, setPersonErr] = useState<string | null>(null);
  const [personEdit, setPersonEdit] = useState<{ id: string; roleId: string; salary: string; fte: string; location: string } | null>(null);
  const [personEditErr, setPersonEditErr] = useState<string | null>(null);

  const setR = (k: keyof typeof EMPTY_ROLE, v: string) => setRoleForm((f) => ({ ...f, [k]: v }));
  const setB = (k: keyof typeof EMPTY_BENEFIT, v: string) => setBenForm((f) => ({ ...f, [k]: v }));
  const setP = (k: keyof typeof EMPTY_PERSON, v: string) => setPersonForm((f) => ({ ...f, [k]: v }));

  function validPerson(roleId: string, salaryStr: string, fteStr: string): string | null {
    const salary = Number(salaryStr);
    const fte = Number(fteStr);
    if (!roleId) return "Choose which role this person sits in.";
    if (!Number.isFinite(salary) || salary <= 0) return "Enter a valid actual salary.";
    if (!Number.isFinite(fte) || fte <= 0 || fte > 1) return "FTE must be between 0 and 1 (e.g. 0.5 or 1).";
    return null;
  }
  function submitPerson(e: React.FormEvent) {
    e.preventDefault();
    const err = validPerson(personForm.roleId, personForm.salary, personForm.fte);
    if (err) { setPersonErr(err); return; }
    addPerson({ roleId: personForm.roleId, salary: Number(personForm.salary), fte: Number(personForm.fte), location: personForm.location || undefined });
    setPersonForm(EMPTY_PERSON); setPersonErr(null); setPersonOpen(false);
  }
  function submitPersonEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!personEdit) return;
    const err = validPerson(personEdit.roleId, personEdit.salary, personEdit.fte);
    if (err) { setPersonEditErr(err); return; }
    updatePerson(personEdit.id, { roleId: personEdit.roleId, salary: Number(personEdit.salary), fte: Number(personEdit.fte), location: personEdit.location || undefined });
    setPersonEdit(null);
  }

  function submitRole(e: React.FormEvent) {
    e.preventDefault();
    const salary = Number(roleForm.currentSalary);
    if (!roleForm.role.trim() || !roleForm.department || !roleForm.jobLevel) { setRoleErr("Please give a job title, department and level."); return; }
    if (!Number.isFinite(salary) || salary <= 0) { setRoleErr("Enter a valid current salary."); return; }
    addOrgRole({ role: roleForm.role.trim(), department: roleForm.department, jobLevel: roleForm.jobLevel, currentSalary: salary, location: roleForm.location || "Brighton", headcount: roleForm.headcount ? Number(roleForm.headcount) : undefined });
    setRoleForm(EMPTY_ROLE); setRoleErr(null); setRoleOpen(false);
  }
  function submitBenefit(e: React.FormEvent) {
    e.preventDefault();
    if (!benForm.name.trim() || !benForm.category || !benForm.provision.trim()) { setBenErr("Please give a benefit name, category and your current provision."); return; }
    addOrgBenefit({ name: benForm.name.trim(), category: benForm.category, provision: benForm.provision.trim(), eligibility: benForm.eligibility.trim() || undefined });
    setBenForm(EMPTY_BENEFIT); setBenErr(null); setBenOpen(false);
  }
  function openEdit(r: (typeof roster)[number]) {
    setEditErr(null);
    setEdit({ id: r.id, kind: "roster", role: r.role, department: r.function, jobLevel: levelLabel(r.jobLevel), location: r.location, currentSalary: String(r.currentSalary), headcount: String(r.headcount) });
  }
  function openEditAdded(r: (typeof orgRoles)[number]) {
    setEditErr(null);
    setEdit({ id: r.id, kind: "added", role: r.role, department: r.department, jobLevel: r.jobLevel, location: r.location, currentSalary: String(r.currentSalary), headcount: r.headcount ? String(r.headcount) : "" });
  }
  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    const salary = Number(edit.currentSalary);
    if (!edit.role.trim()) { setEditErr("Role title can't be empty."); return; }
    if (!Number.isFinite(salary) || salary <= 0) { setEditErr("Enter a valid current salary."); return; }
    const hc = edit.headcount ? Number(edit.headcount) : undefined;
    if (edit.kind === "roster") {
      setRoleOverride(edit.id, {
        role: edit.role.trim(),
        function: edit.department,
        jobLevel: LEVELS.find((l) => l.value === edit.jobLevel)?.jobLevel,
        location: edit.location,
        currentSalary: salary,
        headcount: hc,
      });
    } else {
      updateOrgRole(edit.id, { role: edit.role.trim(), department: edit.department, jobLevel: edit.jobLevel, location: edit.location, currentSalary: salary, headcount: hc });
    }
    setEdit(null);
  }

  const card = { border: `1px solid ${C.border}`, background: C.surface } as const;
  const selTrigger = "h-9 text-[13px]";

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: C.canvas, color: C.ink, fontFamily: "var(--font-sans)" }}>
      <Shell username={username} email={email} active="organisation" onSignOut={() => { void signOut(); }} />

      <main className="flex-1 w-full px-6 lg:px-10 pb-20" style={{ paddingTop: 60 }}>
        <div className="max-w-[1100px] mx-auto pt-10 lg:pt-12 space-y-6">

          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" style={{ color: C.brass }} />
              <span className="text-[10.5px] font-semibold uppercase" style={{ letterSpacing: "0.26em", color: C.brass }}>Your Organisation</span>
            </div>
            <h1 className="font-display" style={{ color: C.ink, fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.7rem", lineHeight: 1.2 }}>{companyInfo.name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]" style={{ color: C.inkMuted }}>
              <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {companyInfo.industry}</span>
              <span style={{ color: C.inkSubtle }}>·</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {companyInfo.location}</span>
            </p>
          </div>

          {/* Summary tiles */}
          <div data-tour="summary" className="rounded-2xl px-6 py-5 grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-5" style={card}>
            <StatCell label="Headcount" value={String(isPerson ? people.length : headcount)} note={isPerson ? "individuals on the books" : "people across all roles"} tone={C.brass} />
            <StatCell label="Total roles" value={String(rolesTotal)} note={`${roster.length} benchmarked`} tone={GOOD} />
            <StatCell label="Awaiting benchmark" value={String(orgRoles.length)} note={orgRoles.length ? "with your consultant" : "all benchmarked"} tone={orgRoles.length ? WATCH : GOOD} />
            <StatCell label="Recently updated" value={String(editedCount)} note={editedCount ? "reflected across the site" : "no changes"} tone={editedCount ? UPD : GOOD} />
            <StatCell label="Benefits" value={String(benefitsTotal)} note={orgBenefits.length + reviewCount ? `${orgBenefits.length + reviewCount} pending review` : "all benchmarked"} tone={orgBenefits.length + reviewCount ? WATCH : GOOD} />
          </div>

          {/* Pending callout */}
          {awaiting > 0 && (
            <div className="rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3" style={{ background: WATCH_BG, border: `1px solid ${WATCH}33` }}>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5" style={{ color: WATCH }} />
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: "#7c5410" }}>
                    {[
                      orgRoles.length ? `${orgRoles.length} role${orgRoles.length > 1 ? "s" : ""} awaiting benchmark` : "",
                      orgBenefits.length ? `${orgBenefits.length} benefit${orgBenefits.length > 1 ? "s" : ""} awaiting market data` : "",
                      reviewCount ? `${reviewCount} benefit${reviewCount > 1 ? "s" : ""} under review` : "",
                    ].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#8a6414" }}>With your TwentySix consultant. Typical turnaround is 3 to 5 working days.</p>
                </div>
              </div>
              <Button type="button" variant="outline" className="gap-1.5 shrink-0" style={{ borderColor: `${WATCH}55`, color: "#7c5410" }} onClick={() => toast({ title: "Update requested", description: "Your TwentySix consultant has been notified. We'll be in touch shortly." })}>
                <Send className="w-3.5 h-3.5" /> Request an update
              </Button>
            </div>
          )}

          {/* ── Roles ─────────────────────────────────────────── */}
          <section>
            <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h2 className="font-display text-[17px] font-semibold" style={{ color: C.ink }}>{isPerson ? "People" : "Roles"}</h2>
                <p className="text-[12.5px] mt-0.5" style={{ color: C.inkMuted }}>{isPerson
                  ? "Each individual’s actual pay and FTE. Their full-time-equivalent salary is what’s compared to the market, and this flows into your Pay dashboards."
                  : "Edit a role or its salary and it updates across your Pay dashboards. Add a role to send it for benchmarking."}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: C.canvas, border: `1px solid ${C.border}` }} role="group" aria-label="View by role or by person">
                  <button type="button" onClick={() => setPayMode("role")} aria-pressed={!isPerson} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px] font-medium rounded-md transition-colors" style={{ background: !isPerson ? C.surface : "transparent", color: !isPerson ? C.ink : C.inkMuted, boxShadow: !isPerson ? "0 1px 2px rgba(0,0,0,0.06)" : undefined }}><LayoutGrid className="w-3.5 h-3.5" /> By role</button>
                  <button type="button" onClick={() => setPayMode("person")} aria-pressed={isPerson} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px] font-medium rounded-md transition-colors" style={{ background: isPerson ? C.surface : "transparent", color: isPerson ? C.ink : C.inkMuted, boxShadow: isPerson ? "0 1px 2px rgba(0,0,0,0.06)" : undefined }}><Users className="w-3.5 h-3.5" /> By person</button>
                </div>
                {isPerson && (
                  <Dialog open={personOpen} onOpenChange={setPersonOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" data-tour="add-person" className="gap-2" style={{ background: C.ink, color: C.canvas }}><Plus className="w-4 h-4" /> Add a person</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle style={{ color: C.ink }}>Add a person</DialogTitle>
                        <DialogDescription style={{ color: C.inkMuted }}>Add an individual to a benchmarked role. Their full-time-equivalent salary (pay ÷ FTE) is what's compared to the market range.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={submitPerson} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="sm:col-span-2"><Field label="Role">
                            <Select value={personForm.roleId} onValueChange={(v) => setP("roleId", v)}>
                              <SelectTrigger><SelectValue placeholder="Select a benchmarked role…" /></SelectTrigger>
                              <SelectContent>{roster.map((r) => <SelectItem key={r.id} value={r.id}>{r.role} · {r.function}</SelectItem>)}</SelectContent>
                            </Select>
                          </Field></div>
                          <Field label="Actual salary (£)"><Input type="number" min={0} value={personForm.salary} onChange={(e) => setP("salary", e.target.value)} placeholder="55000" /></Field>
                          <Field label="FTE (0–1)"><Input type="number" min={0} max={1} step={0.1} value={personForm.fte} onChange={(e) => setP("fte", e.target.value)} placeholder="1" /></Field>
                          <div className="sm:col-span-2"><Field label="Location">
                            <Select value={personForm.location} onValueChange={(v) => setP("location", v)}>
                              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                              <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                            </Select>
                          </Field></div>
                        </div>
                        {personErr && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>{personErr}</p>}
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setPersonOpen(false)}>Cancel</Button>
                          <Button type="submit" style={{ background: C.ink, color: C.canvas }}>Add person</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
                {!isPerson && (
                <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
                <DialogTrigger asChild>
                  <Button type="button" data-tour="add-role" className="gap-2" style={{ background: C.ink, color: C.canvas }}><Plus className="w-4 h-4" /> Add a role</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle style={{ color: C.ink }}>Add a role for benchmarking</DialogTitle>
                    <DialogDescription style={{ color: C.inkMuted }}>Tell us about the role and we'll return the market range. You only need what you already know.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={submitRole} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field label="Job title"><Input value={roleForm.role} onChange={(e) => setR("role", e.target.value)} placeholder="e.g. Senior Product Manager" /></Field>
                      <Field label="Department">
                        <Select value={roleForm.department} onValueChange={(v) => setR("department", v)}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Job level">
                        <Select value={roleForm.jobLevel} onValueChange={(v) => setR("jobLevel", v)}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.value}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Current salary (£)"><Input type="number" min={0} value={roleForm.currentSalary} onChange={(e) => setR("currentSalary", e.target.value)} placeholder="62000" /></Field>
                      <Field label="Location">
                        <Select value={roleForm.location} onValueChange={(v) => setR("location", v)}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Headcount (optional)"><Input type="number" min={0} value={roleForm.headcount} onChange={(e) => setR("headcount", e.target.value)} placeholder="1" /></Field>
                    </div>
                    {roleErr && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>{roleErr}</p>}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setRoleOpen(false)}>Cancel</Button>
                      <Button type="submit" style={{ background: C.ink, color: C.canvas }}>Submit for benchmark</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.inkSubtle }} />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles…" className="h-9 pl-9 text-[13px]" />
              </div>
              <Select value={fDept} onValueChange={setFDept}><SelectTrigger className={`${selTrigger} w-[150px]`}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="All">All departments</SelectItem>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              <Select value={fLevel} onValueChange={setFLevel}><SelectTrigger className={`${selTrigger} w-[140px]`}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="All">All levels</SelectItem>{LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.value}</SelectItem>)}</SelectContent></Select>
              {!isPerson && (
                <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className={`${selTrigger} w-[140px]`}><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="All">All statuses</SelectItem><SelectItem value="benchmarked">Benchmarked</SelectItem><SelectItem value="updated">Updated</SelectItem><SelectItem value="awaiting">Awaiting</SelectItem></SelectContent></Select>
              )}
              {anyFilter && (
                <button type="button" onClick={() => { setQ(""); setFDept("All"); setFLevel("All"); setFStatus("All"); }} className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: C.inkMuted }}>
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <span className="text-[11.5px] ml-auto" style={{ color: C.inkSubtle }}>{isPerson ? `${peopleRows.length} of ${peopleTotal}` : `${shown} of ${rolesTotal}`}</span>
            </div>

            {isPerson ? (
              <>
                <div data-tour="roles-table" className="rounded-2xl overflow-hidden" style={card}>
                  <div className="hidden sm:grid items-center px-5 py-2.5 text-[10px] font-semibold uppercase" style={{ gridTemplateColumns: "2fr 1fr 0.6fr 1fr 1.2fr 0.6fr", color: C.inkSubtle, letterSpacing: "0.1em", borderBottom: `1px solid ${C.borderSubtle}` }}>
                    <span>Person</span><span className="text-right">Actual</span><span className="text-right">FTE</span><span className="text-right">FTE salary</span><span className="text-right">Position</span><span />
                  </div>
                  {peopleRows.map((pv, i) => (
                    <div key={pv.id} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: "2fr 1fr 0.6fr 1fr 1.2fr 0.6fr", borderTop: i === 0 ? "none" : `1px solid ${C.borderSubtle}` }}>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold truncate" style={{ color: C.ink }}>{pv.label}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: C.inkMuted }}>{pv.function} · {pv.level} · {pv.location}</div>
                      </div>
                      <div className="text-right text-[13px] tabular-nums" style={{ color: C.ink }}>{GBP(pv.salary)}</div>
                      <div className="text-right text-[12.5px] tabular-nums" style={{ color: pv.fte < 1 ? C.brass : C.inkMuted }}>{pv.fte}</div>
                      <div className="text-right text-[13px] tabular-nums" style={{ color: C.ink }}>{GBP(pv.fteAdjusted)}</div>
                      <div className="flex items-center justify-end">
                        {pv.positioning && <span className="text-[10.5px] font-medium text-right" style={{ color: pv.positioning.color }}>{pv.positioning.label}</span>}
                      </div>
                      <div className="flex justify-end gap-0.5">
                        <button type="button" onClick={() => { setPersonEditErr(null); setPersonEdit({ id: pv.id, roleId: pv.roleId, salary: String(pv.salary), fte: String(pv.fte), location: pv.location }); }} aria-label={`Edit ${pv.label}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => removePerson(pv.id)} aria-label={`Remove ${pv.label}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {peopleRows.length === 0 && <div className="px-5 py-8 text-center text-[13px]" style={{ color: C.inkMuted }}>No people match your filters.</div>}
                </div>
                <p className="text-[11.5px] mt-2.5" style={{ color: C.inkSubtle }}>{peopleTotal} people across {roster.length} benchmarked roles · full-time-equivalent salary shown against market</p>
              </>
            ) : (
            <>
            <div data-tour="roles-table" className="rounded-2xl overflow-hidden" style={card}>
              <div className="hidden sm:grid items-center px-5 py-2.5 text-[10px] font-semibold uppercase" style={{ gridTemplateColumns: "2.2fr 1fr 1.4fr 0.7fr", color: C.inkSubtle, letterSpacing: "0.1em", borderBottom: `1px solid ${C.borderSubtle}` }}>
                <span>Role</span><span className="text-right">Current</span><span className="text-right">Status</span><span />
              </div>
              {rosterRows.map((r, i) => (
                <div key={r.id} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: "2.2fr 1fr 1.4fr 0.7fr", borderTop: i === 0 ? "none" : `1px solid ${C.borderSubtle}`, background: r.edited ? "#f7f8fb" : undefined }}>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold truncate" style={{ color: C.ink }}>{r.role}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: C.inkMuted }}>{r.function} · {levelLabel(r.jobLevel)} · {r.location}</div>
                  </div>
                  <div className="text-right text-[13px] tabular-nums" style={{ color: C.ink }}>{GBP(r.currentSalary)}</div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="hidden md:inline text-[10.5px] font-medium" style={{ color: r.positioning.color }}>{r.positioning.label}</span>
                    <StatusBadge kind={r.edited ? "updated" : "benchmarked"} />
                  </div>
                  <div className="flex justify-end gap-0.5">
                    <button type="button" onClick={() => openEdit(r)} aria-label={`Edit ${r.role}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Pencil className="w-3.5 h-3.5" /></button>
                    <a href={`${BASE}pay/role-details`} aria-label="View in Pay" className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><ArrowUpRight className="w-4 h-4" /></a>
                  </div>
                </div>
              ))}
              {addedRows.map((r) => (
                <div key={r.id} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: "2.2fr 1fr 1.4fr 0.7fr", borderTop: `1px solid ${C.borderSubtle}`, background: "#fdfbf6" }}>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold truncate" style={{ color: C.ink }}>{r.role}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: C.inkMuted }}>{r.department} · {r.jobLevel} · {r.location}{r.headcount ? ` · ${r.headcount} in role` : ""}</div>
                  </div>
                  <div className="text-right text-[13px] tabular-nums" style={{ color: C.ink }}>{GBP(r.currentSalary)}</div>
                  <div className="flex items-center justify-end"><StatusBadge kind="awaiting" /></div>
                  <div className="flex justify-end gap-0.5">
                    <button type="button" onClick={() => openEditAdded(r)} aria-label={`Edit ${r.role}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Pencil className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => removeOrgRole(r.id)} aria-label={`Remove ${r.role}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {shown === 0 && <div className="px-5 py-8 text-center text-[13px]" style={{ color: C.inkMuted }}>No roles match your filters.</div>}
            </div>
            <p className="text-[11.5px] mt-2.5" style={{ color: C.inkSubtle }}>{roster.length} benchmarked · {editedCount} updated · {orgRoles.length} awaiting · {rolesTotal} total</p>
            </>
            )}
          </section>

          {/* ── Benefits ──────────────────────────────────────── */}
          <section data-tour="benefits">
            <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
              <div>
                <h2 className="font-display text-[17px] font-semibold" style={{ color: C.ink }}>Benefits</h2>
                <p className="text-[12.5px] mt-0.5" style={{ color: C.inkMuted }}>Your benefits and where they sit. Add a benefit to get the market view.</p>
              </div>
              <Dialog open={benOpen} onOpenChange={setBenOpen}>
                <DialogTrigger asChild>
                  <Button type="button" className="gap-2" style={{ background: C.ink, color: C.canvas }}><Plus className="w-4 h-4" /> Add a benefit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle style={{ color: C.ink }}>Add a benefit for a market update</DialogTitle>
                    <DialogDescription style={{ color: C.inkMuted }}>Tell us what you offer and we'll benchmark it against the market.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={submitBenefit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field label="Benefit name"><Input value={benForm.name} onChange={(e) => setB("name", e.target.value)} placeholder="e.g. Private Medical Insurance" /></Field>
                      <Field label="Category">
                        <Select value={benForm.category} onValueChange={(v) => setB("category", v)}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{BENEFIT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <div className="sm:col-span-2"><Field label="Current provision"><Input value={benForm.provision} onChange={(e) => setB("provision", e.target.value)} placeholder="e.g. Employer-funded, all staff" /></Field></div>
                      <div className="sm:col-span-2"><Field label="Eligibility (optional)"><Input value={benForm.eligibility} onChange={(e) => setB("eligibility", e.target.value)} placeholder="e.g. All permanent employees" /></Field></div>
                    </div>
                    {benErr && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>{benErr}</p>}
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setBenOpen(false)}>Cancel</Button>
                      <Button type="submit" style={{ background: C.ink, color: C.canvas }}>Submit for benchmark</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {/* Benefit filters */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: C.inkSubtle }} />
                <Input value={bq} onChange={(e) => setBq(e.target.value)} placeholder="Search benefits…" className="h-9 pl-9 text-[13px]" />
              </div>
              <Select value={bCat} onValueChange={setBCat}><SelectTrigger className={`${selTrigger} w-[170px]`}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="All">All categories</SelectItem>{BENEFIT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              <Select value={bStatus} onValueChange={setBStatus}><SelectTrigger className={`${selTrigger} w-[150px]`}><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="All">All statuses</SelectItem><SelectItem value="benchmarked">Benchmarked</SelectItem><SelectItem value="review">Under review</SelectItem><SelectItem value="awaiting-data">Awaiting</SelectItem></SelectContent></Select>
              {benAnyFilter && (
                <button type="button" onClick={() => { setBq(""); setBCat("All"); setBStatus("All"); }} className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: C.inkMuted }}><X className="w-3.5 h-3.5" /> Clear</button>
              )}
              <span className="text-[11.5px] ml-auto" style={{ color: C.inkSubtle }}>{filteredBenefits.length} of {benefitsTotal}</span>
            </div>

            <div className="rounded-2xl overflow-hidden" style={card}>
              {filteredBenefits.map((b, i) => (
                <div key={b.key} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: "2.2fr 1.4fr 0.8fr", borderTop: i === 0 ? "none" : `1px solid ${C.borderSubtle}`, background: b.status === "awaiting-data" ? "#fdfbf6" : b.status === "review" ? "#f7f8fb" : undefined }}>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold truncate" style={{ color: C.ink }}>{b.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: C.inkMuted }}>{b.category} · {b.provision}</div>
                  </div>
                  <div className="flex items-center justify-end"><StatusBadge kind={b.status} /></div>
                  <div className="flex justify-end gap-0.5">
                    <button type="button" onClick={() => openBenEdit(b)} aria-label={`Edit ${b.name}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Pencil className="w-3.5 h-3.5" /></button>
                    {b.established ? (
                      <a href={`${BASE}benefits/`} aria-label="View in Benefits" className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><ArrowUpRight className="w-4 h-4" /></a>
                    ) : (
                      <button type="button" onClick={() => removeOrgBenefit(b.key)} aria-label={`Remove ${b.name}`} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: C.inkSubtle }}><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              ))}
              {filteredBenefits.length === 0 && <div className="px-5 py-8 text-center text-[13px]" style={{ color: C.inkMuted }}>No benefits match your filters.</div>}
            </div>
            <p className="text-[11.5px] mt-2.5" style={{ color: C.inkSubtle }}>{ESTABLISHED_BENEFITS.length} benchmarked · {reviewCount} under review · {orgBenefits.length} awaiting · {benefitsTotal} total</p>
          </section>

          <button type="button" onClick={() => setLocation("/")} className="text-[12px] font-medium" style={{ color: C.inkMuted, background: "transparent", border: 0, cursor: "pointer" }}>← Back to Home</button>
        </div>
      </main>

      {/* Edit role dialog */}
      <Dialog open={!!edit} onOpenChange={(o) => { if (!o) setEdit(null); }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle style={{ color: C.ink }}>Edit role</DialogTitle>
            <DialogDescription style={{ color: C.inkMuted }}>Changes here update this role, including the current salary, across your Pay dashboards.</DialogDescription>
          </DialogHeader>
          {edit && (
            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Job title"><Input value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} /></Field>
                <Field label="Department">
                  <Select value={edit.department} onValueChange={(v) => setEdit({ ...edit, department: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Job level">
                  <Select value={edit.jobLevel} onValueChange={(v) => setEdit({ ...edit, jobLevel: v })}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.value}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Current salary (£)"><Input type="number" min={0} value={edit.currentSalary} onChange={(e) => setEdit({ ...edit, currentSalary: e.target.value })} /></Field>
                <Field label="Location">
                  <Select value={edit.location} onValueChange={(v) => setEdit({ ...edit, location: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[edit.location, ...LOCATIONS.filter((l) => l !== edit.location)].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Headcount"><Input type="number" min={0} value={edit.headcount} onChange={(e) => setEdit({ ...edit, headcount: e.target.value })} placeholder="1" /></Field>
              </div>
              {editErr && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>{editErr}</p>}
              <DialogFooter className="sm:justify-between">
                {edit.kind === "roster"
                  ? <Button type="button" variant="ghost" onClick={() => { clearRoleOverride(edit.id); setEdit(null); }} style={{ color: C.inkMuted }}>Reset to benchmark</Button>
                  : <span />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
                  <Button type="submit" style={{ background: C.ink, color: C.canvas }}>Save changes</Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit benefit dialog */}
      <Dialog open={!!benEdit} onOpenChange={(o) => { if (!o) setBenEdit(null); }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle style={{ color: C.ink }}>Edit benefit</DialogTitle>
            <DialogDescription style={{ color: C.inkMuted }}>Benefits are qualitative, so changes go to your TwentySix consultant to re-check against the market. This benefit shows “Under review” until then.</DialogDescription>
          </DialogHeader>
          {benEdit && (
            <form onSubmit={submitBenEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Benefit name"><Input value={benEdit.name} onChange={(e) => setBenEdit({ ...benEdit, name: e.target.value })} /></Field>
                <Field label="Category">
                  <Select value={benEdit.category} onValueChange={(v) => setBenEdit({ ...benEdit, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BENEFIT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <div className="sm:col-span-2"><Field label="Current provision"><Input value={benEdit.provision} onChange={(e) => setBenEdit({ ...benEdit, provision: e.target.value })} /></Field></div>
                <div className="sm:col-span-2"><Field label="Eligibility (optional)"><Input value={benEdit.eligibility} onChange={(e) => setBenEdit({ ...benEdit, eligibility: e.target.value })} /></Field></div>
              </div>
              {benEditErr && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>{benEditErr}</p>}
              <DialogFooter className="sm:justify-between">
                {benEdit.established
                  ? <Button type="button" variant="ghost" onClick={() => { clearBenefitOverride(benEdit.key); setBenEdit(null); }} style={{ color: C.inkMuted }}>Reset to benchmark</Button>
                  : <span />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setBenEdit(null)}>Cancel</Button>
                  <Button type="submit" style={{ background: C.ink, color: C.canvas }}>Submit changes</Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit person dialog */}
      <Dialog open={!!personEdit} onOpenChange={(o) => { if (!o) setPersonEdit(null); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle style={{ color: C.ink }}>Edit person</DialogTitle>
            <DialogDescription style={{ color: C.inkMuted }}>Changes here update this individual across your Pay dashboards. FTE-equivalent salary (pay ÷ FTE) is what's compared to the market.</DialogDescription>
          </DialogHeader>
          {personEdit && (
            <form onSubmit={submitPersonEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2"><Field label="Role">
                  <Select value={personEdit.roleId} onValueChange={(v) => setPersonEdit({ ...personEdit, roleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a benchmarked role…" /></SelectTrigger>
                    <SelectContent>{roster.map((r) => <SelectItem key={r.id} value={r.id}>{r.role} · {r.function}</SelectItem>)}</SelectContent>
                  </Select>
                </Field></div>
                <Field label="Actual salary (£)"><Input type="number" min={0} value={personEdit.salary} onChange={(e) => setPersonEdit({ ...personEdit, salary: e.target.value })} /></Field>
                <Field label="FTE (0–1)"><Input type="number" min={0} max={1} step={0.1} value={personEdit.fte} onChange={(e) => setPersonEdit({ ...personEdit, fte: e.target.value })} /></Field>
                <div className="sm:col-span-2"><Field label="Location">
                  <Select value={personEdit.location} onValueChange={(v) => setPersonEdit({ ...personEdit, location: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[personEdit.location, ...LOCATIONS.filter((l) => l !== personEdit.location)].filter(Boolean).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </Field></div>
              </div>
              {personEditErr && <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>{personEditErr}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPersonEdit(null)}>Cancel</Button>
                <Button type="submit" style={{ background: C.ink, color: C.canvas }}>Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
