import Link from "next/link";
import { Logo } from "@/components/common/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Get started</Link>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#features" className="hover:text-foreground">Features</a>
          </nav>
        </div>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Risk disclaimer.</strong>{" "}
          AINextLevelTrading is a decision-support tool. AI signals, whale
          alerts and predictions are provided for informational and educational
          purposes only and do not constitute financial advice. We do not
          custody funds; trades execute on your connected exchange accounts.
          Trading and leverage involve substantial risk of loss. Past
          performance does not guarantee future results.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          © 2026 AINextLevelTrading. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
