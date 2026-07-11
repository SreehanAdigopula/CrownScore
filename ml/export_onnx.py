#!/usr/bin/env python3
"""Export the trained checkpoint to ONNX for onnxruntime-web.

Deployment contract (what the browser feeds and receives):
    input  "input":  float32 [N, 3, 224, 224], RGB scaled to [0, 1]
    output "probs":  float32 [N, 2], softmax probabilities [invalid, valid]

ImageNet normalization is baked into the exported graph so the client never
has to reproduce mean/std constants. A PyTorch-vs-ONNX-Runtime numerical
parity check runs before the export is declared good.

Usage:
    python export_onnx.py --checkpoint checkpoints/best.pt --output crown-classifier.onnx
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import onnxruntime
import torch
from torch import nn

from train import CLASSES, IMAGENET_MEAN, IMAGENET_STD, IMG_SIZE, build_model


class DeployModel(nn.Module):
    """Wraps the trained core with baked-in normalization + softmax."""

    def __init__(self, core: nn.Module) -> None:
        super().__init__()
        self.core = core
        self.register_buffer("mean", torch.tensor(IMAGENET_MEAN).view(1, 3, 1, 1))
        self.register_buffer("std", torch.tensor(IMAGENET_STD).view(1, 3, 1, 1))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.softmax(self.core((x - self.mean) / self.std), dim=1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--checkpoint", default=str(Path(__file__).parent / "checkpoints" / "best.pt"))
    parser.add_argument("--output", default=str(Path(__file__).parent / "crown-classifier.onnx"))
    parser.add_argument("--opset", type=int, default=17)
    args = parser.parse_args()

    checkpoint = torch.load(args.checkpoint, map_location="cpu", weights_only=True)
    if checkpoint.get("classes") != CLASSES:
        raise SystemExit(f"Checkpoint classes {checkpoint.get('classes')} do not match expected {CLASSES}")
    core = build_model(pretrained=False, unfreeze_blocks=0)
    core.load_state_dict(checkpoint["state_dict"])
    model = DeployModel(core).eval()

    sample = torch.rand(1, 3, IMG_SIZE, IMG_SIZE)
    torch.onnx.export(
        model, sample, args.output,
        input_names=["input"], output_names=["probs"],
        dynamic_axes={"input": {0: "batch"}, "probs": {0: "batch"}},
        opset_version=args.opset, dynamo=False,
    )

    session = onnxruntime.InferenceSession(args.output, providers=["CPUExecutionProvider"])
    batch = torch.rand(4, 3, IMG_SIZE, IMG_SIZE)
    with torch.no_grad():
        torch_probs = model(batch).numpy()
    onnx_probs = session.run(["probs"], {"input": batch.numpy()})[0]
    max_diff = float(np.abs(torch_probs - onnx_probs).max())
    if max_diff > 1e-4:
        raise SystemExit(f"Parity check FAILED: max |torch - onnx| = {max_diff:.6f}")

    size_kb = Path(args.output).stat().st_size / 1024
    print(f"Exported {args.output} ({size_kb:.0f} KB, opset {args.opset}); parity max diff {max_diff:.2e}")
    print(f"Val metrics at checkpoint: {checkpoint.get('val_metrics')}")
    print("Deploy: cp", args.output, "public/models/crown-classifier.onnx")


if __name__ == "__main__":
    main()
