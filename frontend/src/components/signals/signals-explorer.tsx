"use client";

import * as React from "react";
import type { Signal, SignalAction, MarketKind } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignalCard } from "@/components/widgets/signal-card";
import { EmptyState } from "@/components/common/empty-state";
import { Sparkles } from "lucide-react";

type ActionFilter = "all" | SignalAction;
type MarketFilter = "all" | MarketKind;

export function SignalsExplorer({ signals }: { signals: Signal[] }) {
  const [action, setAction] = React.useState<ActionFilter>("all");
  const [market, setMarket] = React.useState<MarketFilter>("all");
  const [sort, setSort] = React.useState<"confidence" | "recent">("confidence");

  const filtered = React.useMemo(() => {
    const list = signals.filter(
      (s) =>
        (action === "all" || s.action === action) &&
        (market === "all" || s.market === market)
    );
    return list.sort((a, b) =>
      sort === "confidence"
        ? b.confidence - a.confidence
        : +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [signals, action, market, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={action} onValueChange={(v) => setAction(v as ActionFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="BUY">Buy</TabsTrigger>
            <TabsTrigger value="SELL">Sell</TabsTrigger>
            <TabsTrigger value="SHORT">Short</TabsTrigger>
            <TabsTrigger value="NEUTRAL">Neutral</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Select value={market} onValueChange={(v) => setMarket(v as MarketFilter)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All markets</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confidence">Top confidence</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="No signals match your filters"
          description="Try widening the market or action filter."
        />
      )}
    </div>
  );
}
