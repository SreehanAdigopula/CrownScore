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
- Firebase persistence requires project credentials; local guest records remain
  browser-specific.
