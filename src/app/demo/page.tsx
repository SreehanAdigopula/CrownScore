"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { setDemoScenario } from "@/lib/demo-client";
import type { DemoScenario } from "@/server/domain/types";

const scenarios: Array<{ id: DemoScenario; title: string; copy: string }> = [{ id: "healthy", title: "Healthy recovery", copy: "Gradual improvement that runs slightly ahead of the educational curve." },{ id: "shedding", title: "Early shedding, then recovery", copy: "An initial dip followed by a steady return above baseline." },{ id: "adherence", title: "Inconsistent adherence", copy: "A flatter curve paired with uneven routine adherence." },{ id: "safety", title: "Safety warning", copy: "Repeated decline activates deterministic safety guidance." }];
export default function DemoPage() { const router = useRouter(); const [selected,setSelected] = useState<DemoScenario>("healthy"); const load = (value = selected) => { setDemoScenario(value); router.push("/dashboard"); }; return <AppShell title="Demo controls"><div className="mx-auto max-w-4xl p-4 lg:p-8"><div className="glass-panel rounded-3xl p-6 sm:p-8"><h1 className="text-3xl font-semibold tracking-tight">Choose a judge scenario.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Every scenario is deterministic, works without Groq, and is labeled as demo data throughout the backend.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{scenarios.map((scenario) => <button key={scenario.id} onClick={() => setSelected(scenario.id)} className={`rounded-2xl border p-5 text-left transition ${selected === scenario.id ? "border-emerald-400 bg-emerald-400/10" : "border-white/10 hover:bg-white/5"}`}><span className="font-medium">{scenario.title}</span><span className="mt-2 block text-xs leading-5 text-zinc-500">{scenario.copy}</span></button>)}</div><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => load()}>Load scenario</Button><Button variant="outline" onClick={() => load("safety")}><ShieldAlert />Trigger safety case</Button><Button variant="ghost" onClick={() => { localStorage.removeItem("folliq-demo-scenario"); setSelected("healthy"); }}><RotateCcw />Reset</Button></div></div></div></AppShell>; }
