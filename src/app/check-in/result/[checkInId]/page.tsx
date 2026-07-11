"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ShieldAlert, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { RESULT_KEY, getStoredCheckIns, type StoredCheckIn } from "@/lib/crownscore-client";

export default function ResultPage() {
  const [result] = useState<StoredCheckIn | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (raw) return JSON.parse(raw) as StoredCheckIn;
    return getStoredCheckIns().at(-1) ?? null;
  });

  if (!result) {
    return (
      <AppShell title="Check-in result">
        <div className="mx-auto max-w-xl p-5">
          <div className="glass-panel rounded-[32px] p-8 text-center">
            <p className="text-muted-foreground">This result is not saved in this browser session.</p>
            <Button asChild className="mt-5"><Link href="/dashboard">Return to dashboard</Link></Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const { analysis, coach } = result;
  const elevated = analysis.safetyStatus !== "CLEAR";
  return (
    <AppShell title="Check-in result">
      <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-10">
        <section className="neu-surface-lg overflow-hidden rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#0f766e]"><Check className="size-4" />Analysis complete</div>
              <p className="mt-7 text-sm font-bold text-muted-foreground">Relative score</p>
              <p className="mt-2 font-mono text-6xl font-semibold tracking-normal">{analysis.normalizedScore}</p>
              <p className="mt-2 text-sm text-muted-foreground">{analysis.treatmentWeek === 0 ? "This is your baseline." : "Your baseline is 100."}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 rounded-[28px] p-5 neu-inset">
              <div><p className="text-xs text-muted-foreground">From baseline</p><p className="mt-1 text-xl font-bold text-primary">{analysis.baselineChangePercent >= 0 ? "+" : ""}{analysis.baselineChangePercent}%</p></div>
              <div><p className="text-xs text-muted-foreground">Confidence</p><p className="mt-1 text-xl font-bold">{Math.round(analysis.quality.confidence * 100)}%</p></div>
            </div>
          </div>
        </section>
        {elevated && (
          <section className="rounded-[32px] p-6 text-[#7a4b00] neu-inset">
            <div className="flex gap-3">
              <ShieldAlert className="size-5" />
              <div><h2 className="font-bold">Professional guidance suggested</h2><p className="mt-2 text-sm leading-6">{result.safetyReasons.join(" ")}</p></div>
            </div>
          </section>
        )}
        <section className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
          <article className="neu-surface rounded-[32px] p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">{elevated ? <ShieldAlert className="size-4 text-[#b45309]" /> : <ShieldCheck className="size-4 text-[#0f766e]" />}Safety review</div>
            <p className="mt-5 font-heading text-xl font-extrabold tracking-tight">{analysis.safetyStatus === "CLEAR" ? "No fixed safety rules triggered" : "Review suggested"}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">The AI coach cannot modify this result.</p>
          </article>
          <article className="neu-surface rounded-[32px] p-6">
            <p className="text-sm font-bold text-primary">Coach summary</p>
            <h2 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">{coach.headline}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{coach.summary}</p>
            <p className="mt-5 text-sm font-bold">{coach.nextStep}</p>
          </article>
        </section>
        <p className="px-2 text-xs leading-5 text-muted-foreground">{coach.disclaimer}</p>
        <div className="flex flex-wrap gap-3"><Button asChild><Link href="/dashboard">View dashboard<ArrowUpRight /></Link></Button><Button asChild variant="outline"><Link href="/progress">See progress</Link></Button></div>
      </div>
    </AppShell>
  );
}
