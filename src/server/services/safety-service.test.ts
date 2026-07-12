import { describe, expect, it } from "vitest";
import { evaluateSafety } from "@/server/services/safety-service";
const base = { concerns: [] as string[], qualityStatus: "GOOD" as const, questionnaire: { adherenceRate: 90, shedding: "TYPICAL" as const, irritation: false, scalpPain: false, routineChanged: false } };
describe("deterministic safety", () => { it("returns clear without triggers", () => expect(evaluateSafety(base).status).toBe("CLEAR")); it("flags an insufficient image", () => expect(evaluateSafety({ ...base, qualityStatus: "INSUFFICIENT" }).ruleIds).toContain("INSUFFICIENT_IMAGE")); it("never requires an LLM", () => expect(evaluateSafety({ ...base, questionnaire: { ...base.questionnaire, irritation: true } }).status).toBe("WATCH")); });
