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

## Production model (verified 2026-07-11)

The deployed model was transfer-trained on real Figaro1k photographs, using
their hair masks to select guide-centered positives and to generate matched
blur, exposure, and off-center negatives. Credit: the
[Figaro1k project](http://projects.i-ctm.eu/it/progetto/figaro-1k) and its
original authors. Its research dataset is **not included or distributed by
this repository**. Only the trained ONNX artifact is deployed.

This is a capture-quality classifier, not a medical device. The held-out
results below measure Figaro-derived guide crops and synthetic corruptions,
not arbitrary phone photos, clinical accuracy, demographic fairness, or
general real-world accuracy. No external non-hair photo set was available for
this run, so wrong-subject generalization remains a known limitation.

## Reproduce the verified real-data run (Apple silicon)

1. Obtain Figaro1k from its official project and accept its license. Place the
   extracted data locally under `ml/datasets/Figaro1k/` with `Original/` and
   `GT/` trees. `ml/datasets/`, prepared data, checkpoints, virtualenvs, and
   intermediate ONNX exports are Git-ignored.
2. From the repository root, run:

   ```bash
   python3.12 -m venv ml/.venv
   ml/.venv/bin/python -m pip install -r ml/requirements.txt
   ml/.venv/bin/python ml/prepare_dataset.py \
       --figaro-images ml/datasets/Figaro1k/Original \
       --figaro-masks ml/datasets/Figaro1k/GT \
       --output ml/data/prepared-deduplicated --seed 42
   PYTORCH_ENABLE_MPS_FALLBACK=1 ml/.venv/bin/python ml/train.py \
       --data-dir ml/data/prepared-deduplicated --epochs 20 \
       --batch-size 32 --lr 3e-4 --num-workers 2 \
       --output-dir ml/checkpoints/final --seed 42
   ml/.venv/bin/python ml/export_onnx.py \
       --checkpoint ml/checkpoints/final/best.pt \
       --output ml/crown-classifier-final.onnx --opset 17
   ```

3. After parity and sanity checks pass, back up and replace the browser model:

   ```bash
   cp public/models/crown-classifier.onnx ml/checkpoints/production-backup.onnx
   cp ml/crown-classifier-final.onnx public/models/crown-classifier.onnx
   ```

PyTorch selects MPS when available, CUDA otherwise, and CPU only as a final
fallback. The verified run used Python 3.12.13, torch 2.13.0, torchvision
0.28.0, ONNX 1.22.0, ONNX Runtime 1.27.0, Pillow 12.3.0, and NumPy 2.5.1.

### Verified run record

- Hardware/device: Apple M5 MacBook Air, `mps` active (`is_built=True`,
  `is_available=True`); batch 32, learning rate 3e-4, seed 42.
- Source audit: 1,050 images, 1,064 mask files, 1,049 unique paired images;
  one exact duplicate photograph excluded, 14 duplicate mask copies ignored,
  zero missing/unmatched/unreadable pairs, zero image-mask dimension
  mismatches, and 17 low-guide-coverage pairs rejected.
- Prepared balance: train 722 valid + 722 invalid; validation 155 + 155;
  test 155 + 155. Each negative corruption stays in its source split.
- Training: 13 epochs completed in 327.3 seconds; early stopping selected epoch
  8 (validation F1 0.9747).
- Held-out test (310 Figaro-derived examples): accuracy 0.9452, precision
  0.9107, recall 0.9871, F1 0.9474; confusion matrix `[[140, 15], [2, 153]]`
  in `[invalid, valid]` row/column order.
- ONNX: opset 17, 6,091,822 bytes (5.81 MiB), normalization and softmax baked
  in, output order `[invalid, valid]`; maximum PyTorch/ORT absolute difference
  2.03e-6.

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
