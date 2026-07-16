"use client";

import * as React from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  createChart,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import type { Candle } from "@/lib/types";

const PROFIT = "#34d399";
const LOSS = "#fb7185";

export function CandlestickChart({
  candles,
  height = 380,
}: {
  candles: Candle[];
  height?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const dark = resolvedTheme !== "light";
    const text = dark ? "#94a3b8" : "#64748b";
    const grid = dark ? "rgba(148,163,184,0.10)" : "rgba(100,116,139,0.12)";

    const chart: IChartApi = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: text,
        fontFamily: "var(--font-sans)",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      rightPriceScale: { borderColor: grid },
      timeScale: { borderColor: grid, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      height,
      autoSize: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: PROFIT,
      downColor: LOSS,
      wickUpColor: PROFIT,
      wickDownColor: LOSS,
      borderVisible: false,
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(52,211,153,0.4)" : "rgba(251,113,133,0.4)",
      }))
    );

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [candles, height, resolvedTheme]);

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
