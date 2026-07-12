export const HEALTH_MODEL_CLASSES = [
  "Alopecia Areata", "Contact Dermatitis", "Folliculitis", "Head_Lice",
  "Psoriasis", "dandruff", "dry hair", "grey hair", "low hair density",
] as const;

export type HealthClass = (typeof HEALTH_MODEL_CLASSES)[number];
export type DetectionBox = { x: number; y: number; width: number; height: number };
export type HealthDetection = { className: HealthClass; confidence: number; box: DetectionBox };
export type ImageQualityInput = {
  brightness: number; sharpness: number; contrast: number; rotation: number;
  subjectCoverage: number; warnings: string[]; status: "GOOD" | "REVIEW" | "INSUFFICIENT";
};

export const CONDITION_WEIGHTS: Record<HealthClass, number> = {
  "Alopecia Areata": 0.16,
  "Contact Dermatitis": 0.13,
  Folliculitis: 0.13,
  Head_Lice: 0.12,
  Psoriasis: 0.14,
  dandruff: 0.08,
  "dry hair": 0.06,
  "grey hair": 0,
  "low hair density": 0.08,
};

export const VISIBLE_CONCERN_LABELS: Record<HealthClass, string> = {
  "Alopecia Areata": "patchy hair-loss pattern",
  "Contact Dermatitis": "irritation-like pattern",
  Folliculitis: "follicle-area redness pattern",
  Head_Lice: "lice-like specks",
  Psoriasis: "plaque-like scalp pattern",
  dandruff: "visible flaking",
  "dry hair": "visible dryness",
  "grey hair": "gray hair",
  "low hair density": "low visible hair coverage",
};

const clamp = (value: number, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));

export function intersectionOverUnion(a: DetectionBox, b: DetectionBox): number {
  const left = Math.max(a.x, b.x), top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
  const union = a.width * a.height + b.width * b.height - intersection;
  return union > 0 ? intersection / union : 0;
}

export function deduplicateDetections(detections: HealthDetection[], iouThreshold = 0.5): HealthDetection[] {
  const accepted: HealthDetection[] = [];
  for (const detection of [...detections].sort((a, b) => b.confidence - a.confidence)) {
    if (detection.confidence < 0.2) continue;
    if (accepted.some((item) => item.className === detection.className && intersectionOverUnion(item.box, detection.box) >= iouThreshold)) continue;
    accepted.push(detection);
  }
  return accepted;
}

export function calculateVisibleHealthScore(detections: HealthDetection[], quality: ImageQualityInput) {
  if (quality.status === "INSUFFICIENT") {
    return { status: "INSUFFICIENT_IMAGE" as const, score: null, concerns: [], modelConfidence: 0, uncertainty: 1 };
  }
  const unique = deduplicateDetections(detections);
  const grouped = new Map<HealthClass, HealthDetection[]>();
  for (const detection of unique) {
    if (CONDITION_WEIGHTS[detection.className] === 0) continue;
    grouped.set(detection.className, [...(grouped.get(detection.className) ?? []), detection]);
  }
  const concerns = [...grouped.entries()].map(([className, items]) => {
    let combined = 0;
    for (const item of items) {
      const area = clamp(item.box.width * item.box.height);
      const areaFactor = 0.65 + 0.35 * Math.sqrt(area);
      const evidence = clamp(item.confidence * areaFactor);
      combined = 1 - (1 - combined) * (1 - evidence);
    }
    const penalty = Math.min(className === "low hair density" ? 8 : 18, CONDITION_WEIGHTS[className] * combined * 100);
    return {
      className, label: VISIBLE_CONCERN_LABELS[className], confidence: Math.max(...items.map((item) => item.confidence)),
      affectedArea: Math.min(1, items.reduce((sum, item) => sum + item.box.width * item.box.height, 0)),
      penalty: Number(penalty.toFixed(1)), count: items.length,
    };
  }).sort((a, b) => b.penalty - a.penalty);
  const diversityPenalty = Math.min(8, Math.max(0, concerns.length - 1) * 2);
  const qualityPenalty = quality.status === "REVIEW" ? 4 : 0;
  const totalPenalty = concerns.reduce((sum, item) => sum + item.penalty, 0) + diversityPenalty + qualityPenalty;
  const score = Math.round(clamp(100 - totalPenalty, 0, 100));
  const confidences = unique.filter((item) => item.className !== "grey hair").map((item) => item.confidence);
  // With no scored detections the detector provides no calibrated "healthy"
  // probability, so expose neutral uncertainty instead of false certainty.
  const modelConfidence = confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : 0.5;
  return {
    status: "SCORED" as const, score, concerns,
    modelConfidence: Number(modelConfidence.toFixed(3)), uncertainty: Number((1 - modelConfidence).toFixed(3)),
  };
}
