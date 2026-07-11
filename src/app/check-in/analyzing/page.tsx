"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { CAPTURE_KEY, QUESTIONNAIRE_KEY, RESULT_KEY, countConsecutiveDeclines, getStoredCheckIns, getTreatmentWeek, saveStoredCheckIn, toProgressPoint } from "@/lib/crownscore-client";

const stages = ["Checking image quality", "Measuring visible density", "Comparing with your baseline", "Reviewing your progress trend", "Evaluating safety signals", "Preparing your coach summary"];

export default function AnalyzingPage() {
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const questionnaire = JSON.parse(sessionStorage.getItem(QUESTIONNAIRE_KEY) ?? "{}");
        const records = getStoredCheckIns();
        const points = records.map(toProgressPoint);
        const baseline = records[0]?.analysis.rawDensityRatio ?? 0.498;
        const latest = records.at(-1)?.analysis;
        const rawDensityRatio = records.length === 0 ? baseline : 0.498;
        const response = await fetch("/api/check-ins/crownscore/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawDensityRatio,
            baselineRatio: baseline,
            previousScore: latest?.normalizedScore ?? null,
            treatmentWeek: getTreatmentWeek(records[0]?.analysis.capturedAt),
            historyCount: records.length,
            consecutiveDeclines: countConsecutiveDeclines(points),
            questionnaire,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Analysis failed");
        for (let index = 1; index < stages.length; index += 1) {
          await new Promise((resolve) => setTimeout(resolve, 320));
          if (cancelled) return;
          setActive(index);
        }
        await new Promise((resolve) => setTimeout(resolve, 360));
        const record = { ...result.data, preview: sessionStorage.getItem(CAPTURE_KEY) };
        sessionStorage.setItem(RESULT_KEY, JSON.stringify(record));
        saveStoredCheckIn(record);
        router.replace(`/check-in/result/${result.data.analysis.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis could not finish.");
      }
    };
    void run();
    return () => { cancelled = true; };
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
