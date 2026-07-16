import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { DisclaimerBanner } from "@/components/common/disclaimer-banner";
import { SignalsExplorer } from "@/components/signals/signals-explorer";
import { getSignals } from "@/lib/data/repositories";

export const metadata: Metadata = {
  title: "AI Signals",
  description:
    "AI-generated BUY/SELL/NEUTRAL signals with confidence scores and multi-layer rationale.",
};

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const signals = await getSignals();
  const active = signals.filter((s) => s.status === "active");
  const avgConf = Math.round(
    signals.reduce((s, x) => s + x.confidence, 0) / signals.length
  );
  const avgWin = Math.round(
    signals.reduce((s, x) => s + x.backtest.winRate, 0) / signals.length
  );
  const buys = signals.filter((s) => s.action === "BUY").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Signals"
        description="Predictive BUY / SELL calls that fuse candlestick patterns, technical indicators and live whale flow — each with a confidence score."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active signals" value={`${active.length}`} hint="live" />
        <StatCard label="Avg. confidence" value={`${avgConf}%`} />
        <StatCard label="Avg. backtest win" value={`${avgWin}%`} />
        <StatCard label="Bullish bias" value={`${buys}/${signals.length}`} hint="BUY calls" />
      </div>

      <DisclaimerBanner />

      <SignalsExplorer signals={signals} />
    </div>
  );
}
