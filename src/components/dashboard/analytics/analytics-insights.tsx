import { Lightbulb, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsInsight } from "@/lib/analytics/insights";

const toneStyles = {
  positive: "border-primary/20 bg-primary/5",
  neutral: "border-border bg-card",
  action: "border-accent/40 bg-accent/10",
};

const toneIcons = {
  positive: Sparkles,
  neutral: Lightbulb,
  action: Target,
};

export function AnalyticsInsightsPanel({ insights }: { insights: AnalyticsInsight[] }) {
  if (!insights.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const Icon = toneIcons[insight.tone];
          return (
            <Card key={insight.title} className={toneStyles[insight.tone]}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{insight.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
