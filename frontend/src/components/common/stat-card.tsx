import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PriceChange } from "./price-change";

interface StatCardProps {
  label: string;
  value: string;
  changePct?: number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  changePct,
  hint,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className="tabular mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {changePct !== undefined && <PriceChange value={changePct} size="sm" />}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}
