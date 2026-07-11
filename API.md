# API

Responses use `{ success: true, data }` or `{ success: false, error: { code, message, details? } }`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET, POST | `/api/session` | Restore or verify the anonymous guest session |
| GET, PATCH | `/api/preferences` | Read or validate preferences |
| POST | `/api/check-ins/:id/analyze` | Run the deterministic analysis pipeline and coach fallback |
| POST | `/api/demo/seed` | Return an internal deterministic fixture |
| POST | `/api/demo/reset` | Reset internal fixture data for the current user |
| GET | `/api/health` | Runtime health and demo-mode status |

Production routes should send a Firebase ID token as `Authorization: Bearer <token>`. The backend derives the UID from the verified token and never trusts a client-provided UID.
