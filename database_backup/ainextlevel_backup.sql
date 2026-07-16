-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MarketKind" AS ENUM ('crypto', 'stocks', 'forex');

-- CreateEnum
CREATE TYPE "SignalAction" AS ENUM ('BUY', 'SELL', 'SHORT', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('bullish', 'bearish', 'neutral');

-- CreateEnum
CREATE TYPE "SignalStatus" AS ENUM ('active', 'triggered', 'expired', 'closed');

-- CreateEnum
CREATE TYPE "WhaleTxType" AS ENUM ('exchange_inflow', 'exchange_outflow', 'wallet_transfer', 'options_sweep', 'block_trade');

-- CreateEnum
CREATE TYPE "PositionSide" AS ENUM ('long', 'short');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('buy', 'sell');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('market', 'limit', 'stop');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('open', 'filled', 'partial', 'canceled', 'rejected');

-- CreateEnum
CREATE TYPE "ExecutionSource" AS ENUM ('manual', 'automation');

-- CreateEnum
CREATE TYPE "RiskProfile" AS ENUM ('conservative', 'balanced', 'aggressive');

-- CreateEnum
CREATE TYPE "ExchangeProvider" AS ENUM ('binance', 'coinbase', 'kraken', 'alpaca', 'oanda');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('connected', 'disconnected', 'error');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'pro', 'elite');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('unverified', 'pending', 'verified');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'free',
    "riskProfile" "RiskProfile" NOT NULL DEFAULT 'balanced',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'unverified',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" "MarketKind" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "change24hPct" DOUBLE PRECISION NOT NULL,
    "high24h" DOUBLE PRECISION NOT NULL,
    "low24h" DOUBLE PRECISION NOT NULL,
    "volume24hUsd" DOUBLE PRECISION NOT NULL,
    "aiScore" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" "MarketKind" NOT NULL,
    "action" "SignalAction" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT NOT NULL,
    "status" "SignalStatus" NOT NULL DEFAULT 'active',
    "summary" TEXT NOT NULL,
    "rationale" JSONB NOT NULL,
    "backtest" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhaleTransaction" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "market" "MarketKind" NOT NULL,
    "type" "WhaleTxType" NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "amountAsset" DOUBLE PRECISION NOT NULL,
    "fromLabel" TEXT NOT NULL,
    "toLabel" TEXT NOT NULL,
    "impact" "Sentiment" NOT NULL,
    "aiInterpretation" TEXT NOT NULL,
    "linkedSignalId" TEXT,
    "txRef" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhaleTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ExchangeProvider" NOT NULL,
    "label" TEXT NOT NULL,
    "market" "MarketKind" NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'connected',
    "balanceUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apiKeyEnc" TEXT NOT NULL,
    "apiSecretEnc" TEXT NOT NULL,
    "permissions" TEXT[],
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationStrategy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "riskLevel" INTEGER NOT NULL,
    "spendingLimitUsd" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "autoExecute" BOOLEAN NOT NULL DEFAULT false,
    "connectionId" TEXT,
    "follows" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" "MarketKind" NOT NULL,
    "side" "PositionSide" NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "markPrice" DOUBLE PRECISION NOT NULL,
    "leverage" INTEGER NOT NULL,
    "liquidationPrice" DOUBLE PRECISION NOT NULL,
    "marginUsd" DOUBLE PRECISION NOT NULL,
    "unrealizedPnl" DOUBLE PRECISION NOT NULL,
    "unrealizedPnlPct" DOUBLE PRECISION NOT NULL,
    "source" "ExecutionSource" NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "market" "MarketKind" NOT NULL,
    "side" "OrderSide" NOT NULL,
    "type" "OrderType" NOT NULL,
    "price" DOUBLE PRECISION,
    "size" DOUBLE PRECISION NOT NULL,
    "filledPct" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'open',
    "source" "ExecutionSource" NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_symbol_key" ON "Instrument"("symbol");

-- CreateIndex
CREATE INDEX "Instrument_market_idx" ON "Instrument"("market");

-- CreateIndex
CREATE INDEX "Signal_symbol_idx" ON "Signal"("symbol");

-- CreateIndex
CREATE INDEX "Signal_action_idx" ON "Signal"("action");

-- CreateIndex
CREATE INDEX "Signal_status_idx" ON "Signal"("status");

