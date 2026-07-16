"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  Plus,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type {
  ExchangeConnection,
  ExchangeProvider,
  MarketKind,
} from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const PROVIDER_META: Record<
  ExchangeProvider,
  { name: string; market: MarketKind; color: string }
> = {
  binance: { name: "Binance", market: "crypto", color: "bg-amber-500" },
  coinbase: { name: "Coinbase", market: "crypto", color: "bg-blue-500" },
  kraken: { name: "Kraken", market: "crypto", color: "bg-violet-500" },
  alpaca: { name: "Alpaca", market: "stocks", color: "bg-yellow-500" },
  oanda: { name: "OANDA", market: "forex", color: "bg-red-500" },
};

function ConnectionCard({
  conn,
  onDisconnect,
}: {
  conn: ExchangeConnection;
  onDisconnect?: (conn: ExchangeConnection) => void;
}) {
  const meta = PROVIDER_META[conn.provider];
  const error = conn.status === "error";
  return (
    <Card className={cn(error && "border-loss/40")}>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-lg text-sm font-bold text-white",
              meta.color
            )}
          >
            {meta.name.slice(0, 2)}
          </span>
          <div>
            <p className="font-semibold">{conn.label}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {conn.market}
            </p>
          </div>
        </div>
        {error ? (
          <Badge variant="loss" className="gap-1">
            <TriangleAlert className="size-3" /> Error
          </Badge>
        ) : (
          <Badge variant="profit" className="gap-1">
            <CheckCircle2 className="size-3" /> Connected
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance</span>
          <span className="tabular font-semibold">
            {formatCurrency(conn.balanceUsd)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {conn.permissions.map((p) => (
            <Badge key={p} variant="neutral" className="text-[10px]">
              {p}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-xs">
          <span
            className={cn(
              "flex items-center gap-1",
              conn.mfaEnabled ? "text-profit" : "text-muted-foreground"
            )}
          >
            <ShieldCheck className="size-3.5" />
            {conn.mfaEnabled ? "MFA enabled" : "MFA off"}
          </span>
          {error ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => toast.success("Reconnection flow started (demo)")}
            >
              Reconnect
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-loss hover:text-loss"
              onClick={() =>
                onDisconnect
                  ? onDisconnect(conn)
                  : toast.success(`${conn.label} disconnected (demo)`)
              }
            >
              Disconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export interface NewConnectionInput {
  provider: ExchangeProvider;
  label: string;
  market: MarketKind;
  apiKey: string;
  apiSecret: string;
}

export function ConnectionsManager({
  connections,
  onCreate,
  onDisconnect,
}: {
  connections: ExchangeConnection[];
  onCreate?: (input: NewConnectionInput) => void;
  onDisconnect?: (conn: ExchangeConnection) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [provider, setProvider] = React.useState<ExchangeProvider>("binance");
  const [label, setLabel] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [apiSecret, setApiSecret] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error("Enter both an API key and secret.");
      return;
    }
    const input: NewConnectionInput = {
      provider,
      label: label || `${PROVIDER_META[provider].name} — Main`,
      market: PROVIDER_META[provider].market,
      apiKey,
      apiSecret,
    };
    setOpen(false);
    setLabel("");
    setApiKey("");
    setApiSecret("");
    if (onCreate) onCreate(input);
    else toast.success("Exchange connected (demo)");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Linked exchanges
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus /> Connect exchange
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="size-4" /> Connect an exchange
              </DialogTitle>
              <DialogDescription>
                Keys are encrypted with AES-256 and used only to execute the
                trades you authorize. We never hold your funds.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label>Exchange</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => setProvider(v as ExchangeProvider)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDER_META).map(([id, m]) => (
                      <SelectItem key={id} value={id}>
                        {m.name} · {m.market}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="Binance — Main"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apiKey">API key</Label>
                <Input
                  id="apiKey"
                  placeholder="••••••••••••••••"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apiSecret">API secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
                Use a key restricted to trading only — never enable withdrawal
                permissions.
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Connect securely
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {connections.map((c) => (
          <ConnectionCard key={c.id} conn={c} onDisconnect={onDisconnect} />
        ))}
      </div>
    </div>
  );
}
