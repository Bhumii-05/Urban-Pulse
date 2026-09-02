# 🏙️ UrbanPulse — Smart Waste Management System

UrbanPulse is a full-stack **Smart Waste Management System** designed to improve the reporting, monitoring, assignment, collection, and analysis of urban waste-management concerns.

The platform connects **citizens, waste-collection workers, and administrators** through a centralized system with role-based access, geolocation, image evidence, collection-route management, waste-bin monitoring, dashboards, analytics, and an AI-powered chatbot.

---

## 📌 Problem Statement

Traditional waste-management systems often depend on manual reporting and disconnected workflows. This can result in:

* Overflowing waste bins not being reported or monitored efficiently
* Delayed handling of public waste concerns
* Difficulty assigning concerns to collection workers
* Poor visibility into collection routes and collection points
* Lack of centralized analytics for administrators
* Limited communication between citizens and municipal authorities
* Difficulty locating nearby waste-management resources

UrbanPulse addresses these challenges by providing a centralized digital platform for **concern reporting, waste collection management, resource monitoring, communication, and analytics**.

---

# ✨ Key Features

## 👤 Citizen Features

* User registration and login
* JWT-based authentication
* Profile management
* Password management
* Report waste-management concerns
* Upload image evidence
* Add geographical location to concerns
* View submitted concerns
* View concern details and history
* Support existing concerns
* View nearby:

  * Waste bins
  * Concerns
  * Collection points
* Receive notifications
* Submit suggestions
* View personal dashboard
* Interact with the AI chatbot

---

## 🚛 Worker Features

* Secure worker authentication
* Worker dashboard
* View assigned work
* View assignment details
* Update assignment status
* View collection routes
* View assigned collection points
* View nearby waste-management resources
* Update waste-bin fill levels
* Mark collection points as collected
* Receive notifications

---

## 🛠️ Administrator Features

* Administrator authentication
* User management
* Activate/deactivate users
* Create and manage workers
* Concern management
* Concern status management
* Assignment management
* Collection-route management
* Collection-point management
* Waste-bin management
* Waste-bin activation/deactivation
* Fill-level monitoring
* Citizen suggestion management
* Administrative dashboard
* Analytics dashboard
* Worker analytics
* Concern analytics
* Route analytics
* Collection-point analytics
* Waste-bin analytics

---

# 🏗️ System Architecture

UrbanPulse is organized into three major application layers:

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         │   React + Vite      │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │       Backend       │
                         │ FastAPI + SQLAlchemy│
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └─────────────┐
                    ▼                                ▼
          ┌──────────────────┐             ┌──────────────────┐
          │   PostgreSQL     │             │    Cloudinary    │
          │    Database      │             │ Image Storage    │
          └──────────────────┘             └──────────────────┘

                                 │
                                 ▼
                         ┌─────────────────────┐
                         │      Chatbot        │
                         │   OpenAI + RAG      │
                         └─────────────────────┘
```

---

# 🧰 Technology Stack

## Frontend

* React
* Vite
* JavaScript / JSX
* Axios
* React Router
* Recharts
* Geolocation APIs
* Responsive UI

## Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* Pydantic
* JWT authentication
* Role-based access control

## Image Management

* Cloudinary
* Multipart file uploads
* Image validation
* Configurable upload limits

## AI Chatbot

* Python
* FastAPI
* OpenAI
* Retrieval-Augmented Generation (RAG)
* ChromaDB
* Embeddings
* Knowledge-document ingestion
* Municipal waste-management knowledge base

## Development Tools

* Git
* GitHub
* VS Code
* Swagger / OpenAPI
* Postman
* Python virtual environment
* npm

---

# 📂 Repository Structure

```text
Urban-Pulse/
│
├── urbanpulse-backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── analytics.py
│   │   │       ├── assignments.py
│   │   │       ├── auth.py
│   │   │       ├── chatbot.py
│   │   │       ├── collection_points.py
│   │   │       ├── collection_routes.py
│   │   │       ├── concerns.py
│   │   │       ├── concern_images.py
│   │   │       ├── dashboard.py
│   │   │       ├── maps.py
│   │   │       ├── notifications.py
│   │   │       ├── profile.py
│   │   │       ├── suggestions.py
│   │   │       ├── user.py
│   │   │       └── waste_bins.py
│   │   │
│   │   ├── core/
│   │   ├── db/
│   │   ├── dependencies/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── prompts/
│   │   ├── providers/
│   │   ├── schemas/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── static/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
│
├── urbanpulse-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── ...
│
├── urbanpulse-chatbot/
│   ├── app/
│   │   ├── api/
│   │   ├── config/
│   │   ├── core/
│   │   ├── models/
│   │   ├── prompts/
│   │   ├── providers/
│   │   ├── rag/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   └── services/
│   ├── data/
│   │   ├── chroma/
│   │   ├── knowledge/
│   │   └── uploads/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── urbanpulse-docs/
│   ├── features.md
│   ├── api.md
│   ├── database_models.md
│   └── project_structure.md
│
├── README.md
└── .gitignore
```

---

# 🔄 Core System Workflow

## Concern Reporting

```text
Citizen
   │
   ▼