-- CreateIndex
CREATE INDEX "WhaleTransaction_asset_idx" ON "WhaleTransaction"("asset");

-- CreateIndex
CREATE INDEX "WhaleTransaction_impact_idx" ON "WhaleTransaction"("impact");

-- CreateIndex
CREATE INDEX "WhaleTransaction_timestamp_idx" ON "WhaleTransaction"("timestamp");

-- CreateIndex
CREATE INDEX "ExchangeConnection_userId_idx" ON "ExchangeConnection"("userId");

-- CreateIndex
CREATE INDEX "AutomationStrategy_userId_idx" ON "AutomationStrategy"("userId");

-- CreateIndex
CREATE INDEX "Position_userId_idx" ON "Position"("userId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeConnection" ADD CONSTRAINT "ExchangeConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationStrategy" ADD CONSTRAINT "AutomationStrategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationStrategy" ADD CONSTRAINT "AutomationStrategy_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ExchangeConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- AINextLevelTrading — seed data snapshot
-- Generated for the "ainextlevel" database. Restore after 01_schema.sql.
-- Demo login: alex@ainextleveltrading.com / Sup3rSecret!

BEGIN;

INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "tier", "riskProfile", "mfaEnabled", "kycStatus", "createdAt", "updatedAt") VALUES
  ('usr_demo_0001', 'alex@ainextleveltrading.com', '$2b$12$hSlyFyI1xYCOjAyOLO5QIOdVTS.WVwR3atj2xRXcnuoH.bDPJ13cC', 'Alex Morgan', 'ADMIN', 'elite', 'balanced', true, 'verified', '2026-06-15T14:30:00.000Z', '2026-07-15T14:30:00.000Z');

INSERT INTO "Instrument" ("id", "symbol", "name", "market", "price", "change24hPct", "high24h", "low24h", "volume24hUsd", "aiScore", "updatedAt") VALUES
  ('inst_0001', 'BTC/USDT', 'Bitcoin', 'crypto', 68240.5, -3.6, 70287.715, 66193.285, 1000000000, 55, '2026-07-15T14:30:00.000Z'),
  ('inst_0002', 'ETH/USDT', 'Ethereum', 'crypto', 3552.18, -1.8, 3658.7454, 3445.6146, 1400000000, 62, '2026-07-15T14:30:00.000Z'),
  ('inst_0003', 'SOL/USDT', 'Solana', 'crypto', 172.44, 0, 177.6132, 167.2668, 1800000000, 69, '2026-07-15T14:30:00.000Z'),
  ('inst_0004', 'BNB/USDT', 'BNB', 'crypto', 605.9, 1.8, 624.077, 587.723, 2200000000, 76, '2026-07-15T14:30:00.000Z'),
  ('inst_0005', 'AAPL', 'Apple Inc.', 'stocks', 213.4, 3.6, 219.802, 206.998, 2600000000, 83, '2026-07-15T14:30:00.000Z'),
  ('inst_0006', 'NVDA', 'NVIDIA Corp.', 'stocks', 128.72, -3.6, 132.5816, 124.8584, 3000000000, 90, '2026-07-15T14:30:00.000Z'),
  ('inst_0007', 'TSLA', 'Tesla Inc.', 'stocks', 245.18, -1.8, 252.5354, 237.8246, 3400000000, 57, '2026-07-15T14:30:00.000Z'),
  ('inst_0008', 'EUR/USD', 'Euro / US Dollar', 'forex', 1.0854, 0, 1.118, 1.0528, 3800000000, 64, '2026-07-15T14:30:00.000Z'),
  ('inst_0009', 'GBP/USD', 'Pound / US Dollar', 'forex', 1.2718, 1.8, 1.31, 1.2336, 4200000000, 71, '2026-07-15T14:30:00.000Z');

