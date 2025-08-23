import logging
from datetime import datetime

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import routers
from app.api.v1.analysis import router as analysis_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkillSync Pro API",
    description="AI-Powered Resume & Job Description Analyzer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS - be explicit about origins
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",  # Vite preview
    "https://skill-sync-pro.vercel.app",
    "https://skill-sync-pro-frontend.vercel.app",
    "https://*.vercel.app",  # Allow all Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(analysis_router)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if app.debug else "An unexpected error occurred",
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.get("/")
def read_root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to SkillSync Pro API",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "documentation": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


@app.get("/api/v1/test")
def test_endpoint():
    """Test endpoint for API v1."""
    return {"message": "API v1 is working!", "endpoint": "test"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
