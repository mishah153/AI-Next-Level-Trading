import type { Metadata } from "next";
import { ArrowDownToLine, ArrowUpFromLine, Fish } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { DisclaimerBanner } from "@/components/common/disclaimer-banner";
import { WhaleFeed } from "@/components/whales/whale-feed";
import { formatCurrency } from "@/lib/format";
import { getWhales } from "@/lib/data/repositories";

export const metadata: Metadata = {
  title: "Whale Feed",
  description:
    "Real-time large-transaction radar — see the institutional flow behind every AI alert.",
};

export const dynamic = "force-dynamic";

export default async function WhalesPage() {
  const whaleTransactions = await getWhales();
  const inflow = whaleTransactions
    .filter((t) => t.type === "exchange_inflow")
    .reduce((s, t) => s + t.amountUsd, 0);
  const outflow = whaleTransactions
    .filter((t) => t.type === "exchange_outflow")
    .reduce((s, t) => s + t.amountUsd, 0);
  const total = whaleTransactions.reduce((s, t) => s + t.amountUsd, 0);
  const net = outflow - inflow;

  return (
    <div className="space-y-6">
      <PageHeader
        title="🐋 Whale Feed"
        description="The Whale-Eye system tracks $2M+ transactions across markets, so you can see the why behind every AI alert — often before the candle even closes."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="24h Tracked Volume"
          value={formatCurrency(total, { compact: true })}
          icon={<Fish className="size-4" />}
          hint={`${whaleTransactions.length} events`}
        />
        <StatCard
          label="Exchange Inflow"
          value={formatCurrency(inflow, { compact: true })}
          icon={<ArrowDownToLine className="size-4" />}
          hint="sell-side risk"
        />
        <StatCard
          label="Exchange Outflow"
          value={formatCurrency(outflow, { compact: true })}
          icon={<ArrowUpFromLine className="size-4" />}
          hint="accumulation"
        />
        <StatCard
          label="Net Flow"
          value={formatCurrency(net, { compact: true })}
          changePct={Number(((net / total) * 100).toFixed(1))}
          hint={net >= 0 ? "net accumulation" : "net distribution"}
        />
      </div>

      <DisclaimerBanner />

      <WhaleFeed transactions={whaleTransactions} />
    </div>
  );
}
