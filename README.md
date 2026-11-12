# 🛡️ SentinelAI — Enterprise AI Agent Security & Reliability Platform

[![CI/CD Pipeline](https://github.com/Aditya7808/Cyberagent-/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Aditya7808/Cyberagent-/actions)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/Orchestrator-LangGraph-orange.svg)](https://github.com/langchain-ai/langgraph)
[![pgvector](https://img.shields.io/badge/Vector%20DB-pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SentinelAI is an enterprise platform designed to **assess, protect, and monitor AI agents** interacting with corporate documents, databases, APIs, and business tools before and during production deployment.

---

## 🗺️ Completed 8-Phase Delivery Roadmap

| Phase | Milestone | Deliverables | Status |
|-------|-----------|--------------|--------|
| **P0** | **Foundation** | Monorepo structure, FastAPI, PostgreSQL + `pgvector`, Alembic, 3-tenant synthetic RAG data (`Acme`, `Globex`, `Wayne`) | ✅ Done |
| **P1** | **Agent Playground** | LangGraph stateful workflow, Bedrock + Mock LLM providers, tool execution engine, conversation history, interactive Playground UI | ✅ Done |
| **P2** | **Security Baseline** | Custom PII/Secrets engine (AWS keys, SSNs, Badges), multi-vector injection detector (DAN, Developer mode, zero-width obfuscation), dynamic policies API | ✅ Done |
| **P3** | **Tool Authorization** | Parameter schema validator, approval state machine (`pending`, `approved`, `rejected`), audit logging service, Human-in-the-Loop UI | ✅ Done |
| **P4** | **Secure RAG** | Semantic text chunker, 1536-dim vector embeddings, role-based document ACLs, hard tenant isolation queries, live RAG query UI | ✅ Done |
| **P5** | **Red Team & Evaluation** | Golden benchmark dataset (`golden_dataset.json`), ASR / PII / RAGAS metrics calculator, regression runner, evaluation dashboard | ✅ Done |
| **P6** | **Observability & Audit** | OpenTelemetry traces with telemetry redaction, runtime metric counters, audit query & export APIs, tamper-evident audit table | ✅ Done |
| **P7** | **Deployment & Hardening**| Production security headers (CSP, HSTS), rate limiter, Terraform AWS IaC (VPC, ECS Fargate, ALB, RDS, KMS), GitHub Actions CI/CD | ✅ Done |

---

## 🏗️ Request Lifecycle Architecture

```
User Request
     │
     ▼
[ 1. Authenticate ] ──► Cognito / JWT token context & tenant boundary
     │
     ▼
[ 2. Inspect Input ] ──► Deterministic injection filter, jailbreak detector & PII scan
     │
     ▼
[ 3. Orchestrate ] ──► LangGraph stateful agent execution loop & token budget
     │
     ▼
[ 4. Secure Retrieval ] ──► Tenant-isolated vector search with document ACLs (pgvector)
     │
     ▼
[ 5. Authorize Tools ] ──► Parameter schema validation & Human-in-the-loop approval gate
     │
     ▼
[ 6. Inspect Output ] ──► Presidio PII anonymization & sensitive data redaction
     │
     ▼
[ 7. Observe & Audit ] ──► OpenTelemetry spans, latency tracking, append-only audit trail
     │
     ▼
[ 8. Evaluate & Improve] ──► Automated golden dataset regression testing (ASR < 5%)
```

---

## 🚀 Quickstart Guide

### 1. Run Full Stack with Docker Compose
```bash
# Clone the repository
git clone https://github.com/Aditya7808/Cyberagent-.git
cd Cyberagent-

# Start PostgreSQL (pgvector), Redis, FastAPI backend & React frontend
docker-compose up --build -d
```

### 2. Available Endpoints
- **Frontend Security Dashboard**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Swagger Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Seed Multi-Tenant Enterprise Data
Seeds 3 isolated enterprise tenants (`Acme Corporation`, `Globex Inc`, `Wayne Enterprises`) with HR policies, IT disaster recovery runbooks, confidential financials, and employee records:
```bash
docker-compose exec backend python app/seed.py
```

### 4. Run Automated Test Suites
Runs the comprehensive test suite across security modules, tool authorization, secure RAG, evaluation framework, and concurrent load stress tests:
```bash
docker-compose exec backend pytest backend/tests -v
```

---

## ☁️ Production AWS Deployment with Terraform

Terraform Infrastructure as Code (IaC) is included under `terraform/`:
- **Amazon ECS Fargate**: Serverless container execution for backend & frontend
- **Application Load Balancer (ALB)**: TLS termination and path-based routing (`/api/*` -> backend)
- **Amazon RDS PostgreSQL 16 Multi-AZ**: High-availability vector database
- **Amazon S3 & KMS**: Encrypted document store with Customer-Managed Keys

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

---

## 🔒 Security Compliance & Guardrails

- **Zero-Trust Tool Policy**: Deny-by-default execution. Restricted tools pause for explicit human administrator sign-off.
- **Tenant Isolation**: Database-level queries enforce strict `org_id` boundaries. Cross-tenant retrieval attempts are intercepted and audited.
- **Telemetry Redaction**: Passwords, SSNs, and secret tokens are sanitized prior to OpenTelemetry export.