Submit Concern
   │
   ├── Category
   ├── Description
   ├── Location
   └── Image Evidence
   │
   ▼
Duplicate Check
   │
   ├── Duplicate → Support Existing Concern
   │
   └── New Concern
          │
          ▼
       Pending
          │
          ▼
     Admin Review
          │
          ▼
     Worker Assignment
          │
          ▼
     Worker Handles Issue
          │
          ▼
        Resolved
```

The backend performs duplicate checking for concerns based on nearby existing concerns.

---

# 🚛 Collection Management

Administrators can create and manage collection routes and collection points.

```text
Collection Route
       │
       ├── Collection Point 1
       ├── Collection Point 2
       ├── Collection Point 3
       └── Collection Point N
```

Workers can access routes and collection points assigned to them and update collection progress.

---

# 🗑️ Waste Bin Management

Administrators can create and manage waste bins.

The system supports:

* Bin creation
* Bin listing
* Individual bin details
* Fill-level updates
* Activation
* Deactivation
* Nearby-bin discovery

Fill levels can be updated by authorized administrators and workers.

---

# 📍 Location & Maps

UrbanPulse provides location-based APIs for discovering nearby resources.

Supported nearby-resource searches include:

* Nearby waste bins
* Nearby concerns
* Nearby collection points

Requests use geographical coordinates and a search radius.

---

# 🤖 AI Chatbot

UrbanPulse includes an AI-powered waste-management chatbot.

The chatbot provides a conversational interface for waste-management-related questions.

### Chatbot Architecture

```text
User Question
      │
      ▼
Chatbot API
      │
      ▼
Question Processing
      │
      ▼
RAG Retrieval
      │
      ├── Knowledge Documents
      │
      └── Vector Store
      │
      ▼
Relevant Context
      │
      ▼
OpenAI Model
      │
      ▼
