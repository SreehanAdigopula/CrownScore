import type { Questionnaire, SafetyStatus } from "@/server/domain/types";

export const SAFETY_ENGINE_VERSION = "folliq-safety-v1";

export function evaluateSafety(input: { baselineChangePercent: number; consecutiveDeclines: number; confidence: number; questionnaire: Questionnaire }): { status: SafetyStatus; ruleIds: string[]; reasons: string[] } {
  const rules: string[] = [];
  const reasons: string[] = [];
  if (input.questionnaire.scalpPain) { rules.push("SYMPTOM_SCALP_PAIN"); reasons.push("You reported scalp pain."); }
  if (input.questionnaire.irritation) { rules.push("SYMPTOM_IRRITATION"); reasons.push("You reported irritation."); }
  if (input.questionnaire.shedding === "HIGH") { rules.push("SYMPTOM_HIGH_SHEDDING"); reasons.push("You reported unusual shedding."); }
  if (input.baselineChangePercent <= -12) { rules.push("RAPID_RELATIVE_DECLINE"); reasons.push("The relative score is substantially below your baseline."); }
  if (input.consecutiveDeclines >= 3) { rules.push("REPEATED_DECLINE"); reasons.push("Several check-ins show a declining pattern."); }
  if (input.confidence < 0.55) { rules.push("LOW_IMAGE_CONFIDENCE"); reasons.push("Image quality is too low for a reliable comparison."); }
  const urgent = rules.includes("SYMPTOM_SCALP_PAIN") || rules.includes("RAPID_RELATIVE_DECLINE") || rules.length >= 3;
  return { status: urgent ? "SEEK_PROFESSIONAL_GUIDANCE" : rules.length ? "WATCH" : "CLEAR", ruleIds: rules, reasons };
}
