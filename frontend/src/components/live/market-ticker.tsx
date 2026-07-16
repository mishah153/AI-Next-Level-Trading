"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useInstruments } from "@/lib/api/hooks";
import { useMarketStore } from "@/lib/live/market-store";
import { symbolToSlug } from "@/lib/symbols";

/** A thin, horizontally scrolling strip of live-ticking symbols. */
export function MarketTicker() {
  const { data: instruments = [] } = useInstruments();
  const register = useMarketStore((s) => s.register);
  const prices = useMarketStore((s) => s.prices);
  const prev = useMarketStore((s) => s.prev);

  React.useEffect(() => {
    instruments.forEach((i) => register(i.symbol, i.price));
  }, [instruments, register]);

  if (instruments.length === 0) return null;

  return (
    <div className="flex items-center gap-5 overflow-x-auto border-b bg-card/50 px-4 py-1.5 scroll-thin">
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-profit opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-profit" />
        </span>
        Live
      </span>
      {instruments.slice(0, 12).map((i) => {
        const price = prices[i.symbol] ?? i.price;
        const previous = prev[i.symbol] ?? i.price;
        const up = price >= previous;
        return (
          <Link
            key={i.symbol}
            href={`/trade/${symbolToSlug(i.symbol)}`}
            className="flex shrink-0 items-center gap-1.5 text-xs"
          >
            <span className="font-medium">{i.symbol}</span>
            <span className="tabular text-muted-foreground">
              {formatPrice(price)}
            </span>
            <span
              className={cn(
                "flex items-center",
                up ? "text-profit" : "text-loss",
              )}
            >
              {up ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
