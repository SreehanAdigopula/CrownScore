import { describe, expect, it } from "vitest";
import { canvasToTensorData } from "@/features/check-ins/capture-quality-classifier";

describe("canvasToTensorData", () => {
  it("produces NCHW planes scaled to [0,1]", () => {
    // 2x1 image: pixel A = pure red, pixel B = mid gray
    const pixels = new Uint8ClampedArray([255, 0, 0, 255, 128, 128, 128, 255]);
    const tensor = canvasToTensorData(pixels, 2, 1);
    expect(tensor.length).toBe(6);
    expect(tensor[0]).toBe(1); // R plane, pixel A
    expect(tensor[1]).toBeCloseTo(128 / 255, 5); // R plane, pixel B
    expect(tensor[2]).toBe(0); // G plane, pixel A
    expect(tensor[3]).toBeCloseTo(128 / 255, 5); // G plane, pixel B
    expect(tensor[4]).toBe(0); // B plane, pixel A
    expect(tensor[5]).toBeCloseTo(128 / 255, 5); // B plane, pixel B
  });

  it("ignores the alpha channel", () => {
    const pixels = new Uint8ClampedArray([10, 20, 30, 0]);
    const tensor = canvasToTensorData(pixels, 1, 1);
    expect(Array.from(tensor)).toEqual([10 / 255, 20 / 255, 30 / 255].map((v) => Math.fround(v)));
  });
});
