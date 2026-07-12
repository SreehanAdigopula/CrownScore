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
      <span className="brand-mark size-10">
        <Crown className="size-4" />
      </span>
      {!compact && <span>CrownScore</span>}
    </span>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const captureImmersive = pathname.startsWith("/check-in/capture") || pathname.startsWith("/check-in/analyzing");

  return (
    <div className={cn("relative min-h-[100dvh] text-foreground", !captureImmersive && "lg:pl-64")}>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background transition focus:translate-y-0"
      >
        Skip to content
      </a>
      {!captureImmersive && <div className="atmosphere-grain fixed inset-0 z-0 opacity-20" aria-hidden />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/90 p-5 backdrop-blur-xl lg:flex",
          captureImmersive && "lg:hidden"
        )}
      >
        <Link href="/dashboard" className="mb-8 rounded-2xl p-2 neu-focus">
          <Mark />
        </Link>
        <nav className="space-y-1">
          {nav
            .filter((item) => !item.primary)
            .map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition duration-200 neu-focus",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <Link
          href="/check-in/capture"
          className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold transition duration-300 hover:-translate-y-0.5 gradient-primary neu-focus"
        >
          <Camera className="size-4" />
          New check-in
        </Link>
        <div className="mt-auto space-y-3 border-t border-border/60 pt-5">
          <Link
            href="/settings"
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold neu-focus",
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
          <div className="px-3">
            <AccountControl />
          </div>
          <p className="px-3 text-[11px] leading-4 text-muted-foreground">
            Visible-concern tracking. Not a diagnostic product.
          </p>
        </div>
      </aside>

      <main id="main-content" className={cn("relative z-10 min-w-0", captureImmersive ? "pb-0" : "pb-24 lg:pb-8")}>
        {!captureImmersive && (
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/40 bg-background/85 px-4 backdrop-blur-xl lg:h-[4.25rem] lg:px-8">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Scalp & hair</p>
              <h1 className="truncate font-heading text-lg tracking-tight lg:text-xl">{title ?? "CrownScore"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <AccountControl compact />
              <Link
                href="/check-in/capture"
                className="hidden rounded-xl px-3.5 py-2.5 text-sm font-extrabold gradient-primary neu-focus sm:inline-flex"
              >
                Add check-in
              </Link>
            </div>
          </header>
        )}
        {children}
      </main>

      {!captureImmersive && (
        <nav className="safe-bottom fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[24px] border border-border/70 bg-card/95 p-1.5 backdrop-blur-xl lg:hidden">
          {nav.map((item) => {
            const active = item.primary
              ? pathname.startsWith("/check-in")
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-bold neu-focus",
                  item.primary
                    ? "gradient-primary shadow-[0_10px_28px_var(--glow-primary)]"
                    : active
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
