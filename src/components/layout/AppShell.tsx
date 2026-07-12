"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Camera, Crown, History, House, MessageCircle, Settings } from "lucide-react";
import { AccountControl } from "@/components/auth/AccountControl";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Today", icon: House },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/check-in/capture", label: "Check in", icon: Camera, primary: true },
  { href: "/history", label: "History", icon: History },
  { href: "/coach", label: "Coach", icon: MessageCircle },
];

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3 font-heading text-lg tracking-tight">
      <span className="brand-mark size-11">
        <Crown className="size-5" />
      </span>
      {!compact && <span>CrownScore</span>}
    </span>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const captureImmersive = pathname.startsWith("/check-in/capture") || pathname.startsWith("/check-in/analyzing");
  return (
    <div className={cn("relative min-h-[100dvh] text-foreground", !captureImmersive && "lg:pl-72")}>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background transition focus:translate-y-0"
      >
        Skip to content
      </a>
      {!captureImmersive && <div className="atmosphere-grain fixed inset-0 z-0 opacity-25" aria-hidden />}
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border/70 bg-card/85 p-6 backdrop-blur-xl lg:flex", captureImmersive && "lg:hidden")}>
        <Link href="/dashboard" className="mb-10 rounded-[32px] p-3 neu-focus">
          <Mark />
        </Link>
        <nav className="space-y-2">
          {nav
            .filter((item) => !item.primary)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-muted-foreground transition duration-300 neu-focus",
                  pathname.startsWith(item.href) && "bg-muted text-primary",
                  !pathname.startsWith(item.href) && "hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
        </nav>
        <Link
          href="/check-in/capture"
          className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition duration-300 hover:-translate-y-0.5 gradient-primary neu-focus"
        >
          <Camera className="size-4" />
          New check-in
        </Link>
        <div className="mt-auto space-y-4">
          <Link
            href="/settings"
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-muted-foreground hover:text-foreground neu-focus",
              pathname.startsWith("/settings") && "bg-muted text-primary"
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
          <div className="px-4">
            <AccountControl />
          </div>
          <p className="px-4 text-xs leading-5 text-muted-foreground">
            Visible-concern tracking. Not a diagnostic product.
          </p>
        </div>
      </aside>
      <main id="main-content" className={cn("relative z-10 min-w-0", captureImmersive ? "pb-0" : "pb-24 lg:pb-10")}>
        {!captureImmersive && (
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-10">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Scalp & hair health</p>
              <h1 className="truncate font-heading text-xl tracking-tight">{title ?? "CrownScore"}</h1>
            </div>
            <div className="flex items-center gap-3">
              <AccountControl compact />
              <Link
                href="/check-in/capture"
                className="hidden rounded-2xl px-4 py-3 text-sm font-extrabold gradient-primary neu-focus sm:inline-flex"
              >
                Add check-in
              </Link>
            </div>
          </header>
        )}
        {children}
      </main>
      {!captureImmersive && (
      <nav className="safe-bottom fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[28px] border border-border/60 bg-card/95 p-2 backdrop-blur-xl lg:hidden neu-surface">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              item.primary
                ? pathname.startsWith("/check-in") ? "page" : undefined
                : pathname.startsWith(item.href) ? "page" : undefined
            }
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold text-muted-foreground neu-focus",
              !item.primary && pathname.startsWith(item.href) && "text-primary",
              item.primary && pathname.startsWith("/check-in") && "ring-2 ring-primary/35",
              item.primary && "gradient-primary shadow-[0_12px_30px_var(--glow-primary)]"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      )}
    </div>
  );
}
