"use client";

import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/common/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ConnectionsManager,
  type NewConnectionInput,
} from "@/components/connections/connections-manager";
import { formatCurrency } from "@/lib/format";
import {
  useConnections,
  useCreateConnection,
  useDeleteConnection,
} from "@/lib/api/hooks";
import type { ExchangeConnection } from "@/lib/types";

export function ConnectionsView() {
  const { data: connections } = useConnections();
  const create = useCreateConnection();
  const remove = useDeleteConnection();

  if (!connections) {
    return <Skeleton className="h-96" />;
  }

  const connected = connections.filter((c) => c.status === "connected").length;
  const totalBalance = connections.reduce((s, c) => s + c.balanceUsd, 0);

  const handleCreate = (input: NewConnectionInput) => {
    create.mutate(
      { ...input, permissions: ["Read", "Spot Trade"], mfaEnabled: true },
      {
        onSuccess: () => toast.success("Exchange connected"),
        onError: () => toast.error("Could not connect exchange"),
      },
    );
  };

  const handleDisconnect = (conn: ExchangeConnection) => {
    remove.mutate(conn.id, {
      onSuccess: () => toast.success(`${conn.label} disconnected`),
      onError: () => toast.error("Could not disconnect"),
    });
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Connected" value={`${connected}`} />
        <StatCard
          label="Aggregate balance"
          value={formatCurrency(totalBalance, { compact: true })}
        />
        <StatCard
          label="Security"
          value="AES-256"
          hint="encrypted keys"
          icon={<ShieldCheck className="size-4 text-profit" />}
        />
      </div>
      <ConnectionsManager
        connections={connections}
        onCreate={handleCreate}
        onDisconnect={handleDisconnect}
      />
    </>
  );
}
