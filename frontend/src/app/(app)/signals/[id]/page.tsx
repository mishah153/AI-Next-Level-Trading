import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Shield,
  TrendingUp,
  CandlestickChart as CandleIcon,
  Activity,
  Fish,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarketIcon } from "@/components/common/market-icon";
import { ActionBadge } from "@/components/common/action-badge";
import { ConfidenceMeter } from "@/components/common/confidence-meter";
import { DisclaimerBanner } from "@/components/common/disclaimer-banner";
import { WhaleItem } from "@/components/widgets/whale-item";
import { formatPrice, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MOCK_NOW } from "@/lib/mock/data";
import { getSignalById, getWhales } from "@/lib/data/repositories";
import { symbolToSlug } from "@/lib/symbols";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const signal = await getSignalById(id);
  return {
    title: signal ? `${signal.action} ${signal.symbol} · ${signal.confidence}%` : "Signal",
  };
}

const LAYER_ICON = [CandleIcon, Activity, Fish];

export default async function SignalDetailPage({ params }: Props) {
  const { id } = await params;
  const signal = await getSignalById(id);
  if (!signal) notFound();

  const whales = await getWhales();
  const relatedWhales = whales
    .filter((w) => w.asset === signal.symbol.split("/")[0])
    .slice(0, 3);
  const rr =
    Math.abs(signal.targetPrice - signal.price) /
    Math.abs(signal.price - signal.stopLoss || 1);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/signals">
          <ArrowLeft /> Back to signals
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MarketIcon
            symbol={signal.symbol}
            market={signal.market}
            className="size-11"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{signal.symbol}</h1>
              <ActionBadge action={signal.action} />
              <Badge variant="neutral">{signal.timeframe}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {signal.name} · generated {timeAgo(signal.createdAt, MOCK_NOW)}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/trade/${symbolToSlug(signal.symbol)}`}>
            Trade {signal.symbol}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: analysis */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conviction</span>
                <span className="text-2xl font-bold text-primary">
                  {signal.confidence}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConfidenceMeter value={signal.confidence} showLabel={false} />
              <p className="text-sm text-muted-foreground">{signal.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confirmation Logic</CardTitle>
              <p className="text-sm text-muted-foreground">
                Three independent layers must align before the AI fires a
                high-conviction call.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {signal.rationale.map((layer, i) => {
                const Icon = LAYER_ICON[i] ?? Activity;
                return (
                  <div key={layer.label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{layer.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Weight {layer.weight}%
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          layer.verdict === "bullish"
                            ? "profit"
                            : layer.verdict === "bearish"
                              ? "loss"
                              : "neutral"
                        }
                        className="capitalize"
                      >
                        {layer.verdict}
                      </Badge>
                    </div>
                    <p className="mt-2 pl-10 text-sm text-muted-foreground">
                      {layer.detail}
                    </p>
                    <div className="mt-2 ml-10 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          layer.verdict === "bullish"
                            ? "bg-profit"
                            : layer.verdict === "bearish"
                              ? "bg-loss"
                              : "bg-muted-foreground"
                        )}
                        style={{ width: `${layer.weight * 2.2}%` }}
                      />
                    </div>
                    {i < signal.rationale.length - 1 && (
                      <Separator className="mt-5" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {relatedWhales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🐋 Whale activity behind this signal
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y pt-0">
                {relatedWhales.map((w) => (
                  <WhaleItem key={w.id} tx={w} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: trade plan + backtest */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PlanRow
                icon={<TrendingUp className="size-4" />}
                label="Entry"
                value={formatPrice(signal.price)}
              />
              <PlanRow
                icon={<Target className="size-4 text-profit" />}
                label="Target"
                value={formatPrice(signal.targetPrice)}
                tone="profit"
              />
              <PlanRow
                icon={<Shield className="size-4 text-loss" />}
                label="Stop loss"
                value={formatPrice(signal.stopLoss)}
                tone="loss"
              />
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Risk / Reward</span>
                <span className="font-semibold">1 : {rr.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backtest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Win rate</span>
                <span className="font-semibold text-profit">
                  {signal.backtest.winRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sample size</span>
                <span className="font-medium">
                  {signal.backtest.sampleSize} setups
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. return</span>
                <span className="font-medium text-profit">
                  +{signal.backtest.avgReturnPct}%
                </span>
              </div>
            </CardContent>
          </Card>

          <DisclaimerBanner />
        </div>
      </div>
    </div>
  );
}

function PlanRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "profit" | "loss";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "tabular font-semibold",
          tone === "profit" && "text-profit",
          tone === "loss" && "text-loss"
        )}
      >
        {value}
      </span>
    </div>
  );
}
