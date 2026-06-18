import { Card } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";
import { marketData, getPositioning } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MapPin, Briefcase, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import logoImage from "@/assets/zigbert-logo.png";

function SalaryRangeIndicator({ 
  current, 
  lq, 
  median, 
  uq 
}: { 
  current: number; 
  lq: number; 
  median: number; 
  uq: number;
}) {
  const min = Math.min(lq * 0.85, current * 0.9);
  const max = Math.max(uq * 1.15, current * 1.1);
  const range = max - min;
  
  const lqPos = ((lq - min) / range) * 100;
  const medianPos = ((median - min) / range) * 100;
  const uqPos = ((uq - min) / range) * 100;
  const currentPos = ((current - min) / range) * 100;
  
  const pos = getPositioning(current, lq, median, uq);

  return (
    <div className="mt-4">
      <div className="relative h-8 mb-2">
        <div 
          className="absolute top-3 h-2 bg-red-200 rounded-l-full" 
          style={{ left: 0, width: `${lqPos}%` }}
        />
        <div 
          className="absolute top-3 h-2 bg-gradient-to-r from-amber-200 via-green-200 to-emerald-200" 
          style={{ left: `${lqPos}%`, width: `${uqPos - lqPos}%` }}
        />
        <div 
          className="absolute top-3 h-2 bg-blue-200 rounded-r-full" 
          style={{ left: `${uqPos}%`, right: 0 }}
        />
        
        <div 
          className="absolute top-2.5 w-0.5 h-3 bg-gray-400"
          style={{ left: `${lqPos}%` }}
        />
        <div 
          className="absolute top-2.5 w-0.5 h-3 bg-gray-600"
          style={{ left: `${medianPos}%` }}
        />
        <div 
          className="absolute top-2.5 w-0.5 h-3 bg-gray-400"
          style={{ left: `${uqPos}%` }}
        />
        
        <div 
          className="absolute top-0 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all"
          style={{ 
            left: `calc(${currentPos}% - 8px)`,
            backgroundColor: pos.color 
          }}
        />
      </div>
      
      <div className="relative text-xs text-muted-foreground h-5">
        <span className="absolute text-red-600 font-medium" style={{ left: 0 }}>Below LQ</span>
        <span className="absolute" style={{ left: `calc(${lqPos}% - 6px)` }}>LQ</span>
        <span className="absolute" style={{ left: `calc(${medianPos}% - 10px)` }}>Med</span>
        <span className="absolute" style={{ left: `calc(${uqPos}% - 8px)` }}>UQ</span>
        <span className="absolute text-blue-600 font-medium" style={{ right: 0 }}>Above UQ</span>
      </div>
    </div>
  );
}

export function RoleDetails() {
  const positionColors: Record<string, string> = {
    below: "bg-red-500",
    lower: "bg-amber-500",
    upper: "bg-emerald-500",
    above: "bg-blue-500",
  };

  const positionIcons: Record<string, React.ReactNode> = {
    below: <TrendingDown className="w-4 h-4" />,
    lower: <TrendingDown className="w-4 h-4" />,
    upper: <TrendingUp className="w-4 h-4" />,
    above: <TrendingUp className="w-4 h-4" />,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EditableText
            contentKey="role-details-subtitle"
            defaultValue="Individual Role Analysis"
            className="text-sm font-medium text-accent uppercase tracking-wider mb-2"
            as="p"
            page="role-details"
          />
          <EditableText
            contentKey="role-details-title"
            defaultValue="Role-by-Role Detail"
            className="text-4xl lg:text-5xl font-display font-bold text-primary mb-4"
            as="h1"
            page="role-details"
          />
          <EditableText
            contentKey="role-details-intro"
            defaultValue="Detailed breakdown of each role with market positioning context from our market data."
            className="text-lg text-muted-foreground max-w-2xl"
            as="p"
            page="role-details"
          />
        </div>
        <img src={logoImage} alt="Zigbert" className="h-10 w-auto hidden lg:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketData.map((role, index) => {
          const pos = getPositioning(role.currentSalary, role.lowerQuartile, role.median, role.upperQuartile);
          const diff = role.currentSalary - role.median;
          const diffPercent = ((diff / role.median) * 100).toFixed(1);
          
          return (
            <Card 
              key={role.id} 
              className={cn(
                "p-6 bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 opacity-0 animate-slide-up",
                `stagger-${(index % 5) + 1}`
              )}
              data-testid={`role-card-${role.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg">{role.role}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {role.function}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {role.location}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1",
                    positionColors[pos.position]
                  )}
                >
                  {positionIcons[pos.position]}
                  {pos.label}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">LQ</p>
                  <p className="font-semibold text-sm">£{role.lowerQuartile.toLocaleString()}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">Median</p>
                  <p className="font-semibold text-sm">£{role.median.toLocaleString()}</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5">UQ</p>
                  <p className="font-semibold text-sm">£{role.upperQuartile.toLocaleString()}</p>
                </div>
                <div className="text-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary mb-0.5">Current</p>
                  <p className="font-bold text-sm text-primary">£{role.currentSalary.toLocaleString()}</p>
                </div>
              </div>

              <SalaryRangeIndicator 
                current={role.currentSalary}
                lq={role.lowerQuartile}
                median={role.median}
                uq={role.upperQuartile}
              />

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Variance from Median</span>
                  <span className={cn(
                    "font-semibold",
                    diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {diff > 0 ? "+" : ""}£{diff.toLocaleString()} ({diff > 0 ? "+" : ""}{diffPercent}%)
                  </span>
                </div>
                {role.notes && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-lg flex gap-2">
                    <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{role.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
