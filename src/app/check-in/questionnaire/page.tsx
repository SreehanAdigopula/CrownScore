"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { QUESTIONNAIRE_KEY } from "@/lib/crownscore-client";

export default function QuestionnairePage() {
  const router = useRouter();
  const [adherence, setAdherence] = useState([92]);
  const [shedding, setShedding] = useState("TYPICAL");
  const [irritation, setIrritation] = useState(false);
  const [pain, setPain] = useState(false);

  const submit = () => {
    sessionStorage.setItem(QUESTIONNAIRE_KEY, JSON.stringify({ adherenceRate: adherence[0], shedding, irritation, scalpPain: pain, routineChanged: false }));
    router.push("/check-in/analyzing");
  };

  return (
    <AppShell title="Check-in context">
      <div className="mx-auto max-w-2xl p-4 lg:p-10">
        <section className="neu-surface rounded-[32px] p-6 sm:p-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Add a little context</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Optional answers support the safety review. They never override image quality.</p>
          <div className="mt-8 space-y-7">
            <div>
              <div className="flex items-center justify-between"><Label>Routine adherence</Label><span className="text-sm font-bold text-primary">{adherence[0]}%</span></div>
              <Slider value={adherence} onValueChange={setAdherence} max={100} step={1} className="mt-4" />
            </div>
            <div>
              <Label>Shedding compared with usual</Label>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[["LOW", "Less"], ["TYPICAL", "Typical"], ["HIGH", "More"]].map(([value, label]) => (
                  <button key={value} onClick={() => setShedding(value)} className={`min-h-12 rounded-2xl px-3 py-3 text-sm font-bold transition neu-focus ${shedding === value ? "neu-inset text-primary" : "neu-surface text-foreground"}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[[irritation, setIrritation, "Irritation"], [pain, setPain, "Scalp pain"]].map(([value, setter, label]) => (
                <button key={String(label)} onClick={() => (setter as (next: boolean) => void)(!value)} className={`min-h-14 rounded-2xl p-4 text-left text-sm font-bold transition neu-focus ${value ? "neu-inset text-[#b45309]" : "neu-surface text-foreground"}`}>
                  {String(label)}
                  <span className="float-right text-xs text-muted-foreground">{value ? "Yes" : "No"}</span>
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" className="mt-2" placeholder="Any major routine changes?" />
            </div>
          </div>
          <Button className="mt-8 h-12 w-full" onClick={submit}>Analyze check-in</Button>
        </section>
      </div>
    </AppShell>
  );
}
