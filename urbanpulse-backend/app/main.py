from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.user import router as users_router
from app.api.v1.profile import router as profile_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1 import assignments
from app.api.v1 import collection_points
from app.api.v1 import collection_routes
from app.api.v1 import concern_images
from app.api.v1 import concerns
from app.api.v1 import chatbot
from app.api.v1 import waste_bins
from app.api.v1 import maps
from app.api.v1.suggestions import (
    citizen_router as suggestion_citizen_router,
)
from app.api.v1.suggestions import (
    admin_router as suggestion_admin_router,
)
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1 import analytics

from app.core.config import settings


app = FastAPI(
    title="UrbanPulse API",
    version="1.0.0",
)


# =========================
# CORS
# =========================

origins = list(
    set(
        settings.ALLOWED_ORIGINS
        + [settings.FRONTEND_URL]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "UrbanPulse API is running"
    }


# =========================
# AUTH
# =========================

app.include_router(
    auth_router,
    prefix="/api/v1",
)


# =========================
# USERS
# =========================

app.include_router(
    users_router,
    prefix="/api/v1",
)


# =========================
# PROFILE
# =========================

app.include_router(
    profile_router,
    prefix="/api/v1",
)


# =========================
# CONCERNS
# =========================

app.include_router(
    concerns.router,
    prefix="/api/v1",
)


# =========================
# NOTIFICATIONS
# =========================

app.include_router(
    notifications_router,
    prefix="/api/v1",
)


# =========================
# CONCERN IMAGES
# =========================

app.include_router(
    concern_images.router,
    prefix="/api/v1",
)


# =========================
# SUGGESTIONS
# =========================

app.include_router(
    suggestion_citizen_router,
    prefix="/api/v1",
)

app.include_router(
    suggestion_admin_router,
    prefix="/api/v1",
)


# =========================
# DASHBOARD
# =========================

app.include_router(
    dashboard_router,
    prefix="/api/v1",
)


# =========================
# ASSIGNMENTS
# =========================

app.include_router(
    assignments.router,
    prefix="/api/v1",
)


# =========================
# COLLECTION ROUTES
# =========================

app.include_router(
    collection_routes.router,
    prefix="/api/v1",
)


# =========================
# COLLECTION POINTS
# =========================

app.include_router(
    collection_points.router,
    prefix="/api/v1",
)


# =========================
# WASTE BINS
# =========================

app.include_router(
    waste_bins.router,
    prefix="/api/v1",
)


# =========================
# MAPS
# =========================

app.include_router(
    maps.router,
    prefix="/api/v1",
)


# =========================
# ANALYTICS
# =========================

app.include_router(
    analytics.router,
    prefix="/api/v1",
)


# =========================
# CHATBOT
# =========================

app.include_router(
    chatbot.router,
    prefix="/api/v1",
)