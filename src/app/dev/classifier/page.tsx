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
  context.fillStyle = "#c99a72";
  context.fillRect(0, 0, 900, 900);
  context.strokeStyle = "#2a1d12";
  context.lineWidth = 3;
  let seed = 42;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let index = 0; index < 700; index += 1) {
    const x = random() * 900, y = random() * 900;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + random() * 40 - 20, y + 30, x + random() * 20 - 10, y + 70);
    context.stroke();
  }
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
