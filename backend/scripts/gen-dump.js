/* eslint-disable */
// Generates a restorable SQL backup (schema + seed data) into ../database_backup.
// Run from the backend directory: `node scripts/gen-dump.js`.
// Used because no live PostgreSQL is available to run a real pg_dump here.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "database_backup");
const MIGRATION = path.join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  "0001_init",
  "migration.sql",
);
const ENCRYPTION_KEY =
  "6f1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9";

fs.mkdirSync(OUT, { recursive: true });

/* ----------------------------------------------------------- helpers */
const key = Buffer.from(ENCRYPTION_KEY, "hex");
function enc(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${data.toString("hex")}`;
}
const q = (v) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v))
    return `ARRAY[${v.map((x) => `'${String(x).replace(/'/g, "''")}'`).join(", ")}]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const json = (obj) => `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
const NOW = "2026-07-15T14:30:00.000Z";
const iso = (minAgo) =>
  new Date(Date.parse(NOW) - minAgo * 60000).toISOString();

function insert(table, rows, jsonCols = []) {
  if (rows.length === 0) return `-- (no rows for ${table})\n`;
  const cols = Object.keys(rows[0]);
  const values = rows
    .map(
      (r) =>
        "  (" +
        cols
          .map((c) => (jsonCols.includes(c) ? json(r[c]) : q(r[c])))
          .join(", ") +
        ")",
    )
    .join(",\n");
  const colList = cols.map((c) => `"${c}"`).join(", ");
  return `INSERT INTO "${table}" (${colList}) VALUES\n${values};\n\n`;
}

/* ----------------------------------------------------------- data */
const passwordHash = bcrypt.hashSync("Sup3rSecret!", 12);

const users = [
  {
    id: "usr_demo_0001",
    email: "alex@ainextleveltrading.com",
    passwordHash,
    name: "Alex Morgan",
    role: "ADMIN",
    tier: "elite",
    riskProfile: "balanced",
    mfaEnabled: true,
    kycStatus: "verified",
    createdAt: iso(43200),
    updatedAt: NOW,
  },
];

const SEEDS = [
  { symbol: "BTC/USDT", name: "Bitcoin", market: "crypto", price: 68240.5 },
  { symbol: "ETH/USDT", name: "Ethereum", market: "crypto", price: 3552.18 },
  { symbol: "SOL/USDT", name: "Solana", market: "crypto", price: 172.44 },
  { symbol: "BNB/USDT", name: "BNB", market: "crypto", price: 605.9 },
  { symbol: "AAPL", name: "Apple Inc.", market: "stocks", price: 213.4 },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "stocks", price: 128.72 },
  { symbol: "TSLA", name: "Tesla Inc.", market: "stocks", price: 245.18 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", market: "forex", price: 1.0854 },
  { symbol: "GBP/USD", name: "Pound / US Dollar", market: "forex", price: 1.2718 },
];

const instruments = SEEDS.map((s, i) => ({
  id: `inst_${String(i + 1).padStart(4, "0")}`,
  symbol: s.symbol,
  name: s.name,
  market: s.market,
  price: s.price,
  change24hPct: ((i % 5) - 2) * 1.8,
  high24h: Number((s.price * 1.03).toFixed(4)),
  low24h: Number((s.price * 0.97).toFixed(4)),
  volume24hUsd: 1e9 + i * 4e8,
  aiScore: 55 + ((i * 7) % 40),
  updatedAt: NOW,
}));

const ACTIONS = ["BUY", "SELL", "NEUTRAL"];
const signals = SEEDS.slice(0, 6).map((s, i) => {
  const action = ACTIONS[i % 3];
  const bull = action === "BUY";
  return {
    id: `sig_${String(i + 1).padStart(4, "0")}`,
    symbol: s.symbol,
    name: s.name,
    market: s.market,
    action,
    confidence: 70 + ((i * 5) % 26),
    price: s.price,
    targetPrice: Number((s.price * (bull ? 1.08 : 0.92)).toFixed(4)),
    stopLoss: Number((s.price * (bull ? 0.96 : 1.04)).toFixed(4)),
    timeframe: ["1H", "4H", "1D"][i % 3],
    status: "active",
    summary: `${action} setup on ${s.symbol} confirmed by whale flow and momentum.`,
    rationale: [
      { label: "Candlestick pattern", weight: 28, verdict: bull ? "bullish" : "bearish", detail: "Reversal candle at key level." },
      { label: "Technical indicators", weight: 30, verdict: bull ? "bullish" : "bearish", detail: "RSI + MACD alignment." },
      { label: "Whale / on-chain flow", weight: 42, verdict: bull ? "bullish" : "bearish", detail: "Smart-money accumulation detected." },
    ],
    backtest: { winRate: 72 + (i % 15), sampleSize: 300 + i * 50, avgReturnPct: 3.2 + i * 0.4 },
    createdAt: iso(30 + i * 40),
  };
});

const WTYPES = ["exchange_inflow", "exchange_outflow", "options_sweep", "block_trade"];
const whales = Array.from({ length: 12 }, (_, i) => {
  const s = SEEDS[i % SEEDS.length];
  const type = WTYPES[i % WTYPES.length];
  const usd = 5e6 + i * 3.7e7;
  return {
    id: `whale_${String(i + 1).padStart(4, "0")}`,
    asset: s.symbol.split("/")[0],
    market: s.market,
    type,
    amountUsd: usd,
    amountAsset: Number((usd / s.price).toFixed(4)),
    fromLabel: "Unknown Wallet",
    toLabel: type === "exchange_inflow" ? "Binance Hot Wallet" : "Cold Storage",
    impact: type === "exchange_inflow" ? "bearish" : "bullish",
    aiInterpretation:
      type === "exchange_inflow"
        ? "Large inflow often precedes selling pressure."
        : "Outflow to cold storage signals accumulation.",
    linkedSignalId: null,
    txRef: `0x${(1000 + i).toString(16)}a9f`,
    timestamp: iso(5 + i * 55),
  };
});

const connections = [
  { id: "conn_0001", provider: "binance", label: "Binance — Main", market: "crypto", status: "connected", balanceUsd: 48210.55, mfaEnabled: true, permissions: ["Read", "Spot Trade", "Futures Trade"], connectedAt: iso(43200) },
  { id: "conn_0002", provider: "coinbase", label: "Coinbase Advanced", market: "crypto", status: "connected", balanceUsd: 12980.12, mfaEnabled: true, permissions: ["Read", "Spot Trade"], connectedAt: iso(129600) },
  { id: "conn_0003", provider: "alpaca", label: "Alpaca Brokerage", market: "stocks", status: "connected", balanceUsd: 32450.0, mfaEnabled: false, permissions: ["Read", "Equity Trade"], connectedAt: iso(20160) },
  { id: "conn_0004", provider: "oanda", label: "OANDA FX", market: "forex", status: "error", balanceUsd: 0, mfaEnabled: true, permissions: ["Read"], connectedAt: iso(5760) },
].map((c) => ({
  id: c.id,
  userId: "usr_demo_0001",
  provider: c.provider,
  label: c.label,
  market: c.market,
  status: c.status,
  balanceUsd: c.balanceUsd,
  apiKeyEnc: enc(`demo-key-${c.id}`),
  apiSecretEnc: enc(`demo-secret-${c.id}`),
  permissions: c.permissions,
  mfaEnabled: c.mfaEnabled,
  connectedAt: c.connectedAt,
  createdAt: c.connectedAt,
}));

const strategies = [
  { id: "auto_0001", name: "Whale Reversal Hunter", description: "Enters spot longs when AI detects whale accumulation + oversold RSI on majors.", scope: "crypto", riskLevel: 35, spendingLimitUsd: 1000, enabled: true, autoExecute: true, connectionId: "conn_0001", follows: "BUY signals · confidence >= 80%", stats: { trades30d: 42, winRate: 74, pnl30dUsd: 1284.5, pnl30dPct: 12.8 } },
  { id: "auto_0002", name: "Momentum Breakout", description: "Scales into breakouts confirmed by options-sweep flow across large caps.", scope: "stocks", riskLevel: 62, spendingLimitUsd: 5000, enabled: true, autoExecute: false, connectionId: "conn_0003", follows: "BUY & SHORT signals · confidence >= 75%", stats: { trades30d: 18, winRate: 67, pnl30dUsd: 940.2, pnl30dPct: 6.4 } },
  { id: "auto_0003", name: "Conservative Hedge", description: "Moves spot holdings to stablecoins when exchange-inflow risk spikes.", scope: "crypto", riskLevel: 15, spendingLimitUsd: 2500, enabled: false, autoExecute: true, connectionId: "conn_0002", follows: "SELL signals · confidence >= 85%", stats: { trades30d: 7, winRate: 86, pnl30dUsd: 310.0, pnl30dPct: 2.1 } },
].map((s) => ({
  id: s.id,
  userId: "usr_demo_0001",
  name: s.name,
  description: s.description,
  scope: s.scope,
  riskLevel: s.riskLevel,
  spendingLimitUsd: s.spendingLimitUsd,
  enabled: s.enabled,
  autoExecute: s.autoExecute,
  connectionId: s.connectionId,
  follows: s.follows,
  stats: s.stats,
  createdAt: iso(43200),
}));

const positions = [
  { id: "pos_0001", userId: "usr_demo_0001", symbol: "BTC/USDT", name: "Bitcoin", market: "crypto", side: "long", size: 0.35, entryPrice: 64000, markPrice: 68240.5, leverage: 3, liquidationPrice: 45000, marginUsd: 7466, unrealizedPnl: 1484, unrealizedPnlPct: 19.8, source: "automation", openedAt: iso(2880) },
  { id: "pos_0002", userId: "usr_demo_0001", symbol: "NVDA", name: "NVIDIA Corp.", market: "stocks", side: "long", size: 40, entryPrice: 120.1, markPrice: 128.72, leverage: 1, liquidationPrice: 0, marginUsd: 4804, unrealizedPnl: 344.8, unrealizedPnlPct: 7.2, source: "manual", openedAt: iso(8000) },
];

const orders = [
  { id: "ORD-10480", userId: "usr_demo_0001", symbol: "NVDA", market: "stocks", side: "buy", type: "limit", price: 127.4, size: 12, filledPct: 100, status: "filled", source: "manual", createdAt: iso(58) },
  { id: "ORD-10481", userId: "usr_demo_0001", symbol: "BTC/USDT", market: "crypto", side: "buy", type: "limit", price: 67500, size: 0.1, filledPct: 0, status: "open", source: "manual", createdAt: iso(20) },
  { id: "ORD-10482", userId: "usr_demo_0001", symbol: "ETH/USDT", market: "crypto", side: "sell", type: "market", price: null, size: 1.5, filledPct: 100, status: "filled", source: "automation", createdAt: iso(140) },
];

/* ----------------------------------------------------------- write */
const schema = fs.readFileSync(MIGRATION, "utf8");
fs.writeFileSync(path.join(OUT, "01_schema.sql"), schema);

let data = `-- AINextLevelTrading — seed data snapshot
-- Generated for the "ainextlevel" database. Restore after 01_schema.sql.
-- Demo login: alex@ainextleveltrading.com / Sup3rSecret!

BEGIN;

`;
data += insert("User", users);
data += insert("Instrument", instruments);
data += insert("Signal", signals, ["rationale", "backtest"]);
data += insert("WhaleTransaction", whales);
data += insert("ExchangeConnection", connections);
data += insert("AutomationStrategy", strategies, ["stats"]);
data += insert("Position", positions);
data += insert("Order", orders);
data += "COMMIT;\n";
fs.writeFileSync(path.join(OUT, "02_seed_data.sql"), data);

fs.writeFileSync(
  path.join(OUT, "ainextlevel_backup.sql"),
  schema + "\n\n" + data,
);

console.log("Wrote backup to", OUT);
console.log(
  `Rows — users:${users.length} instruments:${instruments.length} signals:${signals.length} whales:${whales.length} connections:${connections.length} strategies:${strategies.length} positions:${positions.length} orders:${orders.length}`,
);
