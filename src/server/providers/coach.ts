import { z } from "zod";
import type { CoachOutput, CoachStyle, SafetyStatus } from "@/server/domain/types";

export const coachOutputSchema = z.object({
  headline: z.string().min(3).max(90),
  summary: z.string().min(10).max(420),
  nextStep: z.string().min(3).max(180),
  regimenObservation: z.string().max(180).nullable(),
  disclaimer: z.string().min(10).max(240),
});

export type CoachInput = {
  healthScore: number | null;
  concernLabels: string[];
  status: "SCORED" | "INSUFFICIENT_IMAGE";
  safetyStatus: SafetyStatus;
  adherenceRate: number | null;
  coachStyle: CoachStyle;
};

export interface CoachProvider {
  generateSummary(input: CoachInput): Promise<CoachOutput>;
}

const STYLE_VOICE: Record<CoachStyle, string> = {
  SUPPORTIVE: "Use a calm, encouraging tone.",
  DIRECT: "Use short, plain sentences and lead with the practical next step.",
  SCIENTIFIC: "Mention confidence and what the image-based model can and cannot observe.",
  MINIMAL: "Keep wording brief: key result and one next action only.",
};

export class MockCoachProvider implements CoachProvider {
  async generateSummary(input: CoachInput): Promise<CoachOutput> {
    const insufficient = input.status === "INSUFFICIENT_IMAGE";
    const concerns = input.concernLabels.length ? input.concernLabels.join(", ") : "no supported visible concerns";
    const style = input.coachStyle;

    if (insufficient) {
      return {
        headline: style === "MINIMAL" ? "Retake needed" : "A clearer image is needed",
        summary:
          style === "SCIENTIFIC"
            ? "Image-quality gates failed, so CrownScore withheld a visible-health score. Brightness, sharpness, and contrast must meet fixed thresholds before scoring."
            : "This photo did not meet the fixed image-quality requirements, so CrownScore did not produce a health score.",
        nextStep: "Retake the photo in even light, close enough to fill the guide, with the camera level and steady.",
        regimenObservation: input.adherenceRate == null ? null : `Reported routine adherence is ${input.adherenceRate}%.`,
        disclaimer: "Educational only. CrownScore highlights possible visible concerns and does not provide a medical diagnosis.",
        fallbackUsed: true,
      };
    }

    const headline =
      style === "MINIMAL"
        ? input.concernLabels.length
          ? "Visible concerns noted"
          : "No supported concerns"
        : input.concernLabels.length
          ? "Visible areas to review"
          : "No supported visible concerns detected";

    const summary =
      style === "MINIMAL"
        ? `Score ${input.healthScore}. ${input.concernLabels.length ? `Noted: ${concerns}.` : "No supported visible concerns."} Not a diagnosis.`
        : style === "DIRECT"
          ? `Visible-health score: ${input.healthScore}. Model flagged ${concerns}. These are visual signals only.`
          : style === "SCIENTIFIC"
            ? `The visible-health score is ${input.healthScore}. Detected labels: ${concerns}. Scores summarize model outputs from one image and are not clinical measurements.`
            : `The visible-health score is ${input.healthScore}. The model highlighted ${concerns}. This is not confirmation of hair or scalp health. These are visual signals, not diagnoses.`;

    const nextStep =
      style === "DIRECT" || style === "MINIMAL"
        ? "Keep photos consistent and ask a qualified professional about persistent or uncomfortable symptoms."
        : "Track visible changes with consistent photos and ask a qualified professional about persistent or uncomfortable symptoms.";

    return {
      headline,
      summary,
      nextStep,
      regimenObservation: input.adherenceRate == null ? null : `Reported routine adherence is ${input.adherenceRate}%.`,
      disclaimer: "Educational only. CrownScore highlights possible visible concerns and does not provide a medical diagnosis.",
      fallbackUsed: true,
    };
  }
}

export class GroqCoachProvider implements CoachProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model = "llama-3.3-70b-versatile",
  ) {}

  async generateSummary(input: CoachInput): Promise<CoachOutput> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Write a concise non-diagnostic visible hair/scalp summary. Say visible concern, never diagnose or prescribe. ${STYLE_VOICE[input.coachStyle]} Return JSON with headline, summary, nextStep, regimenObservation, disclaimer.`,
            },
            { role: "user", content: JSON.stringify(input) },
          ],
        }),
      });
      if (!response.ok) throw new Error(`Coach provider returned ${response.status}`);
      const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return { ...coachOutputSchema.parse(JSON.parse(body.choices?.[0]?.message?.content ?? "{}")), fallbackUsed: false };
    } finally {
      clearTimeout(timeout);
    }
  }
}
