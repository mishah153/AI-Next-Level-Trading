"use client";

import * as React from "react";
import { Radar } from "lucide-react";
import type { WhaleTransaction, MarketKind, Sentiment } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WhaleItem } from "@/components/widgets/whale-item";
import { EmptyState } from "@/components/common/empty-state";

type MarketFilter = "all" | MarketKind;
type ImpactFilter = "all" | Sentiment;

export function WhaleFeed({
  transactions,
}: {
  transactions: WhaleTransaction[];
}) {
  const [market, setMarket] = React.useState<MarketFilter>("all");
  const [impact, setImpact] = React.useState<ImpactFilter>("all");

  const filtered = React.useMemo(
    () =>
      transactions.filter(
        (t) =>
          (market === "all" || t.market === market) &&
          (impact === "all" || t.impact === impact)
      ),
    [transactions, market, impact]
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-profit opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-profit" />
          </span>
          <span className="text-sm font-medium">Live feed</span>
          <Badge variant="neutral">{filtered.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Tabs value={impact} onValueChange={(v) => setImpact(v as ImpactFilter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="h-6 text-xs">All</TabsTrigger>
              <TabsTrigger value="bullish" className="h-6 text-xs">Bullish</TabsTrigger>
              <TabsTrigger value="bearish" className="h-6 text-xs">Bearish</TabsTrigger>
            </TabsList>
          </Tabs>
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
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="divide-y px-4">
          {filtered.map((tx) => (
            <WhaleItem key={tx.id} tx={tx} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="m-4 border-0"
          icon={<Radar className="size-5" />}
          title="No whale movements match these filters"
        />
      )}
    </Card>
  );
}
