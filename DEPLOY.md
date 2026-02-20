# Deployment checklist — is the project ready for final deploy?

## Quick checklist (before Railway / Render)

### Backend (Spring Boot)

- ✅ Server listens on `PORT` — `server.port=${PORT:8080}` (Railway/Render set `PORT`)
- ⚠️ CORS must allow deployed frontend URL — set `CORS_ORIGINS` env var
- ⚠️ All secrets from env vars — JWT_SECRET, DB URL, SendGrid, etc.

### Frontend (Vite/React)

- ✅ API URL from env — `VITE_API_ORIGIN`
- ✅ Build: `VITE_API_ORIGIN=https://your-backend.railway.app npm run build`

---

## ✅ What’s already in place

| Area | Status |
|------|--------|
| **Docker** | Backend + frontend + PostgreSQL; `docker compose up -d` runs full stack |
| **Run docs** | README + RUN.md with Docker and local instructions |
| **Tests** | Backend tests (health, auth, menu, order E2E); CI runs on push |
| **API docs** | OpenAPI/Swagger at `/swagger-ui.html` |
| **Pagination** | Orders, reservations, admin menu lists |
| **Validation** | Backend Bean Validation on orders; frontend forms |
| **CI** | GitHub Actions: backend tests, frontend build, Docker build |
| **Prod config** | `application-prod.properties` for JWT and CORS from env |
| **Secrets** | JWT, DB, CORS read from environment variables |
| **Health** | Actuator health endpoint for load balancers |

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

## Summary

- **Feature-wise:** The project is **complete** for final deploy (menu, orders, reservations, admin, waiter, auth, Docker, CI, docs).
- **Production-hardening:** Before go-live, set **JWT_SECRET**, **CORS_ORIGINS**, **DB URL**, build frontend with **VITE_API_ORIGIN**, and use **HTTPS** and strong passwords.

After that, you’re ready for final deployment.
