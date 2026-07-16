import { cn } from "@/lib/utils";
import type { SignalAction } from "@/lib/types";

const MAP: Record<SignalAction, { cls: string; label: string }> = {
  BUY: { cls: "bg-profit/15 text-profit ring-profit/30", label: "BUY" },
  SELL: { cls: "bg-loss/15 text-loss ring-loss/30", label: "SELL" },
  SHORT: { cls: "bg-loss/15 text-loss ring-loss/30", label: "SHORT" },
  NEUTRAL: {
    cls: "bg-muted text-muted-foreground ring-border",
    label: "NEUTRAL",
  },
};

export function ActionBadge({
  action,
  className,
}: {
  action: SignalAction;
  className?: string;
}) {
  const { cls, label } = MAP[action];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset",
        cls,
        className
      )}
    >
      {label}
    </span>
  );
}
