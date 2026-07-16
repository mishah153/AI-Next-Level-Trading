import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { MarketsExplorer } from "@/components/markets/markets-explorer";
import { getInstruments } from "@/lib/data/repositories";
import { MARKET_LABEL } from "@/components/common/market-icon";
import type { MarketKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Browse live crypto, stock and forex markets with AI conviction scores.",
};

export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  const instruments = await getInstruments();
  const byMarket = (m: MarketKind) =>
    instruments.filter((i) => i.market === m);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Markets"
        description="Crypto, stocks and forex — ranked by AI conviction and 24h momentum."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {(["crypto", "stocks", "forex"] as MarketKind[]).map((m) => {
          const list = byMarket(m);
          const avg =
            list.reduce((s, i) => s + i.change24hPct, 0) / (list.length || 1);
          return (
            <StatCard
              key={m}
              label={`${MARKET_LABEL[m]} · ${list.length} markets`}
              value={`${list.length}`}
              changePct={Number(avg.toFixed(2))}
              hint="avg 24h"
            />
          );
        })}
      </div>

      <MarketsExplorer instruments={instruments} />
    </div>
  );
}
