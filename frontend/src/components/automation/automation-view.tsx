"use client";

import { StatCard } from "@/components/common/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StrategyCard,
  type StrategyPatch,
} from "@/components/automation/strategy-card";
import { formatSigned } from "@/lib/format";
import { useStrategies, useUpdateStrategy } from "@/lib/api/hooks";

export function AutomationView() {
  const { data: strategies } = useStrategies();
  const update = useUpdateStrategy();

  if (!strategies) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    );
  }

  const active = strategies.filter((s) => s.enabled);
  const totalPnl = strategies.reduce((s, x) => s + x.stats.pnl30dUsd, 0);
  const totalTrades = strategies.reduce((s, x) => s + x.stats.trades30d, 0);
  const avgWin = Math.round(
    active.reduce((s, x) => s + x.stats.winRate, 0) / (active.length || 1),
  );

  const handleUpdate = (id: string, patch: StrategyPatch) => {
    update.mutate({ id, body: patch });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active strategies" value={`${active.length}`} />
        <StatCard label="Automated trades 30d" value={`${totalTrades}`} />
        <StatCard
          label="Automated P&L 30d"
          value={formatSigned(totalPnl)}
          changePct={Number(((totalPnl / 20000) * 100).toFixed(1))}
        />
        <StatCard label="Avg. win rate" value={`${avgWin}%`} hint="active only" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {strategies.map((s) => (
          <StrategyCard
            key={s.id}
            strategy={s}
            onUpdate={(patch) => handleUpdate(s.id, patch)}
          />
        ))}
      </div>
    </>
  );
}
