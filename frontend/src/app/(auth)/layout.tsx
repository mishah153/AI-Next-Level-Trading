import Link from "next/link";
import { Fish, Sparkles, Bot } from "lucide-react";
import { Logo } from "@/components/common/logo";

const HIGHLIGHTS = [
  { icon: Fish, title: "Whale-Eye tracking", desc: "See $100M+ moves as they happen." },
  { icon: Sparkles, title: "Predictive AI signals", desc: "Confidence-scored BUY/SELL calls." },
  { icon: Bot, title: "Automation with control", desc: "Hedge-fund tactics, your guardrails." },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand/15 via-background to-brand-2/15 p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <Link href="/" className="relative">
          <Logo />
        </Link>
        <div className="relative space-y-8">
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            The bridge between institutional-grade intelligence and the everyday
            trader.
          </h1>
          <ul className="space-y-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <h.icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-muted-foreground">{h.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">
          Decision-support tool · not financial advice · trading involves risk.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
