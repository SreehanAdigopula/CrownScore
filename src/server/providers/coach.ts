import { z } from "zod";
import type { CoachOutput, CoachStyle, SafetyStatus } from "@/server/domain/types";

export const coachOutputSchema = z.object({ headline: z.string().min(3).max(90), summary: z.string().min(10).max(420), nextStep: z.string().min(3).max(180), regimenObservation: z.string().max(180).nullable(), disclaimer: z.string().min(10).max(240) });
export type CoachInput = { healthScore: number | null; concernLabels: string[]; status: "SCORED" | "INSUFFICIENT_IMAGE"; safetyStatus: SafetyStatus; adherenceRate: number | null; coachStyle: CoachStyle };
export interface CoachProvider { generateSummary(input: CoachInput): Promise<CoachOutput>; }

export class MockCoachProvider implements CoachProvider {
  async generateSummary(input: CoachInput): Promise<CoachOutput> {
    const insufficient = input.status === "INSUFFICIENT_IMAGE";
    const concerns = input.concernLabels.length ? input.concernLabels.join(", ") : "no supported visible concerns";
    return {
      headline: insufficient ? "A clearer image is needed" : input.concernLabels.length ? "Visible areas to review" : "No supported visible concerns detected",
      summary: insufficient ? "This photo did not meet the fixed image-quality requirements, so CrownScore did not produce a health score." : `The visible-health score is ${input.healthScore}. The model highlighted ${concerns}. This is not confirmation of hair or scalp health. These are visual signals, not diagnoses.`,
      nextStep: insufficient ? "Retake the photo in even light, close enough to fill the guide, with the camera level and steady." : "Track visible changes with consistent photos and ask a qualified professional about persistent or uncomfortable symptoms.",
      regimenObservation: input.adherenceRate == null ? null : `Reported routine adherence is ${input.adherenceRate}%.`,
      disclaimer: "Educational only. CrownScore highlights possible visible concerns and does not provide a medical diagnosis.", fallbackUsed: true,
    };
  }
}

export class GroqCoachProvider implements CoachProvider {
  constructor(private readonly apiKey: string, private readonly model = "llama-3.3-70b-versatile") {}
  async generateSummary(input: CoachInput): Promise<CoachOutput> {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` }, signal: controller.signal, body: JSON.stringify({ model: this.model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Write a concise non-diagnostic visible hair/scalp summary. Say visible concern, never diagnose or prescribe. Return JSON with headline, summary, nextStep, regimenObservation, disclaimer." }, { role: "user", content: JSON.stringify(input) }] }) });
      if (!response.ok) throw new Error(`Coach provider returned ${response.status}`);
      const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      return { ...coachOutputSchema.parse(JSON.parse(body.choices?.[0]?.message?.content ?? "{}")), fallbackUsed: false };
    } finally { clearTimeout(timeout); }
  }
}
