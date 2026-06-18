import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import { marketData, getPositioning } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import logoImage from "@/assets/zigbert-logo.png";
import { toPng } from "html-to-image";

function QuartilesExplained() {
  const graphicRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (graphicRef.current) {
      try {
        const dataUrl = await toPng(graphicRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.download = "quartiles-explained.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Failed to export image:", error);
      }
    }
  };

  return (
    <Card className="p-6 bg-white border-0 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <EditableText
          contentKey="benchmarking-quartiles-explained"
          defaultValue="Quartiles Explained"
          className="font-display font-bold text-xl"
          as="h3"
          page="benchmarking"
        />
        <Button 
          onClick={handleExport} 
          variant="outline" 
          size="sm" 
          className="gap-2"
          data-testid="button-export-quartiles"
        >
          <Download className="w-4 h-4" />
          Export Image
        </Button>
      </div>

      <div ref={graphicRef} className="p-4 bg-white">
        <div className="mb-6">
          <div className="flex h-12 rounded-lg overflow-hidden border border-slate-200">
            <div className="flex-1 bg-red-100 flex items-center justify-center border-r border-slate-200">
              <span className="text-xs font-medium text-red-700 text-center px-1">Below Lower Quartile</span>
            </div>
            <div className="flex-1 bg-amber-100 flex items-center justify-center border-r border-slate-200">
              <span className="text-xs font-medium text-amber-700 text-center px-1">LQ → Median</span>
            </div>
            <div className="flex-1 bg-emerald-100 flex items-center justify-center border-r border-slate-200">
              <span className="text-xs font-medium text-emerald-700 text-center px-1">Median → UQ</span>
            </div>
            <div className="flex-1 bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-700 text-center px-1">Above Upper Quartile</span>
            </div>
          </div>

          <div className="relative h-8 mt-1">
            <div className="absolute left-0 right-0 top-0 h-px bg-slate-300" />
            
            <div className="absolute" style={{ left: "25%" }}>
              <div className="w-px h-3 bg-slate-400 -translate-x-1/2" />
              <p className="text-xs text-slate-600 font-medium mt-1 -translate-x-1/2 whitespace-nowrap">Lower Quartile</p>
            </div>
            
            <div className="absolute" style={{ left: "50%" }}>
              <div className="w-px h-3 bg-slate-600 -translate-x-1/2" />
              <p className="text-xs text-slate-800 font-semibold mt-1 -translate-x-1/2">Median</p>
            </div>
            
            <div className="absolute" style={{ left: "75%" }}>
              <div className="w-px h-3 bg-slate-400 -translate-x-1/2" />
              <p className="text-xs text-slate-600 font-medium mt-1 -translate-x-1/2 whitespace-nowrap">Upper Quartile</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Market data points:</strong> We use three standard reference points — Lower Quartile (LQ), Median, and Upper Quartile (UQ). 
          <strong> Position bands:</strong> Each role's salary is categorised into one of four bands based on where it falls relative to these reference points.
        </p>
      </div>
    </Card>
  );
}

export function Benchmarking() {
  const positionColors: Record<string, string> = {
    below: "bg-red-500",
    lower: "bg-amber-500",
    upper: "bg-emerald-500",
    above: "bg-blue-500",
  };

  const downloadCSV = () => {
    const headers = ["Role", "Function", "Current Salary", "Lower Quartile", "Median", "Upper Quartile", "Position"];
    const rows = marketData.map(role => {
      const pos = getPositioning(role.currentSalary, role.lowerQuartile, role.median, role.upperQuartile);
      return [
        role.role,
        role.function,
        role.currentSalary,
        role.lowerQuartile,
        role.median,
        role.upperQuartile,
        pos.label
      ].join(",");
    });
    
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "market_data_results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="benchmarking-subtitle"
            defaultValue="Salary Analysis"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="benchmarking"
          />
          <EditableText
            contentKey="benchmarking-title"
            defaultValue="Market Data Results"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="benchmarking"
          />
          <EditableText
            contentKey="benchmarking-intro"
            defaultValue="Overview of all roles with market ranges."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="benchmarking"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" style={{ opacity: 1 }} />
      </div>

      <QuartilesExplained />

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <EditableText
            contentKey="benchmarking-summary-table"
            defaultValue="Summary of Market Data & Position"
            className="font-display font-bold text-xl"
            as="h3"
            page="benchmarking"
          />
          <Button onClick={downloadCSV} variant="outline" className="gap-2" data-testid="button-download">
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-4 px-3 font-semibold">Role</th>
                <th className="text-left py-4 px-3 font-semibold">Function</th>
                <th className="text-right py-4 px-3 font-semibold">Current</th>
                <th className="text-right py-4 px-3 font-semibold text-amber-600">LQ</th>
                <th className="text-right py-4 px-3 font-semibold text-green-600">Median</th>
                <th className="text-right py-4 px-3 font-semibold text-blue-600">UQ</th>
                <th className="text-center py-4 px-3 font-semibold">Position</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((role, i) => {
                const pos = getPositioning(role.currentSalary, role.lowerQuartile, role.median, role.upperQuartile);
                return (
                  <tr 
                    key={role.id} 
                    className={cn(
                      "border-b transition-colors hover:bg-muted/20",
                      i % 2 === 0 ? "bg-white" : "bg-muted/10"
                    )}
                  >
                    <td className="py-3 px-3 font-medium">{role.role}</td>
                    <td className="py-3 px-3 text-muted-foreground">{role.function}</td>
                    <td className="py-3 px-3 text-right font-semibold text-primary">£{role.currentSalary.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">£{role.lowerQuartile.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">£{role.median.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">£{role.upperQuartile.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap",
                            positionColors[pos.position]
                          )}
                        >
                          {pos.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Below LQ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm text-muted-foreground">LQ to Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Median to UQ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">Above UQ</span>
        </div>
      </div>
    </div>
  );
}
