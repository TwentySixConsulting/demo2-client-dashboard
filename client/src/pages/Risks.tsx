import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import { marketData } from "@/lib/data";
import { Download, Lightbulb, BarChart3, AlertCircle, Info, Scale } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import logoImage from "@/assets/zigbert-logo.png";

type PositionBand = "belowLQ" | "lqToMedian" | "medianToUQ" | "aboveUQ";

interface BandInfo {
  band: PositionBand;
  label: string;
  shortLabel: string;
  color: string;
}

const bandConfig: Record<PositionBand, BandInfo> = {
  belowLQ: { band: "belowLQ", label: "Below lower quartile", shortLabel: "Below LQ", color: "#94a3b8" },
  lqToMedian: { band: "lqToMedian", label: "Lower quartile → Median", shortLabel: "LQ → Median", color: "#7b8ba5" },
  medianToUQ: { band: "medianToUQ", label: "Median → Upper quartile", shortLabel: "Median → UQ", color: "#c9a84c" },
  aboveUQ: { band: "aboveUQ", label: "Above upper quartile", shortLabel: "Above UQ", color: "#0c1829" },
};

function getPositionBand(actual: number, lq: number, median: number, uq: number): PositionBand {
  if (actual < lq) return "belowLQ";
  if (actual < median) return "lqToMedian";
  if (actual <= uq) return "medianToUQ";
  return "aboveUQ";
}

function generateObservations(
  bandCounts: Record<PositionBand, number>,
  totalRoles: number,
  belowLQRoles: any[],
  aboveUQRoles: any[]
): string[] {
  const observations: string[] = [];
  
  const marketCoreCount = (bandCounts.lqToMedian || 0) + (bandCounts.medianToUQ || 0);
  const marketCorePercentage = Math.round((marketCoreCount / totalRoles) * 100);
  const medianBandPercentage = Math.round(((bandCounts.medianToUQ || 0) / totalRoles) * 100);
  const lqBandPercentage = Math.round(((bandCounts.lqToMedian || 0) / totalRoles) * 100);
  
  if (marketCorePercentage >= 70) {
    observations.push(`The majority of roles (${marketCorePercentage}%) sit within the market core, between lower quartile and upper quartile.`);
  } else if (marketCorePercentage >= 50) {
    observations.push(`Over half of roles (${marketCorePercentage}%) are positioned within the market core range.`);
  }
  
  if (medianBandPercentage > lqBandPercentage && medianBandPercentage >= 40) {
    observations.push(`Roles tend to cluster in the upper half of the market range (median to upper quartile).`);
  } else if (lqBandPercentage > medianBandPercentage && lqBandPercentage >= 40) {
    observations.push(`Roles tend to cluster in the lower half of the market range (lower quartile to median).`);
  }
  
  if (belowLQRoles.length > 0) {
    observations.push(`${belowLQRoles.length} role${belowLQRoles.length > 1 ? 's are' : ' is'} positioned below the lower quartile and may warrant review.`);
  }
  
  if (aboveUQRoles.length > 0) {
    observations.push(`${aboveUQRoles.length} role${aboveUQRoles.length > 1 ? 's are' : ' is'} positioned above the upper quartile.`);
  }
  
  if (belowLQRoles.length === 0 && aboveUQRoles.length === 0) {
    observations.push(`All roles sit within the market range (between lower and upper quartile), with no outliers.`);
  }
  
  const outlierCount = belowLQRoles.length + aboveUQRoles.length;
  if (outlierCount > 0) {
    const outlierPercentage = Math.round((outlierCount / totalRoles) * 100);
    observations.push(`${outlierPercentage}% of roles are positioned outside the interquartile range and may need attention.`);
  }
  
  return observations.slice(0, 5);
}

