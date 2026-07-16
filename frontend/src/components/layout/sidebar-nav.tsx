"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/config/nav";
import { Badge } from "@/components/ui/badge";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith("/trade")) return pathname.startsWith("/trade");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {navSections.map((section) => (
        <div key={section.label} className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {section.label}
          </p>
          {section.items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge
                    variant={active ? "default" : "neutral"}
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
