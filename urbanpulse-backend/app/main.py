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
from app.api.v1 import waste_bins
from app.api.v1.suggestions import (
    citizen_router as suggestion_citizen_router,
)
from app.api.v1.suggestions import (
    admin_router as suggestion_admin_router,
)
from app.api.v1.dashboard import router as dashboard_router

app = FastAPI(
    title="UrbanPulse API",
    version="1.0.0",
)


# CORS config

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "UrbanPulse API is running"
    }


app.include_router(
    auth_router,
    prefix="/api/v1",
)


app.include_router(
    users_router,
    prefix="/api/v1",
)


app.include_router(
    profile_router,
    prefix="/api/v1",
)


app.include_router(
    concerns.router,
    prefix="/api/v1",
)


app.include_router(
    notifications_router,
    prefix="/api/v1",
)


app.include_router(
    concern_images.router,
    prefix="/api/v1",
)


app.include_router(
    suggestion_citizen_router,
    prefix="/api/v1",
)


app.include_router(
    suggestion_admin_router,
    prefix="/api/v1",
)


app.include_router(
    dashboard_router,
    prefix="/api/v1",
)

app.include_router(
    assignments.router,
    prefix="/api/v1",
)


app.include_router(
    collection_routes.router,
    prefix="/api/v1",
)


app.include_router(
    collection_points.router,
    prefix="/api/v1",
)


app.include_router(
    waste_bins.router,
    prefix="/api/v1",
)