"use client";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useLivePrice } from "@/lib/live/use-live-price";

/** A price that ticks live, colored by direction with a brief flash on change. */
export function LivePrice({
  symbol,
  base,
  className,
}: {
  symbol: string;
  base: number;
  className?: string;
}) {
  const { price, direction } = useLivePrice(symbol, base);

  return (
    <span
      // Remounting on each price change re-triggers the flash animation.
      key={price}
      className={cn(
        "tabular inline-block rounded px-1",
        direction === "up" && "text-profit flash-up",
        direction === "down" && "text-loss flash-down",
        className,
      )}
    >
      {formatPrice(price)}
    </span>
  );
}
