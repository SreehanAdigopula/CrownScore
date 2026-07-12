"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, Camera, CalendarDays, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { getOnboardingPrefs, nextCheckInLabel, toProgressPoint } from "@/lib/crownscore-client";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";
import { Skeleton } from "@/components/ui/skeleton";

const TrendChart = dynamic(() => import("@/components/dashboard/TrendChart").then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <div className="neu-inset-deep mt-8 h-72 animate-pulse rounded-[28px]" />,
});

function EmptyDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-10">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="neu-surface-lg rounded-[32px] p-6 sm:p-10">
          <div className="neu-inset mb-8 grid size-16 place-items-center rounded-[24px] text-primary">
            <Sparkles className="size-7" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">No visible-health score yet</p>
          <h2 className="mt-3 max-w-2xl font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">Take your first CrownScore photo today.</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">A usable photo is reviewed for visible concerns. This is not a diagnosis.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/check-in/capture"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#7a72ff] neu-focus"
            >
              <Camera className="size-4" />
              Start check-in
            </Link>
            <Link href="/settings" className="inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-extrabold text-foreground neu-surface neu-focus">
              Privacy settings
            </Link>
          </div>
        </div>
        <div className="grid gap-6">
          <article className="neu-inset-deep rounded-[32px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Current score</p>
            <p className="metric-number mt-4">--</p>
            <p className="mt-2 text-sm text-muted-foreground">Waiting for your first photo</p>
          </article>
          <article className="neu-inset-deep rounded-[32px] p-6">
            <p className="text-sm font-bold text-muted-foreground">Check-ins</p>
            <p className="metric-number mt-4">0</p>
            <p className="mt-2 text-sm text-muted-foreground">No saved history yet</p>
          </article>
        </div>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-10">
      <Skeleton className="h-40 w-full rounded-[32px]" />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-96 rounded-[32px]" />
        <div className="grid gap-6">
          <Skeleton className="h-44 rounded-[32px]" />
          <Skeleton className="h-44 rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const { records, ready } = useStoredCheckIns();

  if (!ready) return <DashboardSkeleton />;
  if (records.length === 0) return <EmptyDashboard />;

  const latestRecord = records.at(-1)!;
  const latest = latestRecord.analysis;
  const history = records.map(toProgressPoint);
  const prefs = getOnboardingPrefs();
  const insufficient = latest.status === "INSUFFICIENT_IMAGE" || latest.safetyStatus === "WATCH" && latest.safetyRuleIds.includes("INSUFFICIENT_IMAGE");
  const seekGuidance = latest.safetyStatus === "SEEK_PROFESSIONAL_GUIDANCE";
  const safetyElevated = latest.safetyStatus !== "CLEAR";

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-10">
      {safetyElevated && (
        <section className="rounded-[28px] bg-background p-5 text-[#7a4b00] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.45),inset_-6px_-6px_10px_rgba(255,255,255,0.55)]">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-bold">
                {seekGuidance ? "Consider professional guidance" : insufficient ? "Image quality limited this check-in" : "This pattern is worth discussing"}
              </h2>
              <p className="mt-1 text-sm leading-6">
                {seekGuidance
                  ? "Fixed safety rules suggest talking with a qualified professional about these symptoms."
                  : insufficient
                    ? "Retake with even light and a steady frame so CrownScore can score visible concerns."
                    : "CrownScore cannot diagnose the cause, but this check-in triggered fixed safety guidance."}
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="neu-surface-lg rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-muted-foreground">Current visible-health score</p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="metric-number">{latest.healthScore ?? "--"}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Higher means fewer model-detected visible concerns.</p>
            </div>
            <span className="neu-inset rounded-full px-4 py-2 text-xs font-bold text-primary">
              {latest.status === "SCORED" ? `${latest.concerns.length} visible concern${latest.concerns.length === 1 ? "" : "s"}` : "Retake needed"}
            </span>
          </div>
          {history.length > 1 ? (
            <div className="mt-8">
              <TrendChart data={history} />
            </div>
          ) : (
            <div className="neu-inset-deep mt-8 grid min-h-72 place-items-center rounded-[28px] p-6 text-center">
              <div>
                <p className="font-heading text-2xl font-extrabold tracking-tight">First score saved today</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Take another check-in later to unlock the trend chart.</p>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <article className="neu-surface rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <CalendarDays className="size-5 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">Week {latest.treatmentWeek}</span>
            </div>
            <h2 className="mt-8 font-heading text-xl font-extrabold tracking-tight">Next check-in</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextCheckInLabel(prefs.checkInFrequency, latest.capturedAt)}</p>
            <Link
              href="/check-in/capture"
              className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#7a72ff] neu-focus"
            >
              <Camera className="size-4" />
              Start capture
            </Link>
          </article>
          <article className="neu-surface rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground">Routine adherence</p>
              <span className="font-mono text-2xl font-semibold">
                {latest.adherenceRate ?? "--"}
                {latest.adherenceRate == null ? "" : "%"}
              </span>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Saved check-ins</span>
                <span className="font-bold">{records.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Model confidence</span>
                <span className="font-bold">{Math.round(latest.modelConfidence * 100)}%</span>
              </div>
            </div>
          </article>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="neu-surface rounded-[32px] p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            {safetyElevated ? <ShieldAlert className="size-4 text-[#b45309]" /> : <ShieldCheck className="size-4 text-[#0f766e]" />}
            Fixed safety review
          </div>
          <h2 className="mt-5 font-heading text-xl font-extrabold tracking-tight">{safetyElevated ? "Review suggested" : "No safety signals detected"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Safety rules are deterministic and separate from the AI summary.</p>
        </article>
        <article className="neu-surface rounded-[32px] p-6">
          <p className="text-sm font-bold text-primary">Coach summary</p>
          <h2 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">{latestRecord.coach.headline}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{latestRecord.coach.summary}</p>
          <Link href="/coach" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-foreground neu-focus">
            Read full summary <ArrowUpRight className="size-4" />
          </Link>
        </article>
      </section>
    </div>
  );
}
