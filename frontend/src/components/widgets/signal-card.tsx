import Link from "next/link";
import { ArrowRight, Clock, Target, Shield } from "lucide-react";
import type { Signal } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionBadge } from "@/components/common/action-badge";
import { ConfidenceMeter } from "@/components/common/confidence-meter";
import { MarketIcon } from "@/components/common/market-icon";
import { formatPrice, timeAgo } from "@/lib/format";
import { MOCK_NOW } from "@/lib/mock/data";

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Card className="flex flex-col p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MarketIcon symbol={signal.symbol} market={signal.market} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{signal.symbol}</span>
              <ActionBadge action={signal.action} />
            </div>
            <p className="text-xs text-muted-foreground">{signal.name}</p>
          </div>
        </div>
        <Badge variant="neutral" className="gap-1">
          <Clock className="size-3" /> {signal.timeframe}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {signal.summary}
      </p>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>AI Confidence</span>
        </div>
        <ConfidenceMeter value={signal.confidence} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-muted-foreground">Entry</p>
          <p className="tabular font-medium">{formatPrice(signal.price)}</p>
        </div>
        <div className="rounded-md bg-profit/10 p-2">
          <p className="flex items-center gap-1 text-profit">
            <Target className="size-3" /> Target
          </p>
          <p className="tabular font-medium">
            {formatPrice(signal.targetPrice)}
          </p>
        </div>
        <div className="rounded-md bg-loss/10 p-2">
          <p className="flex items-center gap-1 text-loss">
            <Shield className="size-3" /> Stop
          </p>
          <p className="tabular font-medium">{formatPrice(signal.stopLoss)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>
          Backtest win rate{" "}
          <span className="font-semibold text-profit">
            {signal.backtest.winRate}%
          </span>
        </span>
        <Link
          href={`/signals/${signal.id}`}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Details <ArrowRight className="size-3" />
        </Link>
      </div>
      <span className="mt-2 text-[10px] text-muted-foreground">
        {timeAgo(signal.createdAt, MOCK_NOW)}
      </span>
    </Card>
  );
}
