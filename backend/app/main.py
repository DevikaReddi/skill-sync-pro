from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
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

# ✅ Configure CORS BEFORE adding routes
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://skill-sync-pro.vercel.app",
    "https://skill-sync-pro-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Explicit origins (no "*")
    allow_credentials=True,       # Required if using cookies/auth
    allow_methods=["*"],          # Includes OPTIONS
    allow_headers=["*"],          # Allow all custom headers
    expose_headers=["*"],         # Optional, useful if you read custom headers
    max_age=3600,                 # Cache preflight for 1 hour
)

# ✅ Ensure OPTIONS requests bypass rate limiting
@app.middleware("http")
async def skip_options_rate_limit(request: Request, call_next):
    if request.method == "OPTIONS":
        # Let CORSMiddleware handle it, don't trigger rate limiter
        return await call_next(request)
    return await call_next(request)

# ✅ Add rate limiter AFTER CORS
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# ✅ Include routers
app.include_router(analysis_router)
app.include_router(advanced_router)

# ❌ Removed manual @app.options("/api/v1/analysis/analyze") 
#    → CORSMiddleware will now handle preflight correctly

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
