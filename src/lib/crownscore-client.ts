import type { CheckInAnalysis, CoachOutput, CoachStyle, ProgressPoint, TreatmentType } from "@/server/domain/types";

export const CHECK_INS_KEY = "crownscore-check-ins";
export const RESULT_KEY = "crownscore-result";
export const CAPTURE_KEY = "crownscore-capture";
export const QUESTIONNAIRE_KEY = "crownscore-questionnaire";
export const GUEST_ID_KEY = "crownscore-guest-id";
export const ONBOARDING_KEY = "crownscore-onboarding";

export type CheckInFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "MANUAL";

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

function slimForStorage(record: StoredCheckIn): StoredCheckIn {
  /* UI never renders raw detection boxes; dropping them keeps localStorage under quota. */
  return {
    ...record,
    analysis: { ...record.analysis, detections: [] },
  };
}

export function saveStoredCheckIn(record: StoredCheckIn) {
  const slim = slimForStorage(record);
  const existing = getStoredCheckIns().filter((item) => item.analysis.id !== slim.analysis.id);
  const next = [...existing, slim].sort((a, b) => new Date(a.analysis.capturedAt).getTime() - new Date(b.analysis.capturedAt).getTime());
  /* localStorage quota is limited. Shed old previews first, then the oldest records, while always
     preserving the check-in the person just completed. */
  let attempt = [...next];
  while (attempt.length > 0) {
    try {
      localStorage.setItem(CHECK_INS_KEY, JSON.stringify(attempt));
      window.dispatchEvent(new CustomEvent("crownscore:check-ins", { detail: attempt }));
      return attempt;
    } catch {
      const oldestWithPreview = attempt.find((item) => item.preview);
      if (oldestWithPreview) {
        attempt = attempt.map((item) => (item === oldestWithPreview ? { ...item, preview: null } : item));
      } else if (attempt.length > 1) {
        attempt = attempt.slice(1);
      } else {
        break;
      }
    }
  }
  throw new Error("This browser could not save the check-in. Free some storage and try again.");
}

export type OnboardingPrefs = {
  treatment: TreatmentType;
  coachStyle: CoachStyle;
  startDate: string | null;
  checkInFrequency: CheckInFrequency;
};

const TREATMENTS: TreatmentType[] = ["MINOXIDIL", "FINASTERIDE", "GENERAL", "MONITORING"];
const COACH_STYLES: CoachStyle[] = ["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"];
const FREQUENCIES: CheckInFrequency[] = ["WEEKLY", "BIWEEKLY", "MONTHLY", "MANUAL"];

const RHYTHM_TO_FREQUENCY: Record<string, CheckInFrequency> = {
  "Every week": "WEEKLY",
  "Every 2 weeks": "BIWEEKLY",
  "Every month": "MONTHLY",
  "I will decide": "MANUAL",
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  MONTHLY: "MONTHLY",
  MANUAL: "MANUAL",
};

export function getOnboardingPrefs(): OnboardingPrefs {
  const fallback: OnboardingPrefs = { treatment: "MINOXIDIL", coachStyle: "SUPPORTIVE", startDate: null, checkInFrequency: "WEEKLY" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = JSON.parse(localStorage.getItem(ONBOARDING_KEY) ?? "{}") as {
      treatment?: string;
      coachStyle?: string;
      startDate?: string;
      rhythm?: string;
      checkInFrequency?: string;
    };
    const treatment = TREATMENTS.find((item) => item === raw.treatment) ?? fallback.treatment;
    const coachStyle = COACH_STYLES.find((item) => item === raw.coachStyle?.toUpperCase()) ?? fallback.coachStyle;
    const startDate = raw.startDate && !Number.isNaN(new Date(raw.startDate).getTime()) ? raw.startDate : null;
    const fromRhythm = raw.rhythm ? RHYTHM_TO_FREQUENCY[raw.rhythm] : undefined;
    const checkInFrequency =
      FREQUENCIES.find((item) => item === raw.checkInFrequency) ?? fromRhythm ?? fallback.checkInFrequency;
    return { treatment, coachStyle, startDate, checkInFrequency };
  } catch {
    return fallback;
  }
}

export function nextCheckInLabel(frequency: CheckInFrequency, lastCapturedAt?: string | null): string {
  if (frequency === "MANUAL" || !lastCapturedAt) {
    return frequency === "MANUAL" ? "Whenever you want another consistent photo" : "Keep the same angle and lighting for a cleaner comparison.";
  }
  const days = frequency === "WEEKLY" ? 7 : frequency === "BIWEEKLY" ? 14 : 30;
  const due = new Date(lastCapturedAt);
  due.setDate(due.getDate() + days);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() <= today.getTime()) return "Due now — same angle and lighting help comparisons.";
  return `Suggested around ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`;
}

/* Full captures are ~100-200KB each; history thumbnails at 320px keep dozens of check-ins
   inside the localStorage budget. */
export async function createThumbnail(dataUrl: string, maxSize = 320): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Preview could not be decoded."));
    image.src = dataUrl;
  });
  const scale = maxSize / Math.max(image.naturalWidth, image.naturalHeight, 1);
  if (scale >= 1) return dataUrl;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.7);
}

export function clearStoredCheckIns() {
  localStorage.removeItem(CHECK_INS_KEY);
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(GUEST_ID_KEY);
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
    healthScore: analysis.healthScore,
    safetyStatus: analysis.safetyStatus,
    adherenceRate: analysis.adherenceRate,
  };
}

export function getTreatmentWeek(firstCapturedAt?: string | null) {
  if (!firstCapturedAt) return 0;
  const days = Math.max(0, Date.now() - new Date(firstCapturedAt).getTime()) / 86_400_000;
  return Math.floor(days / 7);
}

export function parseStoredCheckIn(raw: string | null): StoredCheckIn | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredCheckIn;
    if (!parsed?.analysis?.id || !parsed?.coach) return null;
    return parsed;
  } catch {
    return null;
  }
}
