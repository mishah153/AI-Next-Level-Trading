"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import type { Instrument, MarketKind } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { MarketIcon } from "@/components/common/market-icon";
import { Sparkline } from "@/components/common/sparkline";
import { PriceChange } from "@/components/common/price-change";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPrice } from "@/lib/format";
import { symbolToSlug } from "@/lib/symbols";

type Filter = "all" | MarketKind;

export function MarketsExplorer({ instruments }: { instruments: Instrument[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return instruments.filter((i) => {
      const matchMarket = filter === "all" || i.market === filter;
      const matchQuery =
        !q ||
        i.symbol.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q);
      return matchMarket && matchQuery;
    });
  }, [instruments, filter, query]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets…"
            className="pl-9"
            aria-label="Search markets"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Market</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h</TableHead>
            <TableHead className="hidden text-right md:table-cell">
              24h Volume
            </TableHead>
            <TableHead className="hidden text-center sm:table-cell">
              Trend
            </TableHead>
            <TableHead className="text-center">AI Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((i) => (
            <TableRow key={i.id} className="cursor-pointer">
              <TableCell>
                <Star className="size-4 text-muted-foreground/40 hover:text-warning" />
              </TableCell>
              <TableCell>
                <Link
                  href={`/trade/${symbolToSlug(i.symbol)}`}
                  className="flex items-center gap-2.5"
                >
                  <MarketIcon symbol={i.symbol} market={i.market} />
                  <div>
                    <p className="font-medium">{i.symbol}</p>
                    <p className="text-xs text-muted-foreground">{i.name}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="tabular text-right font-medium">
                {formatPrice(i.price)}
              </TableCell>
              <TableCell className="text-right">
                <PriceChange value={i.change24hPct} size="sm" showIcon={false} />
              </TableCell>
              <TableCell className="tabular hidden text-right text-muted-foreground md:table-cell">
                {formatCurrency(i.volume24hUsd, { compact: true })}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex justify-center">
                  <Sparkline
                    data={i.sparkline}
                    positive={i.change24hPct >= 0}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    i.aiScore >= 75
                      ? "profit"
                      : i.aiScore >= 55
                        ? "default"
                        : "neutral"
                  }
                >
                  {i.aiScore}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No markets match your search.
        </p>
      )}
    </Card>
  );
}
