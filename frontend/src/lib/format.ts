/** Formatting utilities for prices, percentages, and compact values. */

export function formatCurrency(
  value: number,
  opts: { compact?: boolean; maximumFractionDigits?: number } = {}
): string {
  const { compact = false, maximumFractionDigits } = opts;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits:
      maximumFractionDigits ?? (compact ? 2 : value < 10 ? 4 : 2),
  }).format(value);
}

export function formatNumber(
  value: number,
  opts: { compact?: boolean; maximumFractionDigits?: number } = {}
): string {
  const { compact = false, maximumFractionDigits = 2 } = opts;
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits,
  }).format(value);
}

export function formatPrice(value: number): string {
  const digits = value >= 1000 ? 2 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSigned(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}

/** Deterministic relative-time string. Pass a reference "now" for SSR stability. */
export function timeAgo(iso: string, nowMs: number): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function trendClass(value: number): string {
  if (value > 0) return "text-profit";
  if (value < 0) return "text-loss";
  return "text-muted-foreground";
}
