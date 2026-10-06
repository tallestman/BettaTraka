# BettaTraka Backend Foundation & Production Roadmap

## Executive Overview
BettaTraka is transitioning from a browser-local prototype into a self-hosted, multi-tenant Payment-on-Delivery (POD) CRM designed for self-hosting on a Virtual Private Server (VPS). 

This plan tracks milestones, technical specifications, and verification acceptance criteria.

---

## Milestone Status

| Milestone | Scope | Status | Acceptance Tests |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | **Backend Schema, Real Auth, Multi-Tenancy & VPS Foundation** | **COMPLETED** | 14/14 Automated Tests Passing |
| **Milestone 2** | Public Order Intake, Durable Ingestion & Idempotency | PENDING | Public Intake Suite |
| **Milestone 3** | Transactional Orders, Atomic Stock & Immutable Ledgers | PENDING | Ledger & Balance Suite |
| **Milestone 4** | Automated E2E Testing, Auditing & VPS Pilot Handover | PENDING | Production Readiness Suite |

---

## Milestone 1: Detailed Specifications (Current Scope)

### 1. Database & Schema Architecture
- **PostgreSQL 16 Engine**: Schema migrations running in versioned order (`server/migrations/`).
- **Tenancy Model**: Every tenant entity explicitly carries `organization_id` foreign key.
- **Tables Provisioned**:
  - `users`: Core identity, password hashes (`bcrypt`), contact info, status.
  - `organizations`: Business workspace, currency, timezone (`Africa/Lagos`), status.
  - `organization_memberships`: Role-based membership (`Owner`, `Admin`, `Manager`, `Accountant`, `Sales Representative`, `Distributor`, `Inventory Manager`, `Media Buyer`), status (`ACTIVE`, `SUSPENDED`, `INVITED`).
  - `sessions` / `auth_tokens`: Revocable token store and audit trail.
  - `audit_events`: Durable activity ledger.
  - Pilot entity tables for Products, Customers, Orders, Inventory Balances, Remittances.

### 2. Authentication & Authorization
- **Password Security**: `bcryptjs` hashing with salt rounds (cost 12). Plaintext passwords never stored.
- **Token Security**: Cryptographically signed JWT session tokens with organization context and server-side revocation tracking.
- **Server-Side RBAC**: Middleware (`authenticate`, `requireOrg`, `requireRole`) validating user status and organization ownership on every request.
- **Anti-Escalation**: Strict guard preventing staff from granting themselves `Owner` privileges.

### 3. VPS Self-Hosting & Containerization
- **Docker Compose**: Production compose file isolating PostgreSQL within private container network `bettatraka-internal`.
- **Environment Configuration**: `.env.example` with clean placeholders only (no exposed secrets).
- **Graceful Error Handling**: Database connection failures produce explicit setup guides rather than silently defaulting to demo mode.

### 4. Frontend Integration
- Dedicated `AuthContext` replacing demo persona switching in production.
- Real login, signup, session restoration, and logout.
- Protected route gates rendering unauthenticated / setup states safely.

---

## Milestone 1 Acceptance Criteria
1. Unauthenticated visitors cannot access private organization records.
2. Registration hashes password with bcrypt and creates tenant workspace with Owner role.
3. Login verifies credentials against database; invalid credentials return 401.
4. Staff member cannot promote themselves to Owner.
5. Organization A cannot view or alter Organization B records.
6. Logout invalidates session token.
7. Missing DB credentials show explicit setup error instead of silent mock admin escalation.
8. Docker Compose runs on private network with persistent volume storage.
