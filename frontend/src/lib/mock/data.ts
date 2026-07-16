import { createRng, seedFrom } from "./rng";
import type {
  ActivityItem,
  AllocationSlice,
  AutomationStrategy,
  Candle,
  ExchangeConnection,
  Instrument,
  MarketKind,
  NewsItem,
  Order,
  OrderBook,
  Position,
  PortfolioSummary,
  RecentTrade,
  Signal,
  SignalAction,
  TierPlan,
  User,
  WhaleTransaction,
} from "../types";

/** Fixed reference clock so relative times are SSR-stable. */
export const MOCK_NOW = Date.parse("2026-07-15T14:30:00Z");

const isoAgo = (minutes: number) =>
  new Date(MOCK_NOW - minutes * 60_000).toISOString();

interface Seed {
  symbol: string;
  name: string;
  market: MarketKind;
  price: number;
}

const SEEDS: Seed[] = [
  { symbol: "BTC/USDT", name: "Bitcoin", market: "crypto", price: 68240.5 },
  { symbol: "ETH/USDT", name: "Ethereum", market: "crypto", price: 3552.18 },
  { symbol: "SOL/USDT", name: "Solana", market: "crypto", price: 172.44 },
  { symbol: "BNB/USDT", name: "BNB", market: "crypto", price: 605.9 },
  { symbol: "XRP/USDT", name: "XRP", market: "crypto", price: 0.5218 },
  { symbol: "AVAX/USDT", name: "Avalanche", market: "crypto", price: 36.12 },
  { symbol: "LINK/USDT", name: "Chainlink", market: "crypto", price: 18.34 },
  { symbol: "DOGE/USDT", name: "Dogecoin", market: "crypto", price: 0.1624 },
  { symbol: "AAPL", name: "Apple Inc.", market: "stocks", price: 213.4 },
  { symbol: "TSLA", name: "Tesla Inc.", market: "stocks", price: 245.18 },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "stocks", price: 128.72 },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "stocks", price: 448.9 },
  { symbol: "AMZN", name: "Amazon.com", market: "stocks", price: 185.3 },
  { symbol: "META", name: "Meta Platforms", market: "stocks", price: 505.6 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", market: "forex", price: 1.0854 },
  { symbol: "GBP/USD", name: "Pound / US Dollar", market: "forex", price: 1.2718 },
  { symbol: "USD/JPY", name: "US Dollar / Yen", market: "forex", price: 157.24 },
  { symbol: "AUD/USD", name: "Aussie / US Dollar", market: "forex", price: 0.6652 },
];

function buildInstrument(seed: Seed): Instrument {
  const rng = createRng(seedFrom(seed.symbol));
  const changePct = rng.range(-6.5, 7.2);
  const changeAbs = (seed.price * changePct) / 100;
  const spark: number[] = [];
  let p = seed.price - changeAbs;
  for (let i = 0; i < 24; i++) {
    p += (changeAbs / 24) * rng.range(0.2, 1.8) + seed.price * rng.gaussian() * 0.004;
    spark.push(Number(p.toFixed(seed.price < 1 ? 5 : 2)));
  }
  spark[spark.length - 1] = seed.price;
  const volume =
    seed.market === "forex"
      ? rng.range(2e9, 9e10)
      : seed.market === "stocks"
        ? rng.range(3e8, 9e9)
        : rng.range(2e8, 2.4e10);

  return {
    id: seed.symbol,
    symbol: seed.symbol,
    name: seed.name,
    market: seed.market,
    price: seed.price,
    change24hPct: Number(changePct.toFixed(2)),
    change24hAbs: Number(changeAbs.toFixed(seed.price < 1 ? 5 : 2)),
    high24h: Number((seed.price * rng.range(1.005, 1.06)).toFixed(2)),
    low24h: Number((seed.price * rng.range(0.94, 0.995)).toFixed(2)),
    volume24hUsd: volume,
    marketCapUsd:
      seed.market === "crypto" ? seed.price * rng.range(1e7, 2e9) : undefined,
    sparkline: spark,
    aiScore: rng.int(38, 96),
  };
}

export const instruments: Instrument[] = SEEDS.map(buildInstrument);

