/** URL-safe conversion for instrument symbols (BTC/USDT <-> BTC-USDT). */

export function symbolToSlug(symbol: string): string {
  return symbol.replace(/\//g, "-");
}

export function slugToSymbol(slug: string): string {
  // Forex/crypto pairs use a single separator; equities have none.
  const decoded = decodeURIComponent(slug);
  return decoded.includes("-") ? decoded.replace(/-/g, "/") : decoded;
}
