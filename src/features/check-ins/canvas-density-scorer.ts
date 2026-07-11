import type { DensityScorer, DensityScoringInput, DensityScoringResult } from "@/features/check-ins/density-scorer";

export type PixelStats = { rawDensityRatio: number; brightness: number; blur: number; contrast: number };

export function otsuThreshold(histogram: ReadonlyArray<number>, totalPixels: number): number {
  let sumAll = 0;
  for (let level = 0; level < 256; level += 1) sumAll += level * histogram[level];
  let sumBackground = 0;
  let weightBackground = 0;
  let bestVariance = -1;
  let threshold = 127;
  for (let level = 0; level < 256; level += 1) {
    weightBackground += histogram[level];
    if (weightBackground === 0) continue;
    const weightForeground = totalPixels - weightBackground;
    if (weightForeground === 0) break;
    sumBackground += level * histogram[level];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sumAll - sumBackground) / weightForeground;
    const betweenVariance = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;
    if (betweenVariance > bestVariance) { bestVariance = betweenVariance; threshold = level; }
  }
  return threshold;
}

/* Mirrors the OpenCV path (grayscale -> Otsu inverse threshold -> dark-pixel ratio, Laplacian blur proxy)
   so scores stay comparable when this scorer is used as the WASM-failure fallback. */
export function analyzePixels(data: Uint8ClampedArray, width: number, height: number): PixelStats {
  const totalPixels = width * height;
  if (totalPixels === 0 || data.length < totalPixels * 4) throw new Error("Image data is empty or truncated.");
  const gray = new Uint8Array(totalPixels);
  const histogram = new Array<number>(256).fill(0);
  let sum = 0;
  for (let index = 0; index < totalPixels; index += 1) {
    const offset = index * 4;
    const value = Math.round(0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]);
    gray[index] = value;
    histogram[value] += 1;
    sum += value;
  }
  const brightness = sum / totalPixels / 255;
  const threshold = otsuThreshold(histogram, totalPixels);
  let darkPixels = 0;
  for (let index = 0; index < totalPixels; index += 1) if (gray[index] <= threshold) darkPixels += 1;
  let laplacianSum = 0;
  let laplacianCount = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const response = gray[index - 1] + gray[index + 1] + gray[index - width] + gray[index + width] - 4 * gray[index];
      laplacianSum += Math.min(255, Math.max(0, response));
      laplacianCount += 1;
    }
  }
  const blur = laplacianCount === 0 ? 0 : Math.min(1, laplacianSum / laplacianCount / 24);
  const contrast = Math.min(1, Math.abs(brightness - 0.5) * 1.4 + 0.26);
  return { rawDensityRatio: darkPixels / totalPixels, brightness, blur, contrast };
}

export function scoreConfidence(stats: Pick<PixelStats, "brightness" | "blur" | "contrast">): number {
  return Number(Math.max(0, Math.min(1, stats.blur * 0.5 + (1 - Math.abs(stats.brightness - 0.58)) * 0.3 + stats.contrast * 0.2)).toFixed(2));
}

export class CanvasDensityScorer implements DensityScorer {
  async score(input: DensityScoringInput): Promise<DensityScoringResult> {
    const context = input.source.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("2D canvas context is unavailable.");
    const region = input.crop ?? { x: 0, y: 0, width: input.source.width, height: input.source.height };
    const image = context.getImageData(region.x, region.y, region.width, region.height);
    const stats = analyzePixels(image.data, region.width, region.height);
    return {
      rawDensityRatio: Number(stats.rawDensityRatio.toFixed(4)),
      brightness: Number(stats.brightness.toFixed(3)),
      blur: Number(stats.blur.toFixed(3)),
      contrast: Number(stats.contrast.toFixed(3)),
      confidence: scoreConfidence(stats),
      algorithmVersion: "canvas-fallback-v1",
    };
  }
}
