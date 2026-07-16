import Link from "next/link";
import type { Instrument } from "@/lib/types";
import { MarketIcon } from "@/components/common/market-icon";
import { Sparkline } from "@/components/common/sparkline";
import { PriceChange } from "@/components/common/price-change";
import { formatPrice } from "@/lib/format";
import { symbolToSlug } from "@/lib/symbols";

export function InstrumentRow({ instrument }: { instrument: Instrument }) {
  return (
    <Link
      href={`/trade/${symbolToSlug(instrument.symbol)}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
    >
      <MarketIcon symbol={instrument.symbol} market={instrument.market} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{instrument.symbol}</p>
        <p className="truncate text-xs text-muted-foreground">
          {instrument.name}
        </p>
      </div>
      <Sparkline
        data={instrument.sparkline}
        positive={instrument.change24hPct >= 0}
        className="hidden sm:block"
      />
      <div className="w-24 text-right">
        <p className="tabular text-sm font-medium">
          {formatPrice(instrument.price)}
        </p>
        <PriceChange value={instrument.change24hPct} size="sm" showIcon={false} />
      </div>
    </Link>
  );
}
