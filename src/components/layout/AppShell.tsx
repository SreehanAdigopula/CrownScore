"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Camera, Crown, History, House, MessageCircle, Settings } from "lucide-react";
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
    <span className="flex items-center gap-3 font-heading font-extrabold tracking-tight">
      <span className="grid size-11 place-items-center rounded-2xl gradient-primary shadow-[0_16px_34px_rgb(0,82,255,0.22)]">
        <Crown className="size-5" />
      </span>
      {!compact && <span>CrownScore</span>}
    </span>
  );
}

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  return (
    <div className="min-h-[100dvh] bg-background text-foreground lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-card p-6 lg:flex">
        <Link href="/dashboard" className="mb-10 rounded-[32px] p-3 neu-focus">
          <Mark />
        </Link>
        <nav className="space-y-3">
          {nav.filter((item) => !item.primary).map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
          <Link href="/settings" className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-muted-foreground hover:text-foreground neu-focus">
            <Settings className="size-4" />
            Settings
          </Link>
          <p className="px-4 text-xs leading-5 text-muted-foreground">Relative progress tracking. Not a diagnostic product.</p>
        </div>
      </aside>
      <main className="min-w-0 pb-24 lg:pb-10">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between bg-background/85 px-4 backdrop-blur-xl lg:px-10">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">Personal baseline</p>
            <h1 className="truncate font-heading text-xl font-extrabold tracking-tight">{title ?? "CrownScore"}</h1>
          </div>
          <Link href="/check-in/capture" className="hidden rounded-2xl px-4 py-3 text-sm font-extrabold gradient-primary neu-focus sm:inline-flex">
            Add check-in
          </Link>
        </header>
        {children}
      </main>
      <nav className="safe-bottom fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[28px] bg-card p-2 lg:hidden neu-surface">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold text-muted-foreground neu-focus",
              pathname.startsWith(item.href) && !item.primary && "text-primary",
              item.primary && "gradient-primary shadow-[0_12px_30px_rgb(0,82,255,0.22)]"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
