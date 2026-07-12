"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Check, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { ScoreOrb } from "@/components/brand/ScoreOrb";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useStoredCheckIns } from "@/lib/use-stored-check-ins";

export default function ResultPage() {
  const params = useParams<{ checkInId: string }>();
  const { records, ready } = useStoredCheckIns();
  const result = records.find((item) => item.analysis.id === params.checkInId) ?? null;

  if (!ready || !result) {
    return (
      <AppShell title="Check-in result">
        <div className="mx-auto max-w-xl p-5">
          <div className="glass-panel rounded-[32px] p-8 text-center">
            <p className="text-muted-foreground">{ready ? "This result was not found in your account." : "Loading your result…"}</p>
            <Button asChild className="mt-5">
              <Link href="/dashboard">Return to dashboard</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const { analysis, coach } = result;
  const insufficient = analysis.status === "INSUFFICIENT_IMAGE";
  const elevated = analysis.safetyStatus !== "CLEAR";

  return (
    <AppShell title="Check-in result">
      <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-10">
        <section className="overflow-hidden rounded-[36px] neu-surface-lg p-6 sm:p-10">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="reveal-up max-w-md text-center lg:text-left">
              <div
                className={`inline-flex items-center gap-2 text-sm font-bold ${insufficient ? "text-[#b45309]" : "text-[#0f766e]"}`}
              >
                {insufficient ? <TriangleAlert className="size-4" /> : <Check className="size-4" />}
                {insufficient ? "Retake needed" : "Analysis complete"}
              </div>
              <h2 className="mt-5 font-heading text-3xl tracking-tight sm:text-4xl">
                {insufficient ? "Image quality limited this score" : "Your visible-health CrownScore"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Higher means fewer model-detected visible concerns in this photo. Not a diagnosis.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4 lg:justify-start">
                <div className="rounded-[22px] px-4 py-3 neu-inset">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Confidence</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{Math.round(analysis.modelConfidence * 100)}%</p>
                </div>
                <div className="rounded-[22px] px-4 py-3 neu-inset">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Uncertainty</p>
                  <p className="mt-1 font-mono text-xl font-semibold">{Math.round(analysis.uncertainty * 100)}%</p>
                </div>
              </div>
            </div>
            <div className="reveal-up reveal-delay-2">
              <ScoreOrb
                score={analysis.healthScore}
                label={insufficient ? "Needs retake" : "Visible health"}
                size="lg"
              />
            </div>
          </div>
        </section>

        {analysis.quality.warnings.length > 0 && (
          <section className="rounded-[32px] p-6 text-[#7a4b00] neu-inset">
            <h2 className="font-bold">Image-quality notes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {analysis.quality.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-[32px] neu-surface p-6 sm:p-8">
          <h2 className="font-heading text-2xl tracking-tight">Visible concerns</h2>
          {analysis.concerns.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {analysis.concerns.map((concern) => (
                <div key={concern.className} className="rounded-2xl p-4 neu-inset">
                  <p className="font-bold capitalize">{concern.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confidence {Math.round(concern.confidence * 100)}% · estimated visible area{" "}
                    {Math.round(concern.affectedArea * 100)}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground">No supported visible concerns detected.</p>
              <p className="text-xs text-muted-foreground">
                This is not confirmation of healthy hair or scalp. The model may miss conditions, and image quality
                affects reliability.
              </p>
            </div>
          )}
        </section>

        {elevated && (
          <section className="rounded-[32px] p-6 text-[#7a4b00] neu-inset">
            <div className="flex gap-3">
              <ShieldAlert className="size-5 shrink-0" />
              <div>
                <h2 className="font-bold">Review suggested</h2>
                <p className="mt-2 text-sm leading-6">{result.safetyReasons.join(" ")}</p>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]">
          <article className="rounded-[32px] neu-surface p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              {elevated ? (
                <ShieldAlert className="size-4 text-[#b45309]" />
              ) : (
                <ShieldCheck className="size-4 text-[#0f766e]" />
              )}
              Fixed review
            </div>
            <p className="mt-5 font-heading text-xl tracking-tight">
              {analysis.safetyStatus === "CLEAR" ? "No fixed review rules triggered" : "Review suggested"}
            </p>
          </article>
          <article className="rounded-[32px] neu-surface p-6">
            <p className="text-sm font-bold text-primary">Summary</p>
            <h2 className="mt-4 font-heading text-2xl tracking-tight">{coach.headline}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{coach.summary}</p>
            <p className="mt-5 text-sm font-bold">{coach.nextStep}</p>
          </article>
        </section>

        <p className="px-2 text-xs leading-5 text-muted-foreground">{analysis.disclaimer}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">
              View dashboard
              <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/coach">Read coach</Link>
          </Button>
          {insufficient && (
            <Button asChild variant="outline">
              <Link href="/check-in/capture">Retake photo</Link>
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
