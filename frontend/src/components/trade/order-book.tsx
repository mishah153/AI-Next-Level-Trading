import type { OrderBook } from "@/lib/types";
import { formatPrice, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

function Rows({
  levels,
  side,
  max,
}: {
  levels: OrderBook["bids"];
  side: "bid" | "ask";
  max: number;
}) {
  const bar = side === "bid" ? "bg-profit/10" : "bg-loss/10";
  const text = side === "bid" ? "text-profit" : "text-loss";
  const ordered = side === "ask" ? [...levels].reverse() : levels;
  return (
    <div className="space-y-px">
      {ordered.map((l, idx) => (
        <div
          key={idx}
          className="relative grid grid-cols-3 px-3 py-0.5 text-xs"
        >
          <span
            className={cn("absolute inset-y-0 right-0", bar)}
            style={{ width: `${(l.total / max) * 100}%` }}
          />
          <span className={cn("tabular relative font-medium", text)}>
            {formatPrice(l.price)}
          </span>
          <span className="tabular relative text-right text-muted-foreground">
            {formatNumber(l.size, { maximumFractionDigits: 3 })}
          </span>
          <span className="tabular relative text-right text-muted-foreground">
            {formatNumber(l.total, { maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OrderBookPanel({
  book,
  lastPrice,
}: {
  book: OrderBook;
  lastPrice: number;
}) {
  const max = Math.max(
    book.bids[book.bids.length - 1].total,
    book.asks[book.asks.length - 1].total
  );

  return (
    <div>
      <div className="grid grid-cols-3 px-3 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <Rows levels={book.asks} side="ask" max={max} />
      <div className="my-1.5 flex items-center justify-between border-y px-3 py-1.5">
        <span className="tabular text-sm font-semibold text-profit">
          {formatPrice(lastPrice)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Spread {book.spread} ({book.spreadPct}%)
        </span>
      </div>
      <Rows levels={book.bids} side="bid" max={max} />
    </div>
  );
}
