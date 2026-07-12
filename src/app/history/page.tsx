"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Camera, ChevronRight, Image as ImageIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";

export default function HistoryPage() {
  const { records, ready } = useStoredCheckIns();

  return (
    <AppShell title="History">
      <div className="mx-auto max-w-5xl p-4 lg:p-10">
        <div className="mb-8">
          <h2 className="font-heading text-3xl tracking-tight">Check-in history</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Authenticated check-ins stay available across devices.
          </p>
        </div>
        {!ready ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-[24px]" />
            <Skeleton className="h-20 rounded-[24px]" />
            <Skeleton className="h-20 rounded-[24px]" />
          </div>
        ) : records.length === 0 ? (
          <section className="empty-state">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl text-primary neu-inset">
              <ImageIcon className="size-6" />
            </div>
            <h2 className="mt-6 font-heading text-2xl tracking-tight">No saved photos yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Your first usable check-in will save a non-diagnostic visible-health result here.
            </p>
            <Link
              href="/check-in/capture"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-primary-foreground gradient-primary neu-focus"
            >
              <Camera className="size-4" />
              Take first photo
            </Link>
          </section>
        ) : (
          <div className="divide-y divide-border/70 overflow-hidden rounded-[28px] border border-border/70 bg-card/80">
            {[...records].reverse().map((record) => {
              const point = record.analysis;
              return (
                <Link
                  href={`/history/${point.id}`}
                  key={point.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 transition hover:bg-muted/50 neu-focus"
                >
                  <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
                    {record.preview ? (
                      <img src={record.preview} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading tracking-tight">
                      {point.treatmentWeek === 0 ? "First check-in" : `Week ${point.treatmentWeek}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(point.capturedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold">{point.healthScore ?? "--"}</p>
                    <p className="text-xs text-muted-foreground">visible health</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
