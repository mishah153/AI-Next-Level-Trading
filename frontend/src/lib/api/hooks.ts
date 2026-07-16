"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { USE_API } from "./config";
import { publicApi, userApi } from "./services";
import type {
  ActivityItem,
  AutomationStrategy,
  ExchangeConnection,
  Instrument,
  Order,
  PortfolioSummary,
  Position,
  Signal,
  WhaleTransaction,
} from "../types";
import {
  MOCK_NOW,
  activity as mockActivity,
  connections as mockConnections,
  instruments as mockInstruments,
  orders as mockOrders,
  portfolio as mockPortfolio,
  positions as mockPositions,
  signals as mockSignals,
  strategies as mockStrategies,
  whaleTransactions as mockWhales,
} from "../mock/data";

/**
 * User-scoped data hooks. When NEXT_PUBLIC_USE_API is off they resolve to the
 * bundled mock fixtures (no network); when on they fetch from the API with the
 * bearer token attached by the axios client.
 */

const keys = {
  portfolio: ["portfolio"] as const,
  positions: ["positions"] as const,
  orders: ["orders"] as const,
  connections: ["connections"] as const,
  strategies: ["strategies"] as const,
  activity: ["activity"] as const,
  instruments: ["instruments"] as const,
  signals: ["signals"] as const,
  whales: ["whales"] as const,
};

/* ------------------------------------------------- Public (client) reads */

export function useInstruments() {
  return useQuery<Instrument[]>({
    queryKey: keys.instruments,
    queryFn: () => publicApi.instruments(),
    enabled: USE_API,
    initialData: USE_API ? undefined : mockInstruments,
  });
}

export function useSignals() {
  return useQuery<Signal[]>({
    queryKey: keys.signals,
    queryFn: () => publicApi.signals(),
    enabled: USE_API,
    initialData: USE_API ? undefined : mockSignals,
  });
}

export function useWhales() {
  return useQuery<WhaleTransaction[]>({
    queryKey: keys.whales,
    queryFn: () => publicApi.whales(),
    enabled: USE_API,
    initialData: USE_API ? undefined : mockWhales,
  });
}

export function useActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: keys.activity,
    queryFn: () => userApi.activity() as Promise<ActivityItem[]>,
    enabled: USE_API,
    initialData: USE_API ? undefined : mockActivity,
  });
}

export function usePortfolioSummary() {
  return useQuery<PortfolioSummary>({
    queryKey: keys.portfolio,
    queryFn: () => userApi.portfolio() as Promise<PortfolioSummary>,
    enabled: USE_API,
    initialData: USE_API ? undefined : mockPortfolio,
  });
}

export function usePositions() {
  return useQuery<Position[]>({
    queryKey: keys.positions,
    queryFn: () => userApi.positions() as Promise<Position[]>,
    enabled: USE_API,
    initialData: USE_API ? undefined : mockPositions,
  });
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: keys.orders,
    queryFn: () => userApi.orders() as Promise<Order[]>,
    enabled: USE_API,
    initialData: USE_API ? undefined : mockOrders,
  });
}

export function useConnections() {
  return useQuery<ExchangeConnection[]>({
    queryKey: keys.connections,
    queryFn: () => userApi.connections() as Promise<ExchangeConnection[]>,
    enabled: USE_API,
    initialData: USE_API ? undefined : mockConnections,
  });
}

export function useStrategies() {
  return useQuery<AutomationStrategy[]>({
    queryKey: keys.strategies,
    queryFn: () => userApi.strategies() as Promise<AutomationStrategy[]>,
    enabled: USE_API,
    initialData: USE_API ? undefined : mockStrategies,
  });
}

/* ------------------------------------------------------------- Mutations */

export interface PlaceOrderInput {
  symbol: string;
  market: Order["market"];
  side: Order["side"];
  type: Order["type"];
  price: number | null;
  size: number;
}

export interface NewConnectionBody {
  provider: ExchangeConnection["provider"];
  label: string;
  market: ExchangeConnection["market"];
  apiKey: string;
  apiSecret: string;
  permissions?: string[];
  mfaEnabled?: boolean;
}

let mockSeq = 0;

function buildMockOrder(input: PlaceOrderInput): Order {
  mockSeq += 1;
  const filled = input.type === "market";
  return {
    id: `ORD-${20000 + mockSeq}`,
    symbol: input.symbol,
    market: input.market,
    side: input.side,
    type: input.type,
    price: input.type === "market" ? null : input.price,
    size: input.size,
    filledPct: filled ? 100 : 0,
    status: filled ? "filled" : "open",
    source: "manual",
    createdAt: new Date(MOCK_NOW).toISOString(),
  };
}

/** Place an order. Mock mode prepends to the cached orders list. */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) =>
      USE_API ? userApi.createOrder(input) : Promise.resolve(input),
    onSuccess: (_res, input) => {
      if (USE_API) {
        void qc.invalidateQueries({ queryKey: keys.orders });
        return;
      }
      qc.setQueryData<Order[]>(keys.orders, (old) => [
        buildMockOrder(input),
        ...(old ?? mockOrders),
      ]);
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_API ? userApi.cancelOrder(id) : Promise.resolve(id),
    onSuccess: (_res, id) => {
      if (USE_API) {
        void qc.invalidateQueries({ queryKey: keys.orders });
        return;
      }
      qc.setQueryData<Order[]>(keys.orders, (old) =>
        (old ?? mockOrders).map((o) =>
          o.id === id ? { ...o, status: "canceled" } : o,
        ),
      );
    },
  });
}

export function useCreateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewConnectionBody) =>
      USE_API ? userApi.createConnection(body) : Promise.resolve(body),
    onSuccess: (_res, body) => {
      if (USE_API) {
        void qc.invalidateQueries({ queryKey: keys.connections });
        return;
      }
      const created: ExchangeConnection = {
        id: `conn-${20000 + ++mockSeq}`,
        provider: body.provider,
        label: body.label,
        market: body.market,
        status: "connected",
        balanceUsd: 0,
        connectedAt: new Date(MOCK_NOW).toISOString(),
        permissions: body.permissions ?? ["Read"],
        mfaEnabled: body.mfaEnabled ?? false,
      };
      qc.setQueryData<ExchangeConnection[]>(keys.connections, (old) => [
        created,
        ...(old ?? mockConnections),
      ]);
    },
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      USE_API ? userApi.deleteConnection(id) : Promise.resolve(id),
    onSuccess: (_res, id) => {
      if (USE_API) {
        void qc.invalidateQueries({ queryKey: keys.connections });
        return;
      }
      qc.setQueryData<ExchangeConnection[]>(keys.connections, (old) =>
        (old ?? mockConnections).filter((c) => c.id !== id),
      );
    },
  });
}

export function useUpdateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AutomationStrategy> }) =>
      USE_API ? userApi.updateStrategy(id, body) : Promise.resolve({ id, body }),
    onSuccess: (_res, { id, body }) => {
      if (USE_API) {
        void qc.invalidateQueries({ queryKey: keys.strategies });
        return;
      }
      qc.setQueryData<AutomationStrategy[]>(keys.strategies, (old) =>
        (old ?? mockStrategies).map((s) =>
          s.id === id ? { ...s, ...body } : s,
        ),
      );
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (body: unknown) =>
      USE_API ? userApi.updateProfile(body) : Promise.resolve(body),
  });
}
