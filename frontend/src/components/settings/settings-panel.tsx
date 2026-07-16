"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import type { RiskProfile, User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { USE_API } from "@/lib/api/config";
import { useAuth } from "@/lib/api/auth-context";
import { useUpdateProfile } from "@/lib/api/hooks";

const RISK_OPTIONS: { id: RiskProfile; label: string; desc: string }[] = [
  { id: "conservative", label: "Conservative", desc: "Capital preservation, spot only" },
  { id: "balanced", label: "Balanced", desc: "Moderate leverage, mixed markets" },
  { id: "aggressive", label: "Aggressive", desc: "Higher leverage, active trading" },
];

const NOTIFS = [
  { id: "signals", label: "AI signal alerts", desc: "New high-confidence signals", on: true },
  { id: "whales", label: "Whale movements", desc: "$10M+ transactions on watchlist", on: true },
  { id: "automation", label: "Automation activity", desc: "When a strategy opens or closes", on: true },
  { id: "email", label: "Email digest", desc: "Daily performance summary", on: false },
];

export function SettingsPanel({ user: initialUser }: { user: User }) {
  const { user: authUser } = useAuth();
  const user = authUser ?? initialUser;
  const updateProfile = useUpdateProfile();
  const [name, setName] = React.useState(user.name);
  const [risk, setRisk] = React.useState<RiskProfile>(user.riskProfile);
  const [mfa, setMfa] = React.useState(user.mfaEnabled);

  const persist = (patch: Record<string, unknown>) => {
    if (USE_API) updateProfile.mutate(patch);
  };

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              persist({ name });
              toast.success("Profile updated");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Risk profile */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Profile</CardTitle>
          <CardDescription>
            Sets default guardrails for new automation strategies.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {RISK_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setRisk(opt.id);
                persist({ riskProfile: opt.id });
                toast.success(`Risk profile: ${opt.label}`);
              }}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                risk === opt.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-accent"
              )}
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Protect your account and API keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className="size-4 text-profit" /> Two-factor
                authentication
              </p>
              <p className="text-xs text-muted-foreground">
                Require a code on login and withdrawals.
              </p>
            </div>
            <Switch
              checked={mfa}
              onCheckedChange={(v) => {
                setMfa(v);
                persist({ mfaEnabled: v });
                toast.success(`2FA ${v ? "enabled" : "disabled"}`);
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <BadgeCheck className="size-4 text-profit" /> Identity (KYC)
              </p>
              <p className="text-xs text-muted-foreground">
                Verified via Persona.
              </p>
            </div>
            <Badge variant="profit" className="capitalize">
              {user.kycStatus}
            </Badge>
          </div>
          <Separator />
          <Button variant="outline" size="sm">
            Change password
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what the AI pings you about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFS.map((n, i) => (
            <React.Fragment key={n.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked={n.on} />
              </div>
              {i < NOTIFS.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
