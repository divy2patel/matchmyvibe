import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.errors import MatchMyVibeError
from backend.app.api.v1.router import api_v1_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("matchmyvibe.main")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="PS-1 Hobby Matchmaker for Aatmoday Campus with Multi-Provider AI Fallback and Hybrid Vector Matching",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler: Never expose raw stack traces to students
@app.exception_handler(MatchMyVibeError)
async def custom_exception_handler(request: Request, exc: MatchMyVibeError):
    logger.error("Application error: %s (status %d)", exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message, "details": exc.details},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Something went wrong while finding your matches. Please try again.",
        },
    )

# Root & Health Endpoints
@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs_url": "/docs",
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "primary_ai": settings.AI_PRIMARY_PROVIDER,
        "fallback_ai": settings.AI_FALLBACK_PROVIDER,
    }

# Mount API V1
app.include_router(api_v1_router)
