import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Shield, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { toPng } from "html-to-image";
import logoImage from "@/assets/zigbert-logo.png";

type SegmentKey = "small_nfp" | "large_nfp" | "small_private" | "large_private" | "public" | "large_public";

interface SegmentOption {
  key: SegmentKey;
  label: string;
}

const segments: SegmentOption[] = [
  { key: "small_nfp", label: "Small not-for-profit" },
  { key: "large_nfp", label: "Large not-for-profit" },
  { key: "small_private", label: "Small private" },
  { key: "large_private", label: "Large private" },
  { key: "public", label: "Public" },
  { key: "large_public", label: "Public (large)" },
];

interface BenefitData {
  name: string;
  shortName: string;
  [key: string]: number | string;
}

const benefitsData: BenefitData[] = [
  { name: "Pension (employer contribution 5%+)", shortName: "Pension", small_nfp: 78, large_nfp: 95, small_private: 65, large_private: 88, public: 98, large_public: 99 },
  { name: "Annual leave (25+ days)", shortName: "Annual Leave", small_nfp: 72, large_nfp: 89, small_private: 58, large_private: 82, public: 95, large_public: 97 },
  { name: "Hybrid/remote working", shortName: "Hybrid/Remote", small_nfp: 85, large_nfp: 92, small_private: 78, large_private: 90, public: 75, large_public: 82 },
  { name: "Death in service (life assurance)", shortName: "Death in Service", small_nfp: 55, large_nfp: 82, small_private: 48, large_private: 85, public: 65, large_public: 78 },
  { name: "Car allowance / company car", shortName: "Car Allowance", small_nfp: 15, large_nfp: 35, small_private: 42, large_private: 58, public: 22, large_public: 38 },
  { name: "Enhanced maternity/paternity", shortName: "Enhanced Parental", small_nfp: 62, large_nfp: 78, small_private: 45, large_private: 72, public: 85, large_public: 88 },
];

const barColors = ["#0c1829", "#c9a84c", "#7b8ba5", "#a68a48", "#2a3f57", "#d9c179"];

export function Benefits() {
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>("large_nfp");
  const chartRef = useRef<HTMLDivElement>(null!);

  const currentSegment = segments.find((s) => s.key === selectedSegment);

  const chartData = benefitsData.map((b) => ({
    name: b.shortName,
    fullName: b.name,
    value: b[selectedSegment] as number,
  }));

  const downloadImage = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, { backgroundColor: "#ffffff", pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `benefits-breakdown-${selectedSegment}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to download image", err);
      }
    }
  };

  const downloadCSV = () => {
    const headers = ["Benefit", ...segments.map((s) => s.label)];
    const rows = benefitsData.map((b) => [
      b.name,
      ...segments.map((s) => `${b[s.key]}%`),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "benefits_breakdown_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
          <p className="font-semibold text-slate-800 mb-1">{data.fullName}</p>
          <p className="text-slate-600">
            <span className="font-medium text-[#9a7d2e]">{data.value}%</span> of organisations offer this
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="benefits-subtitle"
            defaultValue="Total Reward Analysis"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="benefits"
          />
          <EditableText
            contentKey="benefits-title"
            defaultValue="Benefits Breakdown"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="benefits"
          />
          <EditableText
            contentKey="benefits-intro"
            defaultValue="Market provision of key benefits by organisation type."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="benefits"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" style={{ opacity: 1 }} />
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <EditableText
              contentKey="benefits-about-data"
              defaultValue="About This Data"
              className="text-xl font-display font-bold mb-2"
              as="h2"
              page="benefits"
            />
            <p className="text-white/80">
              This shows the percentage of organisations in each segment that offer each benefit. Data is based on market surveys and industry benchmarks. Use the dropdown to compare different organisation types.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#b08d2e]" />
            <EditableText
              contentKey="benefits-prevalence"
              defaultValue="Benefits Prevalence"
              className="font-display font-bold text-xl"
              as="h3"
              page="benefits"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedSegment} onValueChange={(v) => setSelectedSegment(v as SegmentKey)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((seg) => (
                  <SelectItem key={seg.key} value={seg.key}>
                    {seg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={downloadImage} className="gap-2">
              <Download className="w-4 h-4" />
              Image
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2">
              <Download className="w-4 h-4" />
              CSV
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Showing: <span className="font-medium text-slate-700">{currentSegment?.label}</span>
        </p>

        <div ref={chartRef} className="bg-white p-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 text-center mt-2">
            Percentage of {currentSegment?.label.toLowerCase()} organisations offering each benefit
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="font-display font-bold text-xl mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 font-semibold text-slate-700">Benefit</th>
                {segments.map((seg) => (
                  <th
                    key={seg.key}
                    className={`text-center py-3 font-semibold ${seg.key === selectedSegment ? "text-[#9a7d2e] bg-[#f7efda]" : "text-slate-600"}`}
                  >
                    {seg.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benefitsData.map((benefit, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-800">{benefit.name}</td>
                  {segments.map((seg) => (
                    <td
                      key={seg.key}
                      className={`text-center py-3 ${seg.key === selectedSegment ? "font-semibold text-[#9a7d2e] bg-[#f7efda]" : "text-slate-600"}`}
                    >
                      {benefit[seg.key]}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-slate-50 border-0 shadow-sm">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-3">How to Use This Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-700 mb-1">Comparing Segments</p>
            <p>Use the dropdown to switch between organisation types and see how benefits provision varies. The table shows all segments side-by-side for easy comparison.</p>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">Interpreting Percentages</p>
            <p>Each percentage shows how common a benefit is within that segment. Higher percentages indicate that the benefit is more standard in that market.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
