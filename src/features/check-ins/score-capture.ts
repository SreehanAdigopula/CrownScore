"use client";
import type { DensityScoringResult } from "@/features/check-ins/density-scorer";
import { CanvasDensityScorer } from "@/features/check-ins/canvas-density-scorer";

const SCORING_TIMEOUT_MS = 12_000;
/* The capture screen frames the crown inside an oval centered at 50%/43% of the viewport,
   38% wide and 30% tall. The stored capture is the center square of the video, so this crop
   selects the matching region — every check-in is scored on the same patch of scalp. */
const GUIDE_CROP = { x: 0.31, y: 0.28, width: 0.38, height: 0.3 } as const;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Scoring timed out.")), ms))]);
}

export async function loadGuideRegion(dataUrl: string): Promise<HTMLCanvasElement> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The captured photo could not be decoded."));
    image.src = dataUrl;
  });
  const sourceX = Math.round(image.naturalWidth * GUIDE_CROP.x);
  const sourceY = Math.round(image.naturalHeight * GUIDE_CROP.y);
  const sourceWidth = Math.max(1, Math.round(image.naturalWidth * GUIDE_CROP.width));
  const sourceHeight = Math.max(1, Math.round(image.naturalHeight * GUIDE_CROP.height));
  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas context is unavailable.");
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
  return canvas;
}

/* Primary path is OpenCV.js; if the WASM runtime fails to load or times out, the pure-canvas
   scorer produces a comparable result so a check-in never dies on a library failure. */
export async function scoreCapture(dataUrl: string): Promise<DensityScoringResult | null> {
  let region: HTMLCanvasElement;
  try {
    region = await loadGuideRegion(dataUrl);
  } catch {
    return null;
  }
  try {
    const { OpenCvDensityScorer } = await import("@/features/check-ins/opencv-density-scorer");
    return await withTimeout(new OpenCvDensityScorer().score({ source: region }), SCORING_TIMEOUT_MS);
  } catch {
    try {
      return await new CanvasDensityScorer().score({ source: region });
    } catch {
      return null;
    }
  }
}
