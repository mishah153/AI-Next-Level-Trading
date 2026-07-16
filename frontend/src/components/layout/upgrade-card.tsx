import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeCard() {
  return (
    <div className="m-3 rounded-xl border bg-gradient-to-br from-brand/10 to-brand-2/10 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <p className="text-sm font-semibold">Elite plan active</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Full automation, 24/7 whale tracking and leverage insights are unlocked.
      </p>
      <Button asChild size="sm" variant="outline" className="mt-3 w-full">
        <Link href="/pricing">Manage plan</Link>
      </Button>
    </div>
  );
}
