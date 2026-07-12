"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { scoreCapture } from "@/features/check-ins/score-capture";
import { CAPTURE_KEY, QUESTIONNAIRE_KEY, RESULT_KEY, countConsecutiveDeclines, createThumbnail, getOnboardingPrefs, getStoredCheckIns, getTreatmentWeek, saveStoredCheckIn, toProgressPoint } from "@/lib/crownscore-client";

const stages = ["Checking image quality", "Measuring visible density", "Comparing with your baseline", "Reviewing your progress trend", "Evaluating safety signals", "Preparing your coach summary"];

/* Only used on the photo-free path ("Continue without preview"): simulates a plausible
   trajectory so the rest of the product stays demoable without camera access. */
function getSimulatedDensityRatio(baselineRatio: number, historyCount: number) {
  if (historyCount === 0) return baselineRatio;
  const steadyTrend = Math.min(0.18, historyCount * 0.018);
  const naturalVariation = Math.sin(historyCount * 1.7) * 0.006;
  return Number((baselineRatio * (1 + steadyTrend + naturalVariation)).toFixed(3));
}

/* The analysis API requires ratios in (0, 1); real captures of extreme frames can hit 0 or 1 exactly. */
function clampRatio(value: number) {
  return Math.min(0.98, Math.max(0.02, value));
}

export default function AnalyzingPage() {
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
        const points = records.map(toProgressPoint);
        const latest = records.at(-1)?.analysis;

        const scored = capture ? await scoreCapture(capture) : null;
        if (cancelled) return;
        const fallbackBaseline = scored ? clampRatio(scored.rawDensityRatio) : 0.498;
        const baseline = records[0]?.analysis.rawDensityRatio ?? fallbackBaseline;
        const rawDensityRatio = scored ? clampRatio(scored.rawDensityRatio) : getSimulatedDensityRatio(baseline, records.length);

        const response = await fetch("/api/check-ins/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawDensityRatio,
            baselineRatio: baseline,
            previousScore: latest?.normalizedScore ?? null,
            treatmentWeek: getTreatmentWeek(prefs.startDate ?? records[0]?.analysis.capturedAt),
            treatment: prefs.treatment,
            coachStyle: prefs.coachStyle,
            historyCount: records.length,
            consecutiveDeclines: countConsecutiveDeclines(points),
            ...(scored ? { image: { brightness: scored.brightness, blur: scored.blur, contrast: scored.contrast } } : {}),
            questionnaire,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Analysis failed");
        clearInterval(ticker);
        if (cancelled) return;
        setActive(stages.length - 1);
        await new Promise((resolve) => setTimeout(resolve, 360));
        const preview = capture ? await createThumbnail(capture).catch(() => capture) : null;
        const record = { ...result.data, preview };
        sessionStorage.setItem(RESULT_KEY, JSON.stringify({ ...result.data, preview: capture ?? preview }));
        saveStoredCheckIn(record);
        router.replace(`/check-in/result/${result.data.analysis.id}`);
      } catch (err) {
        clearInterval(ticker);
        setError(err instanceof Error ? err.message : "Analysis could not finish.");
      }
    };
    void run();
    return () => { cancelled = true; clearInterval(ticker); };
  }, [router]);

  return (
    <AppShell title="Analyzing">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl items-center p-5">
        <section className="w-full">
          <div className="neu-inset relative mx-auto mb-10 grid size-28 place-items-center rounded-[36px] text-primary">
            <div className="size-14 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="absolute font-mono text-sm font-semibold">{Math.round(((active + 1) / stages.length) * 100)}%</span>
          </div>
          <h1 className="text-center font-heading text-3xl font-extrabold tracking-tight">Building your comparison</h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">First check-in becomes your baseline. Safety review is deterministic.</p>
          {error ? (
            <div className="mt-8 rounded-[28px] p-4 text-sm text-[#b42318] neu-inset">{error}</div>
          ) : (
            <div className="glass-panel mt-8 rounded-[32px] p-5">
              {stages.map((stage, index) => (
                <div key={stage} className={`flex items-center gap-3 py-3 text-sm font-bold ${index > active ? "text-muted-foreground" : "text-foreground"}`}>
                  <span className={`grid size-7 place-items-center rounded-full ${index < active ? "bg-primary text-primary-foreground" : index === active ? "neu-inset text-primary" : "neu-inset text-muted-foreground"}`}>
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
