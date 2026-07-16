import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PortfolioView } from "@/components/portfolio/portfolio-view";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Holdings, open positions and performance across all markets.",
};

export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio"
        description="Your aggregated holdings and open positions across connected exchanges."
      />
      <PortfolioView />
    </div>
  );
}
