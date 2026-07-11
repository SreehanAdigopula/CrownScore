#!/usr/bin/env python3
"""Prepare a labeled dataset for the crown/scalp capture-quality classifier.

Two modes:

1. Real datasets (the path used for the production model):
   python prepare_dataset.py \
       --figaro-images path/to/Figaro1k/Original \
       --figaro-masks  path/to/Figaro1k/GT \
       --negatives     path/to/non_hair_images \
       --output data/prepared

   Positives are images whose hair mask covers enough of the central region
   (i.e. a usable, roughly centered hair/scalp photo). Negatives combine the
   provided non-hair images with corrupted positives (heavy blur, extreme
   exposure, off-center crops) so the model learns to reject bad captures,
   not just non-scalp content.

2. Synthetic mode (smoke tests / dev placeholder model — NOT the real model):
   python prepare_dataset.py --synthetic 400 --output data/synthetic

Output layout (consumed by train.py via torchvision ImageFolder):
   <output>/{train,val,test}/{valid,invalid}/*.jpg  +  manifest.csv
"""
from __future__ import annotations

import argparse
import csv
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

IMAGE_SIZE = 256
SPLITS = (("train", 0.70), ("val", 0.15), ("test", 0.15))
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def list_images(directory: Path) -> list[Path]:
    return sorted(p for p in directory.rglob("*") if p.suffix.lower() in IMAGE_EXTENSIONS)


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def resize(image: Image.Image) -> Image.Image:
    image = image.copy()
    image.thumbnail((IMAGE_SIZE * 2, IMAGE_SIZE * 2))
    return image.resize((IMAGE_SIZE, IMAGE_SIZE))


def central_mask_coverage(mask: Image.Image) -> float:
    """Fraction of the central 60% box covered by the (binary) hair mask."""
    gray = np.asarray(mask.convert("L"), dtype=np.float32) / 255.0
    height, width = gray.shape
    top, bottom = int(height * 0.2), int(height * 0.8)
    left, right = int(width * 0.2), int(width * 0.8)
    center = gray[top:bottom, left:right]
    return float((center > 0.5).mean())


def find_mask(mask_dir: Path, image_path: Path) -> Path | None:
    for extension in (".pbm", ".png", ".jpg", ".bmp"):
        for candidate in mask_dir.rglob(image_path.stem + "*" + extension):
            return candidate
    return None


# ── Corruption transforms: turn a valid capture into a realistic bad capture ──

def corrupt_blur(image: Image.Image, rng: random.Random) -> Image.Image:
    return image.filter(ImageFilter.GaussianBlur(radius=rng.uniform(8, 16)))


def corrupt_exposure(image: Image.Image, rng: random.Random) -> Image.Image:
    factor = rng.choice([rng.uniform(0.05, 0.2), rng.uniform(2.6, 4.0)])
    return ImageEnhance.Brightness(image).enhance(factor)


def corrupt_offcenter(image: Image.Image, rng: random.Random) -> Image.Image:
    width, height = image.size
    crop = int(min(width, height) * 0.35)
    corner = rng.choice([(0, 0), (width - crop, 0), (0, height - crop), (width - crop, height - crop)])
    return image.crop((corner[0], corner[1], corner[0] + crop, corner[1] + crop)).resize((width, height))


CORRUPTIONS = [corrupt_blur, corrupt_exposure, corrupt_offcenter]


# ── Synthetic generation (smoke tests / dev placeholder only) ─────────────────

SKIN_TONES = [(201, 154, 114), (224, 172, 135), (168, 117, 82), (141, 92, 60), (98, 66, 45)]
HAIR_COLORS = [(42, 29, 18), (20, 16, 12), (74, 48, 26), (105, 84, 60), (60, 60, 64)]

# Mirrors the app's capture path (src/features/check-ins/score-capture.ts): captures are
# 900x900 and the classifier sees the guide-region crop. Synthetic training samples must go
# through the same crop so the training distribution matches inference.
CAPTURE_SIZE = 900
GUIDE_CROP = (0.31, 0.28, 0.38, 0.30)  # x, y, width, height fractions


def crop_guide_region(image: Image.Image) -> Image.Image:
    left = int(CAPTURE_SIZE * GUIDE_CROP[0])
    top = int(CAPTURE_SIZE * GUIDE_CROP[1])
    width = int(CAPTURE_SIZE * GUIDE_CROP[2])
    height = int(CAPTURE_SIZE * GUIDE_CROP[3])
    return image.crop((left, top, left + width, top + height)).resize((IMAGE_SIZE, IMAGE_SIZE))


