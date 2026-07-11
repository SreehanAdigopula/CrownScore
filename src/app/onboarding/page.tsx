"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Crown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const steps = ["Your routine", "Check-in rhythm", "Coach style"];

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-heading font-extrabold tracking-tight"><span className="neu-inset grid size-9 place-items-center rounded-2xl text-primary"><Crown className="size-4" /></span>CrownScore</span>
        <span className="text-xs font-bold text-muted-foreground">{step + 1} of 3</span>
      </div>
      <div className="mt-8 flex gap-2">
        {steps.map((label, index) => <div key={label} className="flex-1"><div className={`h-2 rounded-full ${index <= step ? "bg-primary" : "neu-inset"}`} /><span className="mt-2 hidden text-xs text-muted-foreground sm:block">{label}</span></div>)}
      </div>
      <section className="glass-panel my-auto rounded-[32px] p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">{step === 0 ? "What are you tracking?" : step === 1 ? "Build a consistent rhythm." : "How should your coach sound?"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{step === 0 ? "This personalizes the educational expected curve. It does not evaluate treatment effectiveness." : step === 1 ? "Regular timing makes relative comparisons easier to interpret." : "Tone changes wording only. Facts and safety outcomes stay fixed."}</p>
        {step === 0 && <div className="mt-7 space-y-5"><div className="space-y-2"><Label>Treatment or routine</Label><Select defaultValue="MINOXIDIL"><SelectTrigger className="h-12 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MINOXIDIL">Minoxidil</SelectItem><SelectItem value="FINASTERIDE">Finasteride</SelectItem><SelectItem value="GENERAL">General hair-care routine</SelectItem><SelectItem value="MONITORING">Monitoring only</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="start">Start date</Label><Input id="start" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-12" /></div></div>}
        {step === 1 && <div className="mt-7 grid gap-3 sm:grid-cols-2">{["Every week", "Every 2 weeks", "Every month", "I will decide"].map((item, index) => <button key={item} className={`rounded-2xl p-4 text-left text-sm font-bold transition neu-focus ${index === 0 ? "neu-inset text-primary" : "neu-surface text-foreground"}`}>{item}{index === 0 && <Check className="float-right size-4 text-primary" />}</button>)}</div>}
        {step === 2 && <div className="mt-7 space-y-3">{[["Supportive", "Encouraging, calm, and clear."], ["Direct", "Concise facts and a practical next step."], ["Scientific", "More detail about measurements and confidence."], ["Minimal", "Only the key result and next action."]].map(([title, copy], index) => <button key={title} className={`w-full rounded-2xl p-4 text-left transition neu-focus ${index === 0 ? "neu-inset text-primary" : "neu-surface text-foreground"}`}><span className="font-bold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{copy}</span></button>)}</div>}
        <Button className="mt-8 h-12 w-full" onClick={() => step < 2 ? setStep(step + 1) : router.push("/dashboard")}>{step < 2 ? "Continue" : "Open my dashboard"}<ArrowRight /></Button>
      </section>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><LockKeyhole className="size-3" />Anonymous guest session. You can delete browser data at any time.</p>
    </main>
  );
}
