# CrownScore — Devpost submission draft

Copy/paste into [United Hacks V7](https://unitedhacksv7.devpost.com/). Track: **General**.

**Deadline:** July 12, 2026 @ 12:00pm EDT

---

## Project title

**CrownScore**

## Tagline

*(≤ 1 sentence, Devpost tagline field)*

> One guided photo. A careful 0–100 visible-health score for hair and scalp progress — not a diagnosis.

## Elevator pitch

*(opening of “About” / video intro)*

People tracking minoxidil, finasteride, or a hair-care routine usually guess from uneven bathroom selfies. CrownScore guides a consistent crown/scalp photo, runs YOLOv8n on-device in the browser, turns detections into a deterministic visible-health score, applies fixed safety rules, then explains the result with a coach that cannot rewrite the facts.

---

## Inspiration

Hair-progress tracking is noisy. Lighting changes, angles drift, and “does this look better?” becomes vibes. We wanted a small loop that makes photos comparable, keeps medical honesty front and center, and shows real systems work — vision, scoring, safety — instead of wrapping a chat model and calling it a product.

## What it does

- Guided camera capture with a fixed frame for more consistent photos
- On-device ONNX Runtime Web + YOLOv8n detection of visible hair/scalp concerns
- Deterministic 0–100 visible-health score with image-quality checks
- Fixed safety review (symptoms / quality) that sits above any AI wording
- Educational coach summary (Groq when configured; mock fallback otherwise)
- Dashboard, history, progress, and coach screens that stay empty until a real check-in lands
- Neon Auth accounts with Neon Postgres history that follows users across devices

**Not a medical device.** Scores summarize model-detected visible concerns in one image. They do not diagnose, prescribe, or claim clinical accuracy.

## How we built it

- **Frontend:** Next.js App Router, React 19, Tailwind, Motion
- **Vision:** Browser ONNX Runtime Web + YOLOv8n, letterbox preprocess, class-aware NMS
- **Scoring / safety:** Deterministic TypeScript services + Zod-validated analyze API
- **Coach:** Optional Groq provider with timeout, schema validation, and mock fallback
- **Data:** Neon Auth + Neon Postgres via Drizzle, with an idempotent browser-data import
- **Deploy:** Vercel with the Marketplace-linked Neon project

Pipeline (short):

```text
Guided capture → quality checks → on-device YOLO → deterministic score → fixed safety → coach wording → save
```

## Challenges we ran into

- Keeping the product **non-diagnostic** without watering down usefulness
- Making browser inference feel fast and trustworthy on uneven photos
- Preventing the LLM from becoming the source of truth (scores and safety must stay fixed)
- Designing empty first-run states that look intentional instead of unfinished

## Accomplishments that we're proud of

- End-to-end authenticated product with no cloud vision API required
- Safety firewall: coach cannot change score, detections, or safety status
- Brand-first UI with a clear demo path judges can click in minutes
- Honest empty states — no fake seed data pretending to be a user history

## What we learned

- Judges feel technical depth more when the UI names the systems (on-device YOLO, deterministic score, safety before AI)
- Medical-adjacent products win trust by saying what they **won’t** do
- A polished empty state is part of the product, not a placeholder

## What's next

- Stronger image-quality / pose checks
- Trusted server-side re-inference for higher assurance
- Better dataset balance and evaluation (see `KNOWN_LIMITATIONS.md`)
- Offline write queue and richer account export controls

---

## Judging criteria (General track)

| Criterion | How CrownScore answers it |
| --- | --- |
| **Creativity** | Niche progress tool for hair/scalp check-ins with a careful, non-diagnostic framing — not a generic chatbot skin |
| **Practicality** | Authenticated, cross-device history; people already take progress photos — we make them comparable |
| **Presentation** | Clear landing → check-in → score orb → dashboard loop; follow `DEMO_SCRIPT.md` for the video |
| **Design** | Brand-first landing, atmospheric cool-blue UI, ScoreOrb signature, mobile immersive capture |
| **Technical complexity** | On-device YOLO/ONNX, quality heuristics, class-aware NMS, deterministic scoring, safety service, coach firewall |

---

## Built with

- Next.js
- React
- TypeScript
- Tailwind CSS
- ONNX Runtime Web
- YOLOv8
- Zod
- Neon Auth
- Neon Postgres
- Drizzle ORM
- Groq (optional)
- Vercel
- Motion
- Recharts

---

## Links

| Field | Value |
| --- | --- |
| **Repo** | https://github.com/SreehanAdigopula/CrownScore |
| **Live demo** | https://crownscore.vercel.app |
| **Demo video** | Upload 2–5 min recording (outline below) |

### Live demo note

**Production URL:** https://crownscore.vercel.app

Camera requires HTTPS (Vercel provides this). Accounts and derived results use the linked Neon project; raw captures are not uploaded.

Required platform env plus optional coach:

```text
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
INTERNAL_FIXTURES_ENABLED=false
NEXT_PUBLIC_APP_URL=https://YOUR_PRODUCTION_URL
```

---

## Demo video outline (2–5 min)

Follow **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** exactly. Short version:

1. Landing — brand, ScoreOrb, “under the hood”
2. Onboarding (≈20s)
3. Empty dashboard (honest first-run)
4. Guided capture → questionnaire → analyzing stages
5. Result ScoreOrb + concerns + safety + coach
6. Dashboard / history / coach reflect the same check-in
7. Settings — privacy + not a diagnosis

**Do not** present `/demo` fixtures as the product.

---

## Submission checklist (you)

1. Commit + push overhaul so the **public GitHub** matches what you demo
2. Confirm live URL loads on phone + laptop; allow camera
3. Record video; upload to YouTube/Drive; paste on Devpost
4. Paste this writeup into Devpost; set track = **General**
5. Submit before **12:00pm EDT**
