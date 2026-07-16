import Link from "next/link";
import type { Position } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MarketIcon } from "@/components/common/market-icon";
import { cn } from "@/lib/utils";
import { formatPrice, formatPercent, formatSigned } from "@/lib/format";
import { symbolToSlug } from "@/lib/symbols";

export function PositionsTable({ positions }: { positions: Position[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Position</TableHead>
          <TableHead className="text-right">Size</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Entry</TableHead>
          <TableHead className="text-right">Mark</TableHead>
          <TableHead className="hidden text-right md:table-cell">Liq. price</TableHead>
          <TableHead className="text-right">uPnL</TableHead>
          <TableHead className="hidden text-right lg:table-cell">Source</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <Link
                href={`/trade/${symbolToSlug(p.symbol)}`}
                className="flex items-center gap-2.5"
              >
                <MarketIcon symbol={p.symbol} market={p.market} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{p.symbol}</span>
                    <Badge
                      variant={p.side === "long" ? "profit" : "loss"}
                      className="text-[10px] uppercase"
                    >
                      {p.side} {p.leverage}×
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.name}</span>
                </div>
              </Link>
            </TableCell>
            <TableCell className="tabular text-right">
              {p.size}
            </TableCell>
            <TableCell className="tabular hidden text-right sm:table-cell">
              {formatPrice(p.entryPrice)}
            </TableCell>
            <TableCell className="tabular text-right">
              {formatPrice(p.markPrice)}
            </TableCell>
            <TableCell className="tabular hidden text-right text-warning md:table-cell">
              {formatPrice(p.liquidationPrice)}
            </TableCell>
            <TableCell className="text-right">
              <div
                className={cn(
                  "tabular font-medium",
                  p.unrealizedPnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {formatSigned(p.unrealizedPnl)}
                <div className="text-xs">{formatPercent(p.unrealizedPnlPct)}</div>
              </div>
            </TableCell>
            <TableCell className="hidden text-right lg:table-cell">
              <Badge variant={p.source === "automation" ? "default" : "neutral"}>
                {p.source === "automation" ? "Auto" : "Manual"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
