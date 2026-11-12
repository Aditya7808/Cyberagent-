# 🛡️ SentinelAI

**An Enterprise AI Agent Security & Reliability Platform**

SentinelAI is an enterprise platform designed to assess, protect, and monitor AI agents that interact with company documents, databases, APIs, and business tools.

---

## 🏗️ Architecture & Modules

- **API Gateway (FastAPI)**: REST endpoints for users, organizations, agents, test runs, documents, and audit logs.
- **Runtime Security Layer**:
  - Deterministic Input & Prompt Injection Inspection (`InputSecurityInspector`)
  - Microsoft Presidio PII Detection & Anonymization (`PIIDetector`)
  - Server-side Tool Authorization with Deny-by-Default & Human-in-the-Loop (`ToolAuthorizer`)
  - Sanitized Output Inspection (`OutputSecurityInspector`)
- **Secure RAG Knowledge Base**:
  - Multi-tenant isolated documents with role- and document-level access classifications (`public`, `internal`, `confidential`, `restricted`)
  - Vector embeddings powered by PostgreSQL `pgvector`
- **Adversarial Red Team Engine**:
  - Automated direct and indirect prompt injection, jailbreak, and data extraction test suites
- **Enterprise Observability & Tamper-Evident Audit**:
  - OpenTelemetry tracing and structured audit log persistence

---

## 🚀 Quickstart with Docker Compose

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 20+ & Python 3.11+ (for local bare-metal development)

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Spin up full stack
```bash
docker-compose up --build -d
```
Services started:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL with pgvector**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

### 4. Seed Multi-Tenant Synthetic RAG Data
Populates the database with 3 enterprise tenants (`Acme Corporation`, `Globex Inc`, `Wayne Enterprises`) containing realistic HR policies, employee records with PII, IT runbooks, and financial reports:
```bash
docker-compose exec backend python app/seed.py
```

---

## 🧪 Running Tests
```bash
docker-compose exec backend pytest -v
```

---

## 📂 Repository Structure
```
sentinel-ai/
├── docker-compose.yml        # Orchestrates pgvector, redis, backend, frontend
├── .env.example              # Development environment defaults
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI REST routers (agents, docs, audit, etc.)
│   │   ├── models/           # SQLAlchemy 2.0 ORM models (UUID PKs, pgvector)
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── security/         # Presidio PII detector, tool authorizer, inspectors
│   │   ├── main.py           # Application entrypoint & lifespan
│   │   └── seed.py           # Multi-tenant database seed script
│   ├── data/seed/            # Synthetic RAG datasets (Acme, Globex, Wayne)
│   ├── alembic/              # Async database migration configuration
│   └── tests/                # Automated pytest suite
└── frontend/
    ├── src/
    │   ├── components/       # Layout, Navigation, Header
    │   ├── pages/            # Dashboard, Agents, Playground, RedTeam, Docs, Audit
    │   └── types/            # TypeScript definitions
    └── package.json
```

