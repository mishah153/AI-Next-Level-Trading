"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bot, ShieldCheck, Zap } from "lucide-react";
import type { AutomationStrategy } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency, formatSigned } from "@/lib/format";
import { MARKET_LABEL } from "@/components/common/market-icon";

function riskLabel(level: number) {
  if (level <= 33) return { label: "Conservative", cls: "text-profit" };
  if (level <= 66) return { label: "Balanced", cls: "text-primary" };
  return { label: "Aggressive", cls: "text-loss" };
}

export interface StrategyPatch {
  enabled?: boolean;
  autoExecute?: boolean;
  riskLevel?: number;
}

export function StrategyCard({
  strategy,
  onUpdate,
}: {
  strategy: AutomationStrategy;
  onUpdate?: (patch: StrategyPatch) => void;
}) {
  const [enabled, setEnabled] = React.useState(strategy.enabled);
  const [autoExec, setAutoExec] = React.useState(strategy.autoExecute);
  const [risk, setRisk] = React.useState([strategy.riskLevel]);
  const r = riskLabel(risk[0]);

  return (
    <Card className={cn(enabled && "border-primary/40")}>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="font-semibold">{strategy.name}</p>
            <p className="text-xs text-muted-foreground">
              {strategy.scope === "all"
                ? "All markets"
                : MARKET_LABEL[strategy.scope]}{" "}
              · {strategy.follows}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v);
              onUpdate?.({ enabled: v });
              toast.success(`${strategy.name} ${v ? "enabled" : "paused"}`);
            }}
            aria-label={`Toggle ${strategy.name}`}
          />
          <span className="text-[10px] text-muted-foreground">
            {enabled ? "Active" : "Paused"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{strategy.description}</p>

        {/* Risk toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" /> Risk tolerance
            </Label>
            <span className={cn("text-xs font-semibold", r.cls)}>
              {r.label}
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={risk}
            onValueChange={setRisk}
            onValueCommit={(v) => onUpdate?.({ riskLevel: v[0] })}
            disabled={!enabled}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Spending limit + auto execute */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Spending limit
            </p>
            <p className="tabular text-sm font-semibold">
              {formatCurrency(strategy.spendingLimitUsd, { compact: true })}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div>
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Zap className="size-3" /> Auto-execute
              </p>
              <p className="text-sm font-semibold">
                {autoExec ? "On" : "Manual"}
              </p>
            </div>
            <Switch
              checked={autoExec}
              onCheckedChange={(v) => {
                setAutoExec(v);
                onUpdate?.({ autoExecute: v });
              }}
              disabled={!enabled}
              aria-label="Auto-execute"
            />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="tabular font-semibold">{strategy.stats.trades30d}</p>
            <p className="text-muted-foreground">Trades 30d</p>
          </div>
          <div>
            <p className="tabular font-semibold text-profit">
              {strategy.stats.winRate}%
            </p>
            <p className="text-muted-foreground">Win rate</p>
          </div>
          <div>
            <p
              className={cn(
                "tabular font-semibold",
                strategy.stats.pnl30dUsd >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {formatSigned(strategy.stats.pnl30dUsd)}
            </p>
            <p className="text-muted-foreground">P&L 30d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
