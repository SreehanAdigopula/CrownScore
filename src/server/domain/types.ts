import type { HealthDetection, ImageQualityInput } from "@/server/analysis/visible-health-scoring";

export type TreatmentType = "MINOXIDIL" | "FINASTERIDE" | "GENERAL" | "MONITORING";
export type CoachStyle = "SUPPORTIVE" | "DIRECT" | "SCIENTIFIC" | "MINIMAL";
export type SafetyStatus = "CLEAR" | "WATCH" | "SEEK_PROFESSIONAL_GUIDANCE";

export type Questionnaire = {
  adherenceRate: number | null;
  shedding: "LOW" | "TYPICAL" | "HIGH";
  irritation: boolean;
  scalpPain: boolean;
  routineChanged: boolean;
  notes?: string;
};

export type VisibleConcern = {
  className: string; label: string; confidence: number; affectedArea: number;
  penalty: number; count: number;
};

export type CheckInAnalysis = {
  id: string;
  capturedAt: string;
  treatmentWeek: number;
  healthScore: number | null;
  status: "SCORED" | "INSUFFICIENT_IMAGE";
  concerns: VisibleConcern[];
  detections: HealthDetection[];
  modelConfidence: number;
  uncertainty: number;
  quality: ImageQualityInput;
  safetyStatus: SafetyStatus;
  safetyRuleIds: string[];
  adherenceRate: number | null;
  isDemoData: boolean;
  algorithmVersion: "crownscore-visible-health-v1";
  modelVersion: "hair-health-yolov8n-v1";
  disclaimer: string;
};

export type CoachOutput = {
  headline: string; summary: string; nextStep: string;
  regimenObservation: string | null; disclaimer: string; fallbackUsed: boolean;
};

export type ProgressPoint = Pick<CheckInAnalysis, "id" | "capturedAt" | "treatmentWeek" | "healthScore" | "safetyStatus" | "adherenceRate">;
export type DashboardData = { treatment: TreatmentType; latest: CheckInAnalysis; history: ProgressPoint[]; coach: CoachOutput; nextCheckIn: string; streak: number; scenario: DemoScenario };
export type DemoScenario = "healthy" | "shedding" | "adherence" | "safety";
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string; details?: unknown } };
