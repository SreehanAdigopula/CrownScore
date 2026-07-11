import { z } from "zod";
import { calculateConfidence, classifyTrend, interpolateExpectedCurve, normalizeToBaseline, percentChange } from "@/server/analysis/scoring";
import { EXPECTED_CURVES } from "@/server/analysis/curves";
import { evaluateSafety } from "@/server/services/safety-service";
import { GroqCoachProvider, MockCoachProvider } from "@/server/providers/coach";
import type { CheckInAnalysis, CoachStyle, Questionnaire, TreatmentType } from "@/server/domain/types";

export const analysisInputSchema = z.object({
  rawDensityRatio: z.number().positive().max(1).default(0.45),
  baselineRatio: z.number().positive().max(1).default(0.428),
  previousScore: z.number().positive().default(112.4),
  treatmentWeek: z.number().int().min(0).max(260).default(21),
  treatment: z.enum(["MINOXIDIL", "FINASTERIDE", "GENERAL", "MONITORING"]).default("MINOXIDIL"),
  coachStyle: z.enum(["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"]).default("SUPPORTIVE"),
  historyCount: z.number().int().min(0).default(6),
  consecutiveDeclines: z.number().int().min(0).default(0),
  image: z.object({ brightness: z.number().min(0).max(1).default(0.6), blur: z.number().min(0).max(1).default(0.82), contrast: z.number().min(0).max(1).default(0.4) }).default({ brightness: 0.6, blur: 0.82, contrast: 0.4 }),
  questionnaire: z.object({ adherenceRate: z.number().min(0).max(100).nullable().default(92), shedding: z.enum(["LOW", "TYPICAL", "HIGH"]).default("TYPICAL"), irritation: z.boolean().default(false), scalpPain: z.boolean().default(false), routineChanged: z.boolean().default(false), notes: z.string().max(600).optional() }).default({ adherenceRate: 92, shedding: "TYPICAL", irritation: false, scalpPain: false, routineChanged: false }),
});

export async function analyzeCheckIn(rawInput: unknown) {
  const input = analysisInputSchema.parse(rawInput);
  const normalizedScore = normalizeToBaseline(input.rawDensityRatio, input.baselineRatio);
  const expectedScore = interpolateExpectedCurve(input.treatmentWeek, EXPECTED_CURVES[input.treatment as TreatmentType]);
  const baselineChangePercent = Number((normalizedScore - 100).toFixed(1));
  const previousChangePercent = percentChange(normalizedScore, input.previousScore);
  const expectedDeviationPercent = Number((normalizedScore - expectedScore).toFixed(1));
  const confidence = calculateConfidence(input.image);
  const safety = evaluateSafety({ baselineChangePercent, consecutiveDeclines: input.consecutiveDeclines, confidence, questionnaire: input.questionnaire as Questionnaire });
  const analysis: CheckInAnalysis = { id: crypto.randomUUID(), capturedAt: new Date().toISOString(), treatmentWeek: input.treatmentWeek, rawDensityRatio: input.rawDensityRatio, normalizedScore, baselineChangePercent, previousChangePercent, expectedScore, expectedDeviationPercent, trendStatus: classifyTrend({ historyCount: input.historyCount, confidence, expectedDeviationPercent }), safetyStatus: safety.status, safetyRuleIds: safety.ruleIds, quality: { ...input.image, confidence, status: confidence < 0.45 ? "REJECTED" : confidence < 0.65 ? "REVIEW" : "GOOD" }, adherenceRate: input.questionnaire.adherenceRate, isDemoData: false, algorithmVersion: "folliq-relative-v1" };
  const fallback = new MockCoachProvider();
  let coach;
  try {
    const provider = process.env.GROQ_API_KEY ? new GroqCoachProvider(process.env.GROQ_API_KEY, process.env.GROQ_MODEL) : fallback;
    coach = await provider.generateSummary({ normalizedScore, baselineChangePercent, previousChangePercent, expectedDeviationPercent, trendStatus: analysis.trendStatus, safetyStatus: analysis.safetyStatus, adherenceRate: analysis.adherenceRate, coachStyle: input.coachStyle as CoachStyle });
  } catch { coach = await fallback.generateSummary({ normalizedScore, baselineChangePercent, previousChangePercent, expectedDeviationPercent, trendStatus: analysis.trendStatus, safetyStatus: analysis.safetyStatus, adherenceRate: analysis.adherenceRate, coachStyle: input.coachStyle as CoachStyle }); }
  return { analysis, coach, safetyReasons: safety.reasons };
}
