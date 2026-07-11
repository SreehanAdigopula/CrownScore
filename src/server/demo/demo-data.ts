import type { CoachOutput, DashboardData, DemoScenario, ProgressPoint, SafetyStatus } from "@/server/domain/types";

const dates = ["2026-03-07", "2026-03-28", "2026-04-18", "2026-05-09", "2026-05-30", "2026-06-20", "2026-07-11"];
const configs: Record<DemoScenario, { scores: number[]; expected: number[]; adherence: number[]; safety: SafetyStatus; headline: string }> = {
  healthy: { scores: [100, 98.6, 101.2, 104.8, 108.1, 112.4, 116.8], expected: [100, 98.8, 100.5, 103.3, 106.6, 110.2, 113.8], adherence: [92, 89, 94, 91, 96, 93, 95], safety: "CLEAR", headline: "Your trend is running ahead" },
  shedding: { scores: [100, 95.9, 96.8, 100.4, 104.2, 108.8, 112.1], expected: [100, 98.8, 100.5, 103.3, 106.6, 110.2, 113.8], adherence: [95, 93, 91, 94, 92, 96, 94], safety: "CLEAR", headline: "Recovery followed the early dip" },
  adherence: { scores: [100, 99.1, 99.7, 101.0, 100.3, 102.2, 102.8], expected: [100, 98.8, 100.5, 103.3, 106.6, 110.2, 113.8], adherence: [78, 64, 72, 58, 69, 61, 67], safety: "WATCH", headline: "Consistency may be shaping the trend" },
  safety: { scores: [100, 98.1, 95.7, 92.2, 88.9, 85.4, 82.8], expected: [100, 98.8, 100.5, 103.3, 106.6, 110.2, 113.8], adherence: [91, 89, 92, 88, 90, 87, 86], safety: "SEEK_PROFESSIONAL_GUIDANCE", headline: "This pattern is worth discussing" },
};

export function createDemoDashboard(scenario: DemoScenario = "healthy"): DashboardData {
  const config = configs[scenario];
  const history: ProgressPoint[] = dates.map((capturedAt, index) => ({ id: `demo-${scenario}-${index + 1}`, capturedAt, treatmentWeek: index * 3, normalizedScore: config.scores[index], expectedScore: config.expected[index], safetyStatus: index === dates.length - 1 ? config.safety : "CLEAR", adherenceRate: config.adherence[index] }));
  const latestPoint = history.at(-1)!;
  const previous = history.at(-2)!;
  const baselineChange = Number((latestPoint.normalizedScore - 100).toFixed(1));
  const coach: CoachOutput = {
    headline: config.headline,
    summary: config.safety === "SEEK_PROFESSIONAL_GUIDANCE" ? "Your relative score has declined across several consistent check-ins. CrownScore cannot explain why, but the pattern and reported context deserve professional attention." : `Your latest relative score is ${latestPoint.normalizedScore}. The series is based on your own baseline, and the photo quality has remained consistent enough to compare.`,
    nextStep: config.safety === "SEEK_PROFESSIONAL_GUIDANCE" ? "Consider sharing this timeline with a dermatologist." : "Keep the same lighting and angle for your next scheduled check-in.",
    regimenObservation: `Reported adherence averaged ${Math.round(config.adherence.reduce((a, b) => a + b, 0) / config.adherence.length)}%.`,
    disclaimer: "Educational only. CrownScore does not diagnose conditions or measure clinical hair density.",
    fallbackUsed: true,
  };
  return {
    treatment: "MINOXIDIL",
    history,
    latest: {
      ...latestPoint,
      rawDensityRatio: Number((0.428 * (latestPoint.normalizedScore / 100)).toFixed(3)),
      baselineChangePercent: baselineChange,
      previousChangePercent: Number((latestPoint.normalizedScore - previous.normalizedScore).toFixed(1)),
      expectedDeviationPercent: Number((latestPoint.normalizedScore - latestPoint.expectedScore).toFixed(1)),
      trendStatus: config.safety === "SEEK_PROFESSIONAL_GUIDANCE" || scenario === "adherence" ? "WORTH_WATCHING" : scenario === "healthy" ? "AHEAD_OF_EXPECTED" : "ON_TRACK",
      safetyRuleIds: config.safety === "SEEK_PROFESSIONAL_GUIDANCE" ? ["RAPID_RELATIVE_DECLINE", "REPEATED_DECLINE"] : config.safety === "WATCH" ? ["INCONSISTENT_ADHERENCE"] : [],
      quality: { brightness: 0.61, blur: 0.84, contrast: 0.39, confidence: 0.88, status: "GOOD" },
      isDemoData: true,
      algorithmVersion: "crownscore-relative-v1",
    },
    coach,
    nextCheckIn: "2026-07-18",
    streak: 7,
    scenario,
  };
}
