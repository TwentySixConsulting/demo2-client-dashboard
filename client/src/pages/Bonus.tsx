import { Card } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";
import { bonusData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Percent, Info } from "lucide-react";
import logoImage from "@/assets/zigbert-logo.png";

export function Bonus() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="bonus-subtitle"
            defaultValue="Variable Pay Analysis"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="bonus"
          />
          <EditableText
            contentKey="bonus-title"
            defaultValue="Bonus Potential"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="bonus"
          />
          <EditableText
            contentKey="bonus-intro"
            defaultValue="Market data on bonus levels by job level for the Technology sector."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="bonus"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" />
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white border-0 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <EditableText
              contentKey="bonus-about-data"
              defaultValue="About Bonus Data"
              className="text-xl font-display font-bold mb-2"
              as="h2"
              page="bonus"
            />
            <p className="text-white/80">
              The figures below represent typical bonus percentages as a proportion of base salary. In the Technology sector, bonuses and short-term incentives are common at all levels, with equity and long-term incentive plans (LTIPs) increasingly prevalent at senior and specialist roles.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <Percent className="w-5 h-5 text-accent" />
          <EditableText
            contentKey="bonus-by-job-level"
            defaultValue="Bonus by Job Level"
            className="font-display font-bold text-xl"
            as="h3"
            page="bonus"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-4 px-4 font-semibold">Job Level</th>
                <th className="text-center py-4 px-4 font-semibold">
                  <span className="text-amber-600">Lower Quartile</span>
                </th>
                <th className="text-center py-4 px-4 font-semibold">
                  <span className="text-green-600">Median</span>
                </th>
                <th className="text-center py-4 px-4 font-semibold">
                  <span className="text-blue-600">Upper Quartile</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {bonusData.map((row, i) => (
                <tr 
                  key={row.level} 
                  className={cn(
                    "border-b transition-colors hover:bg-muted/20",
                    i % 2 === 0 ? "bg-white" : "bg-muted/10",
                    row.level === "Sales Roles" && "bg-pink-50"
                  )}
                >
                  <td className="py-4 px-4 font-medium">{row.level}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-16 py-1.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                      {row.lq}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-16 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold">
                      {row.median}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-16 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {row.uq}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="font-display font-bold text-lg mb-4">Sector Trends</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>Bonus schemes are most common at executive and director level</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>Many organisations are moving towards team-based or organisational bonuses</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>Performance-related pay is increasingly linked to ESG and social impact metrics</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>One-off recognition payments are becoming more popular than annual bonuses</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="font-display font-bold text-lg mb-4">Considerations</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span>Bonus percentages shown are typical maximum or target amounts</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span>Actual payments depend on individual and organisational performance</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span>Sales roles typically have higher bonus potential with different structures</span>
            </li>
            <li className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <span>Consider total reward when comparing with organisations without bonus schemes</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
