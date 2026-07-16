import {
  MarketKind,
  PrismaClient,
  SignalAction,
  WhaleTxType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface Seed {
  symbol: string;
  name: string;
  market: MarketKind;
  price: number;
}

const SEEDS: Seed[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', market: 'crypto', price: 68240.5 },
  { symbol: 'ETH/USDT', name: 'Ethereum', market: 'crypto', price: 3552.18 },
  { symbol: 'SOL/USDT', name: 'Solana', market: 'crypto', price: 172.44 },
  { symbol: 'BNB/USDT', name: 'BNB', market: 'crypto', price: 605.9 },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'stocks', price: 213.4 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'stocks', price: 128.72 },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'stocks', price: 245.18 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', market: 'forex', price: 1.0854 },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', market: 'forex', price: 1.2718 },
];

async function main() {
  console.log('Seeding AINextLevelTrading…');

  // Demo user
  const passwordHash = await bcrypt.hash('Sup3rSecret!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'alex@ainextleveltrading.com' },
    update: {},
    create: {
      email: 'alex@ainextleveltrading.com',
      name: 'Alex Morgan',
      passwordHash,
      tier: 'elite',
      riskProfile: 'balanced',
      mfaEnabled: true,
      kycStatus: 'verified',
    },
  });

  // Instruments
  for (const [i, s] of SEEDS.entries()) {
    const change = ((i % 5) - 2) * 1.8;
    await prisma.instrument.upsert({
      where: { symbol: s.symbol },
      update: { price: s.price },
      create: {
        symbol: s.symbol,
        name: s.name,
        market: s.market,
        price: s.price,
        change24hPct: change,
        high24h: s.price * 1.03,
        low24h: s.price * 0.97,
        volume24hUsd: 1e9 + i * 4e8,
        aiScore: 55 + ((i * 7) % 40),
      },
    });
  }

  // Signals
  await prisma.signal.deleteMany();
  for (const [i, s] of SEEDS.slice(0, 6).entries()) {
    const action: SignalAction = i % 3 === 0 ? 'BUY' : i % 3 === 1 ? 'SELL' : 'NEUTRAL';
    const bull = action === 'BUY';
    await prisma.signal.create({
      data: {
        symbol: s.symbol,
        name: s.name,
        market: s.market,
        action,
        confidence: 70 + ((i * 5) % 26),
        price: s.price,
        targetPrice: s.price * (bull ? 1.08 : 0.92),
        stopLoss: s.price * (bull ? 0.96 : 1.04),
        timeframe: ['1H', '4H', '1D'][i % 3],
        summary: `${action} setup on ${s.symbol} confirmed by whale flow and momentum.`,
        rationale: [
          { label: 'Candlestick pattern', weight: 28, verdict: bull ? 'bullish' : 'bearish', detail: 'Reversal candle at key level.' },
          { label: 'Technical indicators', weight: 30, verdict: bull ? 'bullish' : 'bearish', detail: 'RSI + MACD alignment.' },
          { label: 'Whale / on-chain flow', weight: 42, verdict: bull ? 'bullish' : 'bearish', detail: 'Smart-money accumulation detected.' },
        ],
        backtest: { winRate: 72 + (i % 15), sampleSize: 300 + i * 50, avgReturnPct: 3.2 + i * 0.4 },
      },
    });
  }

  // Whale transactions
  await prisma.whaleTransaction.deleteMany();
  const types: WhaleTxType[] = [
    'exchange_inflow',
    'exchange_outflow',
    'options_sweep',
    'block_trade',
  ];
  for (let i = 0; i < 12; i++) {
    const s = SEEDS[i % SEEDS.length];
    const type = types[i % types.length];
    await prisma.whaleTransaction.create({
      data: {
        asset: s.symbol.split('/')[0],
        market: s.market,
        type,
        amountUsd: 5e6 + i * 3.7e7,
        amountAsset: (5e6 + i * 3.7e7) / s.price,
        fromLabel: 'Unknown Wallet',
        toLabel: type === 'exchange_inflow' ? 'Binance Hot Wallet' : 'Cold Storage',
        impact: type === 'exchange_inflow' ? 'bearish' : 'bullish',
        aiInterpretation:
          type === 'exchange_inflow'
            ? 'Large inflow often precedes selling pressure.'
            : 'Outflow to cold storage signals accumulation.',
      },
    });
  }

  // A couple of positions + orders for the demo user
  await prisma.position.deleteMany({ where: { userId: user.id } });
  await prisma.position.create({
    data: {
      userId: user.id,
      symbol: 'BTC/USDT',
      name: 'Bitcoin',
      market: 'crypto',
      side: 'long',
      size: 0.35,
      entryPrice: 64000,
      markPrice: 68240.5,
      leverage: 3,
      liquidationPrice: 45000,
      marginUsd: 7466,
      unrealizedPnl: 1484,
      unrealizedPnlPct: 19.8,
      source: 'automation',
    },
  });

  await prisma.order.deleteMany({ where: { userId: user.id } });
  await prisma.order.create({
    data: {
      userId: user.id,
      symbol: 'NVDA',
      market: 'stocks',
      side: 'buy',
      type: 'limit',
      price: 127.4,
      size: 12,
      filledPct: 100,
      status: 'filled',
      source: 'manual',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
