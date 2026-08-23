from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ai import router as ai_router
from app.api.complaints import router as complaints_router
from app.api.exceptions import AIServiceError

app = FastAPI(
    title="Civic AI Service",
    version="1.0.0",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

app.include_router(ai_router, prefix="/api/v1")
app.include_router(complaints_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Civic AI Service Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}