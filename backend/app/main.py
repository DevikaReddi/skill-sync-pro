from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import database
from app.core.database import engine, Base

# Import routers
from app.api.v1.analysis import router as analysis_router
from app.api.v1.advanced import router as advanced_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.auth import router as auth_router
from app.api.v1.history import router as history_router
from app.api.v1.analytics import router as analytics_router
from app.core.rate_limiter import limiter, rate_limit_exceeded_handler

# Import monitoring
from app.core.monitoring import PerformanceMiddleware, get_system_metrics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillSync Pro API",
    description="AI-Powered Resume Analyzer with Authentication",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add performance monitoring middleware
app.add_middleware(PerformanceMiddleware)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Include routers
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(advanced_router)
app.include_router(recommendations_router)
app.include_router(history_router)
app.include_router(analytics_router)

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
        "version": "4.0.0",
        "features": {
            "authentication": "JWT-based authentication",
            "analysis": "AI-powered resume analysis",
            "history": "Save and retrieve analysis history",
            "recommendations": "Smart skill recommendations",
            "analytics": "User analytics and insights"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/system/health")
async def system_health():
    """System health metrics."""
    return await get_system_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Add these imports at the top
from app.api.v1.websocket import router as websocket_router
from app.api.v1.collaboration import router as collaboration_router

# Add these routers after other includes
app.include_router(websocket_router)
app.include_router(collaboration_router)

# Add these imports at the top
from fastapi.middleware.gzip import GZipMiddleware

# Add compression middleware after CORS
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add these imports
from app.api.v1.insights import router as insights_router

# Add insights router
app.include_router(insights_router)

# Add startup event for cleanup
@app.on_event("startup")
async def startup_event():
    """Run startup tasks."""
    logger.info("Starting SkillSync Pro API...")
    
    # Clean up old sessions if using collaboration
    from app.services.collaboration import collaboration_manager
    cleaned = collaboration_manager.cleanup_inactive_sessions()
    if cleaned > 0:
        logger.info(f"Cleaned up {cleaned} inactive sessions")

@app.on_event("shutdown")
async def shutdown_event():
    """Run shutdown tasks."""
    logger.info("Shutting down SkillSync Pro API...")

# Add these imports at the top
from app.api.v1.upload import router as upload_router
from app.api.v1.templates import router as templates_router

# Add these routers
app.include_router(upload_router)
app.include_router(templates_router)

# Add email notification on user registration (update existing auth endpoint)
# This would be added to the registration endpoint in auth.py
