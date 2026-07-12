"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Crown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiClientError, fetchApiJson } from "@/lib/api-client";
import { ONBOARDING_KEY } from "@/lib/crownscore-client";

const rhythmOptions = ["Every week", "Every 2 weeks", "Every month", "I will decide"] as const;
const coachOptions = [
  ["Supportive", "Encouraging, calm, and clear."],
  ["Direct", "Concise facts and a practical next step."],
  ["Scientific", "More detail about measurements and confidence."],
  ["Minimal", "Only the key result and next action."],
] as const;

function selectableClass(isSelected: boolean) {
  return isSelected
    ? "border-primary/50 bg-primary/10 text-primary shadow-[0_18px_42px_var(--glow-primary)]"
    : "border-border bg-card text-foreground hover:border-primary/35 hover:bg-muted/70";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [treatment, setTreatment] = useState("MINOXIDIL");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [rhythm, setRhythm] = useState<(typeof rhythmOptions)[number]>("Every week");
  const [coachStyle, setCoachStyle] = useState<(typeof coachOptions)[number][0]>("Supportive");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const steps = ["Your routine", "Check-in rhythm", "Coach style"];

  const goNext = async () => {
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    const preferences = {
      treatment,
      startDate,
      rhythm,
      checkInFrequency: rhythm === "Every week" ? "WEEKLY" : rhythm === "Every 2 weeks" ? "BIWEEKLY" : rhythm === "Every month" ? "MONTHLY" : "MANUAL",
      coachStyle: coachStyle.toUpperCase(),
    };
    setSaving(true);
    setSaveError(null);
    try {
      await fetchApiJson("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...preferences, onboardingCompleted: true }),
      });
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(preferences));
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Preferences could not be saved.";
      setSaveError(message);
      setSaving(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-5 py-8">
      <div className="atmosphere-grain fixed inset-0 opacity-30" aria-hidden />
      <div className="relative z-10 flex items-center justify-between">
        <span className="flex items-center gap-2 font-heading text-lg tracking-tight">
          <span className="brand-mark size-9">
            <Crown className="size-4" />
          </span>
          CrownScore
        </span>
        <span className="text-xs font-bold text-muted-foreground">{step + 1} of 3</span>
      </div>
      <div className="relative z-10 mt-8 flex gap-2">
        {steps.map((label, index) => (
          <div key={label} className="flex-1">
            <div className={`h-2 rounded-full ${index <= step ? "gradient-primary" : "bg-muted"}`} />
            <span className="mt-2 hidden text-xs text-muted-foreground sm:block">{label}</span>
          </div>
        ))}
      </div>
      <section className="glass-panel relative z-10 my-auto rounded-[32px] p-6 sm:p-8">
        <h1 className="font-heading text-3xl tracking-tight">
          {step === 0 ? "What are you tracking?" : step === 1 ? "Build a consistent rhythm." : "How should your coach sound?"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {step === 0
            ? "This personalizes check-in timing. It does not evaluate treatment effectiveness."
            : step === 1
              ? "Regular timing makes visible changes easier to review consistently."
              : "Tone changes wording only. Facts and safety outcomes stay fixed."}
        </p>
        {step === 0 && (
          <div className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label>Treatment or routine</Label>
              <Select value={treatment} onValueChange={setTreatment}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MINOXIDIL">Minoxidil</SelectItem>
                  <SelectItem value="FINASTERIDE">Finasteride</SelectItem>
                  <SelectItem value="GENERAL">General hair-care routine</SelectItem>
                  <SelectItem value="MONITORING">Monitoring only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-12" />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {rhythmOptions.map((item) => {
              const isSelected = rhythm === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setRhythm(item)}
                  className={`rounded-2xl border p-4 text-left text-sm font-bold transition neu-focus ${selectableClass(isSelected)}`}
                >
                  {item}
                  {isSelected && <Check className="float-right size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
        {step === 2 && (
          <div className="mt-7 space-y-3">
            {coachOptions.map(([title, copy]) => {
              const isSelected = coachStyle === title;
              return (
                <button
                  key={title}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setCoachStyle(title)}
                  className={`w-full rounded-2xl border p-4 text-left transition neu-focus ${selectableClass(isSelected)}`}
                >
                  <span className="font-bold">{title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{copy}</span>
                </button>
              );
            })}
          </div>
        )}
        {saveError && <p className="mt-5 text-sm font-bold text-destructive">{saveError}</p>}
        <Button className="mt-8 h-12 w-full" onClick={() => void goNext()} disabled={saving}>
          {step < 2 ? "Continue" : saving ? "Saving securely…" : "Open my dashboard"}
          <ArrowRight />
        </Button>
      </section>
      <p className="relative z-10 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <LockKeyhole className="size-3" />
        Your preferences sync securely to your CrownScore account.
      </p>
    </main>
  );
}
