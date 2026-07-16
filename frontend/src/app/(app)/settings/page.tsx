import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/mock/data";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile, risk profile, security and notifications.",
};

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Account, security and preferences." />

      <Card className="border-primary/30 bg-gradient-to-br from-brand/5 to-brand-2/5">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <div>
              <p className="text-sm font-medium">
                Current plan:{" "}
                <span className="capitalize">{currentUser.tier}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Full automation & 24/7 whale tracking unlocked.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/pricing">Manage plan</Link>
          </Button>
        </CardContent>
      </Card>

      <SettingsPanel user={currentUser} />
    </div>
  );
}
