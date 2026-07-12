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
      <div className="page-frame max-w-5xl space-y-6">
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    );
  }

  const scoredRecords = records.filter((record) => record.analysis.healthScore != null);
  const scoredHistory = scoredRecords.map(toProgressPoint);
  const first = scoredHistory[0];
  const latest = scoredHistory.at(-1);
  const change =
    first?.healthScore != null && latest?.healthScore != null ? latest.healthScore - first.healthScore : null;
  const firstRecord = scoredRecords[0];
  const latestRecord = scoredRecords.at(-1);

  if (!latest) {
    return (
      <div className="page-frame max-w-5xl">
        <section className="empty-state">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl text-primary neu-inset">
            <Images className="size-6" />
          </div>
          <h2 className="mt-6 font-heading text-3xl tracking-tight">No progress chart yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            CrownScore needs your first saved check-in before it can show movement over time.
          </p>
          <Link
            href="/check-in/capture"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-primary-foreground gradient-primary neu-focus"
          >
            <Camera className="size-4" />
            Start check-in
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page-frame max-w-6xl space-y-6">
      <div>
        <h2 className="font-heading text-3xl tracking-tight">Progress</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Movement is calculated only from scored check-ins in your account.
        </p>
      </div>
      <section className="grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="neu-surface-lg rounded-[28px] p-6 sm:p-8">
          <h2 className="font-heading text-xl tracking-tight">Visible-health score history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each score comes only from visible concerns detected in that image.
          </p>
          {scoredHistory.length > 1 ? (
            <div className="mt-6">
              <TrendChart data={scoredHistory} />
            </div>
          ) : (
            <div className="neu-inset-deep mt-6 grid h-72 place-items-center rounded-[28px] p-6 text-center text-sm text-muted-foreground">
              One score saved. A trend appears after the next usable check-in.
            </div>
          )}
        </div>
        <div className="grid gap-6">
          <article className="neu-surface rounded-[28px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Change since first score</p>
            <p className="metric-number mt-4">
              {change == null ? "--" : `${change > 0 ? "+" : ""}${change}`}
            </p>
          </article>
          <article className="neu-surface rounded-[28px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Reliable history</p>
            <p className="metric-number mt-4">{scoredHistory.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">scored check-ins</p>
          </article>
        </div>
      </section>
      <section className="neu-surface rounded-[28px] p-6 sm:p-8">
        <h2 className="font-heading text-xl tracking-tight">Photo comparison</h2>
        <div className="mt-6 grid min-h-64 overflow-hidden rounded-[28px] border border-border/60 md:grid-cols-2">
          <div className="grid place-items-center border-b border-border/40 bg-muted/30 p-6 text-center md:border-b-0 md:border-r">
            {firstRecord?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstRecord.preview}
                alt="First check-in preview"
                className="max-h-56 w-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">First check-in</span>
            )}
          </div>
          <div className="grid place-items-center bg-muted/30 p-6 text-center">
            {scoredHistory.length > 1 && latestRecord?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latestRecord.preview}
                alt="Latest check-in preview"
                className="max-h-56 w-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                {scoredHistory.length > 1 ? "Latest preview unavailable" : "Waiting for second scored photo"}
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Thumbnails are an optional local cache. Raw captures are never uploaded; derived results sync through Neon.
        </p>
      </section>
    </div>
  );
}
