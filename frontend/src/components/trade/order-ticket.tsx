"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Instrument } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlaceOrder } from "@/lib/api/hooks";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

function TicketForm({
  side,
  instrument,
}: {
  side: Side;
  instrument: Instrument;
}) {
  const [type, setType] = React.useState<OrderType>("limit");
  const [price, setPrice] = React.useState(instrument.price.toString());
  const [amount, setAmount] = React.useState("");
  const [leverage, setLeverage] = React.useState([2]);
  const placeOrder = usePlaceOrder();

  const px = type === "market" ? instrument.price : Number(price) || 0;
  const qty = Number(amount) || 0;
  const total = px * qty;
  const lev = leverage[0];
  const margin = lev > 0 ? total / lev : total;
  const liq =
    side === "buy"
      ? px * (1 - 0.9 / lev)
      : px * (1 + 0.9 / lev);

  const base = instrument.symbol.split("/")[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (type !== "market" && (!Number.isFinite(px) || px <= 0)) {
      toast.error("Enter a valid price for a limit or stop order.");
      return;
    }
    placeOrder.mutate(
      {
        symbol: instrument.symbol,
        market: instrument.market,
        side,
        type,
        price: type === "market" ? null : px,
        size: qty,
      },
      {
        onSuccess: () => {
          toast.success(`${side === "buy" ? "Buy" : "Sell"} order placed`, {
            description: `${qty} ${base} @ ${
              type === "market" ? "Market" : formatPrice(px)
            } · ${lev}×`,
          });
          setAmount("");
        },
        onError: () => toast.error("Could not place the order."),
      },
    );
  };

  const pct = [25, 50, 75, 100];

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Order type</Label>
        <Select value={type} onValueChange={(v) => setType(v as OrderType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market">Market</SelectItem>
            <SelectItem value="limit">Limit</SelectItem>
            <SelectItem value="stop">Stop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type !== "market" && (
        <div className="space-y-1.5">
          <Label htmlFor={`price-${side}`}>Price (USDT)</Label>
          <Input
            id={`price-${side}`}
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={`amount-${side}`}>Amount ({instrument.symbol.split("/")[0]})</Label>
        <Input
          id={`amount-${side}`}
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {pct.map((p) => (
            <Button
              key={p}
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setAmount(((10000 / px) * (p / 100)).toFixed(4))
              }
            >
              {p}%
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Leverage</Label>
          <span className="text-xs font-semibold text-primary">{lev}×</span>
        </div>
        <Slider
          min={1}
          max={20}
          step={1}
          value={leverage}
          onValueChange={setLeverage}
        />
      </div>

      <dl className="space-y-1 rounded-lg bg-muted/50 p-3 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Order value</dt>
          <dd className="tabular font-medium">{formatCurrency(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Margin required</dt>
          <dd className="tabular font-medium">{formatCurrency(margin)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Est. liquidation</dt>
          <dd className="tabular font-medium text-warning">
            {qty > 0 ? formatPrice(liq) : "—"}
          </dd>
        </div>
      </dl>

      <Button
        type="submit"
        variant={side === "buy" ? "profit" : "loss"}
        className="w-full"
      >
        {side === "buy" ? "Buy" : "Sell"} {instrument.symbol.split("/")[0]}
      </Button>
    </form>
  );
}

export function OrderTicket({ instrument }: { instrument: Instrument }) {
  return (
    <Tabs defaultValue="buy">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="buy"
          className="data-[state=active]:bg-profit data-[state=active]:text-profit-foreground"
        >
          Buy / Long
        </TabsTrigger>
        <TabsTrigger
          value="sell"
          className="data-[state=active]:bg-loss data-[state=active]:text-loss-foreground"
        >
          Sell / Short
        </TabsTrigger>
      </TabsList>
      <TabsContent value="buy" className={cn("mt-4")}>
        <TicketForm side="buy" instrument={instrument} />
      </TabsContent>
      <TabsContent value="sell" className="mt-4">
        <TicketForm side="sell" instrument={instrument} />
      </TabsContent>
    </Tabs>
  );
}
