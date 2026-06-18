import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import {
  Heart,
  Clock,
  Wallet,
  GraduationCap,
  Users,
  Leaf,
  Download,
  Sparkles,
} from "lucide-react";
import { toPng } from "html-to-image";
import logoImage from "@/assets/zigbert-logo.png";

const themeCards = [
  {
    title: "Health & Wellbeing",
    icon: Heart,
    color: "bg-rose-500",
    borderColor: "border-rose-200",
    bgColor: "bg-rose-50",
    description: "Supporting physical and mental health is now a baseline expectation. Organisations are moving beyond EAPs to more proactive, preventative approaches.",
    ideas: [
      "Mental health first aiders and training for managers",
      "Wellbeing days (additional to sick leave)",
      "Health cash plans or private medical options",
      "Menopause support policies and awareness",
      "Access to counselling or therapy sessions",
    ],
  },
  {
    title: "Flexibility",
    icon: Clock,
    color: "bg-[#1f3553]",
    borderColor: "border-[#cdd6e2]",
    bgColor: "bg-[#eef1f6]",
    description: "Flexibility remains the most valued benefit. The focus has shifted from location to genuine autonomy over when and how people work.",
    ideas: [
      "Core hours with flexible start/end times",
      "Compressed working weeks (e.g., 9-day fortnight)",
      "Summer hours or early Friday finish",
      "Additional leave purchase schemes",
      "Sabbatical options after long service",
    ],
  },
  {
    title: "Financial Wellbeing",
    icon: Wallet,
    color: "bg-emerald-500",
    borderColor: "border-emerald-200",
    bgColor: "bg-emerald-50",
    description: "Cost of living pressures have elevated financial wellbeing. Support goes beyond pensions to immediate financial resilience.",
    ideas: [
      "Salary advance or earned wage access schemes",
      "Financial education and guidance services",
      "Savings schemes with employer matching",
      "Debt consolidation support or signposting",
      "One-off cost of living payments",
    ],
  },
  {
    title: "Learning & Development",
    icon: GraduationCap,
    color: "bg-amber-500",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
    description: "Investment in personal growth signals commitment to employees' futures. Learning budgets are increasingly flexible and employee-directed.",
    ideas: [
      "Personal learning budgets (£500–£2,000/year)",
      "Study leave and exam support",
      "Professional subscription payments",
      "Mentoring and coaching programmes",
      "Internal mobility and secondment opportunities",
    ],
  },
  {
    title: "Inclusion & Family Support",
    icon: Users,
    color: "bg-purple-500",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
    description: "Inclusive policies support diverse life stages and circumstances. Family-friendly benefits help attract and retain talent across all demographics.",
    ideas: [
      "Enhanced parental leave (maternity, paternity, adoption)",
      "Fertility treatment support and leave",
      "Carers' leave policies",
      "Grandparent leave for new grandchildren",
      "Bereavement and pregnancy loss support",
    ],
  },
  {
    title: "Purpose & ESG-Aligned Benefits",
    icon: Leaf,
    color: "bg-teal-500",
    borderColor: "border-teal-200",
    bgColor: "bg-teal-50",
    description: "Benefits that align with environmental and social values resonate strongly, particularly with younger employees seeking purpose-driven employers.",
    ideas: [
      "Paid volunteering days (2–5 per year)",
      "Charity matching schemes",
      "Electric vehicle salary sacrifice schemes",
      "Cycle to work schemes",
      "Climate perks (extra leave for low-carbon travel)",
    ],
  },
];

const differentiatorBenefits = [
  { name: "Fertility support & leave", prevalence: "Emerging" },
  { name: "Pet-friendly policies", prevalence: "Growing" },
  { name: "Four-day week trials", prevalence: "Rare" },
  { name: "Unlimited annual leave", prevalence: "Rare" },
  { name: "Home office equipment budget", prevalence: "Common" },
  { name: "Wellbeing apps (Headspace, Calm)", prevalence: "Growing" },
  { name: "Financial coaching", prevalence: "Emerging" },
  { name: "Career break / sabbatical schemes", prevalence: "Moderate" },
];

export function BenefitsTrends() {
  const gridRef = useRef<HTMLDivElement>(null!);

  const downloadImage = async () => {
    if (gridRef.current) {
      try {
        const dataUrl = await toPng(gridRef.current, { backgroundColor: "#f8fafc", pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = "benefits-trends-summary.png";
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to download image", err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="benefits-trends-subtitle"
            defaultValue="Innovation in Reward"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="benefits-trends"
          />
          <EditableText
            contentKey="benefits-trends-title"
            defaultValue="Benefit Trends & Ideas"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="benefits-trends"
          />
          <EditableText
            contentKey="benefits-trends-intro"
            defaultValue="Guidance on emerging themes and ideas to enhance your benefits offering."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="benefits-trends"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" style={{ opacity: 1 }} />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={downloadImage} className="gap-2">
          <Download className="w-4 h-4" />
          Download Summary
        </Button>
      </div>

      <div ref={gridRef} className="p-6 bg-slate-50 rounded-xl">
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-6">Key Themes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeCards.map((theme, i) => (
            <Card key={i} className={`p-5 bg-white border ${theme.borderColor} shadow-sm`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${theme.color} flex items-center justify-center`}>
                  <theme.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-800">{theme.title}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{theme.description}</p>
              <div className={`p-3 rounded-lg ${theme.bgColor}`}>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Ideas to Consider</p>
                <ul className="space-y-1.5">
                  {theme.ideas.map((idea, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0" />
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-display font-bold text-xl">Differentiator Benefits</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Less common benefits that can help differentiate your offering in a competitive talent market.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {differentiatorBenefits.map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-medium text-sm text-slate-800 mb-1">{item.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                item.prevalence === "Rare" ? "bg-purple-100 text-purple-700" :
                item.prevalence === "Emerging" ? "bg-amber-100 text-amber-700" :
                item.prevalence === "Growing" ? "bg-cyan-100 text-cyan-700" :
                item.prevalence === "Moderate" ? "bg-slate-100 text-slate-700" :
                "bg-green-100 text-green-700"
              }`}>
                {item.prevalence}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-lg">
        <h3 className="text-xl font-display font-bold mb-4">Key Takeaway</h3>
        <p className="text-white/90 leading-relaxed">
          The most valued benefits are those that show genuine care for employees' lives beyond work. Focus on flexibility, recognition, and personal development—these create engagement and loyalty without the ongoing cost commitment of salary increases. Start with low-cost, high-impact changes before investing in premium benefits.
        </p>
      </Card>

      <Card className="p-6 bg-slate-50 border-0 shadow-sm">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-3">Using This Guidance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-700 mb-1">Prioritisation</p>
            <p>Consider what aligns with your organisation's values and workforce demographics. Not every benefit suits every employer—focus on those that will resonate most.</p>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">Implementation</p>
            <p>Start with pilot schemes or small-scale trials before full rollout. Gather employee feedback and measure uptake to refine your approach.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
