import { describe, expect, it } from "vitest";
import { coachOutputSchema, MockCoachProvider } from "@/server/providers/coach";
describe("coach fallback", () => { it("returns schema-valid non-diagnostic copy", async () => { const result = await new MockCoachProvider().generateSummary({ healthScore: 88, concernLabels: ["dandruff"], status: "SCORED", safetyStatus: "CLEAR", adherenceRate: 91, coachStyle: "SUPPORTIVE" }); expect(coachOutputSchema.safeParse(result).success).toBe(true); expect(result.summary).toContain("not diagnoses"); expect(result.fallbackUsed).toBe(true); }); });
