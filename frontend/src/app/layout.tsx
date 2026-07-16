import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_NAME = "AINextLevelTrading";
const APP_DESC =
  "Institutional-grade AI trading intelligence for everyday traders — real-time whale tracking, predictive signals, and automation with control across crypto, stocks & forex.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ainextleveltrading.com"),
  title: {
    default: `${APP_NAME} — AI Whale Tracking & Predictive Signals`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESC,
  applicationName: APP_NAME,
  keywords: [
    "AI trading",
    "whale tracking",
    "crypto signals",
    "predictive alerts",
    "automated trading",
    "forex",
    "stocks",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} — AI Whale Tracking & Predictive Signals`,
    description: APP_DESC,
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESC,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0e14" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-dvh antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
