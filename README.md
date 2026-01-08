# 🍽️ Restaurant Management System

A comprehensive Spring Boot backend application for managing restaurant operations including orders, reservations, menu items, payments, and inventory.

---

## 🚀 Features

- 🔐 Authentication & Authorization  
  JWT-based security with role-based access control

- 📊 Admin Dashboard  
  Real-time analytics and statistics

- 🪑 Table Management  
  Manage restaurant tables and occupancy

- 📋 Order System  
  Complete order lifecycle management

- 🍽️ Menu Management  
  CRUD operations for menu items

- 📅 Reservation System  
  Table booking and reservation management

- 💳 Payment Processing  
  Payment tracking and completion

- 📦 Inventory Management  
  Stock level monitoring

- 👥 User Management  
  Customer and staff accounts

---

## 🛠️ Technology Stack

- Backend: Spring Boot 3.5.5  
- Security: Spring Security + JWT  
- Database: PostgreSQL  
- Authentication: JWT Tokens  
- Build Tool: Maven  
- Java Version: 17  

---

## 📋 Prerequisites

- Java 17 or higher  
- Maven 3.6+  
- PostgreSQL 12+  
- Git  

---

## ⚡ Quick Start

### Clone the Repository
```bash
git clone <your-repository-url>
cd restaurant-backend
```

---

### Configure Database
```sql
CREATE DATABASE restaurant_db;
```

---

### Configure Application

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/restaurant_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Secret
jwt.secret=your-secret-key-here

# Server Port
server.port=8080
```

---

### Run the Application
```bash
mvn spring-boot:run
```

---

### Access the Application

- API Base URL:  
  http://localhost:8080

- Default Admin Login:  
  Username: admin  
  Password: admin123  

---

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/restaurant/backend/
│   │       ├── config/          # Security & JWT configuration
│   │       ├── controller/      # REST controllers
│   │       ├── entity/          # JPA entities
│   │       ├── repository/      # Data repositories
│   │       ├── dto/             # Data Transfer Objects
│   │       └── BackendApplication.java
│   └── resources/
│       └── application.properties
```

---

## API Documentation

You can find the API documentation in the file:

```
api-documentation.md
```

---

## 👤 Default Users

The system automatically creates a default admin user:

- Username: admin  
- Password: admin123  
- Role: ADMIN  

---

## 🚀 Deployment

Build the project:
```bash
mvn clean package
```

Run the JAR file:
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## 📊 Key Endpoints to Test

- Login: `POST /api/auth/login`  
- Get Menu Items: `GET /api/menuitems`  
- Create Order: `POST /api/orders`  
- Dashboard Stats: `GET /api/admin/dashboard/stats`  

---

## 🔧 Development

Run tests:
```bash
mvn test
```

Code formatting:
```bash
mvn spotless:apply
```

---

## 🤝 Contributing

- Fork the repository  
- Create a feature branch  
- Commit your changes  
- Push to the branch  
- Create a Pull Request  

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ using Spring Boot and PostgreSQL.
