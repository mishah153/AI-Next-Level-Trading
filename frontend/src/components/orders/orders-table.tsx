"use client";

import * as React from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MarketIcon } from "@/components/common/market-icon";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import { formatPrice, timeAgo } from "@/lib/format";
import { MOCK_NOW } from "@/lib/mock/data";

const STATUS_VARIANT: Record<
  OrderStatus,
  "profit" | "loss" | "neutral" | "warning" | "default"
> = {
  open: "default",
  filled: "profit",
  partial: "warning",
  canceled: "neutral",
  rejected: "loss",
};

type Filter = "all" | "open" | "filled" | "history";

export function OrdersTable({
  orders,
  onCancel,
}: {
  orders: Order[];
  onCancel?: (id: string) => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");

  const rows = React.useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "open")
      return orders.filter((o) => o.status === "open" || o.status === "partial");
    if (filter === "filled") return orders.filter((o) => o.status === "filled");
    return orders.filter(
      (o) => o.status === "canceled" || o.status === "rejected"
    );
  }, [orders, filter]);

  return (
    <Card className="overflow-hidden">
      <div className="border-b p-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="filled">Filled</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Filled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right md:table-cell">Placed</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <MarketIcon symbol={o.symbol} market={o.market} />
                    <div>
                      <p className="font-medium">{o.symbol}</p>
                      <p className="text-xs text-muted-foreground">{o.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-medium capitalize",
                      o.side === "buy" ? "text-profit" : "text-loss"
                    )}
                  >
                    {o.side}
                  </span>
                </TableCell>
                <TableCell className="hidden capitalize text-muted-foreground sm:table-cell">
                  {o.type}
                </TableCell>
                <TableCell className="tabular text-right">
                  {o.price ? formatPrice(o.price) : "Market"}
                </TableCell>
                <TableCell className="tabular text-right">{o.size}</TableCell>
                <TableCell className="tabular text-right">{o.filledPct}%</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status]} className="capitalize">
                    {o.status}
                  </Badge>
                  {o.source === "automation" && (
                    <Badge variant="neutral" className="ml-1 text-[10px]">
                      Auto
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden text-right text-xs text-muted-foreground md:table-cell">
                  {timeAgo(o.createdAt, MOCK_NOW)}
                </TableCell>
                <TableCell className="text-right">
                  {(o.status === "open" || o.status === "partial") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-loss"
                      aria-label="Cancel order"
                      onClick={() =>
                        onCancel
                          ? onCancel(o.id)
                          : toast.success(`Order ${o.id} canceled (demo)`)
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          className="m-4 border-0"
          title="No orders here"
          description="Orders you place — manually or via automation — will appear in this tab."
        />
      )}
    </Card>
  );
}
