import { describe, expect, it } from "vitest";
import { calculateVisibleHealthScore, type HealthDetection, type ImageQualityInput } from "./visible-health-scoring";
const quality: ImageQualityInput = { brightness: 0.55, sharpness: 0.5, contrast: 0.4, rotation: 0, subjectCoverage: 0.5, warnings: [], status: "GOOD" };
const detection = (className: HealthDetection["className"], confidence = 0.8, x = 0.1): HealthDetection => ({ className, confidence, box: { x, y: 0.1, width: 0.4, height: 0.4 } });
describe("visible-health score", () => {
  it("returns 100 for no detections", () => expect(calculateVisibleHealthScore([], quality).score).toBe(100));
  it("penalizes one condition", () => expect(calculateVisibleHealthScore([detection("dandruff")], quality).score).toBeLessThan(100));
  it("penalizes multiple distinct conditions more", () => expect(calculateVisibleHealthScore([detection("dandruff"), detection("Folliculitis", 0.8, 0.55)], quality).score).toBeLessThan(calculateVisibleHealthScore([detection("dandruff")], quality).score!));
  it("deduplicates overlapping detections", () => expect(calculateVisibleHealthScore([detection("dandruff"), detection("dandruff", 0.7, 0.11)], quality).score).toBe(calculateVisibleHealthScore([detection("dandruff")], quality).score));
  it("drops predictions below the confidence floor", () => expect(calculateVisibleHealthScore([detection("Psoriasis", 0.1)], quality).score).toBe(100));
  it("does not penalize gray hair", () => expect(calculateVisibleHealthScore([detection("grey hair")], quality).score).toBe(100));
  it("returns insufficient instead of a score for invalid images", () => expect(calculateVisibleHealthScore([], { ...quality, status: "INSUFFICIENT" })).toMatchObject({ status: "INSUFFICIENT_IMAGE", score: null }));
  it("caps low-density influence", () => expect(calculateVisibleHealthScore([detection("low hair density", 1)], quality).score).toBeGreaterThanOrEqual(92));
});
