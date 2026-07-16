import Link from "next/link";
import {
  ArrowRight,
  Fish,
  Sparkles,
  Bot,
  Plug,
  ShieldCheck,
  Radar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SignalCard } from "@/components/widgets/signal-card";
import { WhaleItem } from "@/components/widgets/whale-item";
import { tiers } from "@/lib/mock/data";
import { getSignals, getWhales } from "@/lib/data/repositories";

const FEATURES = [
  {
    icon: Radar,
    title: "Whale-Eye Tracking",
    desc: "A real-time radar for $2M+ transactions across crypto, stocks and forex — see the institutional flow that moves markets before the candle closes.",
  },
  {
    icon: Sparkles,
    title: "Predictive AI Signals",
    desc: "Transformer + LSTM models fuse candlestick patterns, technical indicators and on-chain whale flow into confidence-scored BUY / SELL calls.",
  },
  {
    icon: Bot,
    title: "Automation with Control",
    desc: "Let the AI act on its own signals inside your guardrails — set risk tolerance and spending limits, from conservative hedging to aggressive leverage.",
  },
  {
    icon: Plug,
    title: "Multi-Market Bridges",
    desc: "Connect Binance, Coinbase, Alpaca and OANDA via AES-256 encrypted keys. We execute the trades you authorize — never custody your funds.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Discovery",
    desc: "The bot detects a $500M BTC transfer to an exchange and pushes an alert: high volatility likely — suggested action, hedge.",
  },
  {
    n: "02",
    title: "Strategy",
    desc: "It checks your risk profile. Aggressive? Open a leveraged short. Conservative? Rotate spot holdings into stablecoins — all within your spending limit.",
  },
  {
    n: "03",
    title: "Execution",
    desc: "Orders route to your connected exchange via secure API keys. You keep custody; the AI keeps the edge.",
  },
];

const CONFIDENCE = [
  { scenario: "Price hits a dip", analysis: "Whale accumulation $50M · RSI oversold", action: "BUY", conf: "92%", tone: "profit" },
  { scenario: "Price hits a peak", analysis: "$100M to exchange · shooting-star candle", action: "SELL", conf: "88%", tone: "loss" },
  { scenario: "Sideways movement", analysis: "No whale activity · low volume", action: "NEUTRAL", conf: "—", tone: "neutral" },
] as const;

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [signals, whales] = await Promise.all([getSignals(), getWhales()]);
  const heroSignal = signals[0];
  const heroWhale = whales[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(60% 50% at 70% 0%, color-mix(in oklab, var(--color-brand) 22%, transparent), transparent), radial-gradient(50% 50% at 10% 20%, color-mix(in oklab, var(--color-brand-2) 18%, transparent), transparent)",
            }}
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="space-y-6">
              <Badge variant="default" className="gap-1.5">
                <Sparkles className="size-3" /> Institutional intelligence for
                everyday traders
              </Badge>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                Your AI doesn&apos;t just watch the market.{" "}
                <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                  It anticipates it.
                </span>
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                Synthesize real-time whale movements, global sentiment and
                multi-market technicals. Get the automation of a hedge fund with
                the simplicity of a smartphone app.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start free <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">Explore the demo</Link>
                </Button>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-profit" />
                Non-custodial · AES-256 encrypted · decision-support only
              </p>
            </div>

            {/* Product preview */}
            <div className="relative space-y-4">
              <div className="mx-auto max-w-sm">
                <SignalCard signal={heroSignal} />
              </div>
              <Card className="mx-auto max-w-sm p-2 pl-3">
                <div className="mb-1 flex items-center gap-2 px-1 pt-1 text-xs font-medium text-muted-foreground">
                  <Fish className="size-3.5 text-primary" /> Whale-Eye feed
                </div>
                <div className="px-1">
                  <WhaleItem tx={heroWhale} compact />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                One platform. Every edge.
              </h2>
              <p className="mt-3 text-muted-foreground">
                From whale radar to autonomous execution — the full institutional
                stack, made simple.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <Card key={f.title} className="p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              From alert to automation
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three steps from a whale&apos;s wallet to a position in yours.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n} className="relative p-6">
                <span className="text-3xl font-bold text-primary/30">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            ))}
          </div>

          {/* Confidence showcase */}
          <Card className="mt-12 overflow-hidden">
            <div className="border-b p-5">
              <h3 className="font-semibold">The Confidence Score</h3>
              <p className="text-sm text-muted-foreground">
                Every call is graded so you know exactly how much conviction is
                behind it.
              </p>
            </div>
            <div className="divide-y">
              {CONFIDENCE.map((c) => (
                <div
                  key={c.scenario}
                  className="grid grid-cols-1 items-center gap-2 p-4 sm:grid-cols-3"
                >
                  <span className="text-sm font-medium">{c.scenario}</span>
                  <span className="text-sm text-muted-foreground">
                    {c.analysis}
                  </span>
                  <span className="flex items-center gap-2 sm:justify-end">
                    <Badge variant={c.tone}>{c.action}</Badge>
                    <span className="tabular text-sm font-semibold">
                      {c.conf}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Plans that scale with you
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free. Upgrade when you&apos;re ready to automate.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {tiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={
                    "flex flex-col p-6" +
                    (tier.highlighted
                      ? " border-primary/50 shadow-lg shadow-primary/10"
                      : "")
                  }
                >
                  {tier.highlighted && (
                    <Badge className="mb-3 w-fit">Most popular</Badge>
                  )}
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${tier.priceMonthly}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-profit" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-6 w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    <Link href="/register">
                      {tier.priceMonthly === 0
                        ? "Start free"
                        : `Choose ${tier.name}`}
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Card className="relative overflow-hidden border-primary/30 p-10 text-center">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(50% 80% at 50% 0%, color-mix(in oklab, var(--color-brand) 20%, transparent), transparent)",
              }}
            />
            <div className="relative mx-auto max-w-xl space-y-5">
              <h2 className="text-3xl font-semibold tracking-tight">
                Trade at the next level.
              </h2>
              <p className="text-muted-foreground">
                Join traders using AI to see the market&apos;s biggest moves
                before they happen.
              </p>
              <Button asChild size="lg">
                <Link href="/register">
                  Create your free account <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