INSERT INTO "Signal" ("id", "symbol", "name", "market", "action", "confidence", "price", "targetPrice", "stopLoss", "timeframe", "status", "summary", "rationale", "backtest", "createdAt") VALUES
  ('sig_0001', 'BTC/USDT', 'Bitcoin', 'crypto', 'BUY', 70, 68240.5, 73699.74, 65510.88, '1H', 'active', 'BUY setup on BTC/USDT confirmed by whale flow and momentum.', '[{"label":"Candlestick pattern","weight":28,"verdict":"bullish","detail":"Reversal candle at key level."},{"label":"Technical indicators","weight":30,"verdict":"bullish","detail":"RSI + MACD alignment."},{"label":"Whale / on-chain flow","weight":42,"verdict":"bullish","detail":"Smart-money accumulation detected."}]'::jsonb, '{"winRate":72,"sampleSize":300,"avgReturnPct":3.2}'::jsonb, '2026-07-15T14:00:00.000Z'),
  ('sig_0002', 'ETH/USDT', 'Ethereum', 'crypto', 'SELL', 75, 3552.18, 3268.0056, 3694.2672, '4H', 'active', 'SELL setup on ETH/USDT confirmed by whale flow and momentum.', '[{"label":"Candlestick pattern","weight":28,"verdict":"bearish","detail":"Reversal candle at key level."},{"label":"Technical indicators","weight":30,"verdict":"bearish","detail":"RSI + MACD alignment."},{"label":"Whale / on-chain flow","weight":42,"verdict":"bearish","detail":"Smart-money accumulation detected."}]'::jsonb, '{"winRate":73,"sampleSize":350,"avgReturnPct":3.6}'::jsonb, '2026-07-15T13:20:00.000Z'),
  ('sig_0003', 'SOL/USDT', 'Solana', 'crypto', 'NEUTRAL', 80, 172.44, 158.6448, 179.3376, '1D', 'active', 'NEUTRAL setup on SOL/USDT confirmed by whale flow and momentum.', '[{"label":"Candlestick pattern","weight":28,"verdict":"bearish","detail":"Reversal candle at key level."},{"label":"Technical indicators","weight":30,"verdict":"bearish","detail":"RSI + MACD alignment."},{"label":"Whale / on-chain flow","weight":42,"verdict":"bearish","detail":"Smart-money accumulation detected."}]'::jsonb, '{"winRate":74,"sampleSize":400,"avgReturnPct":4}'::jsonb, '2026-07-15T12:40:00.000Z'),
  ('sig_0004', 'BNB/USDT', 'BNB', 'crypto', 'BUY', 85, 605.9, 654.372, 581.664, '1H', 'active', 'BUY setup on BNB/USDT confirmed by whale flow and momentum.', '[{"label":"Candlestick pattern","weight":28,"verdict":"bullish","detail":"Reversal candle at key level."},{"label":"Technical indicators","weight":30,"verdict":"bullish","detail":"RSI + MACD alignment."},{"label":"Whale / on-chain flow","weight":42,"verdict":"bullish","detail":"Smart-money accumulation detected."}]'::jsonb, '{"winRate":75,"sampleSize":450,"avgReturnPct":4.4}'::jsonb, '2026-07-15T12:00:00.000Z'),
  ('sig_0005', 'AAPL', 'Apple Inc.', 'stocks', 'SELL', 90, 213.4, 196.328, 221.936, '4H', 'active', 'SELL setup on AAPL confirmed by whale flow and momentum.', '[{"label":"Candlestick pattern","weight":28,"verdict":"bearish","detail":"Reversal candle at key level."},{"label":"Technical indicators","weight":30,"verdict":"bearish","detail":"RSI + MACD alignment."},{"label":"Whale / on-chain flow","weight":42,"verdict":"bearish","detail":"Smart-money accumulation detected."}]'::jsonb, '{"winRate":76,"sampleSize":500,"avgReturnPct":4.800000000000001}'::jsonb, '2026-07-15T11:20:00.000Z'),
  ('sig_0006', 'NVDA', 'NVIDIA Corp.', 'stocks', 'NEUTRAL', 95, 128.72, 118.4224, 133.8688, '1D', 'active', 'NEUTRAL setup on NVDA confirmed by whale flow and momentum.', '[{"label":"Candlestick pattern","weight":28,"verdict":"bearish","detail":"Reversal candle at key level."},{"label":"Technical indicators","weight":30,"verdict":"bearish","detail":"RSI + MACD alignment."},{"label":"Whale / on-chain flow","weight":42,"verdict":"bearish","detail":"Smart-money accumulation detected."}]'::jsonb, '{"winRate":77,"sampleSize":550,"avgReturnPct":5.2}'::jsonb, '2026-07-15T10:40:00.000Z');

