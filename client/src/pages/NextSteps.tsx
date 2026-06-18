import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  FileText,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import logoImage from "@/assets/zigbert-logo.png";

const steps = [
  {
    number: "01",
    title: "Review Your Positioning",
    description: "Use the role cards to understand where each position sits against market data. Focus on roles at or below lower quartile as priority.",
  },
  {
    number: "02",
    title: "Prioritise Actions",
    description: "Identify roles that may need immediate attention due to recruitment difficulty, retention concerns, or significant market gaps.",
  },
  {
    number: "03",
    title: "Consider Total Reward",
    description: "Remember that base salary is only part of the picture. Consider benefits, development opportunities, and working conditions.",
  },
  {
    number: "04",
    title: "Plan Budget Allocation",
    description: "Use this data to inform your next pay review cycle and allocate budget where it will have the most impact.",
  },
];

const comparison = [
  {
    feature: "Number of roles",
    targeted: "Up to 15",
    bespoke: "Unlimited",
  },
  {
    feature: "Role matching",
    targeted: "Standard titles",
    bespoke: "Custom job evaluation",
  },
  {
    feature: "Data sources",
    targeted: "Sector surveys",
    bespoke: "Multiple validated sources",
  },
  {
    feature: "Analysis depth",
    targeted: "Market ranges",
    bespoke: "Full reward analysis",
  },
  {
    feature: "Recommendations",
    targeted: "General guidance",
    bespoke: "Tailored action plan",
  },
  {
    feature: "Support",
    targeted: "Report only",
    bespoke: "Consultant engagement",
  },
];

export function NextSteps() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="next-steps-subtitle"
            defaultValue="Taking Action"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="next-steps"
          />
          <EditableText
            contentKey="next-steps-title"
            defaultValue="Next Steps"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="next-steps"
          />
          <EditableText
            contentKey="next-steps-intro"
            defaultValue="Recommended actions and options for deeper analysis."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="next-steps"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" />
      </div>

      <Card className="p-6 bg-white border-0 shadow-md">
        <EditableText
          contentKey="next-steps-recommended"
          defaultValue="Recommended Next Steps"
          className="font-display font-bold text-xl mb-6"
          as="h3"
          page="next-steps"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-accent font-bold">{step.number}</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent" />
            <EditableText
              contentKey="next-steps-report-enough"
              defaultValue="When This Report Is Enough"
              className="font-display font-bold text-xl"
              as="h3"
              page="next-steps"
            />
          </div>
          <ul className="space-y-3">
            {[
              "You need a quick market check for common roles",
              "You're planning a standard annual pay review",
              "You want to validate proposed salaries for new hires",
              "You need high-level market positioning insight",
              "Budget constraints limit deeper analysis",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <EditableText
              contentKey="next-steps-consider-bespoke"
              defaultValue="When to Consider Bespoke Benchmarking"
              className="font-display font-bold text-xl"
              as="h3"
              page="next-steps"
            />
          </div>
          <ul className="space-y-3">
            {[
              "You have complex or hybrid roles to analyse",
              "You need a comprehensive pay structure review",
              "You're facing significant recruitment challenges",
              "You want detailed recommendations and implementation support",
              "You're undergoing organisational restructure",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground text-sm">
                <ArrowRight className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="font-display font-bold text-xl mb-6">Service Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                <th className="text-center py-3 px-4 font-semibold bg-muted/30">Targeted Report</th>
                <th className="text-center py-3 px-4 font-semibold bg-accent/10">Bespoke Benchmarking</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3 px-4 font-medium">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground bg-muted/30">{row.targeted}</td>
                  <td className="py-3 px-4 text-center bg-accent/10">{row.bespoke}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-8 bg-muted/30 border-0 shadow-md">
        <div className="text-center max-w-2xl mx-auto">
          <MessageCircle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="font-display font-bold text-2xl mb-2">Need Further Support?</h3>
          <p className="text-muted-foreground mb-6">
            Our team of reward consultants is here to help you make the most of this data and plan your next steps.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-contact">
              <Mail className="w-4 h-4 mr-2" />
              Get in Touch
            </Button>
            <Button variant="outline" data-testid="button-bespoke">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn About Bespoke
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="font-display font-bold text-xl mb-4">Contact Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">hello@twentysix.co.uk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">020 1234 5678</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <p className="font-medium">www.twentysix.co.uk</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
