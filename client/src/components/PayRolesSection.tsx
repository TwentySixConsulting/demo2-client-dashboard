import { useState } from "react";
import { Plus, Trash2, LineChart } from "lucide-react";
import { C } from "@/lib/theme";
import { marketData, getPositioning } from "@/lib/data";
import { useUserRoles, addUserRole, removeUserRole, isUserRole } from "@/lib/userRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GBP = (n: number) => `£${Math.round(n).toLocaleString()}`;

interface FormState {
  role: string;
  function: string;
  jobLevel: string;
  location: string;
  currentSalary: string;
  lowerQuartile: string;
  median: string;
  upperQuartile: string;
}

const EMPTY_FORM: FormState = {
  role: "",
  function: "",
  jobLevel: "3",
  location: "Brighton",
  currentSalary: "",
  lowerQuartile: "",
  median: "",
  upperQuartile: "",
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-[11px] font-semibold uppercase mb-1.5 block" style={{ color: C.inkMuted, letterSpacing: "0.1em" }}>
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[10.5px] mt-1" style={{ color: C.inkSubtle }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function PayRolesSection() {
  const userRoles = useUserRoles();
  const allRoles = [...marketData, ...userRoles];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cur = Number(form.currentSalary);
    const lq = Number(form.lowerQuartile);
    const md = Number(form.median);
    const uq = Number(form.upperQuartile);
    const level = Number(form.jobLevel);

    if (!form.role.trim() || !form.function.trim()) {
      setError("Please give the role a title and a function.");
      return;
    }
    if (![cur, lq, md, uq].every((n) => Number.isFinite(n) && n > 0)) {
      setError("Enter valid salary figures for current, lower quartile, median and upper quartile.");
      return;
    }
    if (!(lq <= md && md <= uq)) {
      setError("Quartiles must increase: lower quartile ≤ median ≤ upper quartile.");
      return;
    }
    addUserRole({
      role: form.role.trim(),
      function: form.function.trim(),
      jobLevel: Number.isFinite(level) ? level : 3,
      location: form.location.trim() || "Brighton",
      currentSalary: cur,
      lowerQuartile: lq,
      lowerMid: Math.round((lq + md) / 2),
      median: md,
      upperMid: Math.round((md + uq) / 2),
      upperQuartile: uq,
    });
    setForm(EMPTY_FORM);
    setError(null);
    setOpen(false);
  }

  return (
    <section className="mt-12">
      {/* header row with Add button */}
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="text-[10px] font-semibold uppercase mb-2" style={{ color: C.brass, letterSpacing: "0.26em" }}>
            Your pay roles
          </div>
          <h2 className="text-[22px] lg:text-[24px] font-semibold tracking-tight" style={{ color: C.ink }}>
            Roles in your Pay benchmark
          </h2>
          <p className="text-[13px] mt-1.5 max-w-[60ch]" style={{ color: C.inkMuted }}>
            The roles submitted for benchmarking, plus any you add. Added roles are saved to this
            browser and appear in your Pay report on its next refresh.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="gap-2"
              style={{ background: C.ink, color: C.canvas }}
            >
              <Plus className="w-4 h-4" />
              Add a role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle style={{ color: C.ink }}>Add a role to your benchmark</DialogTitle>
              <DialogDescription style={{ color: C.inkMuted }}>
                We'll position it against the market using the quartiles you provide.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Role title">
                  <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Senior Product Manager" />
                </Field>
                <Field label="Function">
                  <Input value={form.function} onChange={(e) => set("function", e.target.value)} placeholder="e.g. Product" />
                </Field>
                <Field label="Job level" hint="1 = most senior · 6 = entry">
                  <Input type="number" min={1} max={6} value={form.jobLevel} onChange={(e) => set("jobLevel", e.target.value)} />
                </Field>
                <Field label="Location">
                  <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Brighton" />
                </Field>
                <Field label="Current salary">
                  <Input type="number" min={0} value={form.currentSalary} onChange={(e) => set("currentSalary", e.target.value)} placeholder="62000" />
                </Field>
                <Field label="Median (market)">
                  <Input type="number" min={0} value={form.median} onChange={(e) => set("median", e.target.value)} placeholder="65000" />
                </Field>
                <Field label="Lower quartile">
                  <Input type="number" min={0} value={form.lowerQuartile} onChange={(e) => set("lowerQuartile", e.target.value)} placeholder="58000" />
                </Field>
                <Field label="Upper quartile">
                  <Input type="number" min={0} value={form.upperQuartile} onChange={(e) => set("upperQuartile", e.target.value)} placeholder="73000" />
                </Field>
              </div>

              {error && (
                <p className="text-[12.5px] rounded-lg px-3 py-2" style={{ background: C.roseSoft, color: C.rose }}>
                  {error}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" style={{ background: C.ink, color: C.canvas }}>
                  Add role
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* roles list */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
        {/* header */}
        <div
          className="hidden sm:grid items-center px-5 py-2.5 text-[10px] font-semibold uppercase"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1.4fr 0.4fr", color: C.inkSubtle, letterSpacing: "0.1em", borderBottom: `1px solid ${C.borderSubtle}` }}
        >
          <span>Role</span>
          <span className="text-right">Current</span>
          <span className="text-right">Median</span>
          <span className="text-right">Position</span>
          <span />
        </div>

        {allRoles.map((r, i) => {
          const pos = getPositioning(r.currentSalary, r.lowerQuartile, r.median, r.upperQuartile);
          const deltaPct = ((r.currentSalary - r.median) / r.median) * 100;
          const added = isUserRole(r.id);
          return (
            <div
              key={r.id}
              className="grid items-center px-5 py-3.5 gap-y-1"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1.4fr 0.4fr",
                borderTop: i === 0 ? "none" : `1px solid ${C.borderSubtle}`,
              }}
            >
              <div className="col-span-2 sm:col-span-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold truncate" style={{ color: C.ink }}>
                    {r.role}
                  </span>
                  {added && (
                    <span className="text-[9px] font-semibold uppercase rounded-full px-1.5 py-0.5 shrink-0" style={{ background: C.brassSoft, color: C.brassDeep, letterSpacing: "0.06em" }}>
                      Added
                    </span>
                  )}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: C.inkMuted }}>
                  {r.function} · Level {r.jobLevel} · {r.location}
                </div>
              </div>

              <div className="text-right text-[13px] tabular-nums" style={{ color: C.ink }}>
                {GBP(r.currentSalary)}
              </div>
              <div className="text-right text-[13px] tabular-nums" style={{ color: C.inkMuted }}>
                {GBP(r.median)}
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className="text-[11px] tabular-nums" style={{ color: deltaPct >= 0 ? C.success : C.warning }}>
                  {deltaPct >= 0 ? "+" : ""}
                  {deltaPct.toFixed(1)}%
                </span>
                <span
                  className="text-[10px] font-semibold rounded-full px-2 py-0.5 whitespace-nowrap"
                  style={{ background: `${pos.color.replace(")", ", 0.13)").replace("hsl", "hsla")}`, color: pos.color }}
                >
                  {pos.label}
                </span>
              </div>

              <div className="flex justify-end">
                {added ? (
                  <button
                    type="button"
                    onClick={() => removeUserRole(r.id)}
                    aria-label={`Remove ${r.role}`}
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    style={{ color: C.inkSubtle }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <LineChart className="w-3.5 h-3.5" style={{ color: C.inkSubtle, opacity: 0.5 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11.5px] mt-3" style={{ color: C.inkSubtle }}>
        {marketData.length} submitted · {userRoles.length} added by you · {allRoles.length} total
      </p>
    </section>
  );
}
