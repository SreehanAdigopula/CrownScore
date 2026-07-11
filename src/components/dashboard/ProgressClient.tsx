"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Images } from "lucide-react";
import { getStoredCheckIns, toProgressPoint, type StoredCheckIn } from "@/lib/crownscore-client";
import { TrendChart } from "@/components/dashboard/TrendChart";

export function ProgressClient() {
  const [records, setRecords] = useState<StoredCheckIn[]>([]);

  useEffect(() => {
    const refresh = () => setRecords(getStoredCheckIns());
    refresh();
    window.addEventListener("crownscore:check-ins", refresh);
    return () => window.removeEventListener("crownscore:check-ins", refresh);
  }, []);

  const history = records.map(toProgressPoint);
  const first = history[0];
  const latest = history.at(-1);
  const change = first && latest ? Number((latest.normalizedScore - first.normalizedScore).toFixed(1)) : 0;

  if (!latest) {
    return (
      <div className="mx-auto max-w-5xl p-4 lg:p-10">
        <section className="neu-surface-lg rounded-[32px] p-8 text-center sm:p-12">
          <div className="neu-inset mx-auto grid size-16 place-items-center rounded-[24px] text-primary"><Images className="size-7" /></div>
          <h2 className="mt-6 font-heading text-3xl font-extrabold tracking-tight">No progress chart yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">CrownScore needs your first saved check-in before it can show movement over time.</p>
          <Link href="/check-in/capture" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] neu-focus">
            <Camera className="size-4" />
            Start baseline
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-10">
      <section className="grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="neu-surface-lg rounded-[32px] p-6 sm:p-8">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Actual versus expected</h2>
          <p className="mt-1 text-sm text-muted-foreground">Scores are relative to your first usable check-in.</p>
          {history.length > 1 ? <div className="mt-6"><TrendChart data={history} /></div> : <div className="neu-inset-deep mt-6 grid h-72 place-items-center rounded-[28px] p-6 text-center text-sm text-muted-foreground">One baseline saved. A trend appears after the next check-in.</div>}
        </div>
        <div className="grid gap-6">
          <article className="neu-surface rounded-[32px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Change since baseline</p>
            <p className="metric-number mt-4">{change > 0 ? "+" : ""}{change}%</p>
          </article>
          <article className="neu-surface rounded-[32px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Reliable history</p>
            <p className="metric-number mt-4">{history.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">quality-approved check-ins</p>
          </article>
        </div>
      </section>
      <section className="neu-surface rounded-[32px] p-6 sm:p-8">
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Photo comparison</h2>
        <div className="mt-6 grid min-h-64 overflow-hidden rounded-[28px] md:grid-cols-2 neu-inset-deep">
          <div className="grid place-items-center p-6 text-center">
            <span className="text-sm font-bold text-muted-foreground">Baseline</span>
          </div>
          <div className="grid place-items-center p-6 text-center">
            <span className="text-sm font-bold text-muted-foreground">{history.length > 1 ? "Latest" : "Waiting for second photo"}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Real photo thumbnails can be added once Firebase Storage is configured with your project credentials.</p>
      </section>
    </div>
  );
}