export function getInstrument(symbol: string): Instrument {
  return instruments.find((i) => i.symbol === symbol) ?? instruments[0];
}

/** Deterministic OHLC candles for a symbol. */
export function getCandles(symbol: string, count = 120): Candle[] {
  const inst = getInstrument(symbol);
  const rng = createRng(seedFrom("candles-" + symbol));
  const candles: Candle[] = [];
  const intervalSec = 3600;
  let close = inst.price * rng.range(0.9, 1.05);
  const startTime = Math.floor(MOCK_NOW / 1000) - count * intervalSec;
  for (let i = 0; i < count; i++) {
    const drift = (inst.price - close) * 0.02;
    const open = close;
    const vol = inst.price * 0.012;
    close = open + drift + rng.gaussian() * vol;
    const high = Math.max(open, close) + rng.range(0, vol);
    const low = Math.min(open, close) - rng.range(0, vol);
    const digits = inst.price < 1 ? 5 : 2;
    candles.push({
      time: startTime + i * intervalSec,
      open: Number(open.toFixed(digits)),
      high: Number(high.toFixed(digits)),
      low: Number(low.toFixed(digits)),
      close: Number(close.toFixed(digits)),
      volume: Math.round(rng.range(500, 9000)),
    });
  }
  const last = candles[candles.length - 1];
  last.close = inst.price;
  return candles;
}

export function getOrderBook(symbol: string): OrderBook {
  const inst = getInstrument(symbol);
  const rng = createRng(seedFrom("ob-" + symbol));
  const digits = inst.price < 1 ? 5 : 2;
  const step = inst.price * 0.0004;
  const bids = [];
  const asks = [];
  let bTotal = 0;
  let aTotal = 0;
  for (let i = 0; i < 12; i++) {
    const bSize = rng.range(0.5, 24);
    const aSize = rng.range(0.5, 24);
    bTotal += bSize;
    aTotal += aSize;
    bids.push({
      price: Number((inst.price - step * (i + 1)).toFixed(digits)),
      size: Number(bSize.toFixed(3)),
      total: Number(bTotal.toFixed(3)),
    });
    asks.push({
      price: Number((inst.price + step * (i + 1)).toFixed(digits)),
      size: Number(aSize.toFixed(3)),
      total: Number(aTotal.toFixed(3)),
    });
  }
  const spread = asks[0].price - bids[0].price;
  return {
    bids,
    asks,
    spread: Number(spread.toFixed(digits)),
    spreadPct: Number(((spread / inst.price) * 100).toFixed(3)),
  };
}

export function getRecentTrades(symbol: string, count = 30): RecentTrade[] {
  const inst = getInstrument(symbol);
  const rng = createRng(seedFrom("trades-" + symbol));
  const digits = inst.price < 1 ? 5 : 2;
  const out: RecentTrade[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `${symbol}-t${i}`,
      time: MOCK_NOW - i * rng.int(1500, 9000),
      price: Number((inst.price * rng.range(0.999, 1.001)).toFixed(digits)),
      size: Number(rng.range(0.01, 12).toFixed(4)),
      side: rng.chance(0.5) ? "buy" : "sell",
    });
  }
  return out;
}

/* ---------------------------------------------------------------- Signals */

const ACTIONS: SignalAction[] = ["BUY", "SELL", "SHORT", "NEUTRAL"];

