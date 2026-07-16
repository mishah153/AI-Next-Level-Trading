"use client";

import * as React from "react";
import { io } from "socket.io-client";
import { USE_API, WS_URL } from "@/lib/api/config";
import { useMarketStore } from "@/lib/live/market-store";

/**
 * Drives the live price feed. In mock mode it random-walks tracked symbols on
 * an interval; in live mode it subscribes to the backend Socket.IO gateway.
 * Renders nothing.
 */
export function MarketFeed() {
  const tick = useMarketStore((s) => s.tick);
  const setPrice = useMarketStore((s) => s.setPrice);

  React.useEffect(() => {
    if (!USE_API) {
      const id = setInterval(() => tick(), 1500);
      return () => clearInterval(id);
    }
    const socket = io(WS_URL, { transports: ["websocket"] });
    socket.on("tick", (data: { symbol: string; price: number }) => {
      setPrice(data.symbol, data.price);
    });
    return () => {
      socket.disconnect();
    };
  }, [tick, setPrice]);

  return null;
}
