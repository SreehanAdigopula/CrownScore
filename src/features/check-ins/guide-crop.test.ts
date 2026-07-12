import { describe, expect, it } from "vitest";
import { computeObjectCoverMapping, mapGuideToVideo } from "./guide-crop";

describe("computeObjectCoverMapping", () => {
  it("square video in square viewport: no crop, scale = element/video", () => {
    const m = computeObjectCoverMapping(1000, 1000, 500, 500);
    expect(m.scale).toBe(0.5);
    expect(m.horizontalCrop).toBe(0);
    expect(m.verticalCrop).toBe(0);
  });

  it("16:9 video in portrait viewport: horizontal crop", () => {
    const m = computeObjectCoverMapping(1920, 1080, 400, 700);
    expect(m.scale).toBeCloseTo(700 / 1080, 4);
    expect(m.horizontalCrop).toBeGreaterThan(0);
    expect(m.verticalCrop).toBe(0);
  });

  it("portrait video in landscape viewport: vertical crop", () => {
    const m = computeObjectCoverMapping(1080, 1920, 700, 400);
    expect(m.scale).toBeCloseTo(700 / 1080, 4);
    expect(m.verticalCrop).toBeGreaterThan(0);
    expect(m.horizontalCrop).toBe(0);
  });

  it("matching aspect ratios: no crop", () => {
    const m = computeObjectCoverMapping(1920, 1080, 960, 540);
    expect(m.horizontalCrop).toBe(0);
    expect(m.verticalCrop).toBe(0);
    expect(m.scale).toBeCloseTo(0.5, 4);
  });
});

describe("mapGuideToVideo", () => {
  const guide = { left: 0.31, top: 0.28, width: 0.38, height: 0.3 };

  it("square video in square viewport: guide maps correctly", () => {
    const crop = mapGuideToVideo(1000, 1000, 500, 500, guide);
    expect(crop.x).toBe(310);
    expect(crop.y).toBe(280);
    expect(crop.width).toBe(380);
    expect(crop.height).toBe(300);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1000);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1000);
  });

  it("16:9 video in portrait viewport: horizontal crop shifts guide", () => {
    const crop = mapGuideToVideo(1920, 1080, 400, 700, guide);
    expect(crop.x).toBeGreaterThan(0);
    expect(crop.y).toBeGreaterThan(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1920);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1080);
  });

  it("portrait video in landscape viewport: vertical crop shifts guide", () => {
    const crop = mapGuideToVideo(1080, 1920, 700, 400, guide);
    expect(crop.x).toBeGreaterThan(0);
    expect(crop.y).toBeGreaterThan(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1080);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1920);
  });

  it("guide bounds always remain inside intrinsic video bounds", () => {
    const cases = [
      [1920, 1080, 400, 700],
      [1080, 1920, 700, 400],
      [1280, 720, 375, 667],
      [720, 1280, 667, 375],
      [1000, 1000, 500, 500],
      [3840, 2160, 800, 600],
    ];
    for (const [vw, vh, ew, eh] of cases) {
      const crop = mapGuideToVideo(vw, vh, ew, eh, guide);
      expect(crop.x).toBeGreaterThanOrEqual(0);
      expect(crop.y).toBeGreaterThanOrEqual(0);
      expect(crop.x + crop.width).toBeLessThanOrEqual(vw);
      expect(crop.y + crop.height).toBeLessThanOrEqual(vh);
      expect(crop.width).toBeGreaterThan(0);
      expect(crop.height).toBeGreaterThan(0);
    }
  });

  it("guide at edges is clamped to video bounds", () => {
    const edgeGuide = { left: 0, top: 0, width: 1, height: 1 };
    const crop = mapGuideToVideo(1920, 1080, 400, 700, edgeGuide);
    expect(crop.x).toBeGreaterThanOrEqual(0);
    expect(crop.y).toBeGreaterThanOrEqual(0);
    expect(crop.x + crop.width).toBeLessThanOrEqual(1920);
    expect(crop.y + crop.height).toBeLessThanOrEqual(1080);
  });
});
