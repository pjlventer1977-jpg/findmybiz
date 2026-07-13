import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsKpiCard({
  title,
  value,
  change,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
}) {
  const trend =
    change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              trend === "up"
                ? "text-primary"
                : trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
            {trend === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend === "flat" && <Minus className="h-3.5 w-3.5" />}
            {change! > 0 ? "+" : ""}
            {change}% vs previous period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
