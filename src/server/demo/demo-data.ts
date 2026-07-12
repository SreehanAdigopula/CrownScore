import type { CoachOutput, DashboardData, DemoScenario, ProgressPoint, SafetyStatus } from "@/server/domain/types";

const dates = ["2026-03-07", "2026-03-28", "2026-04-18", "2026-05-09", "2026-05-30", "2026-06-20", "2026-07-11"];
const configs: Record<DemoScenario, { scores: number[]; adherence: number[]; safety: SafetyStatus; headline: string }> = {
  healthy: { scores: [92, 94, 93, 96, 95, 97, 98], adherence: [92, 89, 94, 91, 96, 93, 95], safety: "CLEAR", headline: "No visible concerns highlighted" },
  shedding: { scores: [91, 84, 86, 89, 92, 93, 94], adherence: [95, 93, 91, 94, 92, 96, 94], safety: "CLEAR", headline: "Visible score has improved" },
  adherence: { scores: [90, 89, 91, 88, 90, 89, 91], adherence: [78, 64, 72, 58, 69, 61, 67], safety: "WATCH", headline: "Keep photo conditions consistent" },
  safety: { scores: [90, 86, 82, 78, 74, 70, 68], adherence: [91, 89, 92, 88, 90, 87, 86], safety: "SEEK_PROFESSIONAL_GUIDANCE", headline: "Visible concerns are worth reviewing" },
};

export function createDemoDashboard(scenario: DemoScenario = "healthy"): DashboardData {
  const config = configs[scenario];
  const history: ProgressPoint[] = dates.map((capturedAt, index) => ({ id: `demo-${scenario}-${index + 1}`, capturedAt, treatmentWeek: index * 3, healthScore: config.scores[index], safetyStatus: index === dates.length - 1 ? config.safety : "CLEAR", adherenceRate: config.adherence[index] }));
  const latestPoint = history.at(-1)!;
  const coach: CoachOutput = { headline: config.headline, summary: `The latest visible-health score is ${latestPoint.healthScore}. Demo values illustrate the new response shape and are not medical findings.`, nextStep: "Use consistent photos and seek qualified guidance for persistent symptoms.", regimenObservation: `Reported adherence averaged ${Math.round(config.adherence.reduce((a, b) => a + b, 0) / config.adherence.length)}%.`, disclaimer: "Educational only. CrownScore highlights possible visible concerns and does not diagnose.", fallbackUsed: true };
  return { treatment: "MINOXIDIL", history, latest: { ...latestPoint, status: "SCORED", concerns: [], detections: [], modelConfidence: 0.88, uncertainty: 0.12, quality: { brightness: 0.61, sharpness: 0.84, contrast: 0.39, rotation: 0, subjectCoverage: 0.48, warnings: [], status: "GOOD" }, safetyRuleIds: [], isDemoData: true, algorithmVersion: "crownscore-visible-health-v1", modelVersion: "hair-health-yolov8n-v1", disclaimer: "CrownScore highlights possible visible concerns from one image. It is not a medical diagnosis and does not replace a qualified professional." }, coach, nextCheckIn: "2026-07-18", streak: 7, scenario };
}
