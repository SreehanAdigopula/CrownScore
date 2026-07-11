import { describe, expect, it } from "vitest";
import { analyzePixels, otsuThreshold, scoreConfidence } from "@/features/check-ins/canvas-density-scorer";

function solidImage(width: number, height: number, value: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    data[index * 4] = value; data[index * 4 + 1] = value; data[index * 4 + 2] = value; data[index * 4 + 3] = 255;
  }
  return data;
}

function halfDarkImage(width: number, height: number): Uint8ClampedArray {
  const data = solidImage(width, height, 230);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < Math.floor(width / 2); x += 1) {
      const offset = (y * width + x) * 4;
      data[offset] = 20; data[offset + 1] = 20; data[offset + 2] = 20;
    }
  }
  return data;
}

describe("otsuThreshold", () => {
  it("separates a bimodal histogram between the two modes", () => {
    const histogram = new Array<number>(256).fill(0);
    histogram[20] = 500;
    histogram[230] = 500;
    const threshold = otsuThreshold(histogram, 1000);
    expect(threshold).toBeGreaterThanOrEqual(20);
    expect(threshold).toBeLessThan(230);
  });
});

describe("analyzePixels", () => {
  it("scores a half-dark image as roughly 50% density", () => {
    const stats = analyzePixels(halfDarkImage(40, 40), 40, 40);
    expect(stats.rawDensityRatio).toBeCloseTo(0.5, 1);
    expect(stats.brightness).toBeGreaterThan(0.4);
    expect(stats.brightness).toBeLessThan(0.6);
  });

  it("scores a bright uniform image as near-zero density with no edge signal", () => {
    const stats = analyzePixels(solidImage(32, 32, 235), 32, 32);
    expect(stats.rawDensityRatio).toBe(0);
    expect(stats.blur).toBe(0);
    expect(stats.brightness).toBeCloseTo(235 / 255, 2);
  });

  it("reports a stronger edge signal for sharp checkerboards than uniform frames", () => {
    const width = 32; const height = 32;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const value = (x + y) % 2 === 0 ? 10 : 245;
        const offset = (y * width + x) * 4;
        data[offset] = value; data[offset + 1] = value; data[offset + 2] = value; data[offset + 3] = 255;
      }
    }
    const sharp = analyzePixels(data, width, height);
    const flat = analyzePixels(solidImage(width, height, 128), width, height);
    expect(sharp.blur).toBeGreaterThan(flat.blur);
    expect(sharp.blur).toBe(1);
  });

  it("rejects empty or truncated input", () => {
    expect(() => analyzePixels(new Uint8ClampedArray(0), 0, 0)).toThrow();
    expect(() => analyzePixels(new Uint8ClampedArray(8), 10, 10)).toThrow();
  });
});

describe("scoreConfidence", () => {
  it("stays within [0, 1] and rewards sharp, well-lit frames", () => {
    const good = scoreConfidence({ brightness: 0.58, blur: 0.9, contrast: 0.4 });
    const poor = scoreConfidence({ brightness: 0.05, blur: 0.05, contrast: 0.26 });
    expect(good).toBeGreaterThan(poor);
    expect(good).toBeLessThanOrEqual(1);
    expect(poor).toBeGreaterThanOrEqual(0);
  });
});
