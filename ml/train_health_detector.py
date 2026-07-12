#!/usr/bin/env python3
"""Reproduce the CrownScore YOLOv8n visible-health training run."""
from pathlib import Path
import torch
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[1]
if not torch.backends.mps.is_available():
    raise SystemExit("MPS is required for the recorded production run.")

YOLO("yolov8n.pt").train(
    data=str(ROOT / "ml/data/hair-health-yolo/data.yaml"),
    epochs=50,
    patience=10,
    imgsz=640,
    batch=8,
    device="mps",
    workers=2,
    seed=42,
    deterministic=True,
    pretrained=True,
    cache=False,
    plots=True,
    project=str(ROOT / "ml/checkpoints/hair-health"),
    name="yolov8n",
)
