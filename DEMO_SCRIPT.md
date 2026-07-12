# CrownScore demo script (judges / video)

Target length: **2–5 minutes**. Prefer a live demo or screen recording with voiceover. Use a fresh test account or delete CrownScore data in Settings first so the empty state is honest.

## 30-second pitch

> People tracking hair routines guess from uneven selfies. CrownScore guides one consistent photo, runs YOLOv8n on-device, scores visible concerns from 0–100, applies fixed safety rules, then explains the result — without claiming a diagnosis.

## Recommended click path

1. **Landing (`/`)** — Pause on the CrownScore brand, score orb, and “under the hood” section (on-device vision, deterministic scoring, safety before AI).
2. **Get started → Account → Onboarding** — Create a Neon Auth account, then pick a routine, rhythm, and coach tone.
3. **Empty dashboard (`/dashboard`)** — Show first-run emptiness (no fake seed data).
4. **Check-in (`/check-in/capture`)** — Allow camera, align crown in the guide, capture.
5. **Questionnaire** — Optional context; call out that it never overrides image quality.
6. **Analyzing** — Call out stage labels: quality → YOLO → NMS → score → summary.
7. **Result** — Score orb, concerns, confidence/uncertainty, safety strip, coach summary.
8. **Dashboard / History / Coach** — Show the same check-in reflected across the product.
9. **Settings** — Privacy + “not a diagnosis” boundary; optional theme toggle.

## What to emphasize verbally

- **Technical:** browser ONNX inference; score is not “whatever the LLM invents.”
- **Safety:** fixed rules sit above the coach; AI cannot rewrite scores.
- **Honesty:** educational tool; dataset limitations exist (see KNOWN_LIMITATIONS.md).
- **Completeness:** empty states are intentional; data appears only after a usable capture.
- **Persistence:** derived results sync through Neon; raw photos stay on-device and are not retained.

## Optional / avoid

- `/demo` and `/api/demo/*` are **internal fixtures** — do not present them as the product unless judges ask about testing.
- Do not promise clinical accuracy or treatment effectiveness.

## Internal QA checklist (not for the video)

1. Fresh profile → empty dashboard / history / progress / coach.
2. First usable check-in saves and appears in history.
3. Progress chart needs a second check-in.
4. Coach copy matches the latest saved result.
5. Camera denied / unsupported states offer recovery paths.
