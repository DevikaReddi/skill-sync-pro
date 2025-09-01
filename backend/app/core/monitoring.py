"""Performance monitoring and metrics."""
import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import psutil

logger = logging.getLogger(__name__)

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware for performance monitoring."""
    
    async def dispatch(self, request: Request, call_next):
        """Process the request and add performance metrics."""
        start_time = time.time()
        
        # Add request ID for tracing
        request_id = f"{time.time()}-{id(request)}"
        request.state.request_id = request_id
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Add performance headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration:.3f}s"
            
            # Log slow requests
            if duration > 1.0:
                logger.warning(
                    f"Slow request: {request.method} {request.url.path} "
                    f"took {duration:.3f}s (request_id: {request_id})"
                )
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"after {duration:.3f}s - {str(e)} (request_id: {request_id})"
            )
            raise

async def get_system_metrics():
    """Get system performance metrics."""
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "cpu_percent": cpu_percent,
        "memory_percent": memory.percent,
        "memory_available_mb": memory.available / 1024 / 1024,
        "disk_percent": disk.percent,
        "disk_free_gb": disk.free / 1024 / 1024 / 1024
    }

def get_metrics():
    """Get basic metrics."""
    return {"status": "metrics endpoint active"}
