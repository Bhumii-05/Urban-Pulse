from fastapi import FastAPI

from app.api.routes.classify import router as classify_router

app = FastAPI(
    title="Civic AI Service",
    version="1.0.0",
)

app.include_router(classify_router)


@app.get("/")
def root():
    return {
        "message": "Civic AI Service Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }