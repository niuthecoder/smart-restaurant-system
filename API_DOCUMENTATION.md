# Restaurant API Backend

## Quick Start 
1. Run: `mvn spring-boot:run`
2. Test: Visit `http://localhost:8080/menuitems` in browser
3. Default admin: `admin` / `admin123`

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
POST /reservations          # Create reservation  
GET  /reservations          # Get all reservations
DELETE /reservations/{id}   # Delete reservation

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