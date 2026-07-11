import { z } from "zod";
import type { CoachOutput, CoachStyle, SafetyStatus, TrendStatus } from "@/server/domain/types";

export const coachOutputSchema = z.object({
  headline: z.string().min(3).max(90),
  summary: z.string().min(10).max(420),
  nextStep: z.string().min(3).max(180),
  regimenObservation: z.string().max(180).nullable(),
  disclaimer: z.string().min(10).max(240),
});

export type CoachInput = { normalizedScore: number; baselineChangePercent: number; previousChangePercent: number | null; expectedDeviationPercent: number | null; trendStatus: TrendStatus; safetyStatus: SafetyStatus; adherenceRate: number | null; coachStyle: CoachStyle };
export interface CoachProvider { generateSummary(input: CoachInput): Promise<CoachOutput>; }

export class MockCoachProvider implements CoachProvider {
  async generateSummary(input: CoachInput): Promise<CoachOutput> {
    const elevated = input.safetyStatus !== "CLEAR";
    return {
      headline: elevated ? "This pattern is worth a closer look" : input.trendStatus === "AHEAD_OF_EXPECTED" ? "Your trend is running ahead" : "Your routine looks steady",
      summary: elevated ? "Your check-in contains a signal that the deterministic safety review flagged. This is not a diagnosis, but it is a useful reason to pause and review the pattern." : `Your relative score is ${input.normalizedScore}, compared with your personal baseline of 100. Consistent photos will make the trend more useful over time.`,
      nextStep: elevated ? "Consider discussing this pattern with a dermatologist, especially if symptoms continue." : "Keep your routine and camera setup consistent, then check in again on schedule.",
      regimenObservation: input.adherenceRate == null ? null : `Reported routine adherence is ${input.adherenceRate}%.`,
      disclaimer: "Educational only. CrownScore does not diagnose conditions or measure clinical hair density.",
      fallbackUsed: true,
    };
  }
}

export class GroqCoachProvider implements CoachProvider {
  constructor(private readonly apiKey: string, private readonly model = "llama-3.3-70b-versatile") {}
  async generateSummary(input: CoachInput): Promise<CoachOutput> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` }, signal: controller.signal,
        body: JSON.stringify({ model: this.model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Write a concise educational hair-progress summary. Never diagnose, prescribe, guarantee results, or contradict safetyStatus. Return JSON with headline, summary, nextStep, regimenObservation, disclaimer." }, { role: "user", content: JSON.stringify(input) }] }),
      });
      if (!response.ok) throw new Error(`Coach provider returned ${response.status}`);
      const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const parsed = coachOutputSchema.parse(JSON.parse(body.choices?.[0]?.message?.content ?? "{}"));
      return { ...parsed, fallbackUsed: false };
    } finally { clearTimeout(timeout); }
  }
}
