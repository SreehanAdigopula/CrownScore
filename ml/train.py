#!/usr/bin/env python3
"""Train the crown/scalp capture-quality classifier via transfer learning.

MobileNetV3-Small (ImageNet-pretrained) with a 2-class head; the backbone is
frozen except the last few blocks. Chosen for its small footprint (~1.5MB fp32
head + backbone once exported) so the ONNX file stays browser-friendly.

Usage:
    python train.py --data-dir data/prepared --epochs 20
    python train.py --data-dir data/synthetic --epochs 4 --no-pretrained  # offline smoke test

Class convention (torchvision ImageFolder sorts alphabetically):
    index 0 = "invalid", index 1 = "valid"
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

IMG_SIZE = 224
CLASSES = ["invalid", "valid"]
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def build_model(pretrained: bool, unfreeze_blocks: int) -> nn.Module:
    weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v3_small(weights=weights)
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(CLASSES))
    for parameter in model.features.parameters():
        parameter.requires_grad = False
    for block in list(model.features)[-unfreeze_blocks:]:
        for parameter in block.parameters():
            parameter.requires_grad = True
    return model


def build_loaders(data_dir: Path, batch_size: int, num_workers: int) -> dict[str, DataLoader]:
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.6, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    eval_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
    loaders: dict[str, DataLoader] = {}
    for split in ("train", "val", "test"):
        dataset = datasets.ImageFolder(data_dir / split, transform=train_transform if split == "train" else eval_transform)
        if dataset.classes != CLASSES:
            raise SystemExit(f"Expected classes {CLASSES} in {data_dir / split}, found {dataset.classes}")
        loaders[split] = DataLoader(dataset, batch_size=batch_size, shuffle=split == "train", num_workers=num_workers)
    return loaders


@torch.no_grad()
def evaluate(model: nn.Module, loader: DataLoader, device: torch.device) -> dict[str, float]:
    model.eval()
    true_positive = false_positive = false_negative = correct = total = 0
    for inputs, targets in loader:
        inputs, targets = inputs.to(device), targets.to(device)
        predictions = model(inputs).argmax(dim=1)
        correct += int((predictions == targets).sum())
        total += targets.numel()
        true_positive += int(((predictions == 1) & (targets == 1)).sum())
        false_positive += int(((predictions == 1) & (targets == 0)).sum())
        false_negative += int(((predictions == 0) & (targets == 1)).sum())
    precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 0.0
    recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"accuracy": correct / max(total, 1), "precision": precision, "recall": recall, "f1": f1}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--data-dir", required=True)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--unfreeze-blocks", type=int, default=3)
    parser.add_argument("--patience", type=int, default=5, help="Early-stopping patience on validation F1")
    parser.add_argument("--num-workers", type=int, default=2)
    parser.add_argument("--output-dir", default=str(Path(__file__).parent / "checkpoints"))
    parser.add_argument("--no-pretrained", action="store_true", help="Skip ImageNet weights (offline smoke tests)")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Training on {device}")

    loaders = build_loaders(Path(args.data_dir), args.batch_size, args.num_workers)
    model = build_model(pretrained=not args.no_pretrained, unfreeze_blocks=args.unfreeze_blocks).to(device)
    optimizer = torch.optim.AdamW((p for p in model.parameters() if p.requires_grad), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    criterion = nn.CrossEntropyLoss()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    best_f1 = -1.0
    epochs_without_improvement = 0

    for epoch in range(1, args.epochs + 1):
        model.train()
        running_loss = 0.0
        for inputs, targets in loaders["train"]:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            loss = criterion(model(inputs), targets)
            loss.backward()
            optimizer.step()
            running_loss += float(loss) * targets.numel()
        scheduler.step()
        metrics = evaluate(model, loaders["val"], device)
        print(f"epoch {epoch:02d}  loss {running_loss / len(loaders['train'].dataset):.4f}  "
              f"val acc {metrics['accuracy']:.3f}  val f1 {metrics['f1']:.3f}")
        if metrics["f1"] > best_f1:
            best_f1 = metrics["f1"]
            epochs_without_improvement = 0
            torch.save({"state_dict": model.state_dict(), "classes": CLASSES, "img_size": IMG_SIZE, "val_metrics": metrics}, output_dir / "best.pt")
        else:
            epochs_without_improvement += 1
            if epochs_without_improvement >= args.patience:
                print(f"Early stopping after {epoch} epochs (no val F1 improvement in {args.patience}).")
                break

    checkpoint = torch.load(output_dir / "best.pt", map_location=device, weights_only=True)
    model.load_state_dict(checkpoint["state_dict"])
    test_metrics = evaluate(model, loaders["test"], device)
    print(f"TEST  acc {test_metrics['accuracy']:.3f}  precision {test_metrics['precision']:.3f}  "
          f"recall {test_metrics['recall']:.3f}  f1 {test_metrics['f1']:.3f}")
    with open(output_dir / "metrics.json", "w") as handle:
        json.dump({"val": checkpoint["val_metrics"], "test": test_metrics}, handle, indent=2)
    print(f"Best checkpoint: {output_dir / 'best.pt'}")


if __name__ == "__main__":
    main()
