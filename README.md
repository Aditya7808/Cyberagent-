# SentinelAI

**Enterprise AI Agent Security & Reliability Control Plane**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![OWASP LLM Top 10](https://img.shields.io/badge/Security-OWASP%20LLM%20Top%2010-red.svg)](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
[![MITRE ATLAS](https://img.shields.io/badge/Compliance-MITRE%20ATLAS-orange.svg)](https://atlas.mitre.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Aditya7808/Cyberagent-/pulls)

SentinelAI is an open-source, enterprise-grade runtime security gateway, policy enforcement control plane, and observability platform for autonomous AI agents and Large Language Models (LLMs).

Operating as a low-latency reverse proxy or modular middleware, SentinelAI inspects inbound prompts, redacts sensitive personal data (PII/secrets), blocks prompt injection and jailbreak payloads, enforces Human-in-the-Loop (HITL) approval gates on privileged tool invocations, isolates multi-tenant RAG vector retrieval, and maintains an immutable, cryptographically sealed audit trail.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Architecture & Request Lifecycle](#architecture--request-lifecycle)
- [Threat Model & Compliance Matrix](#threat-model--compliance-matrix)
- [Quickstart with Docker Compose](#quickstart-with-docker-compose)
- [Local Development Setup](#local-development-setup)
- [Integration Guide](#integration-guide)
  - [Reverse Proxy Gateway (Drop-in LLM Wrapper)](#reverse-proxy-gateway-drop-in-llm-wrapper)
  - [Python Middleware Integration](#python-middleware-integration)
- [API Reference](#api-reference)
- [Enterprise RBAC & Identity Management](#enterprise-rbac--identity-management)
- [Adversarial Red Teaming & Automated Evals](#adversarial-red-teaming--automated-evals)
- [Cloud Deployment (Terraform AWS)](#cloud-deployment-terraform-aws)
- [Contributing](#contributing)
- [License](#license)

---

## Core Capabilities

### 1. Real-Time Prompt Injection Firewall (<15ms Latency)
- Multi-vector detection analyzing Abstract Syntax Trees (AST), semantic entropy, and heuristic signatures.
- Defends against direct overrides, DAN (Do Anything Now) personas, developer-mode simulation, hypnotic token sequences, and base64 obfuscated payloads.
- Fails closed before payload reaches LLM inference cores.

### 2. Automated PII & Secrets Sanitization Engine
- Two-way inspection (inbound user prompts and outbound model outputs).
- Automatic detection and masking of AWS access keys, GitHub personal tokens, private keys, Social Security Numbers (SSNs), credit cards, IBANs, and corporate emails.
- Preserves token alignment for downstream reasoning while scrubbed entities are logged securely.

### 3. Human-in-the-Loop (HITL) Tool Authorization Engine
- Enforces strict Least-Privilege Role-Based Access Control (RBAC) on autonomous tool executions.
- Classifies operations into Read-Only, Write, and Destructive tiers.
- High-risk operations (e.g., `execute_sql_write`, `delete_backup_snapshot`, `issue_refund`) automatically trigger state suspension and route to an administrative queue for human verification.

### 4. Multi-Tenant Secure RAG Vector Vault
- Role-governed semantic vector search with strict tenant boundary enforcement (`org_id` context propagation).
- Document Access Control Lists (ACLs) categorized into Public, Internal, Confidential, and Restricted.
- Prevents cross-tenant document contamination and RAG context poisoning.

### 5. Cryptographic Compliance & Forensic Ledger
- Every prompt evaluation, safety classification, and policy decision produces a SHA-256 sealed audit record.
- Structured logs designed for compliance standards: SOC 2 Type II, HIPAA, ISO/IEC 27001, and EU AI Act.
- Native export capabilities supporting JSON and CSV formats for SIEM ingestion (Splunk, Datadog, Elastic).

### 6. Dual-Theme Enterprise Command Center
- Obsidian Dark Mode and Slate Light Mode with real-time toggle and local storage persistence.
- High-contrast, accessibility-audited typography with zero distracting animations or emojis.
- Real-time Recharts spline telemetry graphs visualizing latency, deflection rates, and inspection counts.

---

## Architecture & Request Lifecycle

```
[ Client / Business App ]
           │
           ▼
[ 1. Ingress & Zero-Trust Authentication ]
     - Cryptographic JWT Verification (HS256)
     - Tenant Boundary & Clearance Level Check
           │
           ▼
[ 2. Inbound Security Inspection Gate (<15ms) ]
     - Deterministic Prompt Injection Interceptor
     - PII & Credential Anonymization Engine
     - AST Heuristics & Perplexity Anomaly Scanner
           │
           ├──► [ Policy Violation ] ──► Return 403 / Sanitized Guard Notice
           │                             (Logged to SHA-256 Audit Trail)
           ▼
[ 3. Agent Orchestrator (LangGraph Core) ]
     - Stateful Context Budget Management
     - Tool Invocation Detection & Parameter Schema Validation
           │
           ├──► [ Privileged / Destructive Tool Call ]
           │    └──► [ 4. Human-in-the-Loop (HITL) Gate ]
           │         - Execution Suspended
           │         - Push to Admin Approval Queue
           │         - Resume on Signed Approval
           ▼
[ 5. Secure RAG Retrieval Engine ]
     - Multi-Tenant Isolated Vector Search (1,536-dim text-embeddings)
     - Document ACL Enforcement (Public / Confidential / Restricted)
           │
           ▼
[ 6. Model Inference Execution ]
     - Amazon Bedrock / Claude 3 Sonnet / OpenAI / Local LLM
           │
           ▼
[ 7. Outbound Inspection & Data Scrubbing ]
     - Hallucination Threshold Verification
     - Secondary Output PII Redaction
           │
           ▼
[ 8. Cryptographic Telemetry & Audit Dispatch ]
     - SHA-256 Tamper-Evident Ledger Commit
     - OpenTelemetry Metric Counter Dispatch
           │
           ▼
[ Sanitized, Verified Response Delivered to Client ]
```

---

## Threat Model & Compliance Matrix

SentinelAI addresses primary vulnerabilities identified in the **OWASP Top 10 for Large Language Models** and the **MITRE ATLAS (Adversarial Threat Landscape for AI Systems)** framework:

| Vulnerability ID | Vulnerability Class | SentinelAI Defense Mechanism | Verification Module |
|---|---|---|---|
| **OWASP LLM01** / **AML.T0054** | Direct Prompt Injection | Heuristic token scoring, AST anomaly detection, deterministic regex filters | `Injection Playground`, `Red Team Suite` |
| **OWASP LLM02** / **AML.T0055** | Sensitive Information Disclosure | Presidio PII engine, pattern masking for credentials, API tokens, PII | `Secure RAG Vault`, `PII Scrubber` |
| **OWASP LLM06** / **AML.T0053** | Excessive Agency / Rogue Tools | Strict schema validation, HITL state suspension, role-bound permissions | `Tool Approval Gate`, `Agent Registry` |
| **OWASP LLM08** / **AML.T0050** | Vector & Context Poisoning | Strict `org_id` schema partitioning, document ACL validation | `Secure RAG Vault` |
| **OWASP LLM07** / **AML.T0052** | Obfuscation & Evasion | Base64 decode preprocessing, zero-width character stripping, unicode normalization | `Adversarial Red Team` |
| **OWASP LLM10** / **AML.T0051** | Jailbreak & Persona Escalation | System prompt integrity monitoring, DAN heuristic pattern neutralization | `Red Team War Room` |

---

## Quickstart with Docker Compose

The fastest way to deploy SentinelAI locally is using the pre-configured production Docker Compose stack:

```bash
# 1. Clone the repository
git clone https://github.com/Aditya7808/Cyberagent-.git
cd Cyberagent-

# 2. Start PostgreSQL with pgvector, Redis, FastAPI Backend, and React Frontend
docker compose up --build -d
```

### Access Points

- **Enterprise Command Center (Web UI)**: [http://localhost:5173](http://localhost:5173)
- **Security Control Plane API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI JSON Specification**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Initial Enterprise Seed Data

To populate sample multi-tenant organizations (`Acme Corporation`, `Global Bank`, `Wayne Enterprises`), document vector embeddings, and policy definitions:

```bash
docker compose exec backend python app/seed.py
```

---

## Local Development Setup

### Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.0 or higher (pnpm or npm)
- **Database**: PostgreSQL 15+ (with `pgvector` extension) or built-in SQLite auto-fallback

### 1. Backend Service

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start Uvicorn development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Web Console

```bash
cd frontend

# Install package dependencies
npm install

# Start Vite development server
npm run dev -- --host 0.0.0.0 --port 5173
```

---

## Integration Guide

### Reverse Proxy Gateway (Drop-in LLM Wrapper)

SentinelAI can be deployed as an inline reverse proxy for standard OpenAI-compatible SDKs without changing internal client logic.

```python
from openai import OpenAI

# Direct standard requests through the SentinelAI Security Gateway
client = OpenAI(
    base_url="http://sentinel-gateway.internal:8000/api/v1",
    api_key="your_sentinel_bearer_token"
)

response = client.chat.completions.create(
    model="claude-3-sonnet",
    messages=[
        {"role": "user", "content": "Query internal customer records for account AC-8819."}
    ]
)

print(response.choices[0].message.content)
```

### Python Middleware Integration

For custom agent workflows (FastAPI, LangChain, LangGraph, or custom agent runners):

```python
from sentinel_sdk import SentinelClient

# 1. Initialize client with Zero-Trust credentials
sentinel = SentinelClient(
    endpoint="http://localhost:8000/api/v1",
    api_key="sentinel_jwt_token",
    agent_id="agent-devops-sre"
)

async def handle_user_message(user_input: str, user_id: str):
    # 2. Pre-execution Inbound Inspection
    inspection = await sentinel.inspect_prompt(
        prompt=user_input,
        user_context={"user_id": user_id, "clearance": "level_3"}
    )

    if inspection.is_blocked:
        return {
            "error": "Request rejected by SentinelAI perimeter policy.",
            "violations": inspection.violations,
            "incident_id": inspection.incident_id
        }

    # 3. Safe Execution with Sanitized Context (PII Stripped)
    raw_response = await my_llm.generate(inspection.sanitized_prompt)

    # 4. Post-execution Output Sanitization
    safe_output = await sentinel.sanitize_output(raw_response)

    return {"response": safe_output.content}
```

---

## API Reference

### Authentication & IAM
- `POST /api/v1/auth/register` — Register identity with bcrypt password hashing (cost factor 10).
- `POST /api/v1/auth/login` — Authenticate and receive signed cryptographic HS256 JWT.
- `GET /api/v1/auth/me` — Retrieve active authenticated context and clearance level.
- `GET /api/v1/auth/users` — Administrative directory listing of all provisioned operators.
- `PATCH /api/v1/auth/users/{user_id}/role` — Dynamically update security clearance role.
- `DELETE /api/v1/auth/users/{user_id}` — Revoke security identity from the perimeter.

### Agent Management & Execution
- `GET /api/v1/agents/` — List all registered autonomous agents and active governance modes.
- `POST /api/v1/conversations/` — Initialize stateful conversational session with assigned agent.
- `POST /api/v1/conversations/{id}/messages` — Execute prompt against multi-stage guardrail pipeline.

### Tool Authorization (HITL)
- `GET /api/v1/approvals/` — Query pending, approved, and rejected privileged tool executions.
- `POST /api/v1/approvals/{id}/resolve` — Human-in-the-Loop decision endpoint (approve or deny).

### Secure RAG Vector Vault
- `GET /api/v1/documents/` — Retrieve tenant-scoped document listings.
- `POST /api/v1/documents/ingest` — Ingest document with automated PII scrubbing and embedding generation.
- `POST /api/v1/documents/search` — Perform tenant-isolated cosine similarity semantic search.

### Red Teaming & Golden Evaluations
- `POST /api/v1/policies/scan/adversarial` — Trigger MITRE ATLAS automated adversarial attack suite.
- `POST /api/v1/evaluations/run` — Run golden benchmark regression assertions suite.
- `GET /api/v1/evaluations/reports` — Retrieve historical model reliability evaluation reports.

### Cryptographic Audit
- `GET /api/v1/audit/` — Query tamper-evident event log filtered by action, resource, or date.
- `GET /api/v1/audit/incidents` — Retrieve security incident records with severity ratings.

---

## Enterprise RBAC & Identity Management

SentinelAI enforces strict, immutable role-based authorization:

| Role Identifier | Clearance Level | Operational Privileges |
|---|---|---|
| `super_admin` | Level 5 (Root) | Full system administrative access, user provisioning, global policy modification, and HITL overrides. |
| `admin` | Level 4 (Security Admin) | Policy configuration, approval queue resolution, audit forensics, and agent registry management. |
| `developer` | Level 3 (AI Engineer) | Agent configuration, firewall playground testing, adversarial red-team execution, and benchmark evals. |
| `auditor` | Level 2 (Compliance) | Read-only access to tamper-evident audit logs, evaluation metrics, and incident reports. |
| `end_user` | Level 1 (Consumer) | Conversational assistant execution via `/playground` with strict inbound and outbound filters. |

---

## Adversarial Red Teaming & Automated Evals

SentinelAI includes a continuous adversarial evaluation harness that automates regression testing against ground-truth security datasets:

```bash
# Execute regression test suite across security modules
pytest backend/tests/test_security.py -v

# Run Human-in-the-Loop state machine verification
pytest backend/tests/test_approvals.py -v

# Test tenant isolation and document access controls
pytest backend/tests/test_rag.py -v
```

### Metrics Computed
- **Attack Success Rate (ASR)**: Target threshold `<1.0%`.
- **PII Leakage Rate**: Zero tolerance (`0.0%`).
- **Semantic Grounding Relevance**: Golden benchmark alignment score `>0.95`.
- **Policy Compliance Rate**: Total requests verified against active organizational boundaries.

---

## Cloud Deployment (Terraform AWS)

Production-ready Terraform Infrastructure as Code (IaC) templates are located in the `terraform/` directory:

- **Amazon ECS on AWS Fargate**: Serverless, autoscaling container runtime.
- **Application Load Balancer (ALB)**: HTTPS TLS termination with automated health checks.
- **Amazon RDS PostgreSQL 16 (Multi-AZ)**: High-availability relational database with `pgvector` extension.
- **AWS Key Management Service (KMS)**: Customer-managed encryption keys for document stores and audit logs.

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

---

## Contributing

We welcome contributions from the cybersecurity, machine learning, and software engineering communities.

1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feature/advanced-entropy-analyzer`).
3. Commit your changes following Conventional Commits (`git commit -m "feat(security): implement token entropy calculation filter"`).
4. Run formatting and test suites (`pytest` and `npm run test`).
5. Push to your branch and open a Pull Request.

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) guidelines for vulnerability disclosure processes.

---

## License

SentinelAI is licensed under the open-source [MIT License](LICENSE).
You are free to use, modify, distribute, and embed this platform in commercial and private environments.
