import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { OrdersView } from "@/components/orders/orders-view";

export const metadata: Metadata = {
  title: "Orders",
  description: "Open orders, fills and order history across all markets.",
};

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track every order — placed manually or executed by your automation strategies."
      />
      <OrdersView />
    </div>
  );
}
