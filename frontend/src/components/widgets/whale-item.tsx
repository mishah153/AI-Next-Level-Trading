import { ArrowRight, Fish } from "lucide-react";
import type { WhaleTransaction, WhaleTxType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, timeAgo } from "@/lib/format";
import { MOCK_NOW } from "@/lib/mock/data";

const TYPE_LABEL: Record<WhaleTxType, string> = {
  exchange_inflow: "Exchange inflow",
  exchange_outflow: "Exchange outflow",
  wallet_transfer: "Wallet transfer",
  options_sweep: "Options sweep",
  block_trade: "Block trade",
};

const IMPACT_VARIANT = {
  bullish: "profit",
  bearish: "loss",
  neutral: "neutral",
} as const;

export function WhaleItem({
  tx,
  compact = false,
}: {
  tx: WhaleTransaction;
  compact?: boolean;
}) {
  return (
    <div className="flex gap-3 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          tx.impact === "bullish"
            ? "bg-profit/15 text-profit"
            : tx.impact === "bearish"
              ? "bg-loss/15 text-loss"
              : "bg-muted text-muted-foreground"
        )}
      >
        <Fish className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{tx.asset}</span>
          <span className="tabular font-semibold">
            {formatCurrency(tx.amountUsd, { compact: true })}
          </span>
          <Badge variant={IMPACT_VARIANT[tx.impact]} className="text-[10px]">
            {TYPE_LABEL[tx.type]}
          </Badge>
        </div>
        {!compact && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{tx.from}</span>
            <ArrowRight className="size-3 shrink-0" />
            <span className="truncate">{tx.to}</span>
          </p>
        )}
        <p
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            compact && "line-clamp-1"
          )}
        >
          {tx.aiInterpretation}
        </p>
      </div>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {timeAgo(tx.timestamp, MOCK_NOW)}
      </span>
    </div>
  );
}
