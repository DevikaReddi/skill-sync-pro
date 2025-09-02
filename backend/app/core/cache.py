"""Caching service for performance optimization."""
import json
import hashlib
from typing import Optional, Any
from datetime import timedelta
import redis
from functools import wraps
import os

# Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_available = True
except:
    redis_client = None
    redis_available = False

def generate_cache_key(*args, **kwargs) -> str:
    """Generate a cache key from arguments."""
    key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
    return hashlib.md5(key_data.encode()).hexdigest()

def cache_result(expire_time: int = 3600):
    """Decorator to cache function results."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not redis_available:
                return await func(*args, **kwargs)
            
            # Generate cache key
            cache_key = f"{func.__name__}:{generate_cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            try:
                cached = redis_client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except:
                pass
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            try:
                redis_client.setex(
                    cache_key,
                    expire_time,
                    json.dumps(result)
                )
            except:
                pass
            
            return result
        
        return wrapper
    return decorator

class CacheService:
    """Service for managing cache."""
    
    @staticmethod
    def set(key: str, value: Any, expire: int = 3600) -> bool:
        """Set a cache value."""
        if not redis_available:
            return False
        
        try:
            redis_client.setex(key, expire, json.dumps(value))
            return True
        except:
            return False
    
    @staticmethod
    def get(key: str) -> Optional[Any]:
        """Get a cache value."""
        if not redis_available:
            return None
        
        try:
            value = redis_client.get(key)
            return json.loads(value) if value else None
        except:
            return None
    
    @staticmethod
    def delete(key: str) -> bool:
        """Delete a cache value."""
        if not redis_available:
            return False
        
        try:
            redis_client.delete(key)
            return True
        except:
            return False
    
    @staticmethod
    def clear_pattern(pattern: str) -> int:
        """Clear all keys matching a pattern."""
        if not redis_available:
            return 0
        
        try:
            keys = redis_client.keys(pattern)
            if keys:
                return redis_client.delete(*keys)
            return 0
        except:
            return 0
