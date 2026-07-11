# Folliq

Folliq is a mobile-first hair-progress tracker built for consistent scalp check-ins. It compares each usable scan with the user's own baseline, shows change over time, applies deterministic safety rules, and uses an LLM only to phrase an educational summary.

Folliq is not a diagnostic product. Its score is a relative progress metric, not an absolute or clinically validated hair-density measurement.

## What works

- Premium responsive landing page with the React Bits `BlurText` component
- Anonymous Firebase session initialization with a local guest fallback
- Guided browser camera, crown alignment guide, countdown, retake, and permission fallback
- Short adherence and symptom questionnaire
- Replaceable OpenCV.js `DensityScorer` adapter
- Pure TypeScript baseline normalization, expected-curve interpolation, confidence, and trend logic
- Deterministic safety engine that the AI cannot override
- Groq provider with timeout, Zod validation, and automatic mock fallback
- Four deterministic demo scenarios
- Dashboard, charts, history, progress comparison, coach, privacy settings, and result flow
- Strict Firestore and Storage rules
- Unit tests for the backend-critical logic

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. With no Firebase or Groq values, the complete seeded demo remains available. Camera access requires `localhost` or HTTPS.

## Firebase setup

1. Create a Firebase project and web app.
2. Enable Anonymous Authentication.
3. Create Firestore and Storage.
4. Copy the web configuration and Admin service-account values into `.env.local`.
5. Deploy `firestore.rules` and `storage.rules` with the Firebase CLI.

`FIREBASE_PRIVATE_KEY` accepts escaped newlines. The Admin helper converts `\\n` to real line breaks at runtime. Admin clients are initialized lazily so builds do not require credentials.

## Groq

Set `GROQ_API_KEY` and optionally `GROQ_MODEL`. If the key is missing, the call times out, the provider rate-limits, or its JSON is invalid, `MockCoachProvider` returns a deterministic educational summary. AI failure never blocks a scan result.

## Quality checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

Import the repository into Vercel, add the variables from `.env.example`, and deploy as a Next.js project. Keep `DEMO_MODE=true` for judge builds. Set it to `false` for a real environment after Firebase is configured.

## Privacy model

- Images use `users/{uid}/check-ins/{checkInId}/original.webp` and `thumbnail.webp`.
- Storage rules require the authenticated UID to match the path.
- Browser compression creates a fresh image and removes source EXIF metadata.
- Clients cannot write analysis, safety, coach, or audit documents.
- Users can delete check-ins; demo reset is scoped to demo-tagged data for the current user.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [API.md](./API.md), [DEMO_SCRIPT.md](./DEMO_SCRIPT.md), and [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md).
