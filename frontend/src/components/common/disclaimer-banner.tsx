import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function DisclaimerBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3.5 py-2.5 text-xs text-muted-foreground",
        className
      )}
      role="note"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-warning" />
      <p>
        <span className="font-medium text-foreground">
          Decision-support tool.
        </span>{" "}
        AI signals and whale alerts are for informational and educational
        purposes only — not financial advice. Trading involves substantial risk;
        past performance does not guarantee future results.
      </p>
    </div>
  );
}
