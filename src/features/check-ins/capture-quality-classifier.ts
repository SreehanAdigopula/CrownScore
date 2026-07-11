"use client";
import { loadGuideRegion } from "@/features/check-ins/score-capture";

export type CaptureQualityResult = { modelAvailable: boolean; isValidCapture: boolean; confidence: number };

const MODEL_URL = "/models/crown-classifier.onnx";
const MODEL_INPUT_SIZE = 224;
/* Probability of the "valid" class required to accept a capture. Kept lenient:
   the gate exists to reject clearly wrong photos, not to fight the user. */
const VALID_THRESHOLD = 0.5;

const UNAVAILABLE: CaptureQualityResult = { modelAvailable: false, isValidCapture: true, confidence: 0 };

/* Converts a canvas to the model's input layout: float32 NCHW [1,3,H,W], RGB in [0,1].
   Normalization is baked into the exported ONNX graph (see ml/export_onnx.py). */
export function canvasToTensorData(pixels: Uint8ClampedArray, width: number, height: number): Float32Array {
  const plane = width * height;
  const tensor = new Float32Array(3 * plane);
  for (let index = 0; index < plane; index += 1) {
    tensor[index] = pixels[index * 4] / 255;
    tensor[plane + index] = pixels[index * 4 + 1] / 255;
    tensor[2 * plane + index] = pixels[index * 4 + 2] / 255;
  }
  return tensor;
}

type OrtSession = { run(feeds: Record<string, unknown>): Promise<Record<string, { data: Float32Array }>> };
let sessionPromise: Promise<OrtSession | null> | null = null;

/* Loads the ONNX session once. Resolves to null — never throws — when the model file
   is absent or the WASM runtime fails, so the capture flow can skip the gate entirely. */
function getSession(): Promise<OrtSession | null> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      try {
        const head = await fetch(MODEL_URL, { method: "HEAD" });
        if (!head.ok) return null;
        const ort = await import("onnxruntime-web");
        ort.env.wasm.wasmPaths = "/ort/";
        return (await ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] })) as unknown as OrtSession;
      } catch (error) {
        console.warn("Capture-quality model unavailable; skipping gate.", error);
        return null;
      }
    })();
  }
  return sessionPromise;
}

export async function classifyCapture(dataUrl: string): Promise<CaptureQualityResult> {
  try {
    const session = await getSession();
    if (!session) return UNAVAILABLE;
    const region = await loadGuideRegion(dataUrl);
    const scaled = document.createElement("canvas");
    scaled.width = MODEL_INPUT_SIZE;
    scaled.height = MODEL_INPUT_SIZE;
    const context = scaled.getContext("2d", { willReadFrequently: true });
    if (!context) return UNAVAILABLE;
    context.drawImage(region, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
    const pixels = context.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE).data;
    const ort = await import("onnxruntime-web");
    const input = new ort.Tensor("float32", canvasToTensorData(pixels, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE), [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
    const output = await session.run({ input });
    const [invalidProb, validProb] = Array.from(output.probs.data);
    return { modelAvailable: true, isValidCapture: validProb >= VALID_THRESHOLD, confidence: Number(Math.max(validProb, invalidProb).toFixed(3)) };
  } catch {
    return UNAVAILABLE;
  }
}
