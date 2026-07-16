import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UpgradeCard } from "@/components/layout/upgrade-card";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MarketFeed } from "@/components/live/market-feed";
import { MarketTicker } from "@/components/live/market-ticker";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" aria-label="AINextLevelTrading home">
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin">
          <SidebarNav />
        </div>
        <UpgradeCard />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <AppTopbar />
        <MarketTicker />
        <MarketFeed />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
