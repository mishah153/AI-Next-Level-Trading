import { cn } from "@/lib/utils";
import type { MarketKind } from "@/lib/types";

const MARKET_STYLES: Record<MarketKind, string> = {
  crypto: "from-amber-500/80 to-orange-600/80",
  stocks: "from-sky-500/80 to-indigo-600/80",
  forex: "from-emerald-500/80 to-teal-600/80",
};

export const MARKET_LABEL: Record<MarketKind, string> = {
  crypto: "Crypto",
  stocks: "Stocks",
  forex: "Forex",
};

export function MarketIcon({
  symbol,
  market,
  className,
}: {
  symbol: string;
  market: MarketKind;
  className?: string;
}) {
  const base = symbol.split("/")[0].slice(0, 4);
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white shadow-sm",
        MARKET_STYLES[market],
        className
      )}
      aria-hidden
    >
      {base}
    </span>
  );
}
