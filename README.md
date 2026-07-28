# CivicTrack — Citizen Complaint & Resolution Portal

A full-stack complaint management system for municipal governance. Citizens file complaints, officers resolve them, admins oversee everything.

**Backend:** NestJS · TypeORM · PostgreSQL  
**Frontend:** Next.js 14 (App Router) · Tailwind CSS · shadcn/ui  
**Auth:** JWT via HttpOnly cookies (access 15m · refresh 7d)  
**Storage:** Cloudinary · **Email:** Resend SMTP  
**Deploy:** Railway (backend + DB) · Vercel (frontend)

---

## Repository Structure

```
civictrack/
├── backend/          # NestJS API (port 3001)
├── frontend/         # Next.js 14 (port 3000)
├── docs/             # Architecture, API contracts, workflows, UI guidelines
├── docker-compose.yml
├── Dockerfile        # Backend image
├── Dockerfile.frontend
├── docker/entrypoint.sh
└── CLAUDE.md         # AI agent instructions & project spec
```

---

## Quick Start (Local Dev)

### Prerequisites

- Node.js >= 20
- Docker (for PostgreSQL, or bring your own)

### 1. Database

```bash
docker run --name civictrack-db \
  -e POSTGRES_USER=civictrack \
  -e POSTGRES_PASSWORD=civictrack \
  -e POSTGRES_DB=civictrack \
  -p 5433:5432 -d postgres:15
```

> Port 5433 avoids conflicts with any native Postgres on 5432.

### 2. Backend

```bash
cd backend
cp .env.example .env    # fill in JWT secrets + Cloudinary + Resend credentials
npm install
npm run start:dev       # http://localhost:3001
                        # Swagger: http://localhost:3001/api/docs
npm run seed            # load demo data (departments, categories, users, 22 complaints)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm install
npm run dev             # http://localhost:3000
```

---

## Run with Docker Compose

Spins up Postgres + backend (auto-seeds on first boot) + frontend:

```bash
docker compose up --build
```

Access: frontend at `http://localhost:3000` · backend at `http://localhost:3001` · Swagger at `http://localhost:3001/api/docs`

To reseed: `docker compose down -v && docker compose up`

---

## Demo Accounts

| Role    | Email                       | Password      |
|---------|-----------------------------|---------------|
| Admin   | admin@civictrack.app        | Admin@1234    |
| Officer | officer@civictrack.app      | Officer@1234  |
| Citizen | citizen@civictrack.app      | Citizen@1234  |

---

## Deployment

**Backend → Railway**
1. Connect repo, set root directory to `backend/`
2. Add all env vars from `backend/.env.example`
3. Add PostgreSQL plugin (sets `DATABASE_URL` automatically)

**Frontend → Vercel**
1. Connect repo, set root directory to `frontend/`
2. Set `NEXT_PUBLIC_API_URL` to the Railway backend URL

---

## Docs

| Document | Description |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Full project spec, entity definitions, API reference, coding standards |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, auth flow, module dependency graph, security layers |
| [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) | Exact request/response shapes for every endpoint |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md) | Business process flows (WF-01 through WF-11) |
| [docs/UI_GUIDELINES.md](docs/UI_GUIDELINES.md) | Design system, component patterns, accessibility rules |
| [docs/COMPONENT_INVENTORY.md](docs/COMPONENT_INVENTORY.md) | Reusable UI component catalog with variants |
| [docs/SCREEN_INVENTORY.md](docs/SCREEN_INVENTORY.md) | All 28 mockup screens mapped to routes |
| [docs/ROUTE_MAP.md](docs/ROUTE_MAP.md) | Next.js route reconciliation and nav structure |
| [docs/USER_FLOWS.md](docs/USER_FLOWS.md) | End-to-end user journeys cross-referenced to screens |
