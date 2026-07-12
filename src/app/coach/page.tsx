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
        <section className="neu-surface rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="neu-inset grid size-12 place-items-center rounded-[20px] text-primary">
              <Bot className="size-5" />
            </span>
            <div>
              <h1 className="font-heading font-extrabold tracking-tight">CrownScore coach</h1>
              <p className="text-xs text-muted-foreground">Educational summary, never diagnosis</p>
            </div>
          </div>
          {!ready ? (
            <div className="mt-8 space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : latest ? (
            <>
              <h2 className="mt-8 font-heading text-3xl font-extrabold tracking-tight">{latest.coach.headline}</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{latest.coach.summary}</p>
              <div className="neu-inset mt-7 rounded-[28px] p-5">
                <p className="text-xs font-bold text-primary">Next step</p>
                <p className="mt-2 text-sm leading-6">{latest.coach.nextStep}</p>
              </div>
              {latest.coach.regimenObservation && <p className="mt-5 text-sm text-muted-foreground">{latest.coach.regimenObservation}</p>}
            </>
          ) : (
            <div className="mt-8 rounded-[28px] p-6 text-center neu-inset-deep">
              <h2 className="font-heading text-2xl font-extrabold tracking-tight">No coach summary yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                The coach appears after your first analyzed check-in. Until then, CrownScore keeps the page empty.
              </p>
              <Link
                href="/check-in/capture"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] neu-focus"
              >
                <Camera className="size-4" />
                Start check-in
              </Link>
            </div>
          )}
          <div className="mt-8 flex gap-3 rounded-[28px] p-5 neu-inset">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#0f766e]" />
            <p className="text-xs leading-5 text-muted-foreground">
              The coach receives structured facts only. It cannot change scores, safety results, database writes, or recommend medication changes.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
