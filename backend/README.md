# Plato — Restaurant Management & QR Ordering Backend

A production-ready REST API backend for a multi-tenant restaurant platform. Restaurant owners can manage their menus, staff, and tables. Customers scan a QR code at the table, browse the live menu, place orders, and pay — all from their phone with no app install required.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Users](#users)
  - [Restaurants](#restaurants)
  - [Tables & QR Codes](#tables--qr-codes)
  - [Employees](#employees)
  - [Menu](#menu)
  - [Customer Sessions](#customer-sessions)
  - [Orders](#orders)
  - [Billing & Payments](#billing--payments)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [Build Status](#build-status)

---

## Overview

Plato is a multi-tenant SaaS backend for restaurants. A single deployment serves multiple independent restaurant owners, each fully isolated from one another.

### Two Types of Users

| Actor | What they do |
|---|---|
| **Restaurant Owner / Staff** | Login with JWT → manage restaurant, menu, tables, employees, orders |
| **Customer** | Scan QR at table → get a session token → browse menu → place orders → pay → rate |

### Core Flows Built

* **Auth** — Staff JWT login, token validation, role-based access control
* **Users** — Super admin manages all platform users (`OWNER`, `EMPLOYEE`, `SUPER_ADMIN` roles)
* **Restaurants** — Owners create and configure restaurants, settings (tax %, payment methods), and lifecycle management
* **Tables & QR** — Owners add tables, each gets a cryptographically secure QR token; regeneration invalidates old tokens
* **Employees** — Owners assign `EMPLOYEE` users to their restaurant with job roles (`MANAGER`, `CHEF`, `WAITER`, `CASHIER`)
* **Menu** — Categories, dish items, pricing, availability toggles, and public customer menu catalog
* **Customer Sessions** — Frictionless QR-based table dining sessions (auto-expiring 30-min inactivity window)
* **Orders** — Customer item orders, special requests, and live kitchen order queue (`ACCEPTED` → `PREPARING` → `READY` → `SERVED`)
* **Billing & Payments** — Real-time bill calculation, tax & service charges, multi-payment options (`UPI`, `CASH`, `CARD`), and automated table release

### Upcoming Flows (In Progress)

* Feedback with 1–5 star ratings (V10)
* WebSocket real-time updates for kitchen & customer status sync

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.5.5 |
| **Security** | Spring Security 6 + JJWT 0.12.7 (HS384 signed JWTs) |
| **Persistence** | Spring Data JPA + Hibernate 6 |
| **Database** | PostgreSQL 15+ |
| **Migrations** | Flyway |
| **Validation** | Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Email`) |
| **API Docs** | SpringDoc OpenAPI 3 (Swagger UI at `/swagger-ui.html`) |
| **WebSocket** | Spring WebSocket (STOMP over SockJS) |
| **Build Tool** | Maven (Maven Wrapper included) |
| **Boilerplate** | Lombok |

---

## Project Structure

```text
backend/
└── src/
    ├── main/
    │   ├── java/com/miniproject/plato/
    │   │   ├── PlatoApplication.java
    │   │   │
    │   │   ├── auth/                             # JWT login
    │   │   │   ├── AuthController.java
    │   │   │   ├── AuthService.java
    │   │   │   ├── AuthServiceImpl.java
    │   │   │   └── dto/
    │   │   │       ├── LoginRequest.java
    │   │   │       └── LoginResponse.java
    │   │   │
    │   │   ├── modules/                          # Feature modules
    │   │   │   ├── user/                         # Staff user management
    │   │   │   │   ├── User.java
    │   │   │   │   ├── UserRole.java             # SUPER_ADMIN | OWNER | EMPLOYEE
    │   │   │   │   ├── UserStatus.java           # ACTIVE | SUSPENDED | DELETED
    │   │   │   │   ├── UserRepository.java
    │   │   │   │   ├── UserService.java
    │   │   │   │   ├── UserServiceImpl.java
    │   │   │   │   ├── UserMapper.java
    │   │   │   │   ├── UserController.java
    │   │   │   │   ├── DataInitializer.java     # Seeds SUPER_ADMIN on first boot
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   ├── restaurant/                   # Restaurant management
    │   │   │   │   ├── Restaurant.java
    │   │   │   │   ├── RestaurantStatus.java     # ACTIVE | INACTIVE | SUSPENDED
    │   │   │   │   ├── RestaurantRepository.java
    │   │   │   │   ├── RestaurantService.java
    │   │   │   │   ├── RestaurantServiceImpl.java
    │   │   │   │   ├── RestaurantMapper.java
    │   │   │   │   ├── RestaurantController.java
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   ├── table/                        # Tables & QR code management
    │   │   │   │   ├── RestaurantTable.java
    │   │   │   │   ├── TableStatus.java          # AVAILABLE | OCCUPIED | RESERVED | MAINTENANCE
    │   │   │   │   ├── TableRepository.java
    │   │   │   │   ├── QrTokenService.java       # SecureRandom 64-char hex token
    │   │   │   │   ├── TableService.java
    │   │   │   │   ├── TableServiceImpl.java
    │   │   │   │   ├── TableMapper.java
    │   │   │   │   ├── TableController.java
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   ├── employee/                     # Restaurant staff assignments
    │   │   │   │   ├── Employee.java
    │   │   │   │   ├── EmployeeRole.java         # MANAGER | CHEF | WAITER | CASHIER
    │   │   │   │   ├── EmployeeRepository.java
    │   │   │   │   ├── EmployeeService.java
    │   │   │   │   ├── EmployeeServiceImpl.java
    │   │   │   │   ├── EmployeeMapper.java
    │   │   │   │   ├── EmployeeController.java
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   ├── menu/                         # Menu categories & items
    │   │   │   │   ├── MenuCategory.java
    │   │   │   │   ├── MenuItem.java
    │   │   │   │   ├── MenuCategoryRepository.java
    │   │   │   │   ├── MenuItemRepository.java
    │   │   │   │   ├── MenuService.java
    │   │   │   │   ├── MenuServiceImpl.java
    │   │   │   │   ├── MenuController.java
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   ├── session/                      # Customer dining sessions
    │   │   │   │   ├── CustomerSession.java
    │   │   │   │   ├── CustomerSessionRepository.java
    │   │   │   │   ├── CustomerSessionService.java
    │   │   │   │   ├── CustomerSessionServiceImpl.java
    │   │   │   │   ├── CustomerSessionController.java
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   ├── order/                        # Kitchen orders & tracking
    │   │   │   │   ├── Order.java
    │   │   │   │   ├── OrderItem.java
    │   │   │   │   ├── OrderRepository.java
    │   │   │   │   ├── OrderService.java
    │   │   │   │   ├── OrderServiceImpl.java
    │   │   │   │   ├── CustomerOrderController.java
    │   │   │   │   ├── StaffOrderController.java
    │   │   │   │   └── dto/
    │   │   │   │
    │   │   │   └── billing/                      # Bill calculation & payments
    │   │   │       ├── Payment.java
    │   │   │       ├── PaymentRepository.java
    │   │   │       ├── BillingService.java
    │   │   │       ├── BillingServiceImpl.java
    │   │   │       ├── CustomerBillingController.java
    │   │   │       ├── StaffBillingController.java
    │   │   │       └── dto/
    │   │   │
    │   │   ├── common/                           # Shared building blocks
    │   │   │   ├── BaseEntity.java               # UUID PK + createdAt + updatedAt
    │   │   │   ├── ApiResponse.java              # Universal response envelope
    │   │   │   └── PagedResponse.java
    │   │   │
    │   │   ├── config/
    │   │   │   ├── AppConfig.java                # BCrypt PasswordEncoder bean
    │   │   │   └── SecurityConfig.java           # Filter chain, CORS, CSRF, session
    │   │   │
    │   │   ├── security/
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── JwtTokenProvider.java         # Sign, validate, extract claims
    │   │   │   └── UserDetailsServiceImpl.java
    │   │   │
    │   │   └── exception/
    │   │       ├── GlobalExceptionHandler.java
    │   │       ├── PlatoException.java           # Base exception
    │   │       ├── ResourceNotFoundException.java# 404
    │   │       ├── ConflictException.java        # 409
    │   │       ├── UnauthorizedAccessException.java# 403
    │   │       └── ValidationException.java      # 400
    │   │
    │   └── resources/
    │       ├── application.yml                   # Base config (uses ENV variables)
    │       ├── application-local.yml             # Local dev overrides (git-ignored)
    │       └── db/migration/
    │           ├── V1__create_enums.sql          # All PostgreSQL custom enum types
    │           ├── V2__create_users.sql
    │           ├── V3__create_restaurants.sql
    │           ├── V4__create_restaurant_tables.sql
    │           ├── V5__create_employees.sql
    │           ├── V6__create_menu.sql
    │           ├── V7__create_customer_sessions.sql
    │           ├── V8__create_orders.sql
    │           └── V9__create_payments.sql
```

---

## Getting Started

### Prerequisites

* Java 21+
* Maven 3.9+ (or use `./mvnw` wrapper — no install needed)
* PostgreSQL 15+

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE plato_db;"
```

### 2. Configure Local Environment

Edit `backend/src/main/resources/application-local.yml` with your local PostgreSQL credentials:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/plato_db
    username: postgres
    password: postgres

plato:
  jwt:
    secret: plato-dev-jwt-secret-key-that-is-at-least-32-chars-long
  seed:
    admin:
      email: admin@plato.com
      password: password123
      name: Admin User
```

### 3. Run Locally

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

### 4. Verify

* Health Check: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) → `{"status":"UP"}`
* Swagger Explorer: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

On first boot, Flyway applies all migrations and `DataInitializer` seeds a Super Admin account automatically.

---

## Environment Variables

| Variable | Required | Description | Local default |
|---|---|---|---|
| `DB_URL` | ✅ | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/plato_db` |
| `DB_USER` | ✅ | Database username | `postgres` |
| `DB_PASSWORD` | ✅ | Database password | `postgres` |
| `JWT_SECRET` | ✅ | HS384 signing secret (min 32 chars) | `plato-dev-jwt-secret-key...` |
| `ADMIN_EMAIL` | ✅ | Email for the seeded Super Admin account | `admin@plato.com` |
| `ADMIN_PASSWORD` | ✅ | Password for the seeded Super Admin account | `password123` |
| `ADMIN_NAME` | ❌ | Display name for the Super Admin | `Admin User` |
| `QR_BASE_URL` | ❌ | Base URL prefix embedded in QR codes | `http://localhost:3000/qr` |

---

## API Reference

All responses follow the consistent envelope shape:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Login with email + password → returns JWT |

**Sample Login Request:**
```json
{
  "email": "admin@plato.com",
  "password": "password123"
}
```

---

### Users

*All endpoints require `Authorization: Bearer <token>`.*

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | `SUPER_ADMIN` | Paginated list of all users |
| `POST` | `/api/v1/users` | `SUPER_ADMIN` | Create a new user (`OWNER` / `EMPLOYEE`) |
| `GET` | `/api/v1/users/{id}` | `SUPER_ADMIN` or self | Get user by ID |
| `PATCH` | `/api/v1/users/{id}` | `SUPER_ADMIN` or self | Update user details |
| `PATCH` | `/api/v1/users/{id}/status` | `SUPER_ADMIN` | Activate / suspend / delete |
| `DELETE` | `/api/v1/users/{id}` | `SUPER_ADMIN` | Soft delete (`status = DELETED`) |

---

### Restaurants

*All endpoints require `Authorization: Bearer <token>`.*

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/restaurants` | `OWNER` | Create a restaurant |
| `GET` | `/api/v1/restaurants` | `OWNER` / `SUPER_ADMIN` | List (owner sees own, super admin sees all) |
| `GET` | `/api/v1/restaurants/{id}` | `OWNER` / `SUPER_ADMIN` | Get one restaurant |
| `PUT` | `/api/v1/restaurants/{id}` | `OWNER` | Update restaurant details |
| `PATCH` | `/api/v1/restaurants/{id}/status` | `SUPER_ADMIN` | Change status (`?value=SUSPENDED`) |
| `GET` | `/api/v1/restaurants/{id}/settings` | `OWNER` | Get payment & order settings |
| `PUT` | `/api/v1/restaurants/{id}/settings` | `OWNER` | Update payment & order settings |

---

### Tables & QR Codes

*All endpoints require `Authorization: Bearer <token>`.*

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/restaurants/{id}/tables` | `OWNER` | Create table — auto-generates QR token |
| `GET` | `/api/v1/restaurants/{id}/tables` | `OWNER` / `SUPER_ADMIN` | List all tables for a restaurant |
| `GET` | `/api/v1/restaurants/{id}/tables/{tableId}` | `OWNER` / `SUPER_ADMIN` | Get single table |
| `PUT` | `/api/v1/restaurants/{id}/tables/{tableId}` | `OWNER` | Update capacity, label, or status |
| `DELETE` | `/api/v1/restaurants/{id}/tables/{tableId}` | `OWNER` | Delete a table |
| `POST` | `/api/v1/restaurants/{id}/tables/{tableId}/qr/regenerate` | `OWNER` | Regenerate QR token — invalidates old QR |

---

### Employees

*All endpoints require `Authorization: Bearer <token>`.*

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/restaurants/{id}/employees` | `OWNER` | Assign a user (`EMPLOYEE` role) to restaurant |
| `GET` | `/api/v1/restaurants/{id}/employees` | `OWNER` / `SUPER_ADMIN` | List all active employees |
| `PATCH` | `/api/v1/restaurants/{id}/employees/{eid}/role` | `OWNER` | Change employee role (`MANAGER`, `CHEF`, `WAITER`, `CASHIER`) |
| `DELETE` | `/api/v1/restaurants/{id}/employees/{eid}` | `OWNER` | Deactivate employee (`is_active = false`) |

---

### Menu

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/restaurants/{id}/menu/categories` | `OWNER` | Create menu category |
| `GET` | `/api/v1/restaurants/{id}/menu` | **PUBLIC** | View full active restaurant menu catalog |
| `POST` | `/api/v1/restaurants/{id}/menu/items` | `OWNER` | Add menu item under a category |
| `PUT` | `/api/v1/restaurants/{id}/menu/items/{itemId}` | `OWNER` | Update dish price, name, description |
| `PATCH` | `/api/v1/restaurants/{id}/menu/items/{itemId}/availability` | `OWNER` | Toggle dish availability (in stock / out of stock) |

---

### Customer Sessions

*Customer entry is initiated by scanning the physical table QR code.*

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/customer/sessions/start` | **PUBLIC (QR Token)** | Start or rejoin a dining session at a table |
| `GET` | `/api/v1/customer/sessions/current` | `X-Session-Token` | Get active session metadata (extends 30-min window) |
| `POST` | `/api/v1/restaurants/{restaurantId}/sessions/{sessionId}/close` | `OWNER` / `EMPLOYEE` / `SUPER_ADMIN` | Staff closes session and releases table to `AVAILABLE` |

---

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/customer/orders` | `X-Session-Token` | Place order from table (captures price snapshot) |
| `GET` | `/api/v1/customer/orders` | `X-Session-Token` | List all orders for current dining session |
| `GET` | `/api/v1/customer/orders/{id}` | `X-Session-Token` | Get order status and line items |
| `PATCH` | `/api/v1/customer/orders/{id}/cancel` | `X-Session-Token` | Cancel pending order |
| `DELETE` | `/api/v1/customer/orders/{id}/items/{itemId}` | `X-Session-Token` | Remove line item from pending order |
| `GET` | `/api/v1/restaurants/{id}/orders` | `OWNER` / `EMPLOYEE` / `SUPER_ADMIN` | Live kitchen order queue (FIFO sorted) |
| `PATCH` | `/api/v1/orders/{id}/status` | `OWNER` / `EMPLOYEE` / `SUPER_ADMIN` | Advance stage (`ACCEPTED` → `PREPARING` → `READY` → `SERVED`) |

---

### Billing & Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/customer/billing/summary` | `X-Session-Token` | Real-time bill summary aggregated across all orders |
| `POST` | `/api/v1/customer/billing/request-bill` | `X-Session-Token` | Request bill with payment method (`CASH`, `CARD`, `UPI`) |
| `GET` | `/api/v1/customer/billing/payment` | `X-Session-Token` | Check payment status for current session |
| `GET` | `/api/v1/restaurants/{id}/payments` | `OWNER` / `EMPLOYEE` / `SUPER_ADMIN` | List payments / bill requests for a restaurant |
| `GET` | `/api/v1/restaurants/{id}/payments/{id}` | `OWNER` / `EMPLOYEE` / `SUPER_ADMIN` | View specific payment details |
| `POST` | `/api/v1/restaurants/{id}/payments/{id}/complete` | `OWNER` / `EMPLOYEE` / `SUPER_ADMIN` | Confirm payment, close session, and release table |

---

## Database Schema

Migrations live in `backend/src/main/resources/db/migration/`. Flyway applies them in version order:

* `V1__create_enums.sql` — `user_role`, `user_status`, `restaurant_status`, `employee_role`, `table_status`, `session_status`, `order_status`, `order_item_status`, `payment_method`, `payment_status`
* `V2__create_users.sql` — `users` table
* `V3__create_restaurants.sql` — `restaurants` table (includes embedded settings columns)
* `V4__create_restaurant_tables.sql` — `restaurant_tables` + secure `qr_token`
* `V5__create_employees.sql` — `employees` with role per restaurant
* `V6__create_menu.sql` — `menu_categories` + `menu_items`
* `V7__create_customer_sessions.sql` — `customer_sessions` + `session_token`
* `V8__create_orders.sql` — `orders` + `order_items`
* `V9__create_payments.sql` — `payments` with bill breakdown

---

## Security Architecture

```text
HTTP Request
  │
  ▼
JwtAuthenticationFilter     Runs on EVERY request. Extracts & validates JWT from
                            Authorization header. Populates SecurityContextHolder.
  │
  ▼
@PreAuthorize on Controller  Spring Security evaluates SpEL expression:
                            hasRole('OWNER') checks for ROLE_OWNER authority.
                            Throws 403 (AccessDeniedException) on mismatch.
  │
  ▼
Service Layer               Re-validates ownership at business level:
                            restaurant.getOwnerId().equals(callerId)
                            Throws 403 (UnauthorizedAccessException) on mismatch.
  │
  ▼
GlobalExceptionHandler      Catches ALL exceptions and maps them to consistent
                            ApiResponse JSON bodies.
```

* **Token lifetime:** 24 hours (configurable via `plato.jwt.expiration`)
* **Algorithm:** HS384 (HMAC-SHA384)
* **Principal stored in token:** `userId` (UUID string) — never email or PII
