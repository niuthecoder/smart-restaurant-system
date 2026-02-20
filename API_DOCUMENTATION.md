# Restaurant API Backend

## Quick Start 
1. Run: `mvn spring-boot:run`
2. Test: Visit `http://localhost:8080/menuitems` in browser
3. Default admin: `admin` / `admin123`
4. Default waiter: 

## API Endpoints
Base URL: `http://localhost:8080`

### 🔐 Authentication
POST /api/auth/login        # User login  
POST /api/auth/register     # User registration
GET  /api/auth/validate     # Validate token

### 📊 Admin Dashboard  
GET /api/admin/dashboard/stats          # Statistics
GET /api/admin/orders                   # All orders
PUT /api/admin/orders/{id}/status       # Update order status

### 👥 Users
POST /users                 # Create user
GET  /users                 # Get all users  
GET  /users/{id}            # Get user by id
DELETE /users/{id}          # Delete user

### 🪑 Tables
POST /tables                # Create table
GET  /tables                # Get all tables
GET  /tables/{id}           # Get table by id
DELETE /tables/{id}         # Delete table

### 📋 Orders
POST /orders                # Create order
PUT  /orders/complete/{id}  # Complete order
GET  /orders                # Get all orders
GET  /orders/{id}           # Get order by id
DELETE /orders/{id}         # Delete order

### 🍽️ Menu Items  
POST /menuitems             # Create menu item
GET  /menuitems             # Get all menu items
GET  /menuitems/{id}        # Get menu item by id
DELETE /menuitems/{id}      # Delete menu item

### 📅 Reservations
- **Public:** POST `/api/reservations` — Create reservation (double-booking and 90-min window protected; returns 409 on conflict).
- GET `/api/reservations` — List all (no auth required for now).
- GET `/api/reservations/by-time?datetime=2025-02-15T19:00:00` — Reservations at exact time.
- DELETE `/api/reservations/{id}` — Delete reservation.
- **Admin:** GET `/api/admin/reservations` — List reservations latest first, with `tableNumber`, `salon`, `smokingAllowed` (requires admin JWT).

### 💳 Payments
POST /payments              # Create payment
GET  /payments              # Get all payments  
GET  /payments/{id}         # Get payment by id
PUT  /payments/{id}/complete # Complete payment

### 📦 Inventory
POST /inventory             # Create inventory item
GET  /inventory             # Get all inventory items  
GET  /inventory/{id}        # Get inventory item by id
DELETE /inventory/{id}      # Delete inventory item

### 🛒 Order Items
POST /order-items           # Create order item
GET  /order-items           # Get all order items
GET  /order-items/{id}      # Get order item by id  
DELETE /order-items/{id}    # Delete order item

---

## Reservations: curl examples

**1) Success — create a reservation**
```bash
curl -s -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Jane Doe",
    "guestPhone": "+1234567890",
    "guestEmail": "jane@example.com",
    "tableId": 1,
    "reservationTime": "2025-03-01T19:00:00",
    "guestCount": 2,
    "specialRequests": "Window seat"
  }'
```
Expected: `201` or `200` with reservation JSON.

**2) Conflict — same table at same time (double-booking)**  
Repeat the same request as above (same `tableId` and `reservationTime`).  
Expected: `409 Conflict` with `{"error":"TABLE_ALREADY_BOOKED","message":"This table is already booked for that time."}`

**3) Conflict — 90-minute window overlap**
Create a second reservation for the same table with a time inside the 90-minute window (e.g. 30 minutes later):
```bash
curl -s -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "John Smith",
    "guestPhone": "+0987654321",
    "guestEmail": "john@example.com",
    "tableId": 1,
    "reservationTime": "2025-03-01T19:30:00",
    "guestCount": 4,
    "specialRequests": ""
  }'
```
Expected: `409 Conflict` with `{"error":"TIME_SLOT_CONFLICT","message":"This table is already reserved within this time window."}`

**4) Admin — list reservations (latest first, with table/salon)**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')
curl -s -X GET "http://localhost:8080/api/admin/reservations" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `200` with JSON array of reservations including `tableNumber`, `salon`, `smokingAllowed`.