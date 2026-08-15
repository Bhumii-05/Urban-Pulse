from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.ai import router as ai_router
from app.api.complaint import router as complaint_router
from app.api.exceptions import AIServiceError

app = FastAPI(
    title="Civic AI Service",
    version="1.0.0",
)


# --- Exception Handlers ---

@app.exception_handler(AIServiceError)
async def ai_service_exception_handler(
    request: Request,
    exc: AIServiceError,
):
    return JSONResponse(
        status_code=503,
        content={"detail": "AI service is temporarily unavailable."},
    )


@app.exception_handler(RuntimeError)
async def runtime_error_handler(
    request: Request,
    exc: RuntimeError,
):
    return JSONResponse(
        status_code=502,
        content={"detail": str(exc)},
    )


@app.exception_handler(ValueError)
async def value_error_handler(
    request: Request,
    exc: ValueError,
):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


# --- Routers & Endpoints ---

app.include_router(complaint_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {"message": "Civic AI Service Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}