import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

interface PriceChangeProps {
  value: number; // percent
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function PriceChange({
  value,
  className,
  showIcon = true,
  size = "md",
}: PriceChangeProps) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 font-medium",
        up ? "text-profit" : "text-loss",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      {showIcon &&
        (up ? (
          <ArrowUpRight className="size-3.5" />
        ) : (
          <ArrowDownRight className="size-3.5" />
        ))}
      {formatPercent(value)}
    </span>
  );
}
