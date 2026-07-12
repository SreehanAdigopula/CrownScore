# Visible hair/scalp health detector

CrownScore uses a YOLOv8n object detector trained on the local Roboflow COCO
export under `ml/datasets/Figaro1k/hair scalp analysis -Forked on
7-12-2026.coco`. The source export contains COCO JSON rather than the YOLO
`data.yaml` originally expected. `prepare_health_dataset.py` derives YOLO labels
and class names directly from that metadata while preserving train/valid/test
membership.

The browser model is `public/models/hair-health-detector.onnx`. It produces
candidate boxes for nine visible classes. Gray hair is retained as a model
output but never penalized. Results are visual signals, not diagnoses.

```bash
ml/.venv/bin/python ml/prepare_health_dataset.py \
  --source "ml/datasets/Figaro1k/hair scalp analysis -Forked on 7-12-2026.coco" \
  --output ml/data/hair-health-yolo
```

Training configuration, metrics, plots, and export verification are stored
with the completed run artifacts. The test split must not be used during model
selection.
