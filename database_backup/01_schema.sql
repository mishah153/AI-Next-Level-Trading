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

