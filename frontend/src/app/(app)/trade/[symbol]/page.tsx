import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketIcon } from "@/components/common/market-icon";
import { PriceChange } from "@/components/common/price-change";
import { ActionBadge } from "@/components/common/action-badge";
import { ConfidenceMeter } from "@/components/common/confidence-meter";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { OrderBookPanel } from "@/components/trade/order-book";
import { RecentTrades } from "@/components/trade/recent-trades";
import { OrderTicket } from "@/components/trade/order-ticket";
import { LivePrice } from "@/components/live/live-price";
import { formatPrice, formatCurrency } from "@/lib/format";
import { slugToSymbol } from "@/lib/symbols";
import {
  getCandles,
  getInstrument,
  getOrderBook,
  getRecentTrades,
  getSignals,
} from "@/lib/data/repositories";

interface Props {
  params: Promise<{ symbol: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const inst = await getInstrument(slugToSymbol(symbol));
  return {
    title: `${inst.symbol} · ${formatPrice(inst.price)}`,
    description: `Trade ${inst.name} with AI signals, whale tracking and live depth.`,
  };
}

export default async function TradePage({ params }: Props) {
  const { symbol } = await params;
  const instrument = await getInstrument(slugToSymbol(symbol));
  const [candles, book, trades, signals] = await Promise.all([
    getCandles(instrument.symbol),
    getOrderBook(instrument.symbol),
    getRecentTrades(instrument.symbol),
    getSignals(),
  ]);
  const signal = signals.find((s) => s.symbol === instrument.symbol);

  const stats = [
    { label: "24h High", value: formatPrice(instrument.high24h) },
    { label: "24h Low", value: formatPrice(instrument.low24h) },
    {
      label: "24h Volume",
      value: formatCurrency(instrument.volume24hUsd, { compact: true }),
    },
    { label: "AI Score", value: `${instrument.aiScore}/100` },
  ];

  return (
    <div className="space-y-4">
      {/* Instrument header */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <MarketIcon
              symbol={instrument.symbol}
              market={instrument.market}
              className="size-10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{instrument.symbol}</h1>
                <Badge variant="neutral" className="capitalize">
                  {instrument.market}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{instrument.name}</p>
            </div>
            <div className="ml-4 border-l pl-4">
              <LivePrice
                symbol={instrument.symbol}
                base={instrument.price}
                className="text-2xl font-semibold"
              />
              <PriceChange value={instrument.change24hPct} size="sm" />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="tabular text-sm font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between py-3">
            <Tabs defaultValue="1H">
              <TabsList className="h-8">
                {["15m", "1H", "4H", "1D", "1W"].map((tf) => (
                  <TabsTrigger key={tf} value={tf} className="h-6 text-xs">
                    {tf}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Badge variant="neutral">Candlestick</Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <CandlestickChart candles={candles} />
          </CardContent>
        </Card>

        {/* Order ticket */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Place Order</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTicket instrument={instrument} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Order Book</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-3 pt-0">
            <OrderBookPanel book={book} lastPrice={instrument.price} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-3 pt-0">
            <RecentTrades trades={trades} />
          </CardContent>
        </Card>

        {/* AI insight */}
        <Card className="border-primary/30">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signal ? (
              <>
                <div className="flex items-center justify-between">
                  <ActionBadge action={signal.action} />
                  <span className="text-xs text-muted-foreground">
                    {signal.timeframe} timeframe
                  </span>
                </div>
                <ConfidenceMeter value={signal.confidence} />
                <p className="text-sm text-muted-foreground">
                  {signal.summary}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/signals/${signal.id}`}>
                    View full analysis
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active AI signal for {instrument.symbol}. The model is
                monitoring order flow and whale activity.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
