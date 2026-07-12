import { z } from "zod";
import { calculateVisibleHealthScore, HEALTH_MODEL_CLASSES } from "@/server/analysis/visible-health-scoring";
import { evaluateSafety } from "@/server/services/safety-service";
import { GroqCoachProvider, MockCoachProvider } from "@/server/providers/coach";
import type { CheckInAnalysis, CoachStyle, Questionnaire } from "@/server/domain/types";

const boxSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), width: z.number().positive().max(1), height: z.number().positive().max(1) });
const qualitySchema = z.object({
  brightness: z.number().min(0).max(1), sharpness: z.number().min(0).max(1), contrast: z.number().min(0).max(1),
  rotation: z.number().min(0).max(180), subjectCoverage: z.number().min(0).max(1), warnings: z.array(z.string().max(120)).max(8),
  status: z.enum(["GOOD", "REVIEW", "INSUFFICIENT"]),
});

export const analysisInputSchema = z.object({
  detections: z.array(z.object({ className: z.enum(HEALTH_MODEL_CLASSES), confidence: z.number().min(0).max(1), box: boxSchema })).max(300),
  quality: qualitySchema,
  treatmentWeek: z.number().int().min(0).max(260).default(0),
  coachStyle: z.enum(["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"]).default("SUPPORTIVE"),
  questionnaire: z.object({ adherenceRate: z.number().min(0).max(100).nullable().default(null), shedding: z.enum(["LOW", "TYPICAL", "HIGH"]).default("TYPICAL"), irritation: z.boolean().default(false), scalpPain: z.boolean().default(false), routineChanged: z.boolean().default(false), notes: z.string().max(600).optional() }).default({ adherenceRate: null, shedding: "TYPICAL", irritation: false, scalpPain: false, routineChanged: false }),
});

export async function analyzeCheckIn(rawInput: unknown) {
  const input = analysisInputSchema.parse(rawInput);
  const score = calculateVisibleHealthScore(input.detections, input.quality);
  const safety = evaluateSafety({ concerns: score.concerns.map((item) => item.className), qualityStatus: input.quality.status, questionnaire: input.questionnaire as Questionnaire });
  const analysis: CheckInAnalysis = {
    id: crypto.randomUUID(), capturedAt: new Date().toISOString(), treatmentWeek: input.treatmentWeek,
    healthScore: score.score, status: score.status, concerns: score.concerns, detections: input.detections,
    modelConfidence: score.modelConfidence, uncertainty: score.uncertainty, quality: input.quality,
    safetyStatus: safety.status, safetyRuleIds: safety.ruleIds, adherenceRate: input.questionnaire.adherenceRate,
    isDemoData: false, algorithmVersion: "crownscore-visible-health-v1", modelVersion: "hair-health-yolov8n-v1",
    disclaimer: "CrownScore highlights possible visible concerns from one image. It is not a medical diagnosis and does not replace a qualified professional.",
  };
  const fallback = new MockCoachProvider();
  const coachInput = { healthScore: analysis.healthScore, concernLabels: analysis.concerns.map((item) => item.label), status: analysis.status, safetyStatus: analysis.safetyStatus, adherenceRate: analysis.adherenceRate, coachStyle: input.coachStyle as CoachStyle };
  let coach;
  try {
    const provider = process.env.GROQ_API_KEY ? new GroqCoachProvider(process.env.GROQ_API_KEY, process.env.GROQ_MODEL) : fallback;
    coach = await provider.generateSummary(coachInput);
  } catch { coach = await fallback.generateSummary(coachInput); }
  return { analysis, coach, safetyReasons: safety.reasons };
}
