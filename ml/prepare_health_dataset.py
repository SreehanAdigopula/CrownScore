#!/usr/bin/env python3
"""Convert the supplied Roboflow COCO export to YOLO detection format.

The COCO category metadata is authoritative because this export does not ship
the data.yaml mentioned in the original task. Existing train/valid/test split
membership is preserved exactly and source images are never modified.
"""
from __future__ import annotations

import argparse
import json
import os
from collections import Counter
from pathlib import Path

import yaml


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    split_map = {"train": "train", "valid": "val", "test": "test"}
    canonical_categories: list[dict] | None = None
    audit: dict[str, object] = {"source": str(args.source.resolve()), "format": "COCO", "splits": {}}

    for source_split, yolo_split in split_map.items():
        source_dir = args.source / source_split
        payload = json.loads((source_dir / "_annotations.coco.json").read_text())
        categories = [item for item in payload["categories"] if item["id"] != 0]
        if canonical_categories is None:
            canonical_categories = categories
        elif [(c["id"], c["name"]) for c in categories] != [(c["id"], c["name"]) for c in canonical_categories]:
            raise SystemExit(f"Category metadata differs in {source_split}")
        category_to_index = {item["id"]: index for index, item in enumerate(categories)}
        images = {item["id"]: item for item in payload["images"]}
        annotations: dict[int, list[str]] = {image_id: [] for image_id in images}
        counts: Counter[str] = Counter()
        clamped = 0
        for annotation in payload["annotations"]:
            image = images[annotation["image_id"]]
            width, height = image["width"], image["height"]
            x, y, box_width, box_height = annotation["bbox"]
            x1, y1 = max(0.0, x), max(0.0, y)
            x2, y2 = min(float(width), x + box_width), min(float(height), y + box_height)
            if (x1, y1, x2, y2) != (x, y, x + box_width, y + box_height):
                clamped += 1
            if x2 <= x1 or y2 <= y1:
                raise SystemExit(f"Invalid box {annotation['id']} in {source_split}")
            class_index = category_to_index[annotation["category_id"]]
            annotations[annotation["image_id"]].append(
                f"{class_index} {((x1 + x2) / 2) / width:.8f} {((y1 + y2) / 2) / height:.8f} "
                f"{(x2 - x1) / width:.8f} {(y2 - y1) / height:.8f}"
            )
            counts[categories[class_index]["name"]] += 1

        image_dir = args.output / "images" / yolo_split
        label_dir = args.output / "labels" / yolo_split
        image_dir.mkdir(parents=True, exist_ok=True)
        label_dir.mkdir(parents=True, exist_ok=True)
        for image_id, image in images.items():
            source_image = (source_dir / image["file_name"]).resolve()
            destination = image_dir / image["file_name"]
            if not destination.exists():
                os.symlink(source_image, destination)
            (label_dir / f"{Path(image['file_name']).stem}.txt").write_text("\n".join(annotations[image_id]) + "\n")
        audit["splits"][yolo_split] = {
            "images": len(images), "annotations": len(payload["annotations"]),
            "boxes_per_class": dict(counts), "clamped_boxes": clamped,
        }

    assert canonical_categories is not None
    names = [item["name"] for item in canonical_categories]
    data = {
        "path": str(args.output.resolve()),
        "train": "images/train", "val": "images/val", "test": "images/test",
        "names": {index: name for index, name in enumerate(names)},
        "source_format": "COCO; names derived from _annotations.coco.json",
    }
    (args.output / "data.yaml").write_text(yaml.safe_dump(data, sort_keys=False))
    audit["classes"] = names
    audit["data_yaml"] = str((args.output / "data.yaml").resolve())
    (args.output / "audit.json").write_text(json.dumps(audit, indent=2))
    print(json.dumps(audit, indent=2))


if __name__ == "__main__":
    main()
