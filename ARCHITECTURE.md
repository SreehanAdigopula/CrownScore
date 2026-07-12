# Architecture

## Analysis pipeline

```text
Guide-aligned camera capture (not mirrored)
-> deterministic image-quality checks
-> browser ONNX YOLOv8n inference with letterbox preprocessing
-> class-aware non-maximum suppression
-> validated detection/quality API payload
-> deterministic 0–100 visible-health score
-> fixed symptom/quality safety review
-> non-diagnostic coach wording
-> authenticated Neon Postgres persistence
```

The displayed score is derived only from the current health detector outputs.
Gray hair has zero weight, duplicate overlapping boxes are removed, and the
low-hair-density class is capped so it cannot dominate the score.

## Safety boundary

The LLM receives a completed score, visible-concern labels, and fixed safety
status. It cannot change detections, scoring, image quality, or safety rules.
CrownScore reports possible visible concerns and never a medical diagnosis.

## Identity and persistence

Neon Auth owns credentials and sessions. Protected App Router routes resolve the
session server-side; every Drizzle query scopes rows to that session's user ID.
The product stores profiles, onboarding/preferences, questionnaire context,
derived analysis, safety output, and coach output in Neon Postgres.

Existing `localStorage` records are imported once after sign-in. The import uses
`(user_id, check_in_id)` as an idempotency key, so retries cannot duplicate a
check-in. Neon is the source of truth afterward; local records and thumbnails
are only a resilient cache. Raw camera captures never leave the browser.
