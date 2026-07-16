"use client";

import Link from "next/link";
import { Wallet, TrendingUp, PiggyBank, Activity, ArrowRight, Bot } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/common/stat-card";
import { DisclaimerBanner } from "@/components/common/disclaimer-banner";
import { PriceChange } from "@/components/common/price-change";
import { EquityChart } from "@/components/charts/equity-chart";
import { AllocationChart } from "@/components/charts/allocation-chart";
import { SignalCard } from "@/components/widgets/signal-card";
import { WhaleItem } from "@/components/widgets/whale-item";
import { InstrumentRow } from "@/components/widgets/instrument-row";
import { ActivityFeed } from "@/components/widgets/activity-feed";
import { formatCurrency, formatSigned } from "@/lib/format";
import {
  useActivity,
  useInstruments,
  usePortfolioSummary,
  useSignals,
  useStrategies,
  useWhales,
} from "@/lib/api/hooks";

export function DashboardView() {
  const { data: portfolio } = usePortfolioSummary();
  const { data: strategies = [] } = useStrategies();
  const { data: signals = [] } = useSignals();
  const { data: instruments = [] } = useInstruments();
  const { data: whales = [] } = useWhales();
  const { data: activity = [] } = useActivity();

  if (!portfolio) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const topSignals = signals.slice(0, 2);
  const movers = [...instruments]
    .sort((a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct))
    .slice(0, 5);
  const activeStrategies = strategies.filter((s) => s.enabled);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(portfolio.totalValueUsd)}
          changePct={portfolio.pnl24hPct}
          hint="24h"
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="24h P&L"
          value={formatSigned(portfolio.pnl24hUsd)}
          changePct={portfolio.pnl24hPct}
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="All-time P&L"
          value={formatSigned(portfolio.pnlAllTimeUsd)}
          changePct={portfolio.pnlAllTimePct}
          icon={<Activity className="size-4" />}
        />
        <StatCard
          label="Available (USDC)"
          value={formatCurrency(portfolio.availableUsd)}
          hint="Ready to deploy"
          icon={<PiggyBank className="size-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: equity + signals */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Portfolio Performance</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Last 90 days ·{" "}
                  <span className="text-profit">
                    {formatSigned(portfolio.pnlAllTimeUsd)}
                  </span>
                </p>
              </div>
              <Badge variant="profit">
                <PriceChange
                  value={portfolio.pnlAllTimePct}
                  size="sm"
                  showIcon={false}
                />
              </Badge>
            </CardHeader>
            <CardContent>
              <EquityChart data={portfolio.equityCurve} />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Top AI Signals
            </h2>
            <Link
              href="/signals"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              See all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {topSignals.map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>
        </div>

        {/* Right: allocation + automation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationChart data={portfolio.allocation} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-4 text-primary" /> Automation
              </CardTitle>
              <Badge variant="profit">{activeStrategies.length} active</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {strategies.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Limit{" "}
                      {formatCurrency(s.spendingLimitUsd, { compact: true })} ·{" "}
                      {s.stats.winRate}% win
                    </p>
                  </div>
                  <Switch checked={s.enabled} aria-label={`Toggle ${s.name}`} />
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/automation">Manage automation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: whales + movers + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">🐋 Whale Feed</CardTitle>
            <Link
              href="/whales"
              className="text-xs font-medium text-primary hover:underline"
            >
              Live feed
            </Link>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {whales.slice(0, 4).map((tx) => (
              <WhaleItem key={tx.id} tx={tx} compact />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Movers</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {movers.map((m) => (
              <InstrumentRow key={m.id} instrument={m} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
