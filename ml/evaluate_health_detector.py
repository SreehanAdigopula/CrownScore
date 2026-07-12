#!/usr/bin/env python3
"""Evaluate the selected checkpoint and save aggregate/per-class metrics."""
import argparse
import json
from pathlib import Path
from ultralytics import YOLO

parser = argparse.ArgumentParser()
parser.add_argument("--checkpoint", required=True)
parser.add_argument("--data", required=True)
parser.add_argument("--split", choices=["val", "test"], required=True)
parser.add_argument("--output", required=True)
args = parser.parse_args()
model = YOLO(args.checkpoint)
metrics = model.val(data=args.data, split=args.split, imgsz=640, batch=8, device="mps", workers=0, plots=True, project=str(Path(args.output).parent), name=f"evaluation-{args.split}", exist_ok=True)
names = metrics.names
per_class = {}
for index, class_index in enumerate(metrics.box.ap_class_index.tolist()):
    per_class[names[class_index]] = {
        "precision": float(metrics.box.p[index]), "recall": float(metrics.box.r[index]),
        "map50": float(metrics.box.ap50[index]), "map50_95": float(metrics.box.ap[index]),
    }
payload = {
    "split": args.split, "device": "mps",
    "aggregate": {"precision": float(metrics.box.mp), "recall": float(metrics.box.mr), "map50": float(metrics.box.map50), "map50_95": float(metrics.box.map)},
    "per_class": per_class,
}
Path(args.output).write_text(json.dumps(payload, indent=2))
print(json.dumps(payload, indent=2))
