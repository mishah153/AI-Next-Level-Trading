"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/common/logo";
import { SidebarNav } from "./sidebar-nav";
import { currentUser, activity } from "@/lib/mock/data";
import { MOCK_NOW } from "@/lib/mock/data";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/lib/api/auth-context";

export function AppTopbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const account = user ?? currentUser;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      {/* Mobile menu */}
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 border-r bg-card shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left lg:hidden">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <div className="flex h-14 items-center border-b px-4">
              <Logo />
            </div>
            <div className="overflow-y-auto scroll-thin">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Search */}
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search markets, signals, whales…"
          className="pl-9"
          aria-label="Search"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="default" className="text-[10px]">
                {activity.length} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activity.slice(0, 4).map((a) => (
              <DropdownMenuItem
                key={a.id}
                className="flex-col items-start gap-0.5"
              >
                <span className="text-sm font-medium">{a.title}</span>
                <span className="text-xs text-muted-foreground">
                  {a.detail}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {timeAgo(a.timestamp, MOCK_NOW)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-gradient-to-br from-brand to-brand-2 text-white">
                  {account.initials || account.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {account.name}
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{account.name}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {account.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserIcon /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
