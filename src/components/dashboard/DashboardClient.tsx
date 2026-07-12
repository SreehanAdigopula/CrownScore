"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, Camera, CalendarDays, ShieldAlert, ShieldCheck } from "lucide-react";
import { ScoreOrb } from "@/components/brand/ScoreOrb";
import { getOnboardingPrefs, nextCheckInLabel, toProgressPoint } from "@/lib/crownscore-client";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";
import { Skeleton } from "@/components/ui/skeleton";

const TrendChart = dynamic(() => import("@/components/dashboard/TrendChart").then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <div className="neu-inset-deep mt-8 h-72 animate-pulse rounded-[28px]" />,
});

function EmptyDashboard() {
  return (
    <div className="page-frame space-y-8">
      <section className="grid items-center gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="reveal-up">
          <p className="section-label">First check-in</p>
          <h2 className="mt-3 max-w-2xl font-heading text-4xl tracking-tight sm:text-5xl">
            Take your first CrownScore photo today.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            A guided capture runs on-device vision, then saves a non-diagnostic visible-health score. This page stays empty until that lands.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/check-in/capture"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-primary-foreground gradient-primary transition duration-300 hover:-translate-y-0.5 neu-focus"
            >
              <Camera className="size-4" />
              Start check-in
            </Link>
            <Link
              href="/settings"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card px-5 text-sm font-extrabold text-foreground neu-focus"
            >
              Privacy settings
            </Link>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-4 border-t border-border/70 pt-8">
            <div>
              <p className="text-xs font-bold text-muted-foreground">Current score</p>
              <p className="mt-2 font-mono text-3xl font-semibold">--</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">Check-ins</p>
              <p className="mt-2 font-mono text-3xl font-semibold">0</p>
            </div>
          </div>
        </div>
        <div className="reveal-up reveal-delay-1 flex justify-center py-2">
          <ScoreOrb size="lg" label="Waiting for first photo" />
        </div>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-frame space-y-6">
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
  const insufficient =
    latest.status === "INSUFFICIENT_IMAGE" ||
    (latest.safetyStatus === "WATCH" && latest.safetyRuleIds.includes("INSUFFICIENT_IMAGE"));
  const seekGuidance = latest.safetyStatus === "SEEK_PROFESSIONAL_GUIDANCE";
  const safetyElevated = latest.safetyStatus !== "CLEAR";

  return (
    <div className="page-frame space-y-6">
      {safetyElevated && (
        <section className="caution-banner rounded-[24px] p-5">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-bold">
                {seekGuidance
                  ? "Consider professional guidance"
                  : insufficient
                    ? "Image quality limited this check-in"
                    : "This pattern is worth discussing"}
              </h2>
              <p className="mt-1 text-sm leading-6 opacity-90">
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

      <section className="grid items-center gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="reveal-up">
          <p className="section-label">Today</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <span className="metric-number">{latest.healthScore ?? "--"}</span>
            <span className="mb-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              {latest.status === "SCORED"
                ? `${latest.concerns.length} visible concern${latest.concerns.length === 1 ? "" : "s"}`
                : "Retake needed"}
            </span>
          </div>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Higher means fewer model-detected visible concerns in your latest photo.
          </p>
        </div>
        <div className="reveal-up reveal-delay-1 flex justify-center py-2">
          <ScoreOrb
            score={latest.healthScore}
            label={insufficient ? "Needs retake" : "Visible health"}
            size="lg"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="neu-surface-lg rounded-[28px] p-6 sm:p-8">
          <h2 className="font-heading text-xl tracking-tight">Score history</h2>
          <p className="mt-1 text-sm text-muted-foreground">Movement appears after your second scored check-in.</p>
          {history.length > 1 ? (
            <div className="mt-6">
              <TrendChart data={history} />
            </div>
          ) : (
            <div className="mt-6 grid min-h-56 place-items-center rounded-[24px] border border-dashed border-border/70 bg-muted/30 p-6 text-center">
              <div>
                <p className="font-heading text-2xl tracking-tight">First score saved</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Take another check-in later to unlock the trend chart.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <article className="neu-surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <CalendarDays className="size-5 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">Week {latest.treatmentWeek}</span>
            </div>
            <h2 className="mt-6 font-heading text-xl tracking-tight">Next check-in</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {nextCheckInLabel(prefs.checkInFrequency, latest.capturedAt)}
            </p>
            <Link
              href="/check-in/capture"
              className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-primary-foreground gradient-primary transition duration-300 hover:-translate-y-0.5 neu-focus"
            >
              <Camera className="size-4" />
              Start capture
            </Link>
          </article>
          <article className="neu-surface rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground">Routine adherence</p>
              <span className="font-mono text-2xl font-semibold">
                {latest.adherenceRate ?? "--"}
                {latest.adherenceRate == null ? "" : "%"}
              </span>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
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
        <article className="neu-surface rounded-[28px] p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            {safetyElevated ? (
              <ShieldAlert className="size-4 text-caution" />
            ) : (
              <ShieldCheck className="size-4 text-success" />
            )}
            Fixed safety review
          </div>
          <h2 className="mt-5 font-heading text-xl tracking-tight">
            {safetyElevated ? "Review suggested" : "No safety signals detected"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Safety rules are deterministic and separate from the AI summary.
          </p>
        </article>
        <article className="neu-surface rounded-[28px] p-6">
          <p className="section-label">Coach summary</p>
          <h2 className="mt-3 font-heading text-2xl tracking-tight">{latestRecord.coach.headline}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{latestRecord.coach.summary}</p>
          <Link href="/coach" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-foreground neu-focus">
            Read full summary <ArrowUpRight className="size-4" />
          </Link>
        </article>
      </section>
    </div>
  );
}
