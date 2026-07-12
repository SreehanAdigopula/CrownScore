"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScoreOrb } from "@/components/brand/ScoreOrb";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";

export default function DetailPage() {
  const params = useParams<{ checkInId: string }>();
  const { records, ready } = useStoredCheckIns();
  const record = records.find((item) => item.analysis.id === params.checkInId) ?? null;

  if (!ready || !record) {
    return (
      <AppShell title="Check-in detail">
        <div className="mx-auto max-w-xl p-5">
          <section className="rounded-[32px] neu-surface p-8 text-center">
            <p className="text-muted-foreground">{ready ? "That check-in was not found in your account." : "Loading your check-in…"}</p>
            <Button asChild className="mt-6">
              <Link href="/history">Back to history</Link>
            </Button>
          </section>
        </div>
      </AppShell>
    );
  }

  const point = record.analysis;
  return (
    <AppShell title="Check-in detail">
      <div className="mx-auto max-w-3xl p-4 lg:p-10">
        <section className="rounded-[32px] neu-surface p-6 sm:p-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-muted-foreground">
                {point.treatmentWeek === 0 ? "First check-in" : `Treatment week ${point.treatmentWeek}`}
              </p>
              <h2 className="mt-3 font-heading text-3xl tracking-tight">Saved visible-health result</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(point.capturedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <ScoreOrb score={point.healthScore} size="md" animate={false} />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5 rounded-[28px] p-5 sm:grid-cols-3 neu-inset-deep">
            <div>
              <p className="text-xs text-muted-foreground">Visible concerns</p>
              <p className="mt-1 font-bold">{point.concerns.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Adherence</p>
              <p className="mt-1 font-bold">
                {point.adherenceRate ?? "--"}
                {point.adherenceRate == null ? "" : "%"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Safety</p>
              <p className="mt-1 font-bold">{point.safetyStatus}</p>
            </div>
          </div>
          {record.coach.headline && (
            <div className="mt-6 rounded-[28px] p-5 neu-inset">
              <p className="section-label">Coach snapshot</p>
              <p className="mt-2 font-heading text-xl tracking-tight">{record.coach.headline}</p>
            </div>
          )}
          <p className="mt-8 text-xs leading-5 text-muted-foreground">
            Derived analysis is stored in your Neon-backed account. Raw photos are not uploaded.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/check-in/result/${point.id}`}>Open full result</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/history">Back to history</Link>
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
