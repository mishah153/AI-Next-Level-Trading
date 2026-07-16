import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ConnectionsView } from "@/components/connections/connections-view";

export const metadata: Metadata = {
  title: "Connections",
  description:
    "Connect your exchange accounts via encrypted API keys. AINextLevelTrading never custodies your funds.",
};

export const dynamic = "force-dynamic";

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Exchange Connections"
        description="Bridge to your existing accounts — we execute the trades you authorize but never hold your funds."
      />
      <ConnectionsView />
    </div>
  );
}
