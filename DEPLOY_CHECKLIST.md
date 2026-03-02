# Deployment Checklist — Saffron House

Alternative deployment using **Render** for backend (instead of Fly.io). For Fly.io + Neon setup, see [DEPLOY.md](DEPLOY.md).

**Reference:** `frontend/.env.example`, `backend/.env.example`, [SECURITY.md](SECURITY.md).

---

## Backend (Render)

### Environment Variables (required)

| Variable | Example | Notes |
|----------|---------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates prod logging, disables demo users |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-xxx.neon.tech:5432/neondb?sslmode=require` | Neon pooler URL |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` | |
| `SPRING_DATASOURCE_PASSWORD` | `npg_xxx` | **Secret** |
| `JWT_SECRET` | (random 32+ chars) | **Secret** — generate with `openssl rand -base64 48` |
| `CORS_ORIGINS` | `https://smart-restaurant-system-cyan.vercel.app` | Your Vercel domain, comma-separated if multiple |
| `BASE_URL` | `https://smart-restaurant-system-cyan.vercel.app` | Used for QR codes and receipt links |

### Environment Variables (optional)

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `8080` | Render sets this automatically |
| `HIKARI_MAX_POOL` | `30` | Neon free tier supports ~100 connections |
| `TOMCAT_MAX_THREADS` | `250` | |
| `SENDGRID_API_KEY` | (empty) | Required for emails. Without it, emails are silently skipped |
| `SENDGRID_FROM` | `niyousha.kh@gmail.com` | Must be a verified sender in SendGrid |
| `STRIPE_SECRET_KEY` | (empty) | Required for payment processing |
| `STRIPE_PUBLISHABLE_KEY` | (empty) | Returned via `/api/payments/config` |
| `STRIPE_WEBHOOK_SECRET` | (empty) | For webhook signature verification |

### Verification

```bash
# 1. Health check
curl https://your-backend.onrender.com/actuator/health
# Expected: {"status":"UP"}

# 2. API docs
open https://your-backend.onrender.com/swagger-ui.html

# 3. Login
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 4. Menu loads
curl https://your-backend.onrender.com/api/menuitems | head -c 200
```

### Security Checklist

- [x] `SPRING_PROFILES_ACTIVE=prod` — disables demo user creation, hides health details
- [x] `JWT_SECRET` — unique per environment, never committed to git
- [x] `CORS_ORIGINS` — restricted to your Vercel domain only
- [x] Rate limiting active on auth (15/min) and public write (30/min) endpoints
- [x] `/api/auth/register` restricted to ADMIN role
- [x] `DELETE /api/reservations/{id}` restricted to ADMIN role
- [x] Error messages sanitized (no stack traces, no `ex.getMessage()` leaking)
- [x] Swagger UI is public (read-only docs) — restrict in prod if desired by adding to SecurityConfig

---

## Frontend (Vercel)

### Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_ORIGIN` | `https://smart-restaurant-system-4.onrender.com` | Your Render backend URL, **no trailing slash** |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx` | Optional — backend can also serve it |

### Verification

```bash
# 1. Site loads
open https://smart-restaurant-system-cyan.vercel.app

# 2. API connection (open browser console)
# No CORS errors, menu items load from backend

# 3. Check no secrets in source
# View page source — only VITE_ prefixed vars are exposed (by Vite design)
```

### Security Checklist

- [x] No secrets in frontend code — only `VITE_API_ORIGIN` and `VITE_STRIPE_PUBLISHABLE_KEY` (both public)
- [x] Demo credentials gated behind `import.meta.env.DEV` — hidden in production builds
- [x] `.env` files gitignored, only `.env.example` is committed
- [x] SPA rewrite configured in `vercel.json` for client-side routing

---

## Logging (Backend)

### What gets logged

| Event | Level | Includes requestId |
|-------|-------|--------------------|
| Every HTTP request (method, URI, status, duration) | INFO/WARN/ERROR | Yes |
| JWT authentication success | DEBUG | Yes |
| JWT validation failure | DEBUG | Yes |
| Validation errors (400) | via GlobalExceptionHandler | Yes |
| Unhandled exceptions (500) | ERROR + full stack trace | Yes |
| Data initializer actions | INFO | No (startup) |

### Log format

**Dev** (human-readable):
```
19:30:45.123 INFO  [http-nio-8080-exec-1] RequestLoggingFilter - a3f8b2c1 GET /api/menuitems 200 45ms
```

**Prod** (structured JSON, one line per event):
```json
{"ts":"2026-02-20T19:30:45.123+0000","level":"INFO","logger":"RequestLoggingFilter","requestId":"a3f8b2c1","msg":"GET /api/menuitems 200 45ms","thread":"http-nio-8080-exec-1"}
```

### Response headers

Every response includes `X-Request-Id` for client-side correlation. Clients can forward an existing `X-Request-Id` header to trace requests end-to-end.

---

## CORS Configuration

| Setting | Value |
|---------|-------|
| Allowed origins | From `CORS_ORIGINS` env var (comma-separated) |
| Allowed methods | GET, POST, PUT, DELETE, OPTIONS |
| Allowed headers | Authorization, Content-Type, Accept, X-Requested-With, X-API-Key |
| Credentials | true |
| Default (no env) | `http://localhost:5173`, `http://localhost:3000` |

---

## Rate Limiting

| Scope | Limit | Endpoints |
|-------|-------|-----------|
| Auth | 15 req/min per IP | `/api/auth/login`, `/register`, `/forgot-password`, `/reset-password` |
| Public writes | 30 req/min per IP | `/api/reservations`, `/orders`, `/api/waitlist`, `/api/reviews`, `/api/loyalty/redeem`, `/api/messages` |

Note: In-memory rate limiting. If running multiple replicas, limits apply per-instance (not distributed).

---

## Timeouts

| Setting | Value | Source |
|---------|-------|--------|
| Tomcat connection timeout | 20s | `server.tomcat.connection-timeout` |
| HikariCP connection timeout | 10s | `spring.datasource.hikari.connection-timeout` |
| HikariCP idle timeout | 5min | `spring.datasource.hikari.idle-timeout` |
| Graceful shutdown | 30s | `server.shutdown=graceful` |

---

## Quick Deploy Steps

### First-time setup

1. Push code to GitHub
2. **Vercel**: Import repo → set root directory to `frontend` → add `VITE_API_ORIGIN` env var → deploy
3. **Render**: New Web Service → connect repo → set root to `backend` → build command: `cd backend && ./mvnw clean package -DskipTests` → start command: `java -jar backend/target/backend-*.jar` → add all env vars from table above → deploy
4. **Neon**: Create database → copy connection string → set in Render env vars

### After code changes

- **Frontend**: Push to `main` → Vercel auto-deploys
- **Backend**: Push to `main` → Render auto-deploys (if auto-deploy enabled)

### Smoke test after deploy

1. `curl <backend>/actuator/health` → `{"status":"UP"}`
2. Open frontend → menu loads, language switch works
3. Place a test order → check order status page
4. Book a table → verify reservation code appears
5. Login as admin → dashboard loads with stats