function buildSignal(inst: Instrument, i: number): Signal {
  const rng = createRng(seedFrom("sig-" + inst.symbol + i));
  const action = rng.chance(0.55)
    ? "BUY"
    : rng.chance(0.5)
      ? "SELL"
      : rng.pick(ACTIONS);
  const bullish = action === "BUY";
  const confidence = rng.int(action === "NEUTRAL" ? 45 : 68, 96);
  const target = bullish
    ? inst.price * rng.range(1.03, 1.14)
    : inst.price * rng.range(0.87, 0.97);
  const stop = bullish
    ? inst.price * rng.range(0.95, 0.985)
    : inst.price * rng.range(1.015, 1.05);
  const digits = inst.price < 1 ? 5 : 2;

  return {
    id: `sig-${inst.symbol.replace(/\//g, "-")}-${i}`,
    symbol: inst.symbol,
    name: inst.name,
    market: inst.market,
    action,
    confidence,
    price: inst.price,
    targetPrice: Number(target.toFixed(digits)),
    stopLoss: Number(stop.toFixed(digits)),
    timeframe: rng.pick(["1H", "4H", "1D", "1W"]),
    createdAt: isoAgo(rng.int(3, 600)),
    status: rng.pick(["active", "active", "triggered", "closed"]),
    summary: bullish
      ? `Whale accumulation + oversold RSI at support suggests a high-probability reversal on ${inst.symbol}.`
      : action === "NEUTRAL"
        ? `Low volume and no meaningful whale flow — ${inst.symbol} likely ranges near current levels.`
        : `Large exchange inflow paired with a bearish reversal candle flags downside risk on ${inst.symbol}.`,
    rationale: [
      {
        label: "Candlestick pattern",
        weight: rng.int(20, 34),
        verdict: bullish ? "bullish" : action === "NEUTRAL" ? "neutral" : "bearish",
        detail: bullish
          ? "Bullish engulfing closed above the 4H support band."
          : action === "NEUTRAL"
            ? "Indecision doji following a sideways range."
            : "Shooting-star rejection at prior resistance.",
      },
      {
        label: "Technical indicators",
        weight: rng.int(22, 36),
        verdict: bullish ? "bullish" : action === "NEUTRAL" ? "neutral" : "bearish",
        detail: bullish
          ? `RSI ${rng.int(24, 33)} (oversold), MACD histogram turning positive.`
          : action === "NEUTRAL"
            ? `RSI ${rng.int(46, 55)} (neutral), flat moving averages.`
            : `RSI ${rng.int(68, 78)} (overbought), MACD rolling over.`,
      },
      {
        label: "Whale / on-chain flow",
        weight: rng.int(30, 46),
        verdict: bullish ? "bullish" : action === "NEUTRAL" ? "neutral" : "bearish",
        detail: bullish
          ? `$${rng.int(12, 240)}M net accumulation by smart-money wallets in 24h.`
          : action === "NEUTRAL"
            ? "No significant whale activity detected."
            : `$${rng.int(30, 520)}M moved to exchanges — distribution pressure.`,
      },
    ],
    backtest: {
      winRate: rng.int(62, 89),
      sampleSize: rng.int(120, 1400),
      avgReturnPct: Number(rng.range(1.4, 6.8).toFixed(1)),
    },
    resultPct:
      rng.chance(0.4) ? Number(rng.range(-4, 9).toFixed(1)) : undefined,
  };
}

export const signals: Signal[] = instruments
  .slice(0, 12)
  .map((inst, i) => buildSignal(inst, i))
  .sort((a, b) => b.confidence - a.confidence);

export function getSignal(id: string): Signal | undefined {
  return signals.find((s) => s.id === id);
}

/* ----------------------------------------------------------------- Whales */

const WHALE_TYPES = [
  "exchange_inflow",
  "exchange_outflow",
  "wallet_transfer",
  "options_sweep",
  "block_trade",
] as const;

const WALLETS = [
  "Unknown Wallet",
  "Binance Hot Wallet",
  "Coinbase Prime",
  "Institutional OTC",
  "Smart-Money Cluster",
  "Kraken Cold Storage",
  "Jump Trading",
  "Grayscale",
];

export const whaleTransactions: WhaleTransaction[] = Array.from(
  { length: 22 },
  (_, i) => {
    const rng = createRng(seedFrom("whale-" + i));
    const inst = rng.pick(instruments);
    const type = rng.pick(WHALE_TYPES);
    const amountUsd = rng.range(2.5e6, 640e6);
    const inflow = type === "exchange_inflow";
    const impact = inflow
      ? "bearish"
      : type === "exchange_outflow"
        ? "bullish"
        : rng.pick(["bullish", "bearish", "neutral"] as const);
    return {
      id: `whale-${i}`,
      asset: inst.symbol.split("/")[0],
      market: inst.market,
      type,
      amountUsd,
      amountAsset: Number((amountUsd / inst.price).toFixed(2)),
      from: rng.pick(WALLETS),
      to: rng.pick(WALLETS),
      timestamp: isoAgo(rng.int(1, 720)),
      impact,
      aiInterpretation: inflow
        ? "Large inflow to exchange often precedes selling pressure — AI flags elevated dump risk."
        : type === "exchange_outflow"
          ? "Coins leaving exchanges into cold storage signals accumulation and reduced sell-side liquidity."
          : type === "options_sweep"
            ? "Institutional sweep across multiple venues — aggressive directional positioning."
            : "Block trade negotiated off-book; watch for follow-through on the tape.",
      linkedSignalId: rng.chance(0.4)
        ? signals.find((s) => s.symbol === inst.symbol)?.id
        : undefined,
      txRef: `0x${(seedFrom("tx" + i) >>> 0).toString(16)}${i}a9f`,
    };
  }
).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

/* -------------------------------------------------------------- Positions */

export const positions: Position[] = instruments.slice(0, 6).map((inst, i) => {
  const rng = createRng(seedFrom("pos-" + inst.symbol));
  const side = rng.chance(0.6) ? "long" : "short";
  const leverage = rng.pick([1, 2, 3, 5, 10]);
  const entry = inst.price * rng.range(0.9, 1.08);
  const size = Number((rng.range(0.05, 8) * (inst.price < 1 ? 5000 : 1)).toFixed(3));
  const dir = side === "long" ? 1 : -1;
  const pnlPct = ((inst.price - entry) / entry) * 100 * dir * leverage;
  const notional = size * entry;
  const margin = notional / leverage;
  const liq =
    side === "long"
      ? entry * (1 - 0.9 / leverage)
      : entry * (1 + 0.9 / leverage);
  return {
    id: `pos-${i}`,
    symbol: inst.symbol,
    name: inst.name,
    market: inst.market,
    side,
    size,
    entryPrice: Number(entry.toFixed(inst.price < 1 ? 5 : 2)),
    markPrice: inst.price,
    leverage,
    liquidationPrice: Number(liq.toFixed(inst.price < 1 ? 5 : 2)),
    marginUsd: Number(margin.toFixed(2)),
    unrealizedPnl: Number(((notional * pnlPct) / 100 / leverage).toFixed(2)),
    unrealizedPnlPct: Number(pnlPct.toFixed(2)),
    openedAt: isoAgo(rng.int(60, 8000)),
    source: rng.chance(0.5) ? "automation" : "manual",
  };
});

/* ----------------------------------------------------------------- Orders */

export const orders: Order[] = Array.from({ length: 14 }, (_, i): Order => {
  const rng = createRng(seedFrom("ord-" + i));
  const inst = rng.pick(instruments);
  const type = rng.pick(["market", "limit", "stop"] as const);
  const status = rng.pick([
    "open",
    "filled",
    "filled",
    "partial",
    "canceled",
  ] as const);
  return {
    id: `ORD-${10480 + i}`,
    symbol: inst.symbol,
    market: inst.market,
    side: rng.chance(0.5) ? "buy" : "sell",
    type,
    price: type === "market" ? null : Number((inst.price * rng.range(0.96, 1.04)).toFixed(2)),
    size: Number(rng.range(0.1, 12).toFixed(3)),
    filledPct:
      status === "filled" ? 100 : status === "partial" ? rng.int(20, 80) : 0,
    status,
    createdAt: isoAgo(rng.int(2, 4000)),
    source: rng.chance(0.45) ? "automation" : "manual",
  };
}).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

/* ------------------------------------------------------------ Connections */

export const connections: ExchangeConnection[] = [
  {
    id: "conn-binance",
    provider: "binance",
    label: "Binance — Main",
    market: "crypto",
    status: "connected",
    balanceUsd: 48210.55,
    connectedAt: isoAgo(43200),
    permissions: ["Read", "Spot Trade", "Futures Trade"],
    mfaEnabled: true,
  },
  {
    id: "conn-coinbase",
    provider: "coinbase",
    label: "Coinbase Advanced",
    market: "crypto",
    status: "connected",
    balanceUsd: 12980.12,
    connectedAt: isoAgo(129600),
    permissions: ["Read", "Spot Trade"],
    mfaEnabled: true,
  },
  {
    id: "conn-alpaca",
    provider: "alpaca",
    label: "Alpaca Brokerage",
    market: "stocks",
    status: "connected",
    balanceUsd: 32450.0,
    connectedAt: isoAgo(20160),
    permissions: ["Read", "Equity Trade"],
    mfaEnabled: false,
  },
  {
    id: "conn-oanda",
    provider: "oanda",
    label: "OANDA FX",
    market: "forex",
    status: "error",
    balanceUsd: 0,
    connectedAt: isoAgo(5760),
    permissions: ["Read"],
    mfaEnabled: true,
  },
];

