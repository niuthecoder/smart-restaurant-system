# Saffron House — API Reference

> Base URL (local): `http://localhost:8080`
> Swagger UI: `http://localhost:8080/swagger-ui.html`
> OpenAPI JSON: `http://localhost:8080/v3/api-docs`

All error responses follow a standard format:

```json
{
  "timestamp": "2026-02-20T12:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "One or more fields are invalid.",
  "fields": { "guestName": "Guest name is required" }
}
```

---

## 1. Authentication

### Login (Admin)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Response** `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN",
  "message": "Login successful"
}
```

### Login (Waiter)

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "waiter", "password": "waiter123"}'
```

### Validate Token

```bash
curl http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 2. Menu

### List All Menu Items

```bash
curl http://localhost:8080/api/menuitems
```

**Response** `200 OK`: Array of menu item objects sorted by category.

### Get Single Menu Item

```bash
curl http://localhost:8080/api/menuitems/1
```

---

## 3. Orders

### Place an Order

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "customerEmail": "john@example.com",
    "orderType": "DELIVERY",
    "deliveryAddress": "123 Main St",
    "notes": "Extra saffron please",
    "items": [
      { "menuItemId": 1, "quantity": 2 },
      { "menuItemId": 5, "quantity": 1 }
    ]
  }'
```

**Response** `200 OK`:
```json
{
  "id": 42,
  "status": "PENDING",
  "totalAmount": 35.97,
  "orderTime": "2026-02-20T19:00:00",
  "items": [...]
}
```

### Get Order Status

```bash
curl http://localhost:8080/orders/42
```

### Complete an Order (Auth: WAITER/ADMIN)

```bash
curl -X PUT http://localhost:8080/orders/complete/42 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"tipAmount": 5.00}'
```

---

## 4. Reservations

### Check Table Availability

```bash
curl "http://localhost:8080/api/availability?date=2026-03-01&time=19:00"
```

**Response** `200 OK`:
```json
[
  { "id": 1, "number": 1, "capacity": 4, "salon": "Main", "smokingAllowed": false },
  { "id": 3, "number": 3, "capacity": 6, "salon": "Terrace", "smokingAllowed": true }
]
```

### Create a Reservation

```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": 1,
    "reservationTime": "2026-03-01T19:00:00",
    "guestName": "Jane Smith",
    "guestPhone": "+1987654321",
    "guestEmail": "jane@example.com",
    "guestCount": 4,
    "specialRequests": "Window seat preferred"
  }'
```

**Response** `200 OK`:
```json
{
  "id": 7,
  "reservationCode": "R-20260301-A8K3",
  "status": "PENDING",
  "tableId": 1,
  "reservationTime": "2026-03-01T19:00:00",
  "guestName": "Jane Smith",
  "guestCount": 4
}
```

### Lookup Reservation by Code

```bash
curl http://localhost:8080/api/reservations/R-20260301-A8K3
```

### Cancel Reservation

```bash
curl -X PUT http://localhost:8080/api/reservations/R-20260301-A8K3/cancel
```

---

## 5. Waitlist

### Join the Waitlist

```bash
curl -X POST http://localhost:8080/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Ali Rezaei",
    "guestPhone": "+1555123456",
    "guestEmail": "ali@example.com",
    "partySize": 3,
    "notes": "Birthday celebration"
  }'
```

---

## 6. Reviews

### List Reviews

```bash
curl "http://localhost:8080/api/reviews?page=0&size=10"
```

### Submit a Review

```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "customerName": "Sarah",
    "comment": "Amazing food and service!"
  }'
```

---

## 7. Admin Endpoints (Auth: ADMIN)

### Dashboard Stats

```bash
curl http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### List Orders (with pagination)

```bash
curl "http://localhost:8080/api/admin/orders?page=0&size=20" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Update Order Status

```bash
curl -X PUT http://localhost:8080/api/admin/orders/42/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "PREPARING"}'
```

### List Reservations (with filters)

```bash
curl "http://localhost:8080/api/admin/reservations?date=2026-03-01&salon=Main&status=PENDING" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Export Orders CSV

```bash
curl http://localhost:8080/api/admin/orders/export \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -o orders.csv
```

---

## 8. Waiter / Kitchen Endpoints (Auth: WAITER or ADMIN)

### Get Active Orders

```bash
curl http://localhost:8080/api/waiter/orders/active \
  -H "Authorization: Bearer <WAITER_TOKEN>"
```

### Update Order Status (Kitchen flow)

```bash
curl -X PUT http://localhost:8080/api/waiter/orders/42/status \
  -H "Authorization: Bearer <WAITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "PREPARING"}'
```

Allowed values: `PREPARING`, `READY`.

### Create Waiter Order (dine-in)

```bash
curl -X POST http://localhost:8080/api/waiter/orders \
  -H "Authorization: Bearer <WAITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": 2,
    "customerName": "Table 2",
    "orderType": "DINE_IN",
    "items": [
      { "menuItemId": 3, "quantity": 1 },
      { "menuItemId": 10, "quantity": 2 }
    ]
  }'
```

---

## 9. Payments (Auth: WAITER or ADMIN)

### Create Stripe Payment Intent

```bash
curl -X POST http://localhost:8080/api/payments/create-intent \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 42}'
```

**Response** `200 OK`:
```json
{
  "clientSecret": "pi_xxx_secret_yyy"
}
```

---

## 10. Health Check

```bash
curl http://localhost:8080/api/health
```

```json
{ "status": "UP", "database": "connected" }
```

---

## Error Codes

| HTTP | Error Code | Meaning |
|------|-----------|---------|
| 400 | `VALIDATION_ERROR` | Request body failed DTO validation (see `fields`) |
| 400 | `BAD_REQUEST` | Invalid parameters or business rule violation |
| 400 | `MISSING_PARAMETER` | Required query parameter not provided |
| 400 | `TYPE_MISMATCH` | Parameter type is wrong (e.g. string instead of number) |
| 409 | `TIME_SLOT_CONFLICT` | Reservation time overlaps an existing booking |
| 409 | `DATA_INTEGRITY_VIOLATION` | Database constraint violated |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |
