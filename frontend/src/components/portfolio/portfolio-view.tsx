"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/common/stat-card";
import { EquityChart } from "@/components/charts/equity-chart";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { PositionsTable } from "@/components/portfolio/positions-table";
import { formatCurrency, formatSigned } from "@/lib/format";
import { usePortfolioSummary, usePositions } from "@/lib/api/hooks";

export function PortfolioView() {
  const { data: portfolio } = usePortfolioSummary();
  const { data: positions } = usePositions();

  if (!portfolio || !positions) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const totalUpnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total value"
          value={formatCurrency(portfolio.totalValueUsd)}
          changePct={portfolio.pnl24hPct}
          hint="24h"
        />
        <StatCard label="Invested" value={formatCurrency(portfolio.investedUsd)} />
        <StatCard label="Open positions uPnL" value={formatSigned(totalUpnl)} />
        <StatCard
          label="All-time return"
          value={formatSigned(portfolio.pnlAllTimeUsd)}
          changePct={portfolio.pnlAllTimePct}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Equity Curve</CardTitle>
            <Badge variant="profit">{portfolio.pnlAllTimePct}%</Badge>
          </CardHeader>
          <CardContent>
            <EquityChart data={portfolio.equityCurve} height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart data={portfolio.allocation} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <PositionsTable positions={positions} />
        </CardContent>
      </Card>
    </div>
  );
}
