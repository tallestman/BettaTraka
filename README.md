# BettaTraka - Self-Hosted Payment-on-Delivery (POD) CRM

BettaTraka is a production-grade, multi-tenant CRM designed for payment-on-delivery (POD) eCommerce merchants. The backend foundation is built for self-hosting on your own Virtual Private Server (VPS) using Node.js, Express, TypeScript, and a private PostgreSQL database.

---

## Architecture Overview

- **Backend API**: Node.js & Express in TypeScript (`server.ts`, `server/app.ts`, `server/routes/`).
- **Database**: PostgreSQL 16 with versioned SQL migrations (`server/migrations/`).
- **Authentication**: `bcryptjs` password hashing (never plaintext) + cryptographically signed JWT sessions with database session revocation (`sessions` table).
- **Multi-Tenancy**: Organization-level isolation enforced on all queries (`organization_id` foreign key).
- **Role-Based Access Control (RBAC)**: Server-enforced permissions (`Owner`, `Admin`, `Manager`, `Accountant`, `Sales Representative`, `Distributor`, `Inventory Manager`, `Media Buyer`).
- **Anti-Self-Escalation**: Guards preventing staff members from modifying their own roles or promoting themselves to Owner.
- **Frontend**: React 19 SPA with Tailwind CSS, seamlessly integrated with the backend API via `AuthContext` and `AuthModal`.

---

## VPS Deployment Guide

### Option 1: Docker Compose (Recommended)

PostgreSQL is isolated within an internal container bridge network (`bettatraka-internal`) and is **never** exposed to the public Internet or host ports.

1. **Clone the repository onto your VPS**:
   ```bash
   git clone <your-repo-url> /opt/bettatraka
   cd /opt/bettatraka
   ```

2. **Configure your environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your secure production values:
   ```env
   PORT=3000
   NODE_ENV=production
   POSTGRES_DB=bettatraka
   POSTGRES_USER=bettatraka_user
   POSTGRES_PASSWORD=your_strong_generated_password
   JWT_SECRET=your_32_character_random_secret_key
   CORS_ORIGIN=https://crm.yourdomain.com
   ```

3. **Start the containers**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify health check**:
   ```bash
   curl http://localhost:3000/api/health
   ```

The application runs database migrations automatically on startup when connected to PostgreSQL.

---

### Option 2: Native VPS Setup (systemd + Node.js)

1. **Install Prerequisites**:
   - Node.js >= 20.x
   - PostgreSQL 16
   - npm or bun

2. **Configure PostgreSQL**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE bettatraka;
   CREATE USER bettatraka_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE bettatraka TO bettatraka_user;
   \q
   ```

3. **Install Dependencies & Build Frontend**:
   ```bash
   npm install
   npm run build
   ```

4. **Run Database Migrations**:
   ```bash
   export DATABASE_URL="postgresql://bettatraka_user:your_secure_password@127.0.0.1:5432/bettatraka"
   npm run migrate
   ```

5. **Start Server**:
   ```bash
   npm start
   ```

---

## Database Migrations

Migrations are stored in `/server/migrations/` and execute in strict alphabetical/numerical order:
- `001_initial_schema.sql`: Core tables (`users`, `organizations`, `organization_memberships`, `sessions`, `audit_events`).
- `002_pilot_entities.sql`: Pilot CRM entities (`products`, `product_packages`, `order_forms`, `customers`, `orders`, `order_items`, `inventory_locations`, `inventory_balances`, `inventory_movements`, `remittances`).

To run pending migrations:
```bash
npm run migrate
```

---

## Testing & Verification

Run the test suite:
```bash
npm test
```

The automated test suite covers:
- Password hashing security (bcrypt salts, plaintext prevention, strength validation).
- Cryptographic JWT session issuance, signature verification, and tampering detection.
- Deterministic SHA-256 session token hashing for server-side revocation.
- Server-side RBAC middleware (`requireRole`) blocking unauthorized access.
- Anti-self-escalation guard (`preventSelfEscalation`) blocking non-Owners from assigning Owner privileges and blocking staff self-promotion.
- Protected API routes returning HTTP 401 Unauthorized when unauthenticated.
- Health status and database connection reporting.
- Multi-tenant data isolation when PostgreSQL is active (or marked NOT RUN when PostgreSQL is offline).

---

## Security Specifications

1. **Zero Plaintext Passwords**: All user passwords hashed using `bcryptjs` with salt rounds.
2. **Server-Side Authorization**: Frontend route guards are for UX only; every mutation verifies JWT and database membership.
3. **Multi-Tenant Scoping**: All queries filter by `WHERE organization_id = req.membership.organizationId`.
4. **Session Revocation**: Logout immediately marks the session token revoked in the PostgreSQL `sessions` table.
5. **Safe Degradation**: Missing database credentials return explicit HTTP 503 errors with setup guidance, never defaulting to silent mock admin access.
