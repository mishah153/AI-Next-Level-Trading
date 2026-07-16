"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { AllocationSlice } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const COLORS: Record<string, string> = {
  crypto: "var(--color-brand)",
  stocks: "var(--color-brand-2)",
  forex: "var(--color-profit)",
  cash: "var(--color-muted-foreground)",
};

export function AllocationChart({ data }: { data: AllocationSlice[] }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative size-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="valueUsd"
              nameKey="label"
              innerRadius={44}
              outerRadius={62}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((slice) => (
                <Cell key={slice.label} fill={COLORS[slice.market]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Total
          </span>
          <span className="tabular text-sm font-semibold">
            {formatCurrency(
              data.reduce((s, d) => s + d.valueUsd, 0),
              { compact: true }
            )}
          </span>
        </div>
      </div>
      <ul className="flex-1 space-y-2">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: COLORS[slice.market] }}
            />
            <span className="flex-1 text-muted-foreground">{slice.label}</span>
            <span className="tabular font-medium">{slice.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
