"""Rate limiting configuration."""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom handler for rate limit exceeded."""
    response = JSONResponse(
        content={
            "error": "Rate limit exceeded",
            "detail": f"Too many requests. {exc.detail}"
        },
        status_code=429,
    )
    response.headers["Retry-After"] = str(exc.retry_after)
    return response
