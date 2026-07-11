"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import type { DemoScenario } from "@/server/domain/types";

const scenarios: Array<{ id: DemoScenario; title: string; copy: string }> = [
  { id: "healthy", title: "Fixture: steady recovery", copy: "Synthetic multi-check-in data for testing charts." },
  { id: "shedding", title: "Fixture: early dip", copy: "Synthetic data for validating recovery copy." },
  { id: "adherence", title: "Fixture: uneven routine", copy: "Synthetic data for adherence-related copy." },
  { id: "safety", title: "Fixture: safety review", copy: "Synthetic decline used to verify fixed safety rules." },
];

export default function DemoPage() {
  const [selected, setSelected] = useState<DemoScenario>("healthy");
  const active = scenarios.find((scenario) => scenario.id === selected)!;
  return (
    <AppShell title="Internal fixtures">
      <div className="mx-auto max-w-4xl p-4 lg:p-10">
        <div className="neu-surface rounded-[32px] p-6 sm:p-8">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Internal test fixtures</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">These synthetic records are for backend/UI testing only. Selecting one here does not change your dashboard, history, score, or saved check-ins.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <button key={scenario.id} onClick={() => setSelected(scenario.id)} className={`rounded-[28px] p-5 text-left transition neu-focus ${selected === scenario.id ? "neu-inset text-primary" : "neu-surface text-foreground"}`}>
                <span className="font-heading font-extrabold tracking-tight">{scenario.title}</span>
                <span className="mt-2 block text-xs leading-5 text-muted-foreground">{scenario.copy}</span>
              </button>
            ))}
          </div>
          <div className="neu-inset mt-6 rounded-[28px] p-5">
            <p className="text-xs font-bold text-muted-foreground">Selected fixture</p>
            <p className="mt-2 font-heading text-xl font-extrabold tracking-tight">{active.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{active.copy}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setSelected("safety")}><ShieldAlert />Select safety fixture</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
