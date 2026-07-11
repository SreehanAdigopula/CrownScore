# CrownScore

CrownScore is a mobile-first hair-progress tracker built around one simple rule: a user starts with no progress data, and the first usable check-in becomes their personal baseline.

CrownScore is not a diagnostic product. Its score is a relative progress metric, not an absolute or clinically validated hair-density measurement.

## What is built

- Next.js App Router frontend with CrownScore branding and Soft UI styling
- Empty first-run dashboard, history, progress, and coach states
- Guided camera capture and questionnaire flow
- Relative scoring, confidence scoring, trend classification, and deterministic safety rules
- Optional Groq coach provider with timeout, Zod validation, and automatic mock fallback
- Firebase client/admin adapters plus Firestore and Storage rules
- Local guest fallback when Firebase public config is not present

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. With no Firebase or Groq values, CrownScore still runs locally using browser-local records and the deterministic mock coach. Camera access requires `localhost` or HTTPS.

## First-run data behavior

New users start with zero records:

- Dashboard shows no baseline yet
- History shows no saved photos
- Progress shows no chart
- Coach shows no summary

After the first captured check-in, CrownScore saves one local record dated today and treats that score as baseline `100`.

## Firebase setup

1. Create a Firebase project and web app.
2. Add the `NEXT_PUBLIC_FIREBASE_*` values to `.env.local` for local development.
3. Add the same public values to Vercel Project Settings for deployment.
4. For server-side Firebase Admin, provide either application default credentials or the service-account values in `.env.example`.
5. Deploy `firestore.rules` and `storage.rules` with the Firebase CLI.

Do not commit real API keys, private keys, or service account JSON to GitHub.

## Groq

Set `GROQ_API_KEY` and optionally `GROQ_MODEL`. If the key is missing, the call times out, the provider rate-limits, or its JSON is invalid, `MockCoachProvider` returns a deterministic educational summary. AI failure never blocks a scan result.

## Useful scripts

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy to Vercel

Import the repository into Vercel, add the variables from `.env.example`, and deploy as a Next.js project. Keep secrets in Vercel environment variables, not in source control.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [API.md](./API.md), [DEMO_SCRIPT.md](./DEMO_SCRIPT.md), and [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md).
