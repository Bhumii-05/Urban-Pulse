# UrbanPulse

### Smart Waste Management System

UrbanPulse is a full-stack smart waste management ecosystem designed to streamline civic cleanliness by connecting **citizens, sanitation workers, and municipal administrators** through a unified digital platform.

The system provides real-time civic issue reporting, GIS-based route and collection-point management, task dispatching, waste-bin monitoring, analytics, and an AI-powered civic support assistant.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
  - [Citizen Portal](#1-citizen-portal)
  - [Sanitation Worker Portal](#2-sanitation-worker-portal)
  - [Municipal Administrator Dashboard](#3-municipal-administrator-dashboard)
  - [AI Assistant](#4-urbanpulse-ai-assistant)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [REST API Reference](#rest-api-reference)
- [Security](#security)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

UrbanPulse addresses common challenges in municipal waste management by providing a centralized platform for:

- Citizen complaint and concern reporting
- Geotagged waste-management issues
- Waste collection route management
- Sanitation-worker task dispatching
- Public waste-bin monitoring
- Collection-point management
- Civic suggestions and feedback
- Municipal analytics
- AI-powered civic assistance

The platform follows a **role-based architecture**, providing different capabilities to citizens, sanitation workers, and administrators.

---

# Core Features

## 1. Citizen Portal

### Concern Management

Citizens can report waste-management issues directly through the platform.

Features include:

- Report geotagged concerns
- Select detailed concern categories:
  - Overflowing bins
  - Missed collections
  - Illegal dumping
  - Broken bins
  - Other civic cleanliness issues
- Upload photo evidence
- Track concern status throughout its lifecycle
- Edit or delete pending concerns

### Concern Lifecycle

Reports can move through the following stages:

```text
Open → Pending → Assigned → Resolved → Closed
```

Citizens can monitor the progress of their reports from their personal dashboard.

### Collection Points & Missed Pickups

Citizens can:

- Pin new suggested collection points using an interactive map
- Report missed door-to-door waste collections
- Track the status of submitted reports

### Suggestions & Civic Engagement

Citizens can submit suggestions related to:

- New public waste bins
- Collection points
- Waste-management infrastructure
- Other civic improvements

They can also:

- Track suggestion review status
- View administrative responses
- Receive feedback from municipal authorities

### Notifications & Personal Dashboard

The citizen dashboard provides:

- Concern notifications
- Assignment updates
- Resolution updates
- Suggestion feedback
- Total reported concerns
- Pending concerns
- Resolved concerns
- Suggestion history

---

## 2. Sanitation Worker Portal

The sanitation-worker portal helps field staff manage daily collection operations and assigned civic tasks.

### Daily Route Management

Workers can:

- View assigned daily collection routes
- Follow sequenced collection stops
- View routes through an interactive map
- Follow optimized collection sequences

### Collection Point Execution

Workers can mark individual collection points as:

**Collected**

If a collection cannot be completed, workers can report a specific failure reason:

- House Locked
- Waste Not Ready
- Road Blocked
- Vehicle Issue
- Other

### Concern Assignments

Workers can:

- View assigned concerns
- Accept assignments
- Execute field tasks
- Mark tasks as completed
- Upload photo verification from the field

### Worker Dashboard

Workers can monitor:

- Daily progress
- Pending assignments
- Completed tasks
- Notifications
- Route execution status

---

## 3. Municipal Administrator Dashboard

The administrator dashboard provides centralized control over municipal waste-management operations.

### User & Staff Management

Administrators can:

- Manage citizens
- Manage sanitation workers
- Verify accounts
- Create worker accounts
- Activate or deactivate users
- Update user status

### Concern Triage & Assignment

Administrators can:

- Monitor city-wide concerns
- Review reported issues
- Assign priority levels
- Assign field workers
- Reject invalid reports

Supported priority levels:

```text
Low
Medium
High
Critical
```

### Route & Collection Point Dispatch

Administrators can:

- Create collection routes
- Edit routes
- Delete routes
- Reorder collection points
- Add collection points to routes
- Remove collection points from routes
- Link collection points with public waste bins

### Waste Bin Monitoring

Administrators can:

- Deploy new public waste bins
- Update bin locations
- Monitor fill levels
- Activate/deactivate bins
- Track waste-bin status

### Suggestion Management

Administrators can:

- Review citizen suggestions
- Approve suggestions
- Reject suggestions
- Send direct feedback to citizens

### Analytics Dashboard

Municipal analytics include:

- Total users
- Active workers
- Total concerns
- Pending concerns
- Resolved concerns
- Route completion rates
- Ward-level statistics

---

## 4. UrbanPulse AI Assistant

UrbanPulse includes an AI-powered **Retrieval-Augmented Generation (RAG)** assistant designed to provide context-aware civic support.

The assistant can help users with:

- Municipal guidelines
- Waste-management instructions
- Concern-reporting procedures
- Platform navigation
- Civic information

### AI Architecture

The chatbot uses:

- Python
- ChromaDB
- Sentence Transformers
- Custom civic knowledge embeddings
- Retrieval-Augmented Generation pipeline

High-level flow:

```text
User Query
    ↓
Query Processing
    ↓
Embedding Generation
    ↓
ChromaDB Retrieval
    ↓
Relevant Civic Knowledge
    ↓
RAG Pipeline
    ↓
AI Response
```

---

# Architecture

UrbanPulse follows a modular full-stack architecture consisting of three primary services and a documentation layer.

```text
                    ┌─────────────────────┐
                    │      Citizens       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   React Frontend    │
                    │ React + Vite + GIS  │
                    └──────────┬──────────┘
                               │ REST API
                    ┌──────────▼──────────┐
                    │   FastAPI Backend   │
                    │ Authentication/RBAC │
                    │ Business Logic      │
                    └───────┬───────┬─────┘
                            │       │
                 ┌──────────▼───┐ ┌─▼─────────────┐
                 │ PostgreSQL   │ │ Chatbot / RAG │
                 │   Database   │ │   Service     │
                 └──────────────┘ └───────┬───────┘
                                           │
                                    ┌──────▼──────┐
                                    │  ChromaDB   │
                                    │ Vector Store│
                                    └─────────────┘
```

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 18 | User interface |
| Vite | Frontend build tooling |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Lucide React | Icons |
| React-Leaflet | Interactive maps |
| Leaflet | GIS/map rendering |

## Backend

| Technology | Purpose |
|---|---|
| Python 3.10+ | Backend runtime |
| FastAPI | REST API framework |
| SQLAlchemy | ORM |
| Pydantic v2 | Data validation |
| Alembic | Database migrations |
| PostgreSQL | Relational database |

## AI / Chatbot

| Technology | Purpose |
|---|---|
| Python | AI service |
| ChromaDB | Vector database |
| Sentence Transformers | Text embeddings |
| RAG Pipeline | Context-aware responses |

## Security

| Technology | Purpose |
|---|---|
| JWT | Authentication |
| RBAC | Role-based access control |
| bcrypt | Password hashing |

---

# Repository Structure

```text
Urban-Pulse/
│
├── urbanpulse-backend/
│   ├── alembic/                    # Database migrations
│   │
│   ├── app/
│   │   ├── api/v1/                 # REST API endpoints
│   │   │   ├── auth
│   │   │   ├── concerns
│   │   │   ├── routes
│   │   │   ├── points
│   │   │   ├── bins
│   │   │   └── analytics
│   │   │
│   │   ├── core/                   # Configuration and security
│   │   ├── db/                     # Database engine/session
│   │   ├── dependencies/           # Authentication dependencies
│   │   ├── middleware/             # CORS and request middleware
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── scripts/                # Database initialization/seeding
│   │   ├── services/               # Business logic
│   │   └── utils/                  # Helper utilities
│   │
│   ├── alembic.ini
│   ├── main.py                     # FastAPI entrypoint
│   └── requirements.txt
│
├── urbanpulse-frontend/
│   ├── src/
│   │   ├── api/                    # API service modules
│   │   ├── assets/                 # Static assets
│   │   │
│   │   ├── components/
│   │   │   ├── admin/              # Admin components
│   │   │   ├── common/             # Shared components
│   │   │   ├── report-concern/     # Concern reporting
│   │   │   ├── worker/             # Worker components
│   │   │   ├── AboutUs.jsx
│   │   │   ├── ContactUs.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── FloatingChatbot.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── NotificationDropdown.jsx
│   │   │
│   │   ├── pages/                  # Application pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── tailwind.config.js
│   └── package.json
│
├── urbanpulse-chatbot/
│   ├── app/                        # Chatbot API and processors
│   ├── data/                       # Knowledge base and embeddings
│   ├── tests/                      # RAG/ChromaDB tests
│   ├── requirements.txt
│   ├── test_chromadb.py
│   └── test_rag_service.py
│
└── urbanpulse-docs/
    ├── api.md                      # API documentation
    ├── database_models.md          # Database documentation
    ├── features.md                 # Feature specifications
    ├── project_structure.md        # Architecture documentation
    ├── SRS.pdf                     # Software Requirements Specification
    ├── urban_pulse_erd.png         # ER diagram
    └── urban_pulse_physical_erd.jpeg
```

---

# Getting Started

## Prerequisites

Make sure the following are installed:

- **Node.js:** v18.0.0+
- **Python:** 3.10+
- **PostgreSQL:** v14+

---

# 1. Backend Setup

Navigate to the backend directory:

```bash
cd urbanpulse-backend
```

### Create Virtual Environment

```bash
python -m venv .venv
```

### Activate Virtual Environment

#### Linux / macOS

```bash
source .venv/bin/activate
```

#### Windows

```bash
.venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file inside `urbanpulse-backend/`.

```env
DATABASE_URL=postgresql+psycopg2://<user>:<password>@localhost:5432/urbanpulse_db

SECRET_KEY=your_super_secret_jwt_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Replace the database credentials with your local PostgreSQL configuration.

### Apply Database Migrations

```bash
alembic upgrade head
```

### Start Development Server

```bash
uvicorn main:app --reload --port 8000
```

Backend will be available at:

```text
http://localhost:8000
```

### API Documentation

Swagger UI:

```text
http://localhost:8000/docs
```

ReDoc:

```text
http://localhost:8000/redoc
```

---

# 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd urbanpulse-frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Start Development Server

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 3. Chatbot Service Setup

Navigate to the chatbot directory:

```bash
cd urbanpulse-chatbot
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Verification Tests

Test ChromaDB:

```bash
python test_chromadb.py
```

Test the RAG service:

```bash
python test_rag_service.py
```

---

# Environment Variables

## Backend

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://user:password@localhost:5432/urbanpulse_db` |
| `SECRET_KEY` | JWT signing secret | `your_super_secret_jwt_key` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `1440` |

## Frontend

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

> Never commit production secrets, database passwords, JWT secrets, or other sensitive credentials to the repository.

---

# REST API Reference

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user |

---

## User Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/users` | List all users |
| `POST` | `/api/v1/admin/users` | Create user/worker account |
| `PATCH` | `/api/v1/admin/users/{id}/status` | Activate/deactivate account |

> Administrative endpoints require appropriate administrator privileges.

---

## Concerns

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/concerns/` | List concerns |
| `POST` | `/api/v1/concerns/` | Create a geotagged concern |
| `POST` | `/api/v1/concerns/{id}/images` | Upload concern evidence |

---

## Collection Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/collection-routes` | List active routes |
| `POST` | `/api/v1/collection-routes` | Create a collection route |
| `DELETE` | `/api/v1/collection-routes/{id}` | Delete a collection route |

---

## Collection Points

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/collection-points` | List collection points |
| `PATCH` | `/api/v1/collection-points/{id}/collect` | Mark point collected/report issue |

---

## Waste Bins

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/waste-bins` | List public waste bins |
| `PATCH` | `/api/v1/waste-bins/{id}/fill-level` | Update bin fill level |

---

## Suggestions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/citizen/suggestions` | Submit a citizen suggestion |
| `PATCH` | `/api/v1/admin/suggestions/{id}` | Review and respond to suggestion |

---

## Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/analytics/overview` | Retrieve municipal analytics |

---

## Chatbot

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chatbot/ask` | Send a query to the RAG assistant |

---

# Security

UrbanPulse uses multiple layers of application security.

### JWT Authentication

JSON Web Tokens are used to authenticate users and authorize API requests.

### Role-Based Access Control

Different application roles have different permissions:

```text
Citizen
   │
   ├── Report concerns
   ├── Submit suggestions
   └── Track reports

Worker
   │
   ├── View assigned routes
   ├── Execute collection tasks
   └── Resolve assigned concerns

Administrator
   │
   ├── Manage users
   ├── Assign concerns
   ├── Manage routes
   ├── Monitor bins
   └── View analytics
```

### Password Security

Passwords are securely hashed using **bcrypt** rather than being stored as plaintext.

---

# Documentation

Additional project documentation is available in:

```text
urbanpulse-docs/
```

Available documentation includes:

| File | Description |
|---|---|
| `api.md` | Detailed API endpoint documentation |
| `database_models.md` | Database models, relations, and data dictionary |
| `features.md` | Functional feature specifications |
| `project_structure.md` | Architecture and directory breakdown |
| `SRS.pdf` | Software Requirements Specification |
| `urban_pulse_erd.png` | Entity Relationship Diagram |
| `urban_pulse_physical_erd.jpeg` | Physical ER Diagram |

---

# Development Workflow

A typical local development setup consists of three services:

### Terminal 1 — Backend

```bash
cd urbanpulse-backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend

```bash
cd urbanpulse-frontend
npm run dev
```

### Terminal 3 — Chatbot

Run the chatbot service according to its application entrypoint and configuration.

The frontend communicates with the FastAPI backend, while the backend integrates with the chatbot service for AI-powered civic assistance.

---

# Project Goals

UrbanPulse aims to create a more transparent and efficient municipal waste-management workflow by connecting:

```text
Citizens
    ↓
Issue Reporting
    ↓
Municipal Administration
    ↓
Task Assignment
    ↓
Sanitation Workers
    ↓
Field Resolution
    ↓
Citizen Feedback
```

This creates a continuous feedback loop between citizens, municipal authorities, and field workers.

---

# Future Scope

Potential extensions to the platform include:

- Real-time GPS tracking of sanitation vehicles
- IoT-based automatic waste-bin fill sensors
- Automated route optimization
- Predictive waste generation analytics
- Ward-level heatmaps
- Mobile applications for field workers
- Multilingual AI civic assistance
- Automated concern prioritization
- Computer-vision-based waste classification
- Push notifications
- Advanced municipal performance dashboards

---

# License

This project is licensed under the **MIT License**.

See the `LICENSE` file for the complete license text.
