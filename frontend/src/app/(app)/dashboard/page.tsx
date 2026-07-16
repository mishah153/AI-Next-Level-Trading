import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your AI-powered command center across crypto, stocks & forex."
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/markets">Explore markets</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signals">
            View AI signals <ArrowRight />
          </Link>
        </Button>
      </PageHeader>

      <DashboardView />
    </div>
  );
}
