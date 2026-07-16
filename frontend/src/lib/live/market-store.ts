import { create } from "zustand";

interface MarketState {
  prices: Record<string, number>;
  prev: Record<string, number>;
  /** Seed a symbol's base price if not already tracked. */
  register: (symbol: string, base: number) => void;
  /** Apply an authoritative price (from the WebSocket feed). */
  setPrice: (symbol: string, price: number) => void;
  /** Random-walk every tracked symbol (mock/simulated feed). */
  tick: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  prices: {},
  prev: {},
  register: (symbol, base) =>
    set((state) =>
      state.prices[symbol] !== undefined
        ? state
        : {
            prices: { ...state.prices, [symbol]: base },
            prev: { ...state.prev, [symbol]: base },
          },
    ),
  setPrice: (symbol, price) =>
    set((state) => ({
      prices: { ...state.prices, [symbol]: price },
      prev: { ...state.prev, [symbol]: state.prices[symbol] ?? price },
    })),
  tick: () =>
    set((state) => {
      const prices: Record<string, number> = {};
      const prev: Record<string, number> = {};
      for (const [symbol, price] of Object.entries(state.prices)) {
        const drift = (Math.random() - 0.5) * 0.002; // ±0.1%
        const next = Math.max(price * (1 + drift), 0);
        prices[symbol] = Number(next.toFixed(price < 1 ? 6 : 2));
        prev[symbol] = price;
      }
      return { prices, prev };
    }),
}));
