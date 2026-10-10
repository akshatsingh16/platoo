# Plato - QR-Based Restaurant Management System

Plato is a full-stack restaurant management platform featuring table QR ordering, employee management, kitchen workflow, order tracking, and an admin dashboard.

---

## 🏗️ Architecture

- **Frontend**: Next.js 16 (React 19, Tailwind CSS v4, Radix/shadcn-style UI) running on port `3000`
- **Backend**: Spring Boot 3.5 (Java 21, Spring Data JPA, Spring Security, JWT, Flyway, WebSocket, OpenAPI/Swagger) running on port `8080`
- **Database**: PostgreSQL (Default port `5432`, database: `plato_db`)

---

## 📋 Prerequisites

Before running the project, make sure you have installed:
- [Node.js](https://nodejs.org/) (v20+ recommended) & npm
- [Java Development Kit (JDK) 21+](https://www.oracle.com/java/technologies/downloads/#java21)
- [PostgreSQL](https://www.postgresql.org/download/) (v15+)

---

## 🚀 Quick Start Guide

### Step 1: Database Setup

1. Start your local PostgreSQL service.
2. Create the database `plato_db` using psql or pgAdmin:
   ```sql
   CREATE DATABASE plato_db;
   ```
   > By default, the local configuration connects using username `postgres` and password `postgres`.
   > If your credentials differ, update `backend/src/main/resources/application-local.yml` or set environment variables `DB_USER` and `DB_PASSWORD`.

3. *(Optional)* Load demo seed data:
   **PowerShell**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File backend\demo\seed-demo.ps1
   ```
   *(Or execute `backend/demo/demo_seed.sql` directly into `plato_db`).*

---

### Step 2: Run the Backend (Spring Boot)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Start the backend with the `local` profile:

   - **Windows PowerShell**:
     ```powershell
     .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
     ```
     *(Note: Keep quotes around `"-Dspring-boot.run.profiles=local"` so PowerShell passes the property intact to Maven).*

   - **Windows Command Prompt (cmd.exe)**:
     ```cmd
     mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
     ```

   - **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
     ```

3. Verify: Once you see `Tomcat started on port 8080 (http)` and `Started PlatoApplication`, the backend is ready:
   - Base URL: `http://localhost:8080`
   - Swagger / OpenAPI Docs: `http://localhost:8080/swagger-ui/index.html`

---

### Step 3: Run the Frontend (Next.js)

1. Open a separate terminal in the root project directory (`Plato/`):

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> During development, API calls made to `/api/v1/:path*` are automatically proxied to the backend at `http://localhost:8080/api/v1/:path*` via `next.config.ts`. Always start the backend first to prevent connection errors.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@plato.com` | `password123` |

Login page: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🛠️ Common Troubleshooting

### 1. `LifecyclePhaseNotFoundException` in PowerShell
- **Problem**: Running `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local` fails because PowerShell interprets `-D...` as a parameter.
- **Solution**: Wrap the property in quotes:
  ```powershell
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
  ```

### 2. `ECONNREFUSED 127.0.0.1:8080` on `npm run dev`
- **Problem**: Next.js attempts to reach the backend service proxy on port 8080 before it has booted.
- **Solution**: Start the backend in Terminal 1 first until it finishes loading, then run `npm run dev` in Terminal 2.

### 3. Flyway Migration or Database Connection Issues
- Verify that PostgreSQL service is running on port 5432:
  ```powershell
  Test-NetConnection -ComputerName localhost -Port 5432
  ```
- Ensure the database `plato_db` has been created.
