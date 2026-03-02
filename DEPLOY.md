# Deployment Guide — Smart Restaurant System

Deploy frontend to **Vercel**, backend to **Fly.io**, and database to **Neon** (PostgreSQL). For Render backend, see [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md).

**Reference:** `frontend/.env.example`, `backend/.env.example`, [SECURITY.md](SECURITY.md).

---

## Deploy with Vercel (frontend) + Fly.io (backend)

### 1. Database — Neon (free)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project → PostgreSQL
3. Copy the **connection string** (e.g. `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
4. Convert to JDBC URL for Spring Boot: `jdbc:postgresql://YOUR_NEON_HOST:5432/neondb?sslmode=require` (replace host/db with your values)
5. Extract username and password for Fly.io secrets

### 2. Backend — Fly.io

1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. Sign up / log in: `fly auth login`
3. From project root: `cd backend`
4. Launch (first time): `fly launch`
   - Choose app name (e.g. `smart-restaurant-api`) or use default
   - Don’t create Postgres — we use Neon
   - Deploy? → No (we set secrets first)
5. Set **required** secrets:
   ```bash
   fly secrets set JWT_SECRET="$(openssl rand -base64 32)"
   fly secrets set SPRING_DATASOURCE_URL="jdbc:postgresql://YOUR_NEON_HOST:5432/neondb?sslmode=require"
   fly secrets set SPRING_DATASOURCE_USERNAME="your-neon-username"
   fly secrets set SPRING_DATASOURCE_PASSWORD="your-neon-password"
   fly secrets set CORS_ORIGINS="https://your-app.vercel.app"
   fly secrets set BASE_URL="https://your-app.vercel.app"
   ```
6. (Optional) Set SendGrid for emails: `fly secrets set SENDGRID_API_KEY="SG.xxx"` and `SENDGRID_FROM`
7. Deploy: `fly deploy`
8. Note your backend URL: `https://smart-restaurant-api.fly.dev` (or your app name)

### 3. Frontend — Vercel

1. Sign up at [vercel.com](https://vercel.com) and connect GitHub
2. Import your repo → **Configure Project**
3. **Root Directory:** `frontend`
4. **Environment Variable:**
   - Name: `VITE_API_ORIGIN`
   - Value: `https://smart-restaurant-api.fly.dev` (your Fly.io backend URL, no trailing slash)
5. Deploy
6. Note your frontend URL: `https://smart-restaurant-xxx.vercel.app`

### 4. Update backend CORS

1. Go to [Fly.io dashboard](https://fly.io/dashboard) → your app → Secrets
2. Update `CORS_ORIGINS` to your real Vercel URL
3. Redeploy: `cd backend && fly deploy`

### 5. Create admin user

With `prod` profile, no default users are created. Use the register API or temporarily set `app.security.create-default-users=true` in a one-off deploy to create your first admin, then disable it.

---

## Quick checklist (before deploy)

### Backend (Spring Boot)

- ✅ Server listens on `PORT` — `server.port=${PORT:8080}` (Railway/Render set `PORT`)
- ⚠️ CORS must allow deployed frontend URL — set `CORS_ORIGINS` env var
- ⚠️ All secrets from env vars — JWT_SECRET, DB URL, SendGrid, etc.

### Frontend (Vite/React)

- ✅ API URL from env — `VITE_API_ORIGIN`
- ✅ Build: `VITE_API_ORIGIN=https://your-backend.fly.dev npm run build`

---

## ✅ What’s already in place

| Area | Status |
|------|--------|
| **Docker** | Backend + frontend + PostgreSQL; `docker compose up -d` runs full stack |
| **Run docs** | README + RUN.md with Docker and local instructions |
| **Tests** | Backend (health, auth, menu, order E2E, Actuator); frontend (Vitest); CI runs both |
| **API docs** | OpenAPI/Swagger at `/swagger-ui.html` |
| **Pagination** | Orders, reservations, admin menu lists |
| **Validation** | Backend Bean Validation on orders; frontend forms |
| **CI** | GitHub Actions: backend tests, frontend tests + build, Docker build |
| **Prod config** | `application-prod.properties` for JWT and CORS from env |
| **Secrets** | JWT, DB, CORS read from environment variables |
| **Health** | Actuator health, info, metrics endpoints for load balancers and observability |

---

## Before final production deploy

Do these so the app is safe and correct in production.

### 1. **Environment variables (required)**

Set these on your server or in your production Docker/Compose:

| Variable | Example | Purpose |
|----------|---------|--------|
| `JWT_SECRET` | Long random string (min 32 chars) | Signing JWTs; **must** be strong in prod |
| `CORS_ORIGINS` | `https://yourdomain.com` | Your real frontend URL(s), comma-separated |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://host:5432/restaurantdb` | Production DB URL |
| `SPRING_DATASOURCE_USERNAME` | Your DB user | |
| `SPRING_DATASOURCE_PASSWORD` | Your DB password | |

Optional: `SPRING_PROFILES_ACTIVE=prod` so the backend uses `application-prod.properties`.

### 2. **Frontend API URL**

Build the frontend with your real API URL:

```bash
# When building the frontend image or running npm run build
VITE_API_ORIGIN=https://api.yourdomain.com
```

In Docker Compose, pass it as build-arg:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      - VITE_API_ORIGIN=https://api.yourdomain.com
```

### 3. **Database**

- Use a **managed PostgreSQL** (e.g. cloud DB) or a dedicated server; don’t rely on a single container for important data without backups.
- First deploy: backend will run migrations (`ddl-auto=update`). For stricter production, you can switch prod to `validate` after schema is stable.

### 4. **HTTPS**

- Serve frontend and API over **HTTPS** (reverse proxy, e.g. Nginx or cloud load balancer).
- Update `CORS_ORIGINS` and `VITE_API_ORIGIN` to use `https://` URLs.

### 5. **Stripe (if you use payments)**

- Set `app.stripe.secret-key` and `app.stripe.webhook-secret` to **live** keys in production.
- Point Stripe webhook to `https://your-api/api/stripe/webhook`.

### 6. **Docker Compose for production**

- Copy `.env.production.example` to `.env.production` and fill in real values.
- Run with: `docker-compose --env-file .env.production up -d` (and set `SPRING_PROFILES_ACTIVE=prod` in that file).
- Use **strong** `POSTGRES_PASSWORD` and `JWT_SECRET`; never commit `.env.production`.

### 7. **Password reset emails**

- With `SPRING_PROFILES_ACTIVE=prod`, the reset token is **never** returned in the API response (only sent by email).
- Configure SendGrid in production so users receive the reset link: set `app.notification.sendgrid.api-key`, `app.notification.sendgrid.from`, and `app.notification.sendgrid.from-name`.
- Set `BASE_URL` to your frontend URL (e.g. `https://yourdomain.com`) so reset links point to the right site.

### 8. **Default users**

- With `SPRING_PROFILES_ACTIVE=prod`, `app.security.create-default-users` is **false**: no default admin/waiter are created.
- Create your first admin via the register API or by temporarily enabling create-default-users, then change the password and disable it.

---

## Post-deploy verification

1. `curl https://your-backend.fly.dev/actuator/health` → `{"status":"UP"}`
2. Open frontend → menu loads, language switch works
3. Place a test order → check order status page
4. Book a table → verify reservation code appears
5. Login as admin → dashboard loads with stats

---

## Summary

- **Feature-wise:** The project is **complete** for final deploy (menu, orders, reservations, admin, waiter, auth, Docker, CI, docs).
- **Production-hardening:** Before go-live, set **JWT_SECRET**, **CORS_ORIGINS**, **DB URL**, build frontend with **VITE_API_ORIGIN**, and use **HTTPS** and strong passwords. See [SECURITY.md](SECURITY.md).

After that, you’re ready for final deployment.
