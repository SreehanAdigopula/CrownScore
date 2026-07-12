# API

Responses use `{ success: true, data }` or `{ success: false, error: { code, message, details? } }`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET, POST | `/api/auth/[...path]` | Neon Auth proxy for sign-up, sign-in, sign-out, and sessions |
| GET | `/api/session` | Return the server-validated Neon Auth session |
| GET, PATCH, DELETE | `/api/preferences` | Read/update profile settings or delete CrownScore data |
| GET | `/api/check-ins` | List the current user's persisted check-ins |
| POST | `/api/check-ins/import` | Idempotently merge existing browser records after sign-in |
| POST | `/api/check-ins/analyze` | Analyze and atomically persist a derived check-in |
| POST | `/api/demo/seed` | Return an internal deterministic fixture |
| POST | `/api/demo/reset` | Reset internal fixture data for the current user |
| GET | `/api/health` | Runtime health and demo-mode status |

Protected routes use the signed, HTTP-only Neon Auth session cookie. The backend derives ownership from that session and never trusts a client-provided user ID.