/* ------------------------------------------------------------- Strategies */

export const strategies: AutomationStrategy[] = [
  {
    id: "auto-1",
    name: "Whale Reversal Hunter",
    description:
      "Enters spot longs when AI detects whale accumulation + oversold RSI on majors.",
    scope: "crypto",
    riskLevel: 35,
    spendingLimitUsd: 1000,
    enabled: true,
    autoExecute: true,
    connectionId: "conn-binance",
    follows: "BUY signals · confidence ≥ 80%",
    stats: { trades30d: 42, winRate: 74, pnl30dUsd: 1284.5, pnl30dPct: 12.8 },
  },
  {
    id: "auto-2",
    name: "Momentum Breakout",
    description:
      "Scales into breakouts confirmed by options-sweep flow across large caps.",
    scope: "stocks",
    riskLevel: 62,
    spendingLimitUsd: 5000,
    enabled: true,
    autoExecute: false,
    connectionId: "conn-alpaca",
    follows: "BUY & SHORT signals · confidence ≥ 75%",
    stats: { trades30d: 18, winRate: 67, pnl30dUsd: 940.2, pnl30dPct: 6.4 },
  },
  {
    id: "auto-3",
    name: "Conservative Hedge",
    description:
      "Moves spot holdings to stablecoins when exchange-inflow risk spikes.",
    scope: "crypto",
    riskLevel: 15,
    spendingLimitUsd: 2500,
    enabled: false,
    autoExecute: true,
    connectionId: "conn-coinbase",
    follows: "SELL signals · confidence ≥ 85%",
    stats: { trades30d: 7, winRate: 86, pnl30dUsd: 310.0, pnl30dPct: 2.1 },
  },
  {
    id: "auto-4",
    name: "FX Carry Scalper",
    description: "Trades major FX pairs on sentiment + rate-driven signals.",
    scope: "forex",
    riskLevel: 78,
    spendingLimitUsd: 3000,
    enabled: false,
    autoExecute: false,
    connectionId: "conn-oanda",
    follows: "All AI signals · confidence ≥ 70%",
    stats: { trades30d: 0, winRate: 0, pnl30dUsd: 0, pnl30dPct: 0 },
  },
];

/* -------------------------------------------------------------- Portfolio */

function buildPortfolio(): PortfolioSummary {
  const rng = createRng(seedFrom("portfolio"));
  const equityCurve = [];
  let v = 78000;
  for (let i = 90; i >= 0; i--) {
    v += v * (rng.gaussian() * 0.018 + 0.0016);
    equityCurve.push({ date: isoAgo(i * 1440), value: Number(v.toFixed(2)) });
  }
  const total = equityCurve[equityCurve.length - 1].value;
  const available = total * 0.22;
  const invested = total - available;
  const prev = equityCurve[equityCurve.length - 2].value;
  return {
    totalValueUsd: total,
    availableUsd: available,
    investedUsd: invested,
    pnl24hUsd: Number((total - prev).toFixed(2)),
    pnl24hPct: Number((((total - prev) / prev) * 100).toFixed(2)),
    pnlAllTimeUsd: Number((total - 78000).toFixed(2)),
    pnlAllTimePct: Number((((total - 78000) / 78000) * 100).toFixed(2)),
    allocation: (
      [
        { label: "Crypto", market: "crypto", valueUsd: invested * 0.54, pct: 54 },
        { label: "Stocks", market: "stocks", valueUsd: invested * 0.3, pct: 30 },
        { label: "Forex", market: "forex", valueUsd: invested * 0.16, pct: 16 },
        { label: "Cash (USDC)", market: "cash", valueUsd: available, pct: 0 },
      ] as AllocationSlice[]
    ).map((a) => ({ ...a, pct: Number(((a.valueUsd / total) * 100).toFixed(1)) })),
    equityCurve,
  };
}

