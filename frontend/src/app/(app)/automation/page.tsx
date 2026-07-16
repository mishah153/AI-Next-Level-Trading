import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DisclaimerBanner } from "@/components/common/disclaimer-banner";
import { Button } from "@/components/ui/button";
import { AutomationView } from "@/components/automation/automation-view";

export const metadata: Metadata = {
  title: "Automation",
  description:
    "Automate trading with control — risk tolerance, spending limits and auto-execution on AI signals.",
};

export const dynamic = "force-dynamic";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation with Control"
        description="Let the AI act on its own signals — inside the guardrails you set. Tune risk tolerance and spending limits per strategy."
      >
        <Button size="sm">
          <Plus /> New strategy
        </Button>
      </PageHeader>

      <DisclaimerBanner />

      <AutomationView />
    </div>
  );
}