INSERT INTO "WhaleTransaction" ("id", "asset", "market", "type", "amountUsd", "amountAsset", "fromLabel", "toLabel", "impact", "aiInterpretation", "linkedSignalId", "txRef", "timestamp") VALUES
  ('whale_0001', 'BTC', 'crypto', 'exchange_inflow', 5000000, 73.2703, 'Unknown Wallet', 'Binance Hot Wallet', 'bearish', 'Large inflow often precedes selling pressure.', NULL, '0x3e8a9f', '2026-07-15T14:25:00.000Z'),
  ('whale_0002', 'ETH', 'crypto', 'exchange_outflow', 42000000, 11823.7251, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3e9a9f', '2026-07-15T13:30:00.000Z'),
  ('whale_0003', 'SOL', 'crypto', 'options_sweep', 79000000, 458130.3642, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3eaa9f', '2026-07-15T12:35:00.000Z'),
  ('whale_0004', 'BNB', 'crypto', 'block_trade', 116000000, 191450.7344, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3eba9f', '2026-07-15T11:40:00.000Z'),
  ('whale_0005', 'AAPL', 'stocks', 'exchange_inflow', 153000000, 716963.4489, 'Unknown Wallet', 'Binance Hot Wallet', 'bearish', 'Large inflow often precedes selling pressure.', NULL, '0x3eca9f', '2026-07-15T10:45:00.000Z'),
  ('whale_0006', 'NVDA', 'stocks', 'exchange_outflow', 190000000, 1476072.0945, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3eda9f', '2026-07-15T09:50:00.000Z'),
  ('whale_0007', 'TSLA', 'stocks', 'options_sweep', 227000000, 925850.3956, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3eea9f', '2026-07-15T08:55:00.000Z'),
  ('whale_0008', 'EUR', 'forex', 'block_trade', 264000000, 243228302.9298, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3efa9f', '2026-07-15T08:00:00.000Z'),
  ('whale_0009', 'GBP', 'forex', 'exchange_inflow', 301000000, 236672432.7724, 'Unknown Wallet', 'Binance Hot Wallet', 'bearish', 'Large inflow often precedes selling pressure.', NULL, '0x3f0a9f', '2026-07-15T07:05:00.000Z'),
  ('whale_0010', 'BTC', 'crypto', 'exchange_outflow', 338000000, 4953.0704, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3f1a9f', '2026-07-15T06:10:00.000Z'),
  ('whale_0011', 'ETH', 'crypto', 'options_sweep', 375000000, 105568.9745, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3f2a9f', '2026-07-15T05:15:00.000Z'),
  ('whale_0012', 'SOL', 'crypto', 'block_trade', 412000000, 2389236.836, 'Unknown Wallet', 'Cold Storage', 'bullish', 'Outflow to cold storage signals accumulation.', NULL, '0x3f3a9f', '2026-07-15T04:20:00.000Z');

INSERT INTO "ExchangeConnection" ("id", "userId", "provider", "label", "market", "status", "balanceUsd", "apiKeyEnc", "apiSecretEnc", "permissions", "mfaEnabled", "connectedAt", "createdAt") VALUES
  ('conn_0001', 'usr_demo_0001', 'binance', 'Binance — Main', 'crypto', 'connected', 48210.55, '8c8097480a7a18bc17eafd39:8475a6680b31ba6b3b00b9e0b5536c54:249d99a95090f3cf600bbca7404053665e23', 'eaa59efffa5027574abda4ee:dd0b8c3e5482196c5565d1c3fe615a38:69c49ebfbd5a9ad76f4bf9946cf1ffdee66bb70d17', ARRAY['Read', 'Spot Trade', 'Futures Trade'], true, '2026-06-15T14:30:00.000Z', '2026-06-15T14:30:00.000Z'),
  ('conn_0002', 'usr_demo_0001', 'coinbase', 'Coinbase Advanced', 'crypto', 'connected', 12980.12, '3b3b03379cd9399df8fead1e:0ddecff0e017cd669a90c42f5e19e835:82adbdec10af9d32b67f0e534a54b0d3e679', 'da07241f540c7c7c052d6eaf:2265661900f7c957601252ceab0ff933:df13643a3a081940b69b20f32c90482ab14bd0424d', ARRAY['Read', 'Spot Trade'], true, '2026-04-16T14:30:00.000Z', '2026-04-16T14:30:00.000Z'),
  ('conn_0003', 'usr_demo_0001', 'alpaca', 'Alpaca Brokerage', 'stocks', 'connected', 32450, 'b07a745ddc6f897f8426e024:1761cd4233a089e8f23a932c3337dd5b:79c7a99cf60098ee80d953f2c3f3619e7c33', '1a8f87bb00fa399d3ddb5656:df30016a1ba612e5bccc98dc3a02e4cf:87f5951a129bf9c2b5b740daa98051cba9550932e7', ARRAY['Read', 'Equity Trade'], false, '2026-07-01T14:30:00.000Z', '2026-07-01T14:30:00.000Z'),
  ('conn_0004', 'usr_demo_0001', 'oanda', 'OANDA FX', 'forex', 'error', 0, '1d1aa2b09d1704dfd3e6b88d:dfa45a7159ac21c6c4120e226d955bbe:0c6948f8e100a75de534e76d3653b0e63232', '996fccbaeb506f3bac2fc15d:a52c803be640b85b56e3e1a1e110e9a6:d84c143ff7a8ae0d04389336281b672fa62d7876fc', ARRAY['Read'], true, '2026-07-11T14:30:00.000Z', '2026-07-11T14:30:00.000Z');

INSERT INTO "AutomationStrategy" ("id", "userId", "name", "description", "scope", "riskLevel", "spendingLimitUsd", "enabled", "autoExecute", "connectionId", "follows", "stats", "createdAt") VALUES
  ('auto_0001', 'usr_demo_0001', 'Whale Reversal Hunter', 'Enters spot longs when AI detects whale accumulation + oversold RSI on majors.', 'crypto', 35, 1000, true, true, 'conn_0001', 'BUY signals · confidence >= 80%', '{"trades30d":42,"winRate":74,"pnl30dUsd":1284.5,"pnl30dPct":12.8}'::jsonb, '2026-06-15T14:30:00.000Z'),
  ('auto_0002', 'usr_demo_0001', 'Momentum Breakout', 'Scales into breakouts confirmed by options-sweep flow across large caps.', 'stocks', 62, 5000, true, false, 'conn_0003', 'BUY & SHORT signals · confidence >= 75%', '{"trades30d":18,"winRate":67,"pnl30dUsd":940.2,"pnl30dPct":6.4}'::jsonb, '2026-06-15T14:30:00.000Z'),
  ('auto_0003', 'usr_demo_0001', 'Conservative Hedge', 'Moves spot holdings to stablecoins when exchange-inflow risk spikes.', 'crypto', 15, 2500, false, true, 'conn_0002', 'SELL signals · confidence >= 85%', '{"trades30d":7,"winRate":86,"pnl30dUsd":310,"pnl30dPct":2.1}'::jsonb, '2026-06-15T14:30:00.000Z');

INSERT INTO "Position" ("id", "userId", "symbol", "name", "market", "side", "size", "entryPrice", "markPrice", "leverage", "liquidationPrice", "marginUsd", "unrealizedPnl", "unrealizedPnlPct", "source", "openedAt") VALUES
  ('pos_0001', 'usr_demo_0001', 'BTC/USDT', 'Bitcoin', 'crypto', 'long', 0.35, 64000, 68240.5, 3, 45000, 7466, 1484, 19.8, 'automation', '2026-07-13T14:30:00.000Z'),
  ('pos_0002', 'usr_demo_0001', 'NVDA', 'NVIDIA Corp.', 'stocks', 'long', 40, 120.1, 128.72, 1, 0, 4804, 344.8, 7.2, 'manual', '2026-07-10T01:10:00.000Z');

INSERT INTO "Order" ("id", "userId", "symbol", "market", "side", "type", "price", "size", "filledPct", "status", "source", "createdAt") VALUES
  ('ORD-10480', 'usr_demo_0001', 'NVDA', 'stocks', 'buy', 'limit', 127.4, 12, 100, 'filled', 'manual', '2026-07-15T13:32:00.000Z'),
  ('ORD-10481', 'usr_demo_0001', 'BTC/USDT', 'crypto', 'buy', 'limit', 67500, 0.1, 0, 'open', 'manual', '2026-07-15T14:10:00.000Z'),
  ('ORD-10482', 'usr_demo_0001', 'ETH/USDT', 'crypto', 'sell', 'market', NULL, 1.5, 100, 'filled', 'automation', '2026-07-15T12:10:00.000Z');

COMMIT;
