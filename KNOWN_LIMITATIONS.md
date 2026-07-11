# Known limitations

- Expected treatment curves are educational demo approximations, not medical predictions.
- The OpenCV.js scorer estimates visible dark-pixel coverage after a guided crop. Hair color, scalp color, lighting, and styling can affect it.
- Browser measurements are hints. A production deployment should repeat or validate scoring in a trusted worker.
- Demo photos use a generated, non-clinical hero asset rather than a longitudinal synthetic scalp set.
- Firebase upload orchestration and thumbnail generation are represented by secure adapters and rules, but require project credentials to exercise live.
- In-memory and local demo data are intentionally deterministic and are not a substitute for Firestore persistence.
- Camera quality labels currently reflect implemented lighting, sharpness, and alignment heuristics. There is no claim of precise head tracking.
- No ONNX model is included. It should only be considered after the OpenCV workflow is validated on consented data.
