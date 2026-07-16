/**
 * Core domain types for AINextLevelTrading.
 * Shared across frontend screens and (later) the API contract layer.
 */

export type MarketKind = "crypto" | "stocks" | "forex";

export type SignalAction = "BUY" | "SELL" | "SHORT" | "NEUTRAL";

export type Sentiment = "bullish" | "bearish" | "neutral";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  market: MarketKind;
  price: number;
  change24hPct: number;
  change24hAbs: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  marketCapUsd?: number;
  sparkline: number[];
  aiScore: number; // 0-100 composite AI conviction
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPct: number;
}

export interface RecentTrade {
  id: string;
  time: number;
  price: number;
  size: number;
  side: "buy" | "sell";
}

export interface SignalRationaleLayer {
  label: string;
  weight: number; // 0-100 contribution to conviction
  verdict: Sentiment;
  detail: string;
}

export interface Signal {
  id: string;
  symbol: string;
  name: string;
  market: MarketKind;
  action: SignalAction;
  confidence: number; // 0-100
  price: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string; // e.g. "4H", "1D"
  createdAt: string; // ISO
  status: "active" | "triggered" | "expired" | "closed";
  summary: string;
  rationale: SignalRationaleLayer[];
  backtest: {
    winRate: number;
    sampleSize: number;
    avgReturnPct: number;
  };
  resultPct?: number; // realized if closed
}

export type WhaleTxType =
  | "exchange_inflow"
  | "exchange_outflow"
  | "wallet_transfer"
  | "options_sweep"
  | "block_trade";

export interface WhaleTransaction {
  id: string;
  asset: string;
  market: MarketKind;
  type: WhaleTxType;
  amountUsd: number;
  amountAsset: number;
  from: string;
  to: string;
  timestamp: string; // ISO
  impact: Sentiment;
  aiInterpretation: string;
  linkedSignalId?: string;
  txRef?: string;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  market: MarketKind;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  liquidationPrice: number;
  marginUsd: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  openedAt: string;
  source: "manual" | "automation";
}

export type OrderType = "market" | "limit" | "stop";
export type OrderStatus =
  | "open"
  | "filled"
  | "partial"
  | "canceled"
  | "rejected";

export interface Order {
  id: string;
  symbol: string;
  market: MarketKind;
  side: "buy" | "sell";
  type: OrderType;
  price: number | null;
  size: number;
  filledPct: number;
  status: OrderStatus;
  createdAt: string;
  source: "manual" | "automation";
}

export type RiskProfile = "conservative" | "balanced" | "aggressive";

export interface AutomationStrategy {
  id: string;
  name: string;
  description: string;
  scope: MarketKind | "all";
  riskLevel: number; // 0 (conservative) - 100 (aggressive)
  spendingLimitUsd: number;
  enabled: boolean;
  autoExecute: boolean;
  connectionId: string;
  follows: string; // "All AI signals" or asset list summary
  stats: {
    trades30d: number;
    winRate: number;
    pnl30dUsd: number;
    pnl30dPct: number;
  };
}

export type ExchangeProvider =
  | "binance"
  | "coinbase"
  | "kraken"
  | "alpaca"
  | "oanda";

export interface ExchangeConnection {
  id: string;
  provider: ExchangeProvider;
  label: string;
  market: MarketKind;
  status: "connected" | "disconnected" | "error";
  balanceUsd: number;
  connectedAt: string | null;
  permissions: string[];
  mfaEnabled: boolean;
}

export interface AllocationSlice {
  label: string;
  market: MarketKind | "cash";
  valueUsd: number;
  pct: number;
}

export interface EquityPoint {
  date: string;
  value: number;
}

export interface PortfolioSummary {
  totalValueUsd: number;
  availableUsd: number;
  investedUsd: number;
  pnl24hUsd: number;
  pnl24hPct: number;
  pnlAllTimeUsd: number;
  pnlAllTimePct: number;
  allocation: AllocationSlice[];
  equityCurve: EquityPoint[];
}

export interface ActivityItem {
  id: string;
  kind: "signal" | "whale" | "order" | "automation" | "system";
  title: string;
  detail: string;
  timestamp: string;
  sentiment?: Sentiment;
}

export interface NewsItem {
  id: string;
  source: string;
  headline: string;
  asset: string;
  sentimentScore: number; // -100 .. 100
  timestamp: string;
}

export type SubscriptionTier = "free" | "pro" | "elite";

export interface TierPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  tagline: string;
  audience: string;
  features: string[];
  highlighted?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  tier: SubscriptionTier;
  riskProfile: RiskProfile;
  mfaEnabled: boolean;
  kycStatus: "verified" | "pending" | "unverified";
}
