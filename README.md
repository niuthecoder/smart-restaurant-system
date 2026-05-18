# Saffron House — Smart Restaurant System

**Full-stack restaurant management platform** with customer ordering, table reservations, waitlist, admin and waiter dashboards, payments, and multi-language support. Built as a portfolio project (2025–2026).

---
## live Demo
-link:- https://smart-restaurant-system-cyan.vercel.app/

<img width="1901" height="866" alt="image" src="https://github.com/user-attachments/assets/0556f2d0-9cd6-4412-b1f1-b5eb7acff4f3" />


---
## Highlights 

- **Full-stack:** React 19 + Vite 7 frontend, Spring Boot 3 REST API, PostgreSQL
- **Auth & roles:** JWT-based auth with Admin, Waiter, and customer flows
- **Payments:** Stripe integration (payment intents, webhooks, receipts)
- **i18n:** Multi-language (EN / RU / AR / FA) with react-i18next and persisted locale
- **Multi-tenant ready:** Restaurant-scoped data and tenant context
- **UX:** Persian-themed UI (Tailwind), responsive layout, dropdown nav, cart and order flow
- **Operations:** QR table links, API keys, audit log, data export (CSV), health check
- **Notifications:** SendGrid email (order confirmation, order ready, reservations, waitlist), browser push when order is ready

---

## Tech stack

| Layer      | Technologies |
|-----------|--------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS, react-i18next, React Router (hash) |
| **Backend**  | Spring Boot 3.5, Java 17, Spring Security, JWT (JJWT), Spring Data JPA |
| **Database** | PostgreSQL |
| **Payments** | Stripe (payment intents, webhooks) |
| **Optional**  | SendGrid (order/waitlist emails), Docker |

---

## Features

**Customer-facing**

- Browse Persian menu by category (appetizers, soups, salads, kebabs, rice, stews, drinks, desserts, pizza)
- Reviews & ratings (1–5 stars with optional comments)
- Add to cart and place orders (with optional table ID from QR)
- Book a table (date/time, guests) and join waitlist with email notification
- Order confirmation and "order ready" emails (SendGrid)
- Browser push notifications when order status becomes ready
- Contact form and special offers section
- Multi-language (EN / RU / AR / FA) and theme toggle

**Staff & admin**

- **Waiter:** Tables, create orders, mark complete, Stripe payment and receipt link
- **Kitchen:** Order display for preparation
- **Admin:** Dashboard stats, menu CRUD, orders, reservations, waitlist, messages, audit log, API keys, menu export

**Technical**

- JWT authentication and role-based access
- Stripe payment flow and webhook for order status
- QR codes per table for quick ordering
- API key support for server-to-server access
- Audit logging and CSV exports

---

## Configuration (optional)

### SendGrid — Order & reservation emails

To enable order confirmation and "order ready" emails:

1. Create a [SendGrid](https://sendgrid.com) account (free tier: 100 emails/day).
2. Verify a sender (Settings → Sender Authentication → Verify a Single Sender).
3. Create an API key (Settings → API Keys) with **Mail Send** permission.
4. Add to `backend/src/main/resources/application.properties`:

```properties
app.notification.sendgrid.api-key=SG.your_full_api_key_here
app.notification.sendgrid.from=your-verified@email.com
app.notification.sendgrid.from-name=Saffron House
```

5. Restart the backend.

**Test SendGrid:** `POST /api/test-email` with body `{"to":"your@email.com"}`.

---

## Quick start

### Option A — Run with Docker (recommended)

**Prerequisites:** Docker and Docker Compose

```bash
# From the project root
docker compose up -d
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8080  
- **Swagger UI:** http://localhost:8080/swagger-ui.html  

PostgreSQL runs on port 5432 (user `restaurant_user`, DB `restaurantdb`). To stop: `docker compose down`.

---

### Option B — Run locally

**Prerequisites:** Node 18+, Java 17+, Maven 3.6+, PostgreSQL 12+

#### 1. Database

```bash
createdb restaurantdb
# Create user if needed: in psql, CREATE USER restaurant_user WITH PASSWORD '1234'; GRANT ALL ON DATABASE restaurantdb TO restaurant_user;
# Or change backend/src/main/resources/application.properties to match your DB user/password.
```

#### 2. Backend

```bash
cd backend
# Edit src/main/resources/application.properties if needed (DB user, password, port)
mvn spring-boot:run
```

Runs at **http://localhost:8080**. Seed data creates a default restaurant and Persian menu when the DB is empty.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:5173** (or next available port). Set `VITE_API_ORIGIN=http://localhost:8080` in `.env` if the API is elsewhere.

#### 4. Logins (seed defaults)

| Role   | Username | Password  |
|--------|----------|-----------|
| Admin  | admin    | admin123  |
| Waiter | waiter   | waiter123 |

---

## Project structure

```
smart-restaurant-system/
├── backend/                 # Spring Boot API
│   └── src/main/java/.../backend/
│       ├── config/          # Security, JWT, CORS, data seed
│       ├── Controller/      # REST (auth, menu, orders, reservations, etc.)
│       ├── Entity/          # JPA entities
│       ├── Repository/      # Spring Data
│       ├── Service/          # Business logic
│       └── DTO/
├── frontend/                # React SPA
│   └── src/
│       ├── components/      # Navbar, Hero, Menu, Admin, Waiter, etc.
│       ├── context/         # Auth, Cart, Branding, Theme
│       ├── services/        # API client
│       ├── locales/         # i18n (en, es, fr)
│       └── i18n.js
└── README.md
```

---

## API overview

| Area        | Examples |
|------------|----------|
| Auth       | `POST /api/auth/login` |
| Menu       | `GET /api/menuitems` (public) |
| Orders     | `POST /orders`, `GET /orders/{id}/receipt` |
| Reservations | `POST /api/reservations`, `GET /api/availability` |
| Waitlist   | `POST /api/waitlist` |
| Reviews    | `GET /api/reviews`, `POST /api/reviews` |
| Admin      | `GET /api/admin/dashboard/stats`, orders, reservations, audit log, API keys |
| Payments   | `POST /api/payments/create-intent`, Stripe webhook |

See `API_REFERENCE.md` in the repo for details. **Interactive API docs (OpenAPI/Swagger):** when the backend is running, open **http://localhost:8080/swagger-ui.html**.

**Security:** See [SECURITY.md](SECURITY.md) for JWT, CORS, and environment-variable best practices.

---

## Tests

**Backend** (uses H2 in-memory DB; no PostgreSQL required):

```bash
cd backend && mvn test
```

Includes health check, auth, menu, order, Actuator, and user-repository tests. The **place-order** flow is covered by an E2E-style test (`OrderControllerTest`).

**Frontend** (Vitest):

```bash
cd frontend && npm run test:run
```

Covers `CartContext` and utility functions.

**CI:** GitHub Actions runs backend tests, frontend tests, and frontend build on push/PR to `main`/`master`, then builds Docker images (see `.github/workflows/ci.yml`).

---

## Deployment (Vercel + Fly.io)

Deploy the frontend to **Vercel**, backend to **Fly.io**, and database to **Neon** (PostgreSQL). See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions. For **Render** backend, see [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md).

---

## Build for production

**Backend**

```bash
cd backend
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Frontend**

```bash
cd frontend
npm run build
# Serve the contents of dist/ (e.g. with Nginx or static host)
```

---
