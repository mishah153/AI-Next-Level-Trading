/**
 * Server-safe data access. Each function returns the same frontend view model
 * whether sourced from the live API (USE_API) or the bundled mock fixtures.
 * Screens depend on these repositories, not on the data source directly.
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

export async function getInstruments(): Promise<Instrument[]> {
  return USE_API ? publicApi.instruments() : mockInstruments;
}

export async function getInstrument(symbol: string): Promise<Instrument> {
  return USE_API ? publicApi.instrument(symbol) : mockGetInstrument(symbol);
}

export async function getSignals(): Promise<Signal[]> {
  return USE_API ? publicApi.signals() : mockSignals;
}

export async function getSignalById(id: string): Promise<Signal | undefined> {
  if (!USE_API) return mockGetSignal(id);
  try {
    return await publicApi.signal(id);
  } catch {
    return undefined;
  }
}

export async function getWhales(): Promise<WhaleTransaction[]> {
  return USE_API ? publicApi.whales() : mockWhales;
}

export async function getCandles(symbol: string): Promise<Candle[]> {
  return USE_API ? publicApi.candles(symbol) : mockGetCandles(symbol);
}

export async function getOrderBook(symbol: string): Promise<OrderBook> {
  return USE_API ? publicApi.orderBook(symbol) : mockGetOrderBook(symbol);
}

export async function getRecentTrades(symbol: string): Promise<RecentTrade[]> {
  return USE_API ? publicApi.recentTrades(symbol) : mockGetRecentTrades(symbol);
}
