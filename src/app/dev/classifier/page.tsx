"use client";
/* Dev tool: exercises the ONNX capture-quality classifier on synthetic images so the
   model can be verified (and demoed) without a live camera. Not linked from the app. */

import { useEffect, useState } from "react";
import { classifyCapture, type CaptureQualityResult } from "@/features/check-ins/capture-quality-classifier";

function makeCanvas(draw: (context: CanvasRenderingContext2D) => void): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900; canvas.height = 900;
  const context = canvas.getContext("2d")!;
  draw(context);
  return canvas.toDataURL("image/webp", 0.8);
}

function drawScalp(context: CanvasRenderingContext2D) {
  // Deterministic, high-frequency brown texture approximating a close hair crop.
  // This is only a browser wiring fixture; accuracy is measured on held-out data.
  let seed = 42;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const pixels = context.createImageData(900, 900);
  for (let index = 0; index < pixels.data.length; index += 4) {
    pixels.data[index] = 80 + (random() - 0.5) * 140;
    pixels.data[index + 1] = 55 + (random() - 0.5) * 140;
    pixels.data[index + 2] = 35 + (random() - 0.5) * 140;
    pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
}

function drawInvalid(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, 900, 900);
  gradient.addColorStop(0, "#1d4ed8");
  gradient.addColorStop(1, "#f97316");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 900, 900);
}

type Row = { label: string; result: CaptureQualityResult };

export default function ClassifierDevPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    const run = async () => {
      const started = performance.now();
      const scalp = await classifyCapture(makeCanvas(drawScalp));
      const invalid = await classifyCapture(makeCanvas(drawInvalid));
      setElapsedMs(Math.round(performance.now() - started));
      setRows([{ label: "Synthetic scalp (should accept)", result: scalp }, { label: "Gradient / no hair (should reject)", result: invalid }]);
    };
    void run();
  }, []);
  return (
    <main className="mx-auto max-w-xl p-8 font-mono text-sm">
      <h1 className="text-lg font-bold">Capture-quality classifier — dev check</h1>
      {!rows ? <p className="mt-4">Running inference…</p> : (
        <div className="mt-4 space-y-3" data-testid="classifier-results">
          {rows.map(({ label, result }) => (
            <div key={label} className="rounded-lg border border-border p-3">
              <div>{label}</div>
              <div data-verdict={result.modelAvailable ? (result.isValidCapture ? "accept" : "reject") : "model-unavailable"}>
                model: {result.modelAvailable ? "loaded" : "UNAVAILABLE (gate skipped)"} · verdict: {result.isValidCapture ? "ACCEPT" : "REJECT"} · confidence: {result.confidence}
              </div>
            </div>
          ))}
          <p className="text-muted-foreground">Total inference time: {elapsedMs}ms (includes WASM + model load on first run)</p>
        </div>
      )}
    </main>
  );
}
