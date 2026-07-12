# Known limitations

- The training export is small and highly imbalanced. Several rare classes
  cannot receive reliable split-specific metrics.
- The supplied dataset has no explicit healthy/control or irrelevant-image
  class. A lack of detections is therefore not proof of health, and deterministic
  quality heuristics cannot reliably reject every wrong-subject photograph.
- Labels describe visible patterns from a community dataset, not confirmed
  clinical diagnoses. Dataset provenance and annotation consistency limit
  real-world and demographic generalization.
- Camera quality checks cover brightness, contrast, and sharpness. They do not
  provide full head-pose estimation or clinical image validation.
- Browser inference is privacy-friendly but client-controlled. A higher-assurance
  deployment should repeat model inference in a trusted service.
- Neon Auth is currently a beta service. Account and derived-result sync require
  network access; the last successful browser cache remains readable during
  temporary failures, but new check-ins must reach Neon to be considered saved.
- The current official Neon Auth SDK pins Better Auth 1.4.x. `npm audit` flags
  upstream advisories in OAuth/OIDC/organization plugins that CrownScore does not
  enable. Neon Auth's current UI dependency is not compatible with the patched
  Better Auth 1.6.x line, so this must be upgraded when Neon publishes a
  compatible SDK release.
- Raw captures are intentionally not retained in cloud storage. Photo comparison
  thumbnails are browser-local and may be unavailable on another device.
