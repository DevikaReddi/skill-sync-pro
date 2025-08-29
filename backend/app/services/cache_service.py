"""Simple in-memory cache for performance optimization."""
from typing import Any, Optional
import time
import hashlib
import json
from functools import wraps
import logging

logger = logging.getLogger(__name__)

class CacheService:
    """In-memory cache service."""
    
    def __init__(self, default_ttl: int = 3600):
        self.cache = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0
    
    def _make_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments."""
        key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if key in self.cache:
            entry = self.cache[key]
            if time.time() < entry["expires"]:
                self.hits += 1
                logger.debug(f"Cache hit: {key}")
                return entry["value"]
            else:
                # Expired
                del self.cache[key]
        
        self.misses += 1
        logger.debug(f"Cache miss: {key}")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache."""
        ttl = ttl or self.default_ttl
        self.cache[key] = {
            "value": value,
            "expires": time.time() + ttl
        }
        logger.debug(f"Cache set: {key}, TTL: {ttl}")
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self.cache.clear()
        logger.info("Cache cleared")
    
    def stats(self) -> dict:
        """Get cache statistics."""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.1f}%",
            "entries": len(self.cache)
        }

# Global cache instance
cache = CacheService()

def cached(ttl: int = 3600):
    """Decorator for caching function results."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache_key = cache._make_key(func.__name__, *args, **kwargs)
            result = cache.get(cache_key)
            
            if result is None:
                result = await func(*args, **kwargs)
                cache.set(cache_key, result, ttl)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = cache._make_key(func.__name__, *args, **kwargs)
            result = cache.get(cache_key)
            
            if result is None:
                result = func(*args, **kwargs)
                cache.set(cache_key, result, ttl)
            
            return result
        
        # Return appropriate wrapper
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

import asyncio
