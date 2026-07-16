import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { DisclaimerBanner } from "@/components/common/disclaimer-banner";
import { tiers, currentUser } from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the plan that matches your trading intensity.",
};

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Plans & Pricing"
        description="From delayed alerts to full hedge-fund-style automation — upgrade as you level up."
      />
      <PricingPlans tiers={tiers} currentTier={currentUser.tier} />
      <DisclaimerBanner />
    </div>
  );
}
