import type { RecentTrade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPrice, formatNumber } from "@/lib/format";

export function RecentTrades({ trades }: { trades: RecentTrade[] }) {
  return (
    <div>
      <div className="grid grid-cols-3 px-3 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="space-y-px">
        {trades.map((t) => (
          <div key={t.id} className="grid grid-cols-3 px-3 py-0.5 text-xs">
            <span
              className={cn(
                "tabular font-medium",
                t.side === "buy" ? "text-profit" : "text-loss"
              )}
            >
              {formatPrice(t.price)}
            </span>
            <span className="tabular text-right text-muted-foreground">
              {formatNumber(t.size, { maximumFractionDigits: 3 })}
            </span>
            <span className="tabular text-right text-muted-foreground">
              {new Date(t.time).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
