import { API_URL } from "./config";
import { api } from "./client";
import {
  adaptInstrument,
  adaptSignal,
  adaptWhale,
  type InstrumentDto,
  type SignalDto,
  type WhaleDto,
} from "./adapters";
import type {
  Candle,
  Instrument,
  OrderBook,
  RecentTrade,
  Signal,
  User,
  WhaleTransaction,
} from "../types";

/* ----------------------------------------------------- Public (server-safe) */

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const publicApi = {
  async instruments(market?: string): Promise<Instrument[]> {
    const q = market ? `?market=${market}` : "";
    const rows = await getJson<InstrumentDto[]>(`/markets${q}`);
    return rows.map(adaptInstrument);
  },
  async instrument(symbol: string): Promise<Instrument> {
    const dto = await getJson<InstrumentDto>(
      `/markets/${encodeURIComponent(symbol)}`,
    );
    return adaptInstrument(dto);
  },
  async signals(): Promise<Signal[]> {
    const rows = await getJson<SignalDto[]>(`/signals`);
    return rows.map(adaptSignal);
  },
  async signal(id: string): Promise<Signal> {
    return adaptSignal(await getJson<SignalDto>(`/signals/${id}`));
  },
  async whales(): Promise<WhaleTransaction[]> {
    const rows = await getJson<WhaleDto[]>(`/whales`);
    return rows.map(adaptWhale);
  },
  candles(symbol: string): Promise<Candle[]> {
    return getJson<Candle[]>(
      `/markets/${encodeURIComponent(symbol)}/candles`,
    );
  },
  orderBook(symbol: string): Promise<OrderBook> {
    return getJson<OrderBook>(
      `/markets/${encodeURIComponent(symbol)}/orderbook`,
    );
  },
  recentTrades(symbol: string): Promise<RecentTrade[]> {
    return getJson<RecentTrade[]>(
      `/markets/${encodeURIComponent(symbol)}/trades`,
    );
  },
};

/* ------------------------------------------------ Authenticated (client) */

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  async register(body: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", body);
    return data;
  },
  async login(body: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", body);
    return data;
  },
  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};

/* User-scoped resource calls (used by TanStack Query hooks) */
export const userApi = {
  connections: () => api.get("/connections").then((r) => r.data),
  createConnection: (body: unknown) =>
    api.post("/connections", body).then((r) => r.data),
  deleteConnection: (id: string) =>
    api.delete(`/connections/${id}`).then((r) => r.data),
  strategies: () => api.get("/automation/strategies").then((r) => r.data),
  updateStrategy: (id: string, body: unknown) =>
    api.patch(`/automation/strategies/${id}`, body).then((r) => r.data),
  orders: () => api.get("/orders").then((r) => r.data),
  createOrder: (body: unknown) =>
    api.post("/orders", body).then((r) => r.data),
  cancelOrder: (id: string) =>
    api.delete(`/orders/${id}`).then((r) => r.data),
  portfolio: () => api.get("/portfolio").then((r) => r.data),
  positions: () => api.get("/portfolio/positions").then((r) => r.data),
  updateProfile: (body: unknown) =>
    api.patch("/users/me", body).then((r) => r.data),
  activity: () => api.get("/dashboard/activity").then((r) => r.data),
};
