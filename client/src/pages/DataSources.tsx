import { Card } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";
import { Database, FileText, Building2, Globe, CheckCircle2 } from "lucide-react";
import logoImage from "@/assets/zigbert-logo.png";

export function DataSources() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="data-sources-subtitle"
            defaultValue="Methodology"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="data-sources"
          />
          <EditableText
            contentKey="data-sources-title"
            defaultValue="Data Sources"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="data-sources"
          />
          <EditableText
            contentKey="data-sources-intro"
            defaultValue="Information about the data sources and methodology used in this report."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="data-sources"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <EditableText
              contentKey="data-sources-salary-data"
              defaultValue="Salary Data"
              className="font-display font-bold text-xl"
              as="h3"
              page="data-sources"
            />
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>TwentySix proprietary salary database</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Annual sector-specific salary surveys</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Client engagement data (anonymised)</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Published industry benchmarks</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <EditableText
              contentKey="data-sources-sector-data"
              defaultValue="Sector Data"
              className="font-display font-bold text-xl"
              as="h3"
              page="data-sources"
            />
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Technology sector specific surveys</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>TechUK and industry association data</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>South East / London tech sector networks</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Engineering and product reward forums</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-xl">Economic Data</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Office for National Statistics (ONS)</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Bank of England reports</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>CIPD reward surveys</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Living Wage Foundation</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-display font-bold text-xl">Benefits Data</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>TwentySix benefits surveys</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Client benefits audits</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Employee benefits research</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Industry publications</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="font-display font-bold text-xl mb-4">Our Methodology</h3>
        <div className="prose prose-sm text-muted-foreground max-w-none">
          <p className="mb-4">
            Each role submitted has been carefully matched against comparable positions in our database, taking into account:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Industry Match</h4>
              <p className="text-sm">Primary matching to Technology sector roles, with secondary matching to related digital and software industries.</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Location</h4>
              <p className="text-sm">Regional adjustments applied based on South East England and London market rates.</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Role Scope</h4>
              <p className="text-sm">Job level, reporting lines, and responsibilities considered in matching.</p>
            </div>
          </div>
          <p>
            Data is updated quarterly to ensure market ranges reflect current conditions. All data is anonymised and aggregated to protect the confidentiality of participating organisations.
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30 border-0">
        <p className="text-sm text-muted-foreground text-center">
          Data in this report is valid as of January 2026. For the most current market data or custom analysis, please contact your TwentySix consultant.
        </p>
      </Card>
    </div>
  );
}
