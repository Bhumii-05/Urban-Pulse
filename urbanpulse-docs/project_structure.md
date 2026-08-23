# UrbanPulse Project Structure

The UrbanPulse project follows a modular architecture, with separate repositories (or sub-projects) for the backend, frontend, and AI chatbot. This separation enables independent development, testing, and deployment by different team members.

---

# Project Directory Structure

```text
urbanpulse-workspace/
│
├── urbanpulse-backend/              # FastAPI Backend
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── concerns.py
│   │   │       ├── assignments.py
│   │   │       ├── collection_routes.py
│   │   │       ├── collection_points.py
│   │   │       ├── notifications.py
│   │   │       ├── suggestions.py
│   │   │       ├── dashboard.py
│   │   │       ├── maps.py
│   │   │       └── chatbot.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── enums.py
│   │   │   └── constants.py
│   │   │
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── session.py
│   │   │   └── base.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── concern.py
│   │   │   ├── concern_image.py
│   │   │   ├── concern_support.py
│   │   │   ├── concern_history.py
│   │   │   ├── assignment.py
│   │   │   ├── collection_route.py
│   │   │   ├── collection_point.py
│   │   │   ├── waste_bin.py
│   │   │   ├── notification.py
│   │   │   └── suggestion.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── concern.py
│   │   │   ├── assignment.py
│   │   │   ├── collection_route.py
│   │   │   ├── collection_point.py
│   │   │   ├── waste_bin.py
│   │   │   ├── notification.py
│   │   │   ├── suggestion.py
│   │   │   └── chatbot.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── concern_service.py
│   │   │   ├── assignment_service.py
│   │   │   ├── collection_route_service.py
│   │   │   ├── collection_point_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── suggestion_service.py
│   │   │   ├── dashboard_service.py
│   │   │   ├── map_service.py
│   │   │   ├── chatbot_service.py
│   │   │   ├── cloudinary_service.py
│   │   │   └── route_planner_service.py
│   │   │
│   │   ├── dependencies/
│   │   │   ├── auth.py
│   │   │   ├── roles.py
│   │   │   └── pagination.py
│   │   │
│   │   ├── middleware/
│   │   │   ├── exception_handler.py
│   │   │   ├── logging.py
│   │   │   └── request_logger.py
│   │   │
│   │   ├── utils/
│   │   │   ├── responses.py
│   │   │   ├── validators.py
│   │   │   ├── helpers.py
│   │   │   ├── pagination.py
│   │   │   └── geo_utils.py
│   │   │
│   │   ├── static/
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_users.py
│   │   ├── test_concerns.py
│   │   ├── test_assignments.py
│   │   └── test_routes.py
│   │
│   ├── docs/
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── DATABASE.md
│   │   ├── API.md
│   │   ├── FEATURES.md
│   │   ├── ER_DIAGRAM.png
│   │   └── SRS.pdf
│   │
│   ├── .env
│   ├── .gitignore
│   ├── requirements.txt
│   ├── README.md
│   └── run.py
│
├── urbanpulse-frontend/            # React Frontend
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── urbanpulse-chatbot/             # AI Chatbot Service
    │
    ├── bot_app/
    │   ├── main.py
    │   ├── chatbot.py
    │   ├── model_loader.py
    │   ├── prompts.py
    │   ├── utils.py
    │   └── config.py
    │
    ├── .env
    ├── requirements.txt
    └── README.md
```

---

# Project Modules

## 1. UrbanPulse Backend

The backend is developed using **FastAPI** and follows a layered architecture consisting of API routes, business services, database models, schemas, middleware, and utility modules. It handles authentication, waste concern management, worker assignments, route planning, notifications, suggestions, and map-related services.

---

## 2. UrbanPulse Frontend

The frontend is developed using **React** and provides responsive user interfaces for Citizens, Workers, and Administrators. It communicates with the backend through REST APIs and integrates map visualization, dashboards, authentication, and reporting features.

---

## 3. UrbanPulse Chatbot

The chatbot is implemented as an independent FastAPI service. It manages AI model loading, prompt handling, and chatbot responses. The backend communicates with this service through API calls, allowing the chatbot to remain isolated from the core backend.

---

# Advantages of this Structure

- Clear separation of frontend, backend, and AI services.
- Independent development by different team members.
- Easier testing and debugging.
- Modular and scalable architecture.
- Supports independent deployment of each service.
- Simplifies maintenance and future feature additions.