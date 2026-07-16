"use client";

import * as React from "react";
import { useMarketStore } from "./market-store";

export type PriceDirection = "up" | "down" | "flat";

export interface LivePriceResult {
  price: number;
  direction: PriceDirection;
}

/** Subscribe a single symbol to the live feed, returning its ticking price. */
export function useLivePrice(symbol: string, base: number): LivePriceResult {
  const register = useMarketStore((s) => s.register);

  React.useEffect(() => {
    register(symbol, base);
  }, [symbol, base, register]);

  const price = useMarketStore((s) => s.prices[symbol] ?? base);
  const prev = useMarketStore((s) => s.prev[symbol] ?? base);

  const direction: PriceDirection =
    price > prev ? "up" : price < prev ? "down" : "flat";

  return { price, direction };
}