Chatbot Response
```

The chatbot application contains:

* Document loading
* Text splitting
* Embedding generation
* Vector storage
* Retrieval
* Context building
* Prompt management
* LLM provider integration

The current chatbot configuration uses **OpenAI** and ChromaDB-based retrieval.

---

# 🔐 Authentication & Security

UrbanPulse uses several security mechanisms.

## Authentication

* JWT access tokens
* Refresh-token mechanism
* HTTP-only refresh-token cookie
* Token rotation
* Logout / token revocation

## Authorization

Role-based access control is implemented for:

* Citizen
* Worker
* Admin

Protected endpoints verify the authenticated user's role before allowing restricted operations.

## Password Security

Passwords are securely hashed rather than stored as plain text.

## Image Security

Uploaded images are:

* Validated
* Size-limited
* Stored using Cloudinary
* Associated with individual concerns

The default maximum image size configured by the backend is **5 MB**.

---

# 🌐 REST API

The backend exposes its versioned API under:

```text
/api/v1
```

The following list reflects the **currently implemented backend routes**.

## Authentication

| Method | Endpoint                | Access         |
| ------ | ----------------------- | -------------- |
| POST   | `/api/v1/auth/register` | Public         |
| POST   | `/api/v1/auth/login`    | Public         |
| POST   | `/api/v1/auth/refresh`  | Refresh cookie |
| POST   | `/api/v1/auth/logout`   | Public         |
| GET    | `/api/v1/auth/me`       | Authenticated  |

---

## User Management

| Method | Endpoint                               | Access |
| ------ | -------------------------------------- | ------ |
| GET    | `/api/v1/admin/users`                  | Admin  |
| GET    | `/api/v1/admin/users/{user_id}`        | Admin  |
| POST   | `/api/v1/admin/users`                  | Admin  |
| PATCH  | `/api/v1/admin/users/{user_id}`        | Admin  |
| PATCH  | `/api/v1/admin/users/{user_id}/status` | Admin  |
| DELETE | `/api/v1/admin/users/{user_id}`        | Admin  |

---

## Profile

| Method | Endpoint                   | Access        |
| ------ | -------------------------- | ------------- |
| GET    | `/api/v1/profile`          | Authenticated |
| PATCH  | `/api/v1/profile`          | Authenticated |
| PATCH  | `/api/v1/profile/password` | Authenticated |

---

## Notifications

| Method | Endpoint                                       | Access        |
| ------ | ---------------------------------------------- | ------------- |
| GET    | `/api/v1/notifications`                        | Authenticated |
| PATCH  | `/api/v1/notifications/read-all`               | Authenticated |
| PATCH  | `/api/v1/notifications/{notification_id}/read` | Authenticated |

---

## Concerns

| Method | Endpoint                                | Access         |
| ------ | --------------------------------------- | -------------- |
| GET    | `/api/v1/concerns/health`               | Public         |
| GET    | `/api/v1/concerns/db-health`            | Public         |
| POST   | `/api/v1/concerns/`                     | Authenticated  |
| GET    | `/api/v1/concerns/`                     | Authenticated  |
| GET    | `/api/v1/concerns/{concern_id}`         | Authenticated  |
| PUT    | `/api/v1/concerns/{concern_id}`         | Authenticated  |
| DELETE | `/api/v1/concerns/{concern_id}`         | Authenticated  |
| PATCH  | `/api/v1/concerns/{concern_id}/status`  | Admin / Worker |
| GET    | `/api/v1/concerns/{concern_id}/history` | Authenticated  |
| POST   | `/api/v1/concerns/{concern_id}/support` | Authenticated  |
| DELETE | `/api/v1/concerns/{concern_id}/support` | Authenticated  |
| GET    | `/api/v1/concerns/{concern_id}/support` | Authenticated  |

---

## Concern Images

| Method | Endpoint                                          | Access                |
| ------ | ------------------------------------------------- | --------------------- |
| POST   | `/api/v1/concerns/{concern_id}/images`            | Authenticated / Owner |
| GET    | `/api/v1/concerns/{concern_id}/images`            | Authenticated         |
| DELETE | `/api/v1/concerns/{concern_id}/images/{image_id}` | Authenticated / Owner |

---

## Assignments

| Method | Endpoint                                     | Access                  |
| ------ | -------------------------------------------- | ----------------------- |
| POST   | `/api/v1/assignments`                        | Admin                   |
| GET    | `/api/v1/assignments`                        | Admin / Worker          |
| GET    | `/api/v1/assignments/{assignment_id}`        | Admin / Assigned Worker |
| PATCH  | `/api/v1/assignments/{assignment_id}/status` | Assigned Worker         |

---

## Collection Routes

| Method | Endpoint                                      | Access                  |
| ------ | --------------------------------------------- | ----------------------- |
| POST   | `/api/v1/collection-routes`                   | Admin                   |
| GET    | `/api/v1/collection-routes`                   | Admin / Worker          |
| GET    | `/api/v1/collection-routes/{route_id}`        | Admin / Assigned Worker |
| PATCH  | `/api/v1/collection-routes/{route_id}`        | Admin                   |
| PATCH  | `/api/v1/collection-routes/{route_id}/status` | Admin                   |
| DELETE | `/api/v1/collection-routes/{route_id}`        | Admin                   |

---

## Collection Points

| Method | Endpoint                                       | Access                  |
| ------ | ---------------------------------------------- | ----------------------- |
| POST   | `/api/v1/collection-points`                    | Admin                   |
| GET    | `/api/v1/collection-points`                    | Admin / Worker          |
| GET    | `/api/v1/collection-points/route/{route_id}`   | Admin / Assigned Worker |
| GET    | `/api/v1/collection-points/{point_id}`         | Admin / Assigned Worker |
| PATCH  | `/api/v1/collection-points/{point_id}`         | Admin                   |
| PATCH  | `/api/v1/collection-points/{point_id}/collect` | Worker                  |
| DELETE | `/api/v1/collection-points/{point_id}`         | Admin                   |

---

## Waste Bins

| Method | Endpoint                                       | Access         |
| ------ | ---------------------------------------------- | -------------- |
| POST   | `/api/v1/waste-bins`                           | Admin          |
| GET    | `/api/v1/waste-bins`                           | Admin / Worker |
| GET    | `/api/v1/waste-bins/{waste_bin_id}`            | Admin / Worker |
| PATCH  | `/api/v1/waste-bins/{waste_bin_id}`            | Admin          |
| PATCH  | `/api/v1/waste-bins/{waste_bin_id}/fill-level` | Admin / Worker |
| PATCH  | `/api/v1/waste-bins/{waste_bin_id}/activate`   | Admin          |
| PATCH  | `/api/v1/waste-bins/{waste_bin_id}/deactivate` | Admin          |

---

## Suggestions

### Citizen

| Method | Endpoint                      | Access  |
| ------ | ----------------------------- | ------- |
| POST   | `/api/v1/citizen/suggestions` | Citizen |
| GET    | `/api/v1/citizen/suggestions` | Citizen |

### Admin

| Method | Endpoint                                    | Access |
| ------ | ------------------------------------------- | ------ |
| GET    | `/api/v1/admin/suggestions`                 | Admin  |
| GET    | `/api/v1/admin/suggestions/{suggestion_id}` | Admin  |
| PATCH  | `/api/v1/admin/suggestions/{suggestion_id}` | Admin  |

---

## Dashboards

| Method | Endpoint                    | Access  |
| ------ | --------------------------- | ------- |
| GET    | `/api/v1/dashboard/admin`   | Admin   |
| GET    | `/api/v1/dashboard/worker`  | Worker  |
| GET    | `/api/v1/dashboard/citizen` | Citizen |

---

## Analytics

All analytics endpoints are restricted to administrators.

| Method | Endpoint                                     |
| ------ | -------------------------------------------- |
| GET    | `/api/v1/analytics/overview`                 |
| GET    | `/api/v1/analytics/workers`                  |
| GET    | `/api/v1/analytics/concerns/status`          |
| GET    | `/api/v1/analytics/concerns/categories`      |
| GET    | `/api/v1/analytics/concerns/priorities`      |
| GET    | `/api/v1/analytics/routes/status`            |
| GET    | `/api/v1/analytics/collection-points/status` |
| GET    | `/api/v1/analytics/waste-bins/status`        |

---

## Maps

| Method | Endpoint                                | Access        |
| ------ | --------------------------------------- | ------------- |
| GET    | `/api/v1/maps/nearby-bins`              | Authenticated |
| GET    | `/api/v1/maps/nearby-concerns`          | Authenticated |
| GET    | `/api/v1/maps/nearby-collection-points` | Authenticated |

---

## Chatbot

| Method | Endpoint              | Access |
| ------ | --------------------- | ------ |
| POST   | `/api/v1/chatbot/ask` | Public |

---

## API Root

| Method | Endpoint | Access |
| ------ | -------- | ------ |
| GET    | `/`      | Public |

Returns:

```json
{
  "message": "UrbanPulse API is running"
}
```

### API Count

The current backend exposes:

* **76 versioned `/api/v1` endpoints**
* **1 root endpoint**
* **77 total registered application endpoints**

---

# 📖 Interactive API Documentation

When the FastAPI backend is running, its automatically generated API documentation can be accessed through the standard FastAPI documentation endpoints:

```text
http://localhost:8000/docs
http://localhost:8000/redoc
```

The OpenAPI specification is also available through FastAPI.

---

# ⚙️ Backend Setup

Navigate to the backend:

```cmd
cd urbanpulse-backend
```

Create / activate the Python virtual environment:

```cmd
python -m venv venv
```

Windows:

```cmd
venv\Scripts\activate
```

Install dependencies:

```cmd
pip install -r requirements.txt
```

Configure the environment variables.

Start the backend:

```cmd
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

