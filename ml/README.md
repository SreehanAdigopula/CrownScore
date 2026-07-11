# Crown Capture-Quality Classifier

A binary image classifier that gates the CrownScore capture flow: **"is this a
usable scalp/crown photo?"** It rejects wrong-subject photos, heavy blur,
extreme exposure, and off-center framing *before* the density pipeline runs.
It is a capture-quality gate, **not** a diagnostic or hair-health model.

## Model contract

| | |
|---|---|
| Architecture | MobileNetV3-Small, ImageNet transfer learning, 2-class head |
| Input `input` | `float32 [N, 3, 224, 224]`, RGB scaled to `[0, 1]` (normalization is baked into the graph) |
| Output `probs` | `float32 [N, 2]` softmax — index 0 = `invalid`, index 1 = `valid` |
| Deployment | `public/models/crown-classifier.onnx`, run client-side via `onnxruntime-web` |

The app degrades gracefully: if the `.onnx` file is missing or the WASM runtime
fails, the capture flow simply skips the gate.

## ⚠️ About the dev placeholder model

The `crown-classifier.onnx` checked into `public/models/` (if present) was
trained **entirely on synthetic images** (procedurally drawn scalp/hair
textures vs. noise/solids/corruptions). It proves the in-browser pipeline and
rejects grossly wrong captures, but it has never seen a real photograph. Train
the real model on Figaro1k before making any accuracy claims.

## Training the real model (Google Colab, free T4 GPU, ~30 min)

1. **Get the datasets** (you must accept their research-use licenses yourself):
   - **Figaro1k** (~1,050 hair images + masks): http://projects.i-ctm.eu/it/progetto/figaro-1k
   - Optional extra positives: **CelebAMask-HQ** hair masks — https://github.com/switchablenorms/CelebAMask-HQ
   - Negatives: any folder of non-hair photos (e.g. a few hundred COCO images with no people).
2. Upload the dataset folders and this `ml/` directory to Google Drive, open a Colab notebook with a GPU runtime, then:

   ```bash
   from google.colab import drive; drive.mount('/content/drive')
   %cd /content/drive/MyDrive/crownscore-ml
   !pip install -r requirements.txt
   !python prepare_dataset.py \
       --figaro-images datasets/Figaro1k/Original \
       --figaro-masks  datasets/Figaro1k/GT \
       --negatives     datasets/negatives \
       --output data/prepared
   !python train.py --data-dir data/prepared --epochs 20
   !python export_onnx.py --checkpoint checkpoints/best.pt --output crown-classifier.onnx
   ```

3. Download `crown-classifier.onnx` and drop it into the app:

   ```bash
   cp crown-classifier.onnx <repo>/public/models/crown-classifier.onnx
   ```

That's it — no app code changes needed; the classifier loads whatever model is
at that path.

## Local smoke test (no GPU, no datasets, ~2 min)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python prepare_dataset.py --synthetic 200 --output data/synthetic
python train.py --data-dir data/synthetic --epochs 4
python export_onnx.py
```

## Files

- `prepare_dataset.py` — labels positives by central hair-mask coverage, builds
  negatives from non-hair images + corrupted positives (blur / exposure /
  off-center), 70/15/15 split. `--synthetic N` generates procedural data.
- `train.py` — transfer learning with frozen backbone (last 3 blocks unfrozen),
  early stopping on validation F1, test-set report to `checkpoints/metrics.json`.
- `export_onnx.py` — bakes normalization + softmax into the graph, exports
  opset 17, and verifies PyTorch↔ONNX-Runtime numerical parity before success.
