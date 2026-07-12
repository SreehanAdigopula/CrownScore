"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Camera, Images } from "lucide-react";
import { toProgressPoint } from "@/lib/crownscore-client";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";
import { Skeleton } from "@/components/ui/skeleton";

const TrendChart = dynamic(() => import("@/components/dashboard/TrendChart").then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <div className="neu-inset-deep mt-6 h-72 animate-pulse rounded-[28px]" />,
});

export function ProgressClient() {
  const { records, ready } = useStoredCheckIns();

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-10">
        <Skeleton className="h-96 rounded-[32px]" />
      </div>
    );
  }

  const history = records.map(toProgressPoint);
  const first = history[0];
  const latest = history.at(-1);
  const change = first?.healthScore != null && latest?.healthScore != null ? latest.healthScore - first.healthScore : null;
  const firstRecord = records[0];
  const latestRecord = records.at(-1);

  if (!latest) {
    return (
      <div className="mx-auto max-w-5xl p-4 lg:p-10">
        <section className="neu-surface-lg rounded-[32px] p-8 text-center sm:p-12">
          <div className="neu-inset mx-auto grid size-16 place-items-center rounded-[24px] text-primary">
            <Images className="size-7" />
          </div>
          <h2 className="mt-6 font-heading text-3xl font-extrabold tracking-tight">No progress chart yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            CrownScore needs your first saved check-in before it can show movement over time.
          </p>
          <Link
            href="/check-in/capture"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] neu-focus"
          >
            <Camera className="size-4" />
            Start check-in
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-10">
      <section className="grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="neu-surface-lg rounded-[32px] p-6 sm:p-8">
          <h2 className="font-heading text-xl font-extrabold tracking-tight">Visible-health score history</h2>
          <p className="mt-1 text-sm text-muted-foreground">Each score comes only from visible concerns detected in that image.</p>
          {history.length > 1 ? (
            <div className="mt-6">
              <TrendChart data={history} />
            </div>
          ) : (
            <div className="neu-inset-deep mt-6 grid h-72 place-items-center rounded-[28px] p-6 text-center text-sm text-muted-foreground">
              One score saved. A trend appears after the next usable check-in.
            </div>
          )}
        </div>
        <div className="grid gap-6">
          <article className="neu-surface rounded-[32px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Change since first score</p>
            <p className="metric-number mt-4">{change == null ? "--" : `${change > 0 ? "+" : ""}${change}`}</p>
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
          <div className="grid place-items-center border-b border-border/40 p-6 text-center md:border-b-0 md:border-r">
            {firstRecord?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firstRecord.preview} alt="First check-in preview" className="max-h-56 w-full rounded-2xl object-cover" />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">First check-in</span>
            )}
          </div>
          <div className="grid place-items-center p-6 text-center">
            {history.length > 1 && latestRecord?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={latestRecord.preview} alt="Latest check-in preview" className="max-h-56 w-full rounded-2xl object-cover" />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">{history.length > 1 ? "Latest preview unavailable" : "Waiting for second photo"}</span>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Local thumbnails from this browser. Firebase Storage can hold production originals when credentials are configured.</p>
      </section>
    </div>
  );
}