# 🔑 Backend Environment Variables

The backend expects environment configuration including:

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=urbanpulse/concerns
MAX_IMAGE_SIZE_BYTES=5242880
```

### Important

Do **not** commit `.env` files, API keys, database passwords, JWT secrets, or Cloudinary secrets to GitHub.

---

# 💻 Frontend Setup

Navigate to the frontend:

```cmd
cd urbanpulse-frontend
```

Install dependencies:

```cmd
npm install
```

The frontend API configuration uses:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

If the variable is not supplied, the frontend defaults to:

```text
http://localhost:8000/api/v1
```

Start the development server:

```cmd
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

---

# 🔌 Frontend API Layer

The frontend contains dedicated service modules for backend communication.

Examples include:

```text
src/api/
├── admin.service.js
├── analytics.service.js
├── assignment.service.js
├── auth.service.js
├── axios.js
├── bin.service.js
├── chatbot.service.js
├── citizen.service.js
├── collectionPoint.service.js
├── collectionRoute.service.js
├── complaint.service.js
├── concern.service.js
├── location.service.js
├── map.service.js
├── notification.service.js
├── profile.service.js
├── suggestion.service.js
└── worker.service.js
```

The Axios client:

* Uses the configured backend base URL
* Sends credentials
* Reads the access token from local storage
* Adds the Bearer token to authenticated requests