export const portfolio: PortfolioSummary = buildPortfolio();

/* --------------------------------------------------------------- Activity */

export const activity: ActivityItem[] = [
  {
    id: "act-1",
    kind: "signal",
    title: "New BUY signal · BTC/USDT",
    detail: "92% confidence — whale accumulation + oversold RSI",
    timestamp: isoAgo(4),
    sentiment: "bullish",
  },
  {
    id: "act-2",
    kind: "whale",
    title: "🐋 $312M ETH moved to Binance",
    detail: "AI flags elevated short-term dump risk",
    timestamp: isoAgo(11),
    sentiment: "bearish",
  },
  {
    id: "act-3",
    kind: "automation",
    title: "Whale Reversal Hunter opened long",
    detail: "0.14 BTC @ 67,980 · within $1,000 limit",
    timestamp: isoAgo(23),
    sentiment: "bullish",
  },
  {
    id: "act-4",
    kind: "order",
    title: "Limit order filled · NVDA",
    detail: "12 shares @ 127.40",
    timestamp: isoAgo(58),
  },
  {
    id: "act-5",
    kind: "whale",
    title: "🐋 Options sweep · TSLA",
    detail: "$48M in call sweeps across 3 venues",
    timestamp: isoAgo(96),
    sentiment: "bullish",
  },
  {
    id: "act-6",
    kind: "system",
    title: "OANDA connection needs attention",
    detail: "API key expired — reconnect to resume FX automation",
    timestamp: isoAgo(140),
  },
];

/* ------------------------------------------------------------------- News */

export const news: NewsItem[] = [
  { id: "n1", source: "Bloomberg", headline: "Institutional inflows into spot BTC ETFs hit 3-month high", asset: "BTC", sentimentScore: 68, timestamp: isoAgo(35) },
  { id: "n2", source: "Reuters", headline: "Fed signals patience on rate cuts; dollar firms", asset: "EUR/USD", sentimentScore: -42, timestamp: isoAgo(72) },
  { id: "n3", source: "CoinDesk", headline: "Ethereum staking withdrawals climb as validators rotate", asset: "ETH", sentimentScore: -18, timestamp: isoAgo(120) },
  { id: "n4", source: "CNBC", headline: "NVIDIA extends AI-chip lead; analysts raise targets", asset: "NVDA", sentimentScore: 74, timestamp: isoAgo(160) },
  { id: "n5", source: "X / Social", headline: "Sentiment spike: 'Solana' mentions up 220% in 24h", asset: "SOL", sentimentScore: 55, timestamp: isoAgo(200) },
  { id: "n6", source: "Reuters", headline: "Tesla deliveries beat estimates; shares volatile", asset: "TSLA", sentimentScore: 22, timestamp: isoAgo(240) },
];

/* ------------------------------------------------------------------ Tiers */

export const tiers: TierPlan[] = [
  {
    id: "free",
    name: "Basic",
    priceMonthly: 0,
    tagline: "Start tracking the market",
    audience: "Novice traders",
    features: [
      "Delayed AI alerts (15 min)",
      "Manual whale tracking",
      "Community access",
      "1 exchange connection",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 49,
    tagline: "Trade with real-time intelligence",
    audience: "Active traders",
    highlighted: true,
    features: [
      "Real-time AI alerts",
      "Full whale-tracking feed",
      "Fundamental & sentiment analysis",
      "Pre-built strategies",
      "3 exchange connections",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    priceMonthly: 199,
    tagline: "Automate like a hedge fund",
    audience: "Serious investors",
    features: [
      "Everything in Pro",
      "Full automation with control",
      "24/7 whale tracking & alerts",
      "Leverage & liquidation insights",
      "Unlimited exchange connections",
      "Priority signal delivery",
    ],
  },
];

/* ------------------------------------------------------------------- User */

export const currentUser: User = {
  id: "usr-1",
  name: "Alex Morgan",
  email: "alex@ainextleveltrading.com",
  initials: "AM",
  tier: "elite",
  riskProfile: "balanced",
  mfaEnabled: true,
  kycStatus: "verified",
};
