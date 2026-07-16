import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

function tone(value: number) {
  if (value >= 80) return "bg-profit";
  if (value >= 60) return "bg-primary";
  if (value >= 45) return "bg-warning";
  return "bg-loss";
}

export function ConfidenceMeter({
  value,
  className,
  showLabel = true,
}: ConfidenceMeterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone(value))}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="tabular w-9 shrink-0 text-right text-xs font-semibold">
          {value}%
        </span>
      )}
    </div>
  );
}
