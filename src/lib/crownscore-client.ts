import type { CheckInAnalysis, CoachOutput, ProgressPoint } from "@/server/domain/types";

export const CHECK_INS_KEY = "crownscore-check-ins";
export const RESULT_KEY = "crownscore-result";
export const CAPTURE_KEY = "crownscore-capture";
export const QUESTIONNAIRE_KEY = "crownscore-questionnaire";
export const GUEST_ID_KEY = "crownscore-guest-id";

export type StoredCheckIn = {
  analysis: CheckInAnalysis;
  coach: CoachOutput;
  safetyReasons: string[];
  preview?: string | null;
};

export function getStoredCheckIns(): StoredCheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECK_INS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCheckIn(record: StoredCheckIn) {
  const existing = getStoredCheckIns().filter((item) => item.analysis.id !== record.analysis.id);
  const next = [...existing, record].sort((a, b) => new Date(a.analysis.capturedAt).getTime() - new Date(b.analysis.capturedAt).getTime());
  localStorage.setItem(CHECK_INS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("crownscore:check-ins", { detail: next }));
  return next;
}

export function clearStoredCheckIns() {
  localStorage.removeItem(CHECK_INS_KEY);
  sessionStorage.removeItem(RESULT_KEY);
  sessionStorage.removeItem(CAPTURE_KEY);
  sessionStorage.removeItem(QUESTIONNAIRE_KEY);
  window.dispatchEvent(new CustomEvent("crownscore:check-ins", { detail: [] }));
}

export function toProgressPoint(record: StoredCheckIn): ProgressPoint {
  const { analysis } = record;
  return {
    id: analysis.id,
    capturedAt: analysis.capturedAt,
    treatmentWeek: analysis.treatmentWeek,
    normalizedScore: analysis.normalizedScore,
    expectedScore: analysis.expectedScore,
    safetyStatus: analysis.safetyStatus,
    adherenceRate: analysis.adherenceRate,
  };
}

export function getTreatmentWeek(firstCapturedAt?: string | null) {
  if (!firstCapturedAt) return 0;
  const days = Math.max(0, Date.now() - new Date(firstCapturedAt).getTime()) / 86_400_000;
  return Math.floor(days / 7);
}

export function countConsecutiveDeclines(points: ProgressPoint[]) {
  let declines = 0;
  for (let index = points.length - 1; index > 0; index -= 1) {
    if (points[index].normalizedScore >= points[index - 1].normalizedScore) break;
    declines += 1;
  }
  return declines;
}
