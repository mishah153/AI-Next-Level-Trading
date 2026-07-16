/**
 * Server-safe data access. Each function returns the same frontend view model
 * whether sourced from the live API (USE_API) or the bundled mock fixtures.
 * Screens depend on these repositories, not on the data source directly.
 * When the live API is unreachable (cold start) or denies access, public
 * screens degrade to the mock fixtures instead of failing the render.
 */
import { USE_API } from "../api/config";
import { publicApi } from "../api/services";
import type {
  Candle,
  Instrument,
  OrderBook,
  RecentTrade,
  Signal,
  WhaleTransaction,
} from "../types";
import {
  getCandles as mockGetCandles,
  getInstrument as mockGetInstrument,
  getOrderBook as mockGetOrderBook,
  getRecentTrades as mockGetRecentTrades,
  getSignal as mockGetSignal,
  instruments as mockInstruments,
  signals as mockSignals,
  whaleTransactions as mockWhales,
} from "../mock/data";

async function apiOrMock<T>(call: () => Promise<T>, mock: T): Promise<T> {
  if (!USE_API) return mock;
  try {
    return await call();
  } catch {
    return mock;
  }
}

export async function getInstruments(): Promise<Instrument[]> {
  return apiOrMock(() => publicApi.instruments(), mockInstruments);
}

export async function getInstrument(symbol: string): Promise<Instrument> {
  return apiOrMock(() => publicApi.instrument(symbol), mockGetInstrument(symbol));
}

export async function getSignals(): Promise<Signal[]> {
  return apiOrMock(() => publicApi.signals(), mockSignals);
}

export async function getSignalById(id: string): Promise<Signal | undefined> {
  return apiOrMock(() => publicApi.signal(id), mockGetSignal(id));
}

export async function getWhales(): Promise<WhaleTransaction[]> {
  return apiOrMock(() => publicApi.whales(), mockWhales);
}

export async function getCandles(symbol: string): Promise<Candle[]> {
  return apiOrMock(() => publicApi.candles(symbol), mockGetCandles(symbol));
}

export async function getOrderBook(symbol: string): Promise<OrderBook> {
  return apiOrMock(() => publicApi.orderBook(symbol), mockGetOrderBook(symbol));
}

export async function getRecentTrades(symbol: string): Promise<RecentTrade[]> {
  return apiOrMock(() => publicApi.recentTrades(symbol), mockGetRecentTrades(symbol));
}