---

# 🤖 Chatbot Setup

Navigate to the chatbot:

```cmd
cd urbanpulse-chatbot
```

Install dependencies:

```cmd
pip install -r requirements.txt
```

The chatbot configuration supports environment variables such as:

```env
API_HOST=0.0.0.0
API_PORT=8000
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-large
DEBUG=False
ENVIRONMENT=development
```

The chatbot application contains its own:

* API layer
* Services
* Providers
* RAG pipeline
* Embedding service
* Vector store
* Knowledge base
* Tests

---

# 📚 Documentation

The repository contains project documentation under:

```text
urbanpulse-docs/
```

Important documentation files include:

* `features.md`
* `api.md`
* `database_models.md`
* `project_structure.md`

### Documentation Note

The implementation is continuously evolving. Therefore, the **current backend source code and generated OpenAPI documentation are the source of truth for implemented API behavior**.

Some older documentation may describe planned or previous endpoints that are no longer present in the current implementation.

---

# 🗄️ Database

The backend is designed around a relational database architecture using PostgreSQL and SQLAlchemy.

Major domain entities include:

* User
* Waste Bin
* Concern
* Concern Image
* Concern Support
* Assignment
* Concern History
* Collection Route
* Collection Point
* Suggestion
* Notification
* Refresh Token

Database schema changes are managed through **Alembic migrations**.

---

# 🧪 Testing

The project contains backend and chatbot tests.

Backend testing should cover:

* Authentication
* Authorization
* Role restrictions
* CRUD operations
* Concern workflows
* Duplicate concern handling
* Image uploads
* Assignments
* Routes
* Collection points
* Waste bins
* Suggestions
* Notifications
* Dashboards
* Analytics
* Maps
* Chatbot integration

The chatbot contains tests covering areas such as:

* AI functionality
* Complaint handling
* RAG functionality
* Image services

---

# 🔍 Validation Workflow

A recommended development workflow is:

```text
Implement
   ↓
Run Application
   ↓
Test API
   ↓
Test Frontend Integration
   ↓
Test Edge Cases
   ↓
Validate Database
   ↓
Validate Security
   ↓
Review Code
   ↓
Git Commit
   ↓
Git Push
```

Swagger / OpenAPI can be used for API testing during backend development.

---

# 🌿 Git Workflow

Create a feature branch when appropriate:

```cmd
git checkout -b feature/<feature-name>
```

Check changes:

```cmd
git status
```

Review the diff:

```cmd
git diff
```

Stage changes:

```cmd
git add .
```

Commit:

```cmd
git commit -m "Describe the change"
```

Push:

```cmd
git push origin <branch-name>
```

For the main branch:

```cmd
git push origin main
```

---

# 🧩 Design Principles

UrbanPulse follows a modular backend architecture.

The backend separates:

```text
API Routes
    ↓
Dependencies
    ↓
Services
    ↓
Models / Database
```

Additional separation is provided through:

* Schemas
* Authentication dependencies
* Role dependencies
* Utility functions
* Middleware
* Providers
* External-service integrations

This makes the system easier to maintain, test, and extend.

---

# 📈 Dashboards & Analytics

Different roles receive different dashboards.

### Admin Dashboard

Provides administrative visibility into areas such as:

* Users
* Concerns
* Assignments
* Routes
* Collection points
* Waste bins
* Suggestions
* System analytics

### Worker Dashboard

Provides access to:

* Assigned work
* Collection routes
* Collection points
* Worker metrics
* Operational status

### Citizen Dashboard

Provides access to:

* Personal concerns
* Concern status
* Notifications
* Suggestions
* Citizen-facing information

---

# ☁️ Cloudinary Integration

UrbanPulse uses Cloudinary for concern-image storage.

The backend contains a dedicated Cloudinary service responsible for communicating with the external image-storage platform.

Image uploads are handled through the concern-image API.

The system validates uploads before sending them to Cloudinary.

---

# 🚨 Error Handling

The backend provides structured error handling through:

* HTTP status codes
* Validation errors
* Authentication errors
* Authorization errors
* Resource-not-found handling
* Duplicate detection
* External-service error handling
* Middleware-based exception handling
* Request logging

Examples of external-service failures include image-storage and chatbot-provider errors.

---

# 🔮 Future Scope

The project can be extended with:

* 🗺️ Advanced route optimization
* 📊 Predictive waste analytics
* 🗑️ IoT-enabled smart bins
* 📱 Dedicated mobile application
* 📡 Offline worker functionality
* 📩 SMS and email notifications
* 🤖 AI-based waste-image classification
* 🔳 QR-based waste-bin identification
* 📈 Predictive overflow detection
* 🧭 Advanced GIS-based municipal planning
* 🚛 Automated collection scheduling
* 🌐 Real-time operational monitoring

---

# 🎯 Project Goals

UrbanPulse aims to create a centralized smart waste-management ecosystem that:

1. Makes waste-related reporting easier.
2. Improves visibility of waste-management concerns.
3. Helps administrators manage workers and resources.
4. Makes collection operations more organized.
5. Provides location-aware waste-management information.
6. Uses analytics to support better decision-making.
7. Provides citizens with a conversational AI interface.
8. Creates a scalable foundation for future smart-city integrations.

---

# 🚀 Project Status

UrbanPulse is an actively developed full-stack project.

The system currently includes:

* Role-based authentication
* Citizen, Worker and Admin workflows
* Concern management
* Image evidence
* Cloudinary integration
* Assignments
* Collection routes
* Collection points
* Waste-bin management
* Notifications
* Suggestions
* Dashboards
* Analytics
* Location-based APIs
* AI chatbot
* RAG infrastructure
* PostgreSQL-oriented backend architecture
* React frontend

---

# 📜 License

This project is developed as part of the UrbanPulse project and is intended for educational, development, and demonstration purposes unless a separate license is provided by the project owners.

---

## 💡 UrbanPulse

**Report. Connect. Collect. Improve.**

Building a smarter and more connected approach to urban waste management.
