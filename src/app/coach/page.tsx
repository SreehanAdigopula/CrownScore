"use client";

import Link from "next/link";
import { Bot, Camera, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";

export default function CoachPage() {
  const { records, ready } = useStoredCheckIns();
  const latest = records.at(-1);

  return (
    <AppShell title="Coach">
      <div className="mx-auto max-w-3xl p-4 lg:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl text-primary neu-inset">
            <Bot className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-2xl tracking-tight">CrownScore coach</h2>
            <p className="text-xs text-muted-foreground">Educational summary, never diagnosis</p>
          </div>
        </div>

        {!ready ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : latest ? (
          <section className="space-y-6">
            <h3 className="font-heading text-3xl tracking-tight sm:text-4xl">{latest.coach.headline}</h3>
            <p className="text-base leading-7 text-muted-foreground">{latest.coach.summary}</p>
            <div className="rounded-[24px] border border-border/70 bg-muted/40 p-5">
              <p className="section-label">Next step</p>
              <p className="mt-2 text-sm leading-6">{latest.coach.nextStep}</p>
            </div>
            {latest.coach.regimenObservation && (
              <p className="text-sm text-muted-foreground">{latest.coach.regimenObservation}</p>
            )}
          </section>
        ) : (
          <section className="empty-state">
            <h2 className="font-heading text-2xl tracking-tight">No coach summary yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              The coach appears after your first analyzed check-in. Until then, this page stays empty.
            </p>
            <Link
              href="/check-in/capture"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-primary-foreground gradient-primary neu-focus"
            >
              <Camera className="size-4" />
              Start check-in
            </Link>
          </section>
        )}

        <div className="mt-10 flex gap-3 rounded-[24px] border border-border/60 bg-card/60 p-5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
          <p className="text-xs leading-5 text-muted-foreground">
            The coach receives structured facts only. It cannot change scores, safety results, database writes, or recommend medication changes.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
