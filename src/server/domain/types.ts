export type TreatmentType = "MINOXIDIL" | "FINASTERIDE" | "GENERAL" | "MONITORING";
export type CoachStyle = "SUPPORTIVE" | "DIRECT" | "SCIENTIFIC" | "MINIMAL";
export type TrendStatus = "AHEAD_OF_EXPECTED" | "ON_TRACK" | "WORTH_WATCHING" | "INSUFFICIENT_QUALITY" | "INSUFFICIENT_HISTORY";
export type SafetyStatus = "CLEAR" | "WATCH" | "SEEK_PROFESSIONAL_GUIDANCE";

export type Questionnaire = {
  adherenceRate: number | null;
  shedding: "LOW" | "TYPICAL" | "HIGH";
  irritation: boolean;
  scalpPain: boolean;
  routineChanged: boolean;
  notes?: string;
};

export type ImageQuality = {
  brightness: number;
  blur: number;
  contrast: number;
  confidence: number;
  status: "GOOD" | "REVIEW" | "REJECTED";
};

export type CheckInAnalysis = {
  id: string;
  capturedAt: string;
  treatmentWeek: number;
  rawDensityRatio: number;
  normalizedScore: number;
  baselineChangePercent: number;
  previousChangePercent: number | null;
  expectedScore: number;
  expectedDeviationPercent: number;
  trendStatus: TrendStatus;
  safetyStatus: SafetyStatus;
  safetyRuleIds: string[];
  quality: ImageQuality;
  adherenceRate: number | null;
  isDemoData: boolean;
  algorithmVersion: "crownscore-relative-v1";
};

export type CoachOutput = {
  headline: string;
  summary: string;
  nextStep: string;
  regimenObservation: string | null;
  disclaimer: string;
  fallbackUsed: boolean;
};

export type ProgressPoint = Pick<CheckInAnalysis, "id" | "capturedAt" | "treatmentWeek" | "normalizedScore" | "expectedScore" | "safetyStatus" | "adherenceRate">;

export type DashboardData = {
  treatment: TreatmentType;
  latest: CheckInAnalysis;
  history: ProgressPoint[];
  coach: CoachOutput;
  nextCheckIn: string;
  streak: number;
  scenario: DemoScenario;
};

export type DemoScenario = "healthy" | "shedding" | "adherence" | "safety";

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string; details?: unknown } };
