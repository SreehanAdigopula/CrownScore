import type { ImageQuality, TrendStatus } from "@/server/domain/types";

export const ALGORITHM_VERSION = "crownscore-relative-v1" as const;

export function normalizeToBaseline(rawDensityRatio: number, baselineRatio: number): number {
  if (!Number.isFinite(rawDensityRatio) || !Number.isFinite(baselineRatio) || baselineRatio <= 0) {
    throw new Error("A positive baseline and finite density ratio are required.");
  }
  return Number(((rawDensityRatio / baselineRatio) * 100).toFixed(1));
}

export function percentChange(current: number, previous: number): number {
  if (previous <= 0) throw new Error("Previous value must be positive.");
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function interpolateExpectedCurve(week: number, curve: ReadonlyArray<{ week: number; score: number }>): number {
  if (curve.length === 0) throw new Error("Expected curve cannot be empty.");
  const sorted = [...curve].sort((a, b) => a.week - b.week);
  if (week <= sorted[0].week) return sorted[0].score;
  if (week >= sorted.at(-1)!.week) return sorted.at(-1)!.score;
  const upperIndex = sorted.findIndex((point) => point.week >= week);
  const lower = sorted[upperIndex - 1];
  const upper = sorted[upperIndex];
  const progress = (week - lower.week) / (upper.week - lower.week);
  return Number((lower.score + progress * (upper.score - lower.score)).toFixed(1));
}

export function calculateConfidence(input: Pick<ImageQuality, "brightness" | "blur" | "contrast">): number {
  const brightnessFit = Math.max(0, 1 - Math.abs(input.brightness - 0.58) / 0.58);
  const blurFit = Math.min(1, Math.max(0, input.blur));
  const contrastFit = Math.min(1, Math.max(0, input.contrast / 0.45));
  return Number((brightnessFit * 0.35 + blurFit * 0.45 + contrastFit * 0.2).toFixed(2));
}

export function classifyTrend(input: { historyCount: number; confidence: number; expectedDeviationPercent: number }): TrendStatus {
  if (input.confidence < 0.55) return "INSUFFICIENT_QUALITY";
  if (input.historyCount < 2) return "INSUFFICIENT_HISTORY";
  if (input.expectedDeviationPercent >= 3) return "AHEAD_OF_EXPECTED";
  if (input.expectedDeviationPercent >= -4) return "ON_TRACK";
  return "WORTH_WATCHING";
}
