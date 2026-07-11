"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Camera, History, House, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Today", icon: House },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/check-in/capture", label: "Check in", icon: Camera, primary: true },
  { href: "/history", label: "History", icon: History },
  { href: "/coach", label: "Coach", icon: MessageCircle },
];

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  return <div className="min-h-[100dvh] lg:grid lg:grid-cols-[240px_1fr]">
    <aside className="glass-panel fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-y-0 border-l-0 p-5 lg:flex">
      <Link href="/dashboard" className="mb-9 flex items-center gap-3 text-lg font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-zinc-950">F</span>Folliq</Link>
      <nav className="space-y-1">{nav.filter((item) => !item.primary).map((item) => <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white", pathname.startsWith(item.href) && "bg-white/8 text-white")}><item.icon className="size-4" />{item.label}</Link>)}</nav>
      <Link href="/check-in/capture" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 active:scale-[0.98]"><Camera className="size-4" />New check-in</Link>
      <div className="mt-auto"><Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:text-white"><Settings className="size-4" />Settings</Link><p className="mt-4 text-xs leading-5 text-zinc-600">Relative progress tracking. Not a diagnostic product.</p></div>
    </aside>
    <main className="min-w-0 pb-24 lg:pb-8"><header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-zinc-950/60 px-4 backdrop-blur-xl lg:px-8"><div><p className="text-xs text-zinc-500">Personal baseline</p><h1 className="font-medium">{title ?? "Folliq"}</h1></div><Link href="/demo" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5">Demo mode</Link></header>{children}</main>
    <nav className="glass-panel safe-bottom fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl p-1.5 lg:hidden">{nav.map((item) => <Link key={item.href} href={item.href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] text-zinc-500", pathname.startsWith(item.href) && !item.primary && "text-emerald-300", item.primary && "bg-emerald-400 text-zinc-950")}><item.icon className="size-5" />{item.label}</Link>)}</nav>
  </div>;
}
