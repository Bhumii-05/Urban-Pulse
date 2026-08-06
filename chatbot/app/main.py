from fastapi import FastAPI

from app.config.settings import settings

app = FastAPI(
    title="Civic AI Service",
    description="AI mmicroservice for Civic Cleanliness reporting Platform",
    version = "1.0.0",
)

@app.get("/")
def root():
    return {
        "message": "Civic AI Service is Running"
    }

@app.get("/health")
def health():
    return{
        "status": "healthy",
        "model": settings.OPENAI_MODEL,
    }