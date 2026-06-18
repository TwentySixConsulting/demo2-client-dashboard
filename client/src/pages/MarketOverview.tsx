import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, TrendingDown, Percent, Users, AlertTriangle, ArrowRight, Download } from "lucide-react";
import logoImage from "@/assets/zigbert-logo.png";
import { toPng } from "html-to-image";

const inflationData = [
  { month: "Dec 24", cpi: 2.3 },
  { month: "Feb 25", cpi: 2.8 },
  { month: "Apr 25", cpi: 3.2 },
  { month: "Jun 25", cpi: 3.5 },
  { month: "Aug 25", cpi: 3.8 },
  { month: "Oct 25", cpi: 3.5 },
  { month: "Nov 25", cpi: 3.2 },
];

const unemploymentData = [
  { month: "Jul 24", rate: 4.2 },
  { month: "Sep 24", rate: 4.4 },
  { month: "Nov 24", rate: 4.6 },
  { month: "Jan 25", rate: 4.7 },
  { month: "Mar 25", rate: 4.8 },
  { month: "May 25", rate: 4.9 },
  { month: "Jul 25", rate: 5.0 },
  { month: "Nov 25", rate: 5.1 },
];

const payRiseComparisonData = [
  { category: "CIPD Forecast", value: 3.0, color: "#3b82f6" },
  { category: "Statutory Min Wage", value: 4.1, color: "#10b981" },
];

