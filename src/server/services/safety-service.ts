import type { Questionnaire, SafetyStatus } from "@/server/domain/types";

export const SAFETY_ENGINE_VERSION = "crownscore-safety-v2";

export function evaluateSafety(input: { concerns: string[]; qualityStatus: "GOOD" | "REVIEW" | "INSUFFICIENT"; questionnaire: Questionnaire }): { status: SafetyStatus; ruleIds: string[]; reasons: string[] } {
  const rules: string[] = [], reasons: string[] = [];
  if (input.questionnaire.scalpPain) { rules.push("SYMPTOM_SCALP_PAIN"); reasons.push("You reported scalp pain."); }
  if (input.questionnaire.irritation) { rules.push("SYMPTOM_IRRITATION"); reasons.push("You reported irritation."); }
  if (input.questionnaire.shedding === "HIGH") { rules.push("SYMPTOM_HIGH_SHEDDING"); reasons.push("You reported unusual shedding."); }
  if (input.qualityStatus === "INSUFFICIENT") { rules.push("INSUFFICIENT_IMAGE"); reasons.push("The image is not suitable for a visible-concern score."); }
  if (input.concerns.length >= 3) { rules.push("MULTIPLE_VISIBLE_CONCERNS"); reasons.push("Several distinct visible concerns were highlighted for review."); }
  const urgent = rules.includes("SYMPTOM_SCALP_PAIN") || (rules.includes("SYMPTOM_IRRITATION") && rules.includes("SYMPTOM_HIGH_SHEDDING"));
  return { status: urgent ? "SEEK_PROFESSIONAL_GUIDANCE" : rules.length ? "WATCH" : "CLEAR", ruleIds: rules, reasons };
}
