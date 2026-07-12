# CrownScore

**Visible hair and scalp progress from one guided photo — scored carefully, never diagnosed.**

CrownScore turns a consistent crown/scalp check-in into a 0–100 visible-health score using on-device YOLOv8n detection, deterministic scoring, fixed safety rules, and an educational coach that cannot override the facts.

It is **not** a medical device. Scores summarize model-detected visible concerns in one image. They are not clinical measurements and do not replace a qualified professional.

## Why it exists

People tracking minoxidil, finasteride, or general hair-care routines often rely on memory and uneven bathroom selfies. CrownScore adds a guided capture loop, a comparable score, and a clear disclaimer boundary so progress is easier to review without pretending to diagnose.

## What judges should notice

| Criterion | Where it shows up |
| --- | --- |
| **Creativity** | Niche progress tool with a safety-first framing, not a generic chatbot skin |
| **Practicality** | Neon-backed accounts keep check-ins available across devices |
| **Design** | Brand-first landing, score orb, soft cool atmosphere, mobile bottom nav |
| **Technical complexity** | Browser ONNX YOLO, quality heuristics, class-aware NMS, deterministic score, coach firewall |
| **Presentation** | Follow [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for a 2–5 minute walkthrough |

## Product loop

1. **Onboarding** — routine, check-in rhythm, coach tone
2. **Guided capture** — fixed oval guide, countdown, quality-minded framing
3. **Context** — optional adherence / shedding / irritation for safety review
4. **Analyze** — on-device detections → API score + coach summary
5. **Result → Dashboard / History / Progress / Coach** — only real check-ins populate data

## Stack

- Next.js App Router + React 19 + Tailwind
- ONNX Runtime Web + YOLOv8n (browser)
- Zod-validated analyze API, deterministic safety service
- Optional Groq coach with mock fallback
- Neon Auth + Neon Postgres through the existing Vercel Marketplace integration
- Drizzle ORM with tracked, forward-only migrations
- Idempotent one-time import of existing browser-only records after sign-in

## Local development

```bash
npm install
npx vercel env pull .env.local --environment=production
npm run db:migrate
npm run dev
```

Open `https://localhost:3000` (`npm run dev` enables HTTPS so Neon Auth `__Secure-` session cookies work). Camera needs `localhost` or HTTPS. Neon Auth requires `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and a 32+ character `NEON_AUTH_COOKIE_SECRET` — pull them with the command above after connecting the Neon Marketplace resource to Development. Groq remains optional.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment

Copy `.env.example` → `.env.local`. Keep secrets out of GitHub and use Vercel project env for deploys.

- `DATABASE_URL` — pooled Neon Postgres connection
- `NEON_AUTH_BASE_URL` — existing branch-scoped Neon Auth URL
- `NEON_AUTH_COOKIE_SECRET` — server-only signed-session cookie secret
- `GROQ_API_KEY` — optional coach; mock fallback otherwise
- `INTERNAL_FIXTURES_ENABLED` — leave false in production

Raw captures are processed in the browser and are not uploaded. Neon stores the
derived analysis, questionnaire context, coach output, preferences, and account
ownership metadata. Local thumbnails are a disposable browser cache.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — analysis pipeline
- [API.md](./API.md) — routes
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) — judge / video walkthrough
- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) — dataset and safety honesty

## United Hacks V7

Built for the **General** track: originality, working demo, clear design, and technical depth that is visible in the product — not buried in a README alone.

The official [United Hacks V7 page](https://unitedhacksv7.devpost.com/) lists five equally visible judging dimensions: creativity, practicality, presentation, design, and technical complexity. It requires a public repository, a 2–5 minute demo video, and a written Devpost explanation; a live demo is optional but recommended.
