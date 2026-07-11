/* Copies the onnxruntime-web WASM runtime into public/ort/ so the capture-quality
   classifier can load it same-origin (ort.env.wasm.wasmPaths = "/ort/"). Runs on
   postinstall; exits quietly if the package is absent. */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "onnxruntime-web", "dist");
const destination = join(root, "public", "ort");
const assets = [
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.jsep.wasm",
  "ort-wasm-simd-threaded.jsep.mjs",
];

if (!existsSync(source)) {
  console.log("copy-ort-wasm: onnxruntime-web not installed, skipping.");
  process.exit(0);
}
mkdirSync(destination, { recursive: true });
for (const asset of assets) {
  const from = join(source, asset);
  if (existsSync(from)) {
    copyFileSync(from, join(destination, asset));
    console.log(`copy-ort-wasm: ${asset} -> public/ort/`);
  }
}
