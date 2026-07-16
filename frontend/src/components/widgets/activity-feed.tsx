import { Bot, Fish, ReceiptText, Server, Sparkles } from "lucide-react";
import type { ActivityItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { MOCK_NOW } from "@/lib/mock/data";

const ICONS = {
  signal: Sparkles,
  whale: Fish,
  order: ReceiptText,
  automation: Bot,
  system: Server,
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <li key={item.id} className="flex gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                item.sentiment === "bullish"
                  ? "bg-profit/15 text-profit"
                  : item.sentiment === "bearish"
                    ? "bg-loss/15 text-loss"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {timeAgo(item.timestamp, MOCK_NOW)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
