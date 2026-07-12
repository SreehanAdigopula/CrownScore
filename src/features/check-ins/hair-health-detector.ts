"use client";
import type { HealthClass, HealthDetection, ImageQualityInput } from "@/server/analysis/visible-health-scoring";
import { HEALTH_MODEL_CLASSES, intersectionOverUnion } from "@/server/analysis/visible-health-scoring";
import { loadCapture } from "@/features/check-ins/score-capture";

const MODEL_URL = "/models/hair-health-detector.onnx", INPUT_SIZE = 640, CONFIDENCE_THRESHOLD = 0.2, SESSION_TIMEOUT_MS = 30000, INFERENCE_TIMEOUT_MS = 30000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

let sessionPromise: Promise<import("onnxruntime-web").InferenceSession> | null = null;
async function getSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      try {
        const ort = await import("onnxruntime-web");
        ort.env.wasm.wasmPaths = "/ort/";
        return await withTimeout(
          ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"], graphOptimizationLevel: "all" }),
          SESSION_TIMEOUT_MS,
          "Model loading timed out. Please refresh the page and try again."
        );
      } catch (error) {
        sessionPromise = null;
        throw error;
      }
    })();
  }
  return sessionPromise;
}

function inspectQuality(source: HTMLCanvasElement): Omit<ImageQualityInput, "subjectCoverage"> {
  const sample = document.createElement("canvas"); sample.width = 160; sample.height = 160;
  const context = sample.getContext("2d", { willReadFrequently: true }); if (!context) throw new Error("2D canvas context is unavailable.");
  context.drawImage(source, 0, 0, sample.width, sample.height); const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
  const luminance = new Float32Array(sample.width * sample.height); let sum = 0;
  for (let index = 0; index < luminance.length; index += 1) { const offset = index * 4, value = (0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2]) / 255; luminance[index] = value; sum += value; }
  const brightness = sum / luminance.length; let variance = 0, laplacian = 0;
  for (let y = 1; y < sample.height - 1; y += 1) for (let x = 1; x < sample.width - 1; x += 1) { const index = y * sample.width + x, delta = luminance[index] - brightness; variance += delta * delta; laplacian += Math.abs(4 * luminance[index] - luminance[index - 1] - luminance[index + 1] - luminance[index - sample.width] - luminance[index + sample.width]); }
  const contrast = Math.min(1, Math.sqrt(variance / luminance.length) * 4), sharpness = Math.min(1, laplacian / ((sample.width - 2) * (sample.height - 2)) * 5), warnings: string[] = [];
  if (brightness < 0.18) warnings.push("Image is too dark."); if (brightness > 0.92) warnings.push("Image is overexposed."); if (sharpness < 0.08) warnings.push("Image appears blurry."); if (contrast < 0.12) warnings.push("Image contrast is too low.");
  const insufficient = brightness < 0.12 || brightness > 0.97 || sharpness < 0.035 || contrast < 0.06;
  return { brightness: Number(brightness.toFixed(3)), sharpness: Number(sharpness.toFixed(3)), contrast: Number(contrast.toFixed(3)), rotation: 0, warnings, status: insufficient ? "INSUFFICIENT" : warnings.length ? "REVIEW" : "GOOD" };
}

function nonMaximumSuppression(detections: HealthDetection[]) { const accepted: HealthDetection[] = []; for (const detection of detections.sort((a, b) => b.confidence - a.confidence)) { if (!accepted.some((item) => item.className === detection.className && intersectionOverUnion(item.box, detection.box) > 0.5)) accepted.push(detection); } return accepted.slice(0, 100); }

let inferenceInFlight: ReturnType<typeof runInference> | null = null;

async function runInference(dataUrl: string): Promise<{ detections: HealthDetection[]; quality: ImageQualityInput }> {
  const source = await loadCapture(dataUrl), qualityBase = inspectQuality(source), scale = Math.min(INPUT_SIZE / source.width, INPUT_SIZE / source.height);
  const resizedWidth = Math.round(source.width * scale), resizedHeight = Math.round(source.height * scale), padX = Math.round((INPUT_SIZE - resizedWidth) / 2 - 0.1), padY = Math.round((INPUT_SIZE - resizedHeight) / 2 - 0.1);
  const canvas = document.createElement("canvas"); canvas.width = INPUT_SIZE; canvas.height = INPUT_SIZE; const context = canvas.getContext("2d", { willReadFrequently: true }); if (!context) throw new Error("2D canvas context is unavailable.");
  context.fillStyle = "rgb(114,114,114)"; context.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE); context.drawImage(source, padX, padY, resizedWidth, resizedHeight);
  const rgba = context.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data, input = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE), plane = INPUT_SIZE * INPUT_SIZE;
  for (let index = 0; index < plane; index += 1) { input[index] = rgba[index * 4] / 255; input[plane + index] = rgba[index * 4 + 1] / 255; input[plane * 2 + index] = rgba[index * 4 + 2] / 255; }
  const ort = await import("onnxruntime-web"), session = await getSession(), output = (await withTimeout(
    session.run({ [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, INPUT_SIZE, INPUT_SIZE]) }),
    INFERENCE_TIMEOUT_MS,
    "Analysis timed out. Please try again."
  ))[session.outputNames[0]], values = output.data as Float32Array;
  const channels = 4 + HEALTH_MODEL_CLASSES.length, candidates = values.length / channels, detections: HealthDetection[] = [];
  for (let candidate = 0; candidate < candidates; candidate += 1) { let bestClass = 0, confidence = 0; for (let classIndex = 0; classIndex < HEALTH_MODEL_CLASSES.length; classIndex += 1) { const value = values[(4 + classIndex) * candidates + candidate]; if (value > confidence) { confidence = value; bestClass = classIndex; } } if (confidence < CONFIDENCE_THRESHOLD) continue;
    const centerX = values[candidate], centerY = values[candidates + candidate], width = values[candidates * 2 + candidate], height = values[candidates * 3 + candidate], x = Math.max(0, (centerX - width / 2 - padX) / scale), y = Math.max(0, (centerY - height / 2 - padY) / scale);
    detections.push({ className: HEALTH_MODEL_CLASSES[bestClass] as HealthClass, confidence: Number(confidence.toFixed(4)), box: { x: x / source.width, y: y / source.height, width: Math.max(0.001, Math.min(source.width - x, width / scale) / source.width), height: Math.max(0.001, Math.min(source.height - y, height / scale) / source.height) } }); }
  const selected = nonMaximumSuppression(detections), subjectCoverage = Math.min(1, selected.reduce((maximum, item) => Math.max(maximum, item.box.width * item.box.height), 0));
  return { detections: selected, quality: { ...qualityBase, subjectCoverage: Number(subjectCoverage.toFixed(3)) } };
}

export async function analyzeHealthCapture(dataUrl: string): Promise<{ detections: HealthDetection[]; quality: ImageQualityInput }> {
  if (inferenceInFlight) return inferenceInFlight;
  inferenceInFlight = runInference(dataUrl).finally(() => { inferenceInFlight = null; });
  return inferenceInFlight;
}
