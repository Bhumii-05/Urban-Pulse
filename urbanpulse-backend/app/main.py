from fastapi import FastAPI
from app.api.v1.auth import router as auth_router

app = FastAPI(
    title="UrbanPulse API",
    version="1.0.0",
)

@app.get("/")
def root():
    return {"message": "UrbanPulse API is running"}

app.include_router(
    auth_router,
    prefix="/api/v1",
)