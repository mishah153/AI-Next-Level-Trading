"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";
import type { TierPlan, SubscriptionTier } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PricingPlans({
  tiers,
  currentTier,
}: {
  tiers: TierPlan[];
  currentTier: SubscriptionTier;
}) {
  const [annual, setAnnual] = React.useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="billing" className="text-sm text-muted-foreground">
          Monthly
        </Label>
        <Switch id="billing" checked={annual} onCheckedChange={setAnnual} />
        <Label htmlFor="billing" className="text-sm text-muted-foreground">
          Annual
        </Label>
        <Badge variant="profit">Save 20%</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price = annual
            ? Math.round(tier.priceMonthly * 0.8)
            : tier.priceMonthly;
          const isCurrent = tier.id === currentTier;
          return (
            <Card
              key={tier.id}
              className={cn(
                "relative flex flex-col p-6",
                tier.highlighted &&
                  "border-primary/50 shadow-lg shadow-primary/10"
              )}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                  <Sparkles className="size-3" /> Most popular
                </Badge>
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.tagline}</p>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  ${price}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {tier.audience}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-profit" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                variant={
                  isCurrent
                    ? "secondary"
                    : tier.highlighted
                      ? "default"
                      : "outline"
                }
                disabled={isCurrent}
                onClick={() =>
                  toast.success(`Upgrade to ${tier.name} started (demo)`)
                }
              >
                {isCurrent
                  ? "Current plan"
                  : tier.priceMonthly === 0
                    ? "Downgrade"
                    : `Upgrade to ${tier.name}`}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
