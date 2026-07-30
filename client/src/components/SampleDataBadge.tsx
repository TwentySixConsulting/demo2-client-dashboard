// A small, consistent "Illustrative sample data" chip so demo figures are never
// mistaken for a client's real numbers. Renders only when clientConfig.sampleData
// is true (set it false for a live client deployment). Mirror this in the static
// Pay/Benefits shells (client/public/*) so all three report surfaces agree.
import { Info } from "lucide-react";
import { clientConfig } from "@/config/clientConfig";
import { C } from "@/lib/theme";

export function SampleDataBadge({ className = "" }: { className?: string }) {
  if (!clientConfig.sampleData) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}
      style={{ background: C.slateSoft, color: C.slate }}
      title="These figures are illustrative sample data, not your organisation's real benchmarks."
    >
      <Info className="w-3 h-3" />
      Illustrative sample data
    </span>
  );
}
