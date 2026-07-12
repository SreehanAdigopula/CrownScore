"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Cpu } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { analyzeHealthCapture } from "@/features/check-ins/hair-health-detector";
import {
  CAPTURE_KEY,
  QUESTIONNAIRE_KEY,
  RESULT_KEY,
  createThumbnail,
  getOnboardingPrefs,
  getStoredCheckIns,
  getTreatmentWeek,
  saveStoredCheckIn,
} from "@/lib/crownscore-client";

const stages = [
  "Checking image quality",
  "Running on-device YOLOv8n",
  "Removing duplicate detections",
  "Calculating visible-health score",
  "Preparing your summary",
];

export default function AnalyzingPage() {
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const ticker = setInterval(() => setActive((current) => Math.min(current + 1, stages.length - 2)), 650);

    const run = async () => {
      try {
        const questionnaire = JSON.parse(sessionStorage.getItem(QUESTIONNAIRE_KEY) ?? "{}");
        const capture = sessionStorage.getItem(CAPTURE_KEY);
        const prefs = getOnboardingPrefs();
        const records = getStoredCheckIns();
        if (!capture) throw new Error("A photo is required for a visible-health score.");

        const [inference, preview] = await Promise.all([
          analyzeHealthCapture(capture),
          createThumbnail(capture).catch(() => capture),
        ]);
        if (cancelled) return;

        const response = await fetch("/api/check-ins/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detections: inference.detections,
            quality: inference.quality,
            treatmentWeek: getTreatmentWeek(prefs.startDate ?? records[0]?.analysis.capturedAt),
            coachStyle: prefs.coachStyle,
            questionnaire,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Analysis failed");
        clearInterval(ticker);
        if (cancelled) return;
        setActive(stages.length - 1);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const record = { ...result.data, preview };
        sessionStorage.setItem(RESULT_KEY, JSON.stringify(record));
        try {
          saveStoredCheckIn(record);
        } catch {
          // The server has already persisted the derived result; local cache is optional.
        }
        router.replace(`/check-in/result/${result.data.analysis.id}`);
      } catch (err) {
        clearInterval(ticker);
        if (!cancelled) setError(err instanceof Error ? err.message : "Analysis could not finish.");
      }
    };

    void run();
    return () => {
      cancelled = true;
      clearInterval(ticker);
    };
  }, [router, attempt]);

  const progress = Math.round(((active + 1) / stages.length) * 100);

  return (
    <AppShell title="Analyzing">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl items-center p-5">
        <section className="w-full">
          <div className="relative mx-auto mb-10 grid size-32 place-items-center">
            <div
              className="absolute inset-0 rounded-full score-ring shadow-[0_20px_50px_var(--glow-primary)]"
              style={{ ["--score-angle" as string]: `${(progress / 100) * 360}deg` }}
            />
            <div className="relative z-10 flex flex-col items-center">
              {!error ? (
                <Cpu className="size-6 text-primary" />
              ) : (
                <span className="font-mono text-lg font-semibold text-destructive">!</span>
              )}
              <span className="mt-2 font-mono text-sm font-semibold">{error ? "Error" : `${progress}%`}</span>
            </div>
          </div>
          <h1 className="text-center font-heading text-3xl tracking-tight">
            {error ? "Analysis could not finish" : "Scoring visible hair and scalp health"}
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {error
              ? "Nothing was saved. Retake the photo or try analyzing again."
              : "On-device detections feed a deterministic score. This is not a diagnosis."}
          </p>
          {error ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-[28px] p-4 text-sm text-destructive neu-inset">{error}</div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="flex-1">
                  <Link href="/check-in/capture">Retake photo</Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setError(null);
                    setActive(0);
                    setAttempt((value) => value + 1);
                  }}
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-panel mt-8 rounded-[32px] p-5">
              {stages.map((stage, index) => (
                <div
                  key={stage}
                  className={`flex items-center gap-3 py-3 text-sm font-bold transition ${
                    index > active ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-full ${
                      index < active ? "bg-primary text-primary-foreground" : "neu-inset text-primary"
                    }`}
                  >
                    {index < active ? <Check className="size-3" /> : <span className="text-[10px]">{index + 1}</span>}
                  </span>
                  {stage}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
