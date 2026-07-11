"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Camera, ShieldCheck, ShieldAlert } from "lucide-react";
import { createDemoDashboard } from "@/server/demo/demo-data";
import { getDemoScenario } from "@/lib/demo-client";
import { TrendChart } from "@/components/dashboard/TrendChart";
import type { DashboardData, DemoScenario } from "@/server/domain/types";

const trendLabels = { AHEAD_OF_EXPECTED: "Ahead of expected", ON_TRACK: "On track", WORTH_WATCHING: "Worth watching", INSUFFICIENT_QUALITY: "Low image quality", INSUFFICIENT_HISTORY: "More history needed" };

export function DashboardClient() {
  const [data, setData] = useState<DashboardData>(() => createDemoDashboard("healthy"));
  useEffect(() => {
    const refresh = (event?: Event) => setData(createDemoDashboard(((event as CustomEvent<DemoScenario>)?.detail ?? getDemoScenario())));
    refresh(); window.addEventListener("folliq:scenario", refresh); return () => window.removeEventListener("folliq:scenario", refresh);
  }, []);
  const { latest } = data;
  const safetyElevated = latest.safetyStatus !== "CLEAR";
  return <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 lg:px-8">
    {safetyElevated && <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4"><div className="flex gap-3"><ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-300" /><div><h2 className="font-medium text-amber-100">This pattern is worth discussing</h2><p className="mt-1 text-sm leading-6 text-amber-100/65">Several relative scores are declining. Folliq cannot determine the cause. Consider sharing this timeline with a dermatologist.</p></div></div></section>}
    <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><div className="glass-panel rounded-3xl p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm text-zinc-500">Current relative score</p><div className="mt-2 flex items-baseline gap-3"><span className="metric-number">{latest.normalizedScore}</span><span className={latest.baselineChangePercent >= 0 ? "text-emerald-300" : "text-amber-300"}>{latest.baselineChangePercent >= 0 ? "+" : ""}{latest.baselineChangePercent}%</span></div><p className="mt-2 text-xs text-zinc-500">Baseline = 100</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">{trendLabels[latest.trendStatus]}</span></div><div className="mt-6"><TrendChart data={data.history} /></div><div className="mt-2 flex flex-wrap gap-5 text-xs text-zinc-500"><span><span className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />Relative score</span><span><span className="mr-2 inline-block w-4 border-t border-dashed border-zinc-500 align-middle" />Educational expected curve</span></div></div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1"><article className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><CalendarDays className="size-5 text-emerald-300" /><span className="text-xs text-zinc-500">Week {latest.treatmentWeek}</span></div><h2 className="mt-8 text-lg font-medium">Next check-in</h2><p className="mt-1 text-sm text-zinc-500">One week keeps this series consistent.</p><Link href="/check-in/capture" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"><Camera className="size-4" />Start guided capture</Link></article><article className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><p className="text-sm text-zinc-500">Routine adherence</p><span className="text-2xl font-semibold">{latest.adherenceRate}%</span></div><div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-sm"><span className="text-zinc-500">Check-in streak</span><span>{data.streak} weeks</span></div><div className="mt-3 flex items-center justify-between text-sm"><span className="text-zinc-500">Image confidence</span><span>{Math.round(latest.quality.confidence * 100)}%</span></div></article></div>
    </section>
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><article className="glass-panel rounded-3xl p-5 sm:p-6"><div className="flex items-center gap-2 text-sm text-zinc-400">{safetyElevated ? <ShieldAlert className="size-4 text-amber-300" /> : <ShieldCheck className="size-4 text-emerald-300" />}Deterministic safety review</div><h2 className="mt-5 text-xl font-medium">{safetyElevated ? "Professional guidance suggested" : "No safety signals detected"}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Safety checks use fixed rules and cannot be changed by the AI coach.</p></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-sm text-emerald-300">Coach summary</p><h2 className="mt-4 text-2xl font-medium tracking-tight">{data.coach.headline}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{data.coach.summary}</p><Link href="/coach" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-white">Read full summary <ArrowUpRight className="size-4" /></Link></article></section>
  </div>;
}