def synth_valid(rng: random.Random) -> Image.Image:
    image = Image.new("RGB", (CAPTURE_SIZE, CAPTURE_SIZE), rng.choice(SKIN_TONES))
    draw = ImageDraw.Draw(image)
    hair = rng.choice(HAIR_COLORS)
    for _ in range(rng.randint(350, 1400)):
        x, y = rng.uniform(0, CAPTURE_SIZE), rng.uniform(0, CAPTURE_SIZE)
        angle = rng.uniform(0, math.tau)
        length = rng.uniform(40, 90)
        mid = (x + math.cos(angle) * length / 2 + rng.uniform(-15, 15), y + math.sin(angle) * length / 2)
        end = (x + math.cos(angle) * length, y + math.sin(angle) * length)
        draw.line([(x, y), mid, end], fill=hair, width=rng.randint(2, 4))
    image = crop_guide_region(image)
    noise = np.asarray(image, dtype=np.int16) + np.random.default_rng(rng.randint(0, 10**6)).integers(-6, 7, (IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.int16)
    image = Image.fromarray(np.clip(noise, 0, 255).astype(np.uint8))
    return image.filter(ImageFilter.GaussianBlur(radius=rng.uniform(0.2, 0.7)))


def synth_invalid(rng: random.Random) -> Image.Image:
    kind = rng.choice(["solid", "noise", "gradient", "shapes", "corrupted"])
    if kind == "corrupted":
        return rng.choice(CORRUPTIONS)(synth_valid(rng), rng)
    if kind == "solid":
        return Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), tuple(rng.randint(0, 255) for _ in range(3)))
    if kind == "noise":
        data = np.random.default_rng(rng.randint(0, 10**6)).integers(0, 256, (IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.uint8)
        return Image.fromarray(data)
    if kind == "gradient":
        ramp = np.linspace(0, 255, IMAGE_SIZE, dtype=np.uint8)
        channel = np.tile(ramp, (IMAGE_SIZE, 1))
        stack = np.stack([np.roll(channel, rng.randint(0, IMAGE_SIZE)) for _ in range(3)], axis=-1)
        return Image.fromarray(stack)
    image = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), tuple(rng.randint(120, 255) for _ in range(3)))
    draw = ImageDraw.Draw(image)
    for _ in range(rng.randint(4, 14)):
        box = sorted(rng.sample(range(IMAGE_SIZE), 2)), sorted(rng.sample(range(IMAGE_SIZE), 2))
        color = tuple(rng.randint(0, 255) for _ in range(3))
        draw.rectangle([box[0][0], box[1][0], box[0][1], box[1][1]], fill=color)
    return image


# ── Assembly ──────────────────────────────────────────────────────────────────

def collect_real(args: argparse.Namespace, rng: random.Random) -> tuple[list[Image.Image], list[Image.Image]]:
    valid: list[Image.Image] = []
    invalid: list[Image.Image] = []
    for images_arg, masks_arg in ((args.figaro_images, args.figaro_masks), (args.celeba_images, args.celeba_masks)):
        if not images_arg:
            continue
        images_dir, masks_dir = Path(images_arg), Path(masks_arg)
        for image_path in list_images(images_dir):
            mask_path = find_mask(masks_dir, image_path)
            if mask_path is None:
                continue
            image = resize(load_rgb(image_path))
            if central_mask_coverage(Image.open(mask_path)) >= args.min_coverage:
                valid.append(image)
    if args.negatives:
        for image_path in list_images(Path(args.negatives)):
            invalid.append(resize(load_rgb(image_path)))
    for source in rng.sample(valid, k=min(len(valid), max(1, len(valid) // 2))):
        invalid.append(rng.choice(CORRUPTIONS)(source, rng))
    return valid, invalid


def collect_synthetic(count: int, rng: random.Random) -> tuple[list[Image.Image], list[Image.Image]]:
    return [synth_valid(rng) for _ in range(count)], [synth_invalid(rng) for _ in range(count)]


def write_split(output: Path, label: str, images: list[Image.Image], rng: random.Random, manifest: list[tuple[str, str, str]]) -> None:
    rng.shuffle(images)
    cursor = 0
    for split_name, fraction in SPLITS:
        take = len(images) - cursor if split_name == SPLITS[-1][0] else max(1, round(len(images) * fraction))
        for index, image in enumerate(images[cursor:cursor + take]):
            destination = output / split_name / label / f"{label}_{cursor + index:05d}.jpg"
            destination.parent.mkdir(parents=True, exist_ok=True)
            image.save(destination, quality=90)
            manifest.append((split_name, label, str(destination)))
        cursor += take


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--figaro-images")
    parser.add_argument("--figaro-masks")
    parser.add_argument("--celeba-images")
    parser.add_argument("--celeba-masks")
    parser.add_argument("--negatives")
    parser.add_argument("--synthetic", type=int, default=0, help="Generate N synthetic samples per class instead of using real datasets")
    parser.add_argument("--min-coverage", type=float, default=0.12, help="Minimum central hair-mask coverage for a positive")
    parser.add_argument("--output", required=True)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    if args.synthetic:
        valid, invalid = collect_synthetic(args.synthetic, rng)
    else:
        if not (args.figaro_images and args.figaro_masks):
            parser.error("Provide --figaro-images/--figaro-masks (and optionally --celeba-*, --negatives), or use --synthetic N")
        valid, invalid = collect_real(args, rng)

    if len(valid) < 10 or len(invalid) < 10:
        raise SystemExit(f"Not enough samples (valid={len(valid)}, invalid={len(invalid)}); need at least 10 per class.")

    output = Path(args.output)
    manifest: list[tuple[str, str, str]] = []
    write_split(output, "valid", valid, rng, manifest)
    write_split(output, "invalid", invalid, rng, manifest)
    with open(output / "manifest.csv", "w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["split", "label", "path"])
        writer.writerows(manifest)
    print(f"Wrote {len(manifest)} images to {output} (valid={len(valid)}, invalid={len(invalid)})")


if __name__ == "__main__":
    main()
