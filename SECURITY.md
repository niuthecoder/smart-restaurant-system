# Security

Security practices for the Smart Restaurant System.

---

## Authentication

- **JWT** tokens for Admin and Waiter authentication. Tokens are signed with HS256.
- **Never** return raw passwords. Use BCrypt for password hashing.
- In production, set `JWT_SECRET` via environment variable to a **strong random string** (min 32 chars, e.g. `openssl rand -base64 32`).
- Tokens have a configurable expiration (default 24h).

---

## CORS

- **Allowed origins** are configured via `CORS_ORIGINS` (comma-separated).
- In production, set `CORS_ORIGINS` to your **exact frontend URL(s)** only (e.g. `https://your-restaurant.vercel.app`).
- Avoid `*` or overly broad origins.
- `Allow-Credentials: true` is used; origins must be explicit, not wildcard.

---

## Environment Variables

- **Never** commit secrets. Use `.env.example` as templates only.
- Store production secrets in your host (Vercel, Fly.io, etc.) or a secrets manager.
- Required production variables:
  - `JWT_SECRET`
  - `CORS_ORIGINS`
  - `SPRING_DATASOURCE_*` (DB credentials)
- Optional: SendGrid, Stripe keys — only set when needed.

---

## Rate Limiting

- Public endpoints (login, order placement) are rate-limited via `PublicRateLimitFilter`.
- Authenticated endpoints are rate-limited via `AuthRateLimitFilter`.
- Reduces brute-force and abuse.

---

## API Keys

- Admin can create API keys for server-to-server access.
- Keys are hashed before storage.
- Pass keys in `X-API-Key` header. Never expose in URLs.

---

## Stripe Webhook

- Webhook signature is verified using `STRIPE_WEBHOOK_SECRET`.
- Do not trust unverified webhook payloads.
- Webhook endpoint is public (no JWT); security relies on signature verification.

---

## General

- Use **HTTPS** in production.
- Keep dependencies updated (`npm audit`, `mvn dependency-check`).
- Audit log records admin actions for accountability.
