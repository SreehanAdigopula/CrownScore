import type { TreatmentType } from "@/server/domain/types";

export const EXPECTED_CURVES: Record<TreatmentType, ReadonlyArray<{ week: number; score: number }>> = {
  MINOXIDIL: [{ week: 0, score: 100 }, { week: 4, score: 98 }, { week: 8, score: 101 }, { week: 12, score: 105 }, { week: 18, score: 111 }, { week: 24, score: 116 }],
  FINASTERIDE: [{ week: 0, score: 100 }, { week: 4, score: 99 }, { week: 8, score: 101 }, { week: 12, score: 104 }, { week: 18, score: 108 }, { week: 24, score: 112 }],
  GENERAL: [{ week: 0, score: 100 }, { week: 4, score: 100 }, { week: 8, score: 101 }, { week: 12, score: 102 }, { week: 18, score: 103 }, { week: 24, score: 104 }],
  MONITORING: [{ week: 0, score: 100 }, { week: 4, score: 100 }, { week: 8, score: 100 }, { week: 12, score: 100 }, { week: 18, score: 100 }, { week: 24, score: 100 }],
};
