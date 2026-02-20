# Testing the Smart Restaurant System

Use this guide to test all main features. Use **Docker** or **local** — pick one.

---

## 1. Start the app

### Docker (recommended)

```bash
cd c:\Users\Niusha\Desktop\smart-restaurant-system
docker-compose up -d --build
```

| What        | URL |
|------------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8081 |
| **Swagger UI** | http://localhost:8081/swagger-ui.html |

### Local (no Docker)

- **Backend:** `cd backend && mvn spring-boot:run` (API on **8080**)
- **Frontend:** `cd frontend && npm run dev` (e.g. http://localhost:5173)
- Set frontend API to `http://localhost:8080` if needed (see `.env` / `VITE_API_ORIGIN`)

**Default logins (created on first run when default users are enabled):**

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | `admin`  | `admin123` |
| Waiter | `waiter` | `waiter123` |

*If waiter doesn’t exist, call once: `GET http://localhost:8081/api/auth/create-waiter` (or 8080 locally).*

---

## 2. Customer features (no login)

Open the **frontend** (e.g. http://localhost:3000 or 5173).

| Feature | How to test |
|--------|--------------|
| **Home / Menu / Offers / About / Contact** | Use top nav: Home, Menu, Offers, About, Contact. Page scrolls to sections; check menu categories and dish images (e.g. Chenjeh if you added the image). |
| **Order** | Click “Order” → add items to cart → place order. Optional: enter table number (e.g. from a QR). |
| **Book table** | Click “Book a table” (or go to `#book-table`) → pick date, time, guests, details → submit. Check success or conflict message. |
| **Waitlist** | Go to `#waitlist` (or link in nav if present) → join waitlist with name/email/party size. |
| **Contact** | Scroll to Contact or use nav → submit form (if backend is wired). |
| **Theme** | Use sun/moon icon in nav to toggle dark/light. |
| **Language** | Use language selector (EN / RU / AR / FA) in nav. |

---

## 3. Admin (login required)

1. In nav: **Staff** → **Admin** (or open `http://localhost:3000/#admin`).
2. Login: **admin** / **admin123**.
3. Use the dashboard tabs:

| Tab | What to test |
|-----|----------------|
| **Overview** | Stats: orders, reservations, revenue, today’s bookings, occupancy. |
| **Orders** | List orders; filter by status; update status (e.g. PENDING → COMPLETED). |
| **Bookings** | List reservations; see table, time, guest; cancel if supported. |
| **Menu** | List menu items; add / edit / delete items; check categories and descriptions. |
| **Messages** | View customer messages (if implemented). |
| **Analytics** | Charts / revenue / peak hours (if data exists). |
| **Floor plan** | Table layout and status. |
| **Waitlist** | View and manage waitlist entries. |
| **Audit log** | View audit entries (who did what, when). |
| **API keys** | Create/list/revoke API keys for server access. |
| **QR** | Generate or view QR codes per table for ordering links. |
| **Settings** | Restaurant name, branding, other settings. |

4. Logout via the logout control in the dashboard.

---

## 4. Waiter & kitchen (login required)

1. **Waiter login:** Open `http://localhost:3000/#waiter-login` (or **Staff** → **Waiter** if available).
2. Login: **waiter** / **waiter123**.
3. **Waiter dashboard** (`#waiter-dashboard`): create orders for tables, mark orders complete, optionally use Stripe payment and receipt link.
4. **Kitchen display** (`#kitchen`): same login; view orders for preparation (pending/preparing/ready).

---

## 5. API / Swagger checks

- **Swagger:** Open http://localhost:8081/swagger-ui.html (or 8080 locally). Try:
  - **Auth:** `POST /api/auth/login` with `{"username":"admin","password":"admin123"}`.
  - **Menu:** `GET /menuitems` (or the menu endpoint shown in Swagger).
  - **Reservations:** `POST /api/reservations` with a JSON body (see `API_DOCUMENTATION.md`).
- **Health:** `GET http://localhost:8081/actuator/health` (or `/health` if you have a custom health endpoint).

---

## 6. Quick smoke checklist

- [ ] Frontend loads (home, menu, images).
- [ ] Place one order from the Order page.
- [ ] Create one reservation from Book table.
- [ ] Join waitlist once.
- [ ] Admin login → Overview and Orders tabs load.
- [ ] Waiter login → Waiter dashboard loads; Kitchen display loads.
- [ ] Swagger loads; login and one GET (e.g. menu) work.

If anything fails, check: backend and DB are running; correct API URL in frontend (8081 for Docker, 8080 for local); no port conflicts.
