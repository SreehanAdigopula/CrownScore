"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { analyzeHealthCapture } from "@/features/check-ins/hair-health-detector";
import { CAPTURE_KEY, QUESTIONNAIRE_KEY, RESULT_KEY, createThumbnail, getOnboardingPrefs, getStoredCheckIns, getTreatmentWeek, saveStoredCheckIn } from "@/lib/crownscore-client";

const stages = ["Checking image quality", "Finding visible concerns", "Removing duplicate detections", "Calculating visible-health score", "Preparing your summary"];

export default function AnalyzingPage() {
  const [active, setActive] = useState(0), [error, setError] = useState<string | null>(null); const router = useRouter(); const startedRef = useRef(false);
  useEffect(() => { if (startedRef.current) return; startedRef.current = true; let cancelled = false; const ticker = setInterval(() => setActive((current) => Math.min(current + 1, stages.length - 2)), 650);
    const run = async () => { try {
      const questionnaire = JSON.parse(sessionStorage.getItem(QUESTIONNAIRE_KEY) ?? "{}"), capture = sessionStorage.getItem(CAPTURE_KEY), prefs = getOnboardingPrefs(), records = getStoredCheckIns();
      if (!capture) throw new Error("A photo is required for a visible-health score.");
      const inference = await analyzeHealthCapture(capture); if (cancelled) return;
      const response = await fetch("/api/check-ins/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ detections: inference.detections, quality: inference.quality, treatmentWeek: getTreatmentWeek(prefs.startDate ?? records[0]?.analysis.capturedAt), coachStyle: prefs.coachStyle, questionnaire }) });
      const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Analysis failed");
      clearInterval(ticker); if (cancelled) return; setActive(stages.length - 1); await new Promise((resolve) => setTimeout(resolve, 300));
      const preview = await createThumbnail(capture).catch(() => capture), record = { ...result.data, preview }; sessionStorage.setItem(RESULT_KEY, JSON.stringify({ ...result.data, preview: capture })); saveStoredCheckIn(record); router.replace(`/check-in/result/${result.data.analysis.id}`);
    } catch (err) { clearInterval(ticker); setError(err instanceof Error ? err.message : "Analysis could not finish."); } };
    void run(); return () => { cancelled = true; clearInterval(ticker); };
  }, [router]);
  return <AppShell title="Analyzing"><div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-xl items-center p-5"><section className="w-full"><div className="neu-inset relative mx-auto mb-10 grid size-28 place-items-center rounded-[36px] text-primary"><div className="size-14 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="absolute font-mono text-sm font-semibold">{Math.round(((active + 1) / stages.length) * 100)}%</span></div><h1 className="text-center font-heading text-3xl font-extrabold tracking-tight">Reviewing visible hair and scalp health</h1><p className="mt-3 text-center text-sm text-muted-foreground">This is a non-diagnostic visual check from one image.</p>{error ? <div className="mt-8 rounded-[28px] p-4 text-sm text-[#b42318] neu-inset">{error}</div> : <div className="glass-panel mt-8 rounded-[32px] p-5">{stages.map((stage, index) => <div key={stage} className={`flex items-center gap-3 py-3 text-sm font-bold ${index > active ? "text-muted-foreground" : "text-foreground"}`}><span className={`grid size-7 place-items-center rounded-full ${index < active ? "bg-primary text-primary-foreground" : "neu-inset text-primary"}`}>{index < active ? <Check className="size-3" /> : <span className="text-[10px]">{index + 1}</span>}</span>{stage}</div>)}</div>}</section></div></AppShell>;
}
