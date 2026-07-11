# Architecture

## Analysis pipeline

```text
Camera capture
-> browser crop and compression
-> authenticated upload
-> request validation
-> relative density score
-> baseline normalization
-> expected-curve interpolation
-> trend classification
-> deterministic safety evaluation
-> coach wording with mock fallback
-> persistence and audit event
```

Route handlers parse and validate. Services orchestrate workflows. Repositories own Firestore access. Pure analysis functions have no React, Firebase, Next.js, or LLM dependencies.

## Runtime modes

The product UI starts empty and reads only real local/Firebase check-ins. Synthetic demo fixtures are isolated under internal demo routes. Firebase client initialization occurs only when public configuration exists. Firebase Admin is lazy and used only from server modules. Groq is optional.

## Data model

```text
users/{uid}
users/{uid}/preferences/default
users/{uid}/checkIns/{checkInId}
users/{uid}/checkIns/{checkInId}/analysis/result
users/{uid}/checkIns/{checkInId}/coachSummary/result
users/{uid}/auditEvents/{eventId}
referenceCurves/{treatmentType}
demoScenarios/{scenarioId}
```

Expected curves currently live in versioned TypeScript constants and can be copied to Firestore later.

## Safety boundary

The LLM receives structured measurements and a completed safety status. It cannot select processing steps, change data, classify safety, or recommend medication. Elevated results use fixed user-facing guidance even if the model is unavailable.
