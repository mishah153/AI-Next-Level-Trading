import {
  LayoutDashboard,
  LineChart,
  Radar,
  Sparkles,
  Bot,
  Plug,
  Wallet,
  ReceiptText,
  Settings,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "Trade",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Markets", href: "/markets", icon: LineChart },
      { title: "Trade Terminal", href: "/trade/BTC-USDT", icon: LineChart },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      { title: "AI Signals", href: "/signals", icon: Sparkles, badge: "12" },
      { title: "Whale Feed", href: "/whales", icon: Radar, badge: "Live" },
      { title: "Automation", href: "/automation", icon: Bot },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Portfolio", href: "/portfolio", icon: Wallet },
      { title: "Orders", href: "/orders", icon: ReceiptText },
      { title: "Connections", href: "/connections", icon: Plug },
      { title: "Pricing", href: "/pricing", icon: CreditCard },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const flatNav: NavItem[] = navSections.flatMap((s) => s.items);
