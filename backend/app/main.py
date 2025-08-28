from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import our modules
from app.api.v1.analysis import router as analysis_router
from app.api.v1.advanced import router as advanced_router
from app.core.rate_limiter import limiter, rate_limit_exceeded_handler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SkillSync Pro API",
    description="AI-Powered Resume & Job Description Analyzer with NLP",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS BEFORE adding routes
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:4173",
    "https://skill-sync-pro.vercel.app",
    "https://skill-sync-pro-frontend.vercel.app",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # This allows all methods including OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add rate limiter AFTER CORS
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Include routers
app.include_router(analysis_router)
app.include_router(advanced_router)

# Add explicit OPTIONS handler for problematic endpoints
@app.options("/api/v1/analysis/analyze")
async def options_analyze():
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

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
            "timestamp": datetime.now().isoformat()
        }
    )

@app.get("/")
@limiter.limit("30 per minute")
def read_root(request: Request):
    """Root endpoint with API information."""
    return {
        "message": "Welcome to SkillSync Pro API",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "documentation": "/docs",
        "version": "2.0.0",
        "features": {
            "nlp": "Advanced NLP with spaCy",
            "skill_extraction": "Multi-method skill extraction",
            "semantic_analysis": "Semantic similarity scoring",
            "experience_detection": "Automatic experience level detection"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}

@app.get("/api/v1/test")
@limiter.limit("30 per minute")
def test_endpoint(request: Request):
    """Test endpoint for API v1."""
    return {
        "message": "API v1 is working!",
        "endpoint": "test"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
