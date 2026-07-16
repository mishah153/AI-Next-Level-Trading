"use client";

import { toast } from "sonner";
import { StatCard } from "@/components/common/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersTable } from "@/components/orders/orders-table";
import { useCancelOrder, useOrders } from "@/lib/api/hooks";

export function OrdersView() {
  const { data: orders } = useOrders();
  const cancel = useCancelOrder();

  if (!orders) {
    return <Skeleton className="h-96" />;
  }

  const open = orders.filter(
    (o) => o.status === "open" || o.status === "partial",
  ).length;
  const filled = orders.filter((o) => o.status === "filled").length;
  const auto = orders.filter((o) => o.source === "automation").length;

  const handleCancel = (id: string) => {
    cancel.mutate(id, {
      onSuccess: () => toast.success(`Order ${id} canceled`),
      onError: () => toast.error("Could not cancel order"),
    });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open orders" value={`${open}`} />
        <StatCard label="Filled (recent)" value={`${filled}`} />
        <StatCard label="Automated" value={`${auto}`} hint="by strategies" />
      </div>
      <OrdersTable orders={orders} onCancel={handleCancel} />
    </>
  );
}
