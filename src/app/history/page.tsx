"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, ChevronRight, Image as ImageIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getStoredCheckIns, type StoredCheckIn } from "@/lib/crownscore-client";

export default function HistoryPage() {
  const [records, setRecords] = useState<StoredCheckIn[]>([]);

  useEffect(() => {
    const refresh = () => setRecords(getStoredCheckIns());
    refresh();
    window.addEventListener("crownscore:check-ins", refresh);
    return () => window.removeEventListener("crownscore:check-ins", refresh);
  }, []);

  return (
    <AppShell title="History">
      <div className="mx-auto max-w-5xl p-4 lg:p-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Check-in history</h1>
          <p className="mt-2 text-sm text-muted-foreground">Only check-ins you actually capture in this browser appear here.</p>
        </div>
        {records.length === 0 ? (
          <section className="neu-surface-lg rounded-[32px] p-8 text-center sm:p-12">
            <div className="neu-inset mx-auto grid size-16 place-items-center rounded-[24px] text-primary"><ImageIcon className="size-7" /></div>
            <h2 className="mt-6 font-heading text-2xl font-extrabold tracking-tight">No saved photos yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Your first check-in will be saved with today&apos;s date and used as your baseline.</p>
            <Link href="/check-in/capture" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] neu-focus">
              <Camera className="size-4" />
              Take first photo
            </Link>
          </section>
        ) : (
          <div className="overflow-hidden rounded-[32px] neu-surface">
            {[...records].reverse().map((record) => {
              const point = record.analysis;
              return (
                <Link href={`/history/${point.id}`} key={point.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-5 transition hover:bg-[#d8dee7] neu-focus">
                  <div className="neu-inset grid size-14 shrink-0 place-items-center rounded-[22px] text-muted-foreground"><ImageIcon className="size-5" /></div>
                  <div className="min-w-0">
                    <p className="font-heading font-extrabold tracking-tight">{point.treatmentWeek === 0 ? "Baseline" : `Week ${point.treatmentWeek}`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(point.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold">{point.normalizedScore}</p>
                    <p className="text-xs text-muted-foreground">relative</p>
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