function ExportableChart({ 
  children, 
  title, 
  filename,
  contentKey,
  page = "market-context"
}: { 
  children: React.ReactNode; 
  title: string; 
  filename: string;
  contentKey?: string;
  page?: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      try {
        const dataUrl = await toPng(chartRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.download = `${filename}.png`;
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
        {contentKey ? (
          <EditableText
            contentKey={contentKey}
            defaultValue={title}
            className="font-display font-bold text-lg"
            as="h3"
            page={page}
          />
        ) : (
          <h3 className="font-display font-bold text-lg">{title}</h3>
        )}
        <Button 
          onClick={handleExport} 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
      <div ref={chartRef} className="bg-white p-2">
        {children}
      </div>
    </Card>
  );
}

export function MarketOverview() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="market-context-subtitle"
            defaultValue="Economic & Labour Market Analysis"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="market-context"
          />
          <EditableText
            contentKey="market-context-title"
            defaultValue="Market Context"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="market-context"
          />
          <EditableText
            contentKey="market-context-intro"
            defaultValue="Understanding the economic factors shaping pay decisions in 2026."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="market-context"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" style={{ opacity: 1 }} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <EditableText contentKey="stat-cpi-value" defaultValue="3.2%" className="text-3xl font-bold" as="p" page="market-context" />
          <EditableText contentKey="stat-cpi-label" defaultValue="CPI Inflation" className="text-sm font-medium text-white/90 mt-1" as="p" page="market-context" />
          <EditableText contentKey="stat-cpi-date" defaultValue="November 2025" className="text-xs text-white/60 mt-0.5" as="p" page="market-context" />
        </Card>

        <Card className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <EditableText contentKey="stat-unemployment-value" defaultValue="5.1%" className="text-3xl font-bold" as="p" page="market-context" />
          <EditableText contentKey="stat-unemployment-label" defaultValue="Unemployment" className="text-sm font-medium text-white/90 mt-1" as="p" page="market-context" />
          <EditableText contentKey="stat-unemployment-note" defaultValue="Up from 4.2% (Jul 24)" className="text-xs text-white/60 mt-0.5" as="p" page="market-context" />
        </Card>

        <Card className="p-5 bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <EditableText contentKey="stat-payrise-value" defaultValue="3.0%" className="text-3xl font-bold" as="p" page="market-context" />
          <EditableText contentKey="stat-payrise-label" defaultValue="Pay Rise Forecast" className="text-sm font-medium text-white/90 mt-1" as="p" page="market-context" />
          <EditableText contentKey="stat-payrise-note" defaultValue="CIPD 2026 Outlook" className="text-xs text-white/60 mt-0.5" as="p" page="market-context" />
        </Card>

        <Card className="p-5 bg-gradient-to-br from-teal-600 to-teal-700 text-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <EditableText contentKey="stat-minwage-value" defaultValue="4.1%" className="text-3xl font-bold" as="p" page="market-context" />
          <EditableText contentKey="stat-minwage-label" defaultValue="Min Wage Rise" className="text-sm font-medium text-white/90 mt-1" as="p" page="market-context" />
          <EditableText contentKey="stat-minwage-note" defaultValue="Statutory estimate" className="text-xs text-white/60 mt-0.5" as="p" page="market-context" />
        </Card>
      </div>

      {/* Inflation & Labour Market Section */}
      <Card className="p-8 bg-white border-0 shadow-md">
        <EditableText
            contentKey="section-inflation-labour-market"
            defaultValue="Inflation & the Labour Market"
            className="font-display font-bold text-2xl text-slate-800 mb-6"
            as="h2"
            page="market-context"
          />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="prose prose-sm max-w-none text-slate-600">
            <EditableText 
              contentKey="inflation-para-1" 
              defaultValue="The most recent data from the Office of National Statistics shows that twelve-month inflation in the Consumer Prices Index (CPI) was 3.2% in November. Inflation has been higher than expected all year – at the end of 2024, it was 2.3% but climbed steadily throughout much of 2025."
              className="mb-4 block" 
              as="p" 
              page="market-context"
              multiline
            />
            <EditableText 
              contentKey="inflation-para-2" 
              defaultValue="It is, however, finally starting to come down (it was 3.8% in August), but still sits above the Bank of England's target of 2%."
              className="mb-4 block" 
              as="p" 
              page="market-context"
              multiline
            />
            <EditableText 
              contentKey="inflation-para-3" 
              defaultValue="This level of inflation is likely to put upwards pressure on pay rises."
              className="block" 
              as="p" 
              page="market-context"
              multiline
            />
          </div>
          
          <ExportableChart title="CPI Inflation Trend" filename="cpi-inflation-trend" contentKey="chart-cpi-inflation-trend">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inflationData}>
                  <defs>
                    <linearGradient id="cpiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 5]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "CPI"]} />
                  <Area type="monotone" dataKey="cpi" stroke="#f59e0b" strokeWidth={2} fill="url(#cpiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">Bank of England target: 2%</p>
          </ExportableChart>
        </div>
      </Card>

      {/* Labour Market Weakening */}
      <Card className="p-8 bg-white border-0 shadow-md">
        <EditableText
            contentKey="section-labour-market-weakening"
            defaultValue="Labour Market Weakening"
            className="font-display font-bold text-2xl text-slate-800 mb-6"
            as="h2"
            page="market-context"
          />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExportableChart title="Unemployment Rate" filename="unemployment-trend" contentKey="chart-unemployment-rate">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={unemploymentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[3.5, 5.5]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Unemployment"]} />
                  <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">Rising from 4.2% (Jul 24) to 5.1% (Nov 25)</p>
          </ExportableChart>
          
          <div className="prose prose-sm max-w-none text-slate-600">
            <EditableText 
              contentKey="labour-market-intro" 
              defaultValue="At the same time, the UK labour market is weakening, meaning that there is more supply than demand for workers. This is characterised by:"
              className="mb-4 block" 
              as="p" 
              page="market-context"
              multiline
            />
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <EditableText contentKey="labour-list-1" defaultValue="Rising unemployment (4.2% → 5.1%)" as="span" page="market-context" />
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <EditableText contentKey="labour-list-2" defaultValue="Slowing job growth" as="span" page="market-context" />
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <EditableText contentKey="labour-list-3" defaultValue="Fewer job vacancies" as="span" page="market-context" />
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <EditableText contentKey="labour-list-4" defaultValue="Slower wage growth" as="span" page="market-context" />
              </li>
            </ul>
            <EditableText 
              contentKey="labour-market-conclusion" 
              defaultValue="This has slightly eased recruitment pressures for some organisations as the candidate pool has significantly increased, particularly for entry-level jobs. However, there is still a skill shortage and a fall in the quality of applications relative to 12 months ago."
              className="block" 
              as="p" 
              page="market-context"
              multiline
            />
          </div>
        </div>
      </Card>

      {/* Pay Rises in 2026 */}
      <Card className="p-8 bg-white border-0 shadow-md">
        <EditableText
            contentKey="section-pay-rises-2026"
            defaultValue="Pay Rises in 2026"
            className="font-display font-bold text-2xl text-slate-800 mb-6"
            as="h2"
            page="market-context"
          />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="prose prose-sm max-w-none text-slate-600">
            <p className="mb-4">
              We anticipate that continued increases in the <strong className="text-slate-800">statutory and Real Living Wages</strong> will continue to dominate the pay landscape throughout 2026.
            </p>
            <p className="mb-4">
              Pay rises as a whole are forecast to sit in the region of <strong className="text-slate-800">3.0%</strong> (CIPD Labour Market Outlook); however, the latest estimate for the statutory minimum wage is an increase of <strong className="text-slate-800">4.1%</strong>.
            </p>
            <p>
              This upwards pressure at the bottom of the market will have a longer term transformational effect on the labour market.
            </p>
          </div>
          
          <ExportableChart title="2026 Pay Rise Comparison" filename="pay-rise-comparison" contentKey="chart-pay-rise-comparison">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payRiseComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 5]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
                  <Tooltip formatter={(value: number) => [`${value}%`]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {payRiseComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ExportableChart>
        </div>
      </Card>

      {/* Key Trends */}
      <Card className="p-8 bg-slate-50 border border-slate-200">
        <EditableText
            contentKey="section-short-term-trends"
            defaultValue="What We're Seeing in the Short Term"
            className="font-display font-bold text-2xl text-slate-800 mb-6"
            as="h2"
            page="market-context"
          />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="text-amber-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Differential Pay Rises</h3>
            <p className="text-sm text-slate-600">
              The lion's share of any increased pay pot is going to those at the bottom of the market – this has resulted in some senior level salaries showing only small or no increases.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Pay Compression</h3>
            <p className="text-sm text-slate-600">
              Compression between bottom grades and those just above, causing difficulties in creating career paths, especially for some supervisory roles.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Market Flattening</h3>
            <p className="text-sm text-slate-600">
              We have seen the removal in distinction in pay both between different sectors and different regions for roles at the bottom of the market, outside London and the inner South East.
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Box */}
      <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white border-0 shadow-xl">
        <div className="flex items-start gap-4">
          <ArrowRight className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h3 className="font-display font-bold text-xl mb-2">Key Takeaway</h3>
            <p className="text-white/90 leading-relaxed">
              These labour market elements should act to moderate the upwards pressure on pay rises caused by the continuing stickiness of inflation. Organisations need to balance inflationary pressures with a weakening labour market when planning their 2026 pay strategy.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
