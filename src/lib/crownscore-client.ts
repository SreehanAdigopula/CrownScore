import type { CheckInAnalysis, CoachOutput, CoachStyle, ProgressPoint, TreatmentType } from "@/server/domain/types";

export const CHECK_INS_KEY = "crownscore-check-ins";
export const RESULT_KEY = "crownscore-result";
export const CAPTURE_KEY = "crownscore-capture";
export const QUESTIONNAIRE_KEY = "crownscore-questionnaire";
export const GUEST_ID_KEY = "crownscore-guest-id";
export const ONBOARDING_KEY = "crownscore-onboarding";

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
  /* localStorage quota is ~5MB; if a save fails, shed the oldest photo previews first and keep the
     analysis history intact rather than losing the whole check-in. */
  let attempt = [...next];
  for (let round = 0; round <= attempt.length; round += 1) {
    try {
      localStorage.setItem(CHECK_INS_KEY, JSON.stringify(attempt));
      break;
    } catch {
      const oldestWithPreview = attempt.find((item) => item.preview);
      if (!oldestWithPreview) break;
      attempt = attempt.map((item) => (item === oldestWithPreview ? { ...item, preview: null } : item));
    }
  }
  window.dispatchEvent(new CustomEvent("crownscore:check-ins", { detail: attempt }));
  return attempt;
}

export type OnboardingPrefs = { treatment: TreatmentType; coachStyle: CoachStyle; startDate: string | null };
const TREATMENTS: TreatmentType[] = ["MINOXIDIL", "FINASTERIDE", "GENERAL", "MONITORING"];
const COACH_STYLES: CoachStyle[] = ["SUPPORTIVE", "DIRECT", "SCIENTIFIC", "MINIMAL"];

export function getOnboardingPrefs(): OnboardingPrefs {
  const fallback: OnboardingPrefs = { treatment: "MINOXIDIL", coachStyle: "SUPPORTIVE", startDate: null };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = JSON.parse(localStorage.getItem(ONBOARDING_KEY) ?? "{}") as { treatment?: string; coachStyle?: string; startDate?: string };
    const treatment = TREATMENTS.find((item) => item === raw.treatment) ?? fallback.treatment;
    const coachStyle = COACH_STYLES.find((item) => item === raw.coachStyle?.toUpperCase()) ?? fallback.coachStyle;
    const startDate = raw.startDate && !Number.isNaN(new Date(raw.startDate).getTime()) ? raw.startDate : null;
    return { treatment, coachStyle, startDate };
  } catch {
    return fallback;
  }
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