export function Risks() {
  const rolesWithBands = marketData.map((role) => ({
    ...role,
    band: getPositionBand(role.currentSalary, role.lowerQuartile, role.median, role.upperQuartile),
    gapToLQ: role.lowerQuartile - role.currentSalary,
    gapToUQ: role.currentSalary - role.upperQuartile,
  }));

  const bandCounts = rolesWithBands.reduce((acc, role) => {
    acc[role.band] = (acc[role.band] || 0) + 1;
    return acc;
  }, {} as Record<PositionBand, number>);

  const totalRoles = marketData.length;

  const distributionData = (Object.keys(bandConfig) as PositionBand[]).map((band) => ({
    name: bandConfig[band].shortLabel,
    fullName: bandConfig[band].label,
    value: bandCounts[band] || 0,
    color: bandConfig[band].color,
    percentage: Math.round(((bandCounts[band] || 0) / totalRoles) * 100),
  }));

  const belowLQRoles = rolesWithBands
    .filter((r) => r.band === "belowLQ")
    .sort((a, b) => b.gapToLQ - a.gapToLQ);

  const aboveUQRoles = rolesWithBands
    .filter((r) => r.band === "aboveUQ")
    .sort((a, b) => b.gapToUQ - a.gapToUQ);

  const observations = generateObservations(bandCounts, totalRoles, belowLQRoles, aboveUQRoles);

  const downloadCSV = () => {
    const headers = ["Role", "Function", "Current Salary", "Lower Quartile", "Median", "Upper Quartile", "Position Band", "Gap to LQ", "Gap to UQ"];
    const rows = rolesWithBands.map((role) => [
      role.role,
      role.function,
      role.currentSalary,
      role.lowerQuartile,
      role.median,
      role.upperQuartile,
      bandConfig[role.band].label,
      role.gapToLQ > 0 ? role.gapToLQ : 0,
      role.gapToUQ > 0 ? role.gapToUQ : 0,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "position_distribution_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="risks-subtitle"
            defaultValue="Pay Analysis"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="risks"
          />
          <EditableText
            contentKey="risks-title"
            defaultValue="Strengths & Risks"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="risks"
          />
          <EditableText
            contentKey="risks-intro"
            defaultValue="Position distribution and outlier analysis for your pay structure."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="risks"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" style={{ opacity: 1 }} />
      </div>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <EditableText
            contentKey="risks-key-observations"
            defaultValue="Key Observations"
            className="font-display font-bold text-xl"
            as="h3"
            page="risks"
          />
        </div>
        <ul className="space-y-2">
          {observations.map((obs, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              {obs}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <EditableText
              contentKey="risks-distribution-summary"
              defaultValue="Distribution Summary"
              className="font-display font-bold text-xl"
              as="h3"
              page="risks"
            />
          </div>
          <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(Object.keys(bandConfig) as PositionBand[]).map((band) => (
            <div
              key={band}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: bandConfig[band].color, backgroundColor: `${bandConfig[band].color}10` }}
            >
              <p className="text-3xl font-bold" style={{ color: bandConfig[band].color }}>
                {bandCounts[band] || 0}
              </p>
              <p className="text-sm text-slate-600 mt-1">{bandConfig[band].label}</p>
              <p className="text-xs text-slate-400">
                {Math.round(((bandCounts[band] || 0) / totalRoles) * 100)}% of roles
              </p>
            </div>
          ))}
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number, name: string, props: any) => [`${value} roles (${props.payload.percentage}%)`, props.payload.fullName]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-slate-500" />
            <EditableText
              contentKey="risks-watch-below-lq"
              defaultValue="Watch: Below Lower Quartile"
              className="font-display font-bold text-xl"
              as="h3"
              page="risks"
            />
          </div>
          <EditableText
            contentKey="risks-below-lq-desc"
            defaultValue="Roles positioned below market lower quartile, sorted by largest gap"
            className="text-sm text-muted-foreground mb-4"
            as="p"
            page="risks"
          />
          {belowLQRoles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-semibold text-slate-700">Role</th>
                    <th className="text-right py-2 font-semibold text-slate-700">Current</th>
                    <th className="text-right py-2 font-semibold text-slate-700">LQ</th>
                    <th className="text-right py-2 font-semibold text-slate-700">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {belowLQRoles.map((role) => (
                    <tr key={role.id} className="border-b border-slate-100">
                      <td className="py-3">
                        <p className="font-medium">{role.role}</p>
                        <p className="text-xs text-muted-foreground">{role.function}</p>
                      </td>
                      <td className="text-right py-3 font-medium">£{role.currentSalary.toLocaleString()}</td>
                      <td className="text-right py-3 text-slate-600">£{role.lowerQuartile.toLocaleString()}</td>
                      <td className="text-right py-3 font-semibold text-slate-700">-£{role.gapToLQ.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-lg">
              <p className="text-slate-600">No roles below lower quartile</p>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-teal-600" />
            <EditableText
              contentKey="risks-watch-above-uq"
              defaultValue="Watch: Above Upper Quartile"
              className="font-display font-bold text-xl"
              as="h3"
              page="risks"
            />
          </div>
          <EditableText
            contentKey="risks-above-uq-desc"
            defaultValue="Roles positioned above market upper quartile, sorted by largest gap"
            className="text-sm text-muted-foreground mb-4"
            as="p"
            page="risks"
          />
          {aboveUQRoles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-semibold text-slate-700">Role</th>
                    <th className="text-right py-2 font-semibold text-slate-700">Current</th>
                    <th className="text-right py-2 font-semibold text-slate-700">UQ</th>
                    <th className="text-right py-2 font-semibold text-slate-700">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {aboveUQRoles.map((role) => (
                    <tr key={role.id} className="border-b border-slate-100">
                      <td className="py-3">
                        <p className="font-medium">{role.role}</p>
                        <p className="text-xs text-muted-foreground">{role.function}</p>
                      </td>
                      <td className="text-right py-3 font-medium">£{role.currentSalary.toLocaleString()}</td>
                      <td className="text-right py-3 text-slate-600">£{role.upperQuartile.toLocaleString()}</td>
                      <td className="text-right py-3 font-semibold text-teal-700">+£{role.gapToUQ.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-lg">
              <p className="text-slate-600">No roles above upper quartile</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-[#b08d2e]" />
          <EditableText contentKey="risks-interpreting-title" defaultValue="Interpreting Market Position" className="font-display font-bold text-xl" as="h3" page="risks" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <EditableText contentKey="risks-upper-half-title" defaultValue="When positioning in the upper half may be appropriate" className="font-semibold text-slate-800 mb-3" as="h4" page="risks" />
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] mt-2 shrink-0" />
                <EditableText contentKey="risks-upper-1" defaultValue="Scarce or specialist skills that are difficult to recruit" as="span" page="risks" />
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] mt-2 shrink-0" />
                <EditableText contentKey="risks-upper-2" defaultValue="High retention risk for critical roles" as="span" page="risks" />
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] mt-2 shrink-0" />
                <EditableText contentKey="risks-upper-3" defaultValue="Roles with broader scope than typical market comparators" as="span" page="risks" />
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] mt-2 shrink-0" />
                <EditableText contentKey="risks-upper-4" defaultValue="Operating in highly competitive talent markets" as="span" page="risks" />
              </li>
            </ul>
          </div>
          <div>
            <EditableText contentKey="risks-lower-half-title" defaultValue="When positioning in the lower half may be appropriate" className="font-semibold text-slate-800 mb-3" as="h4" page="risks" />
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <EditableText contentKey="risks-lower-1" defaultValue="Role holder is still developing into the position" as="span" page="risks" />
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <EditableText contentKey="risks-lower-2" defaultValue="Role scope is narrower than market comparators" as="span" page="risks" />
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <EditableText contentKey="risks-lower-3" defaultValue="Organisation offers strong non-pay benefits" as="span" page="risks" />
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <EditableText contentKey="risks-lower-4" defaultValue="Geographic location has lower cost of living" as="span" page="risks" />
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#f7efda] rounded-lg border border-[#e6d6a3]">
          <EditableText 
            contentKey="risks-positioning-note" 
            defaultValue="Appropriate positioning depends on your pay policy. There is no single 'correct' market position—alignment should reflect your organisation's strategic priorities and reward philosophy."
            className="text-sm text-[#7a6326] font-medium" 
            as="p" 
            page="risks"
            multiline
          />
        </div>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-amber-500" />
          <EditableText contentKey="risks-equal-pay-title" defaultValue="Equal Pay Considerations" className="font-display font-bold text-xl" as="h3" page="risks" />
        </div>
        <div className="space-y-4 text-sm text-slate-600">
          <EditableText 
            contentKey="risks-equal-pay-para1" 
            defaultValue="Roles positioned as outliers (significantly below lower quartile or above upper quartile) can sometimes indicate internal equity issues that may require attention."
            as="p" 
            page="risks"
            multiline
          />
          <EditableText 
            contentKey="risks-equal-pay-para2" 
            defaultValue="Significant pay differences between comparable roles, particularly where there are gender or other protected characteristic dimensions, may present equal pay risk."
            as="p" 
            page="risks"
            multiline
          />
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 font-medium">
              We recommend conducting an equal pay audit as a next step to identify and address any potential internal equity concerns.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
