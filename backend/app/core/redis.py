from __future__ import annotations

import asyncio
from typing import Optional

from loguru import logger
from redis.asyncio import Redis

from app.core.config import settings

_redis: Optional[Redis] = None
_redis_lock = asyncio.Lock()


def _build_redis_url() -> str:
    if settings.REDIS_URL:
        return settings.REDIS_URL
    auth = ""
    if settings.REDIS_PASSWORD:
        auth = f":{settings.REDIS_PASSWORD}@"
    return (
        f"redis://{auth}{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
    )


async def get_redis() -> Optional[Redis]:
    """
    Returns a lazily initialized Redis client.
    If Redis is unavailable, returns None and logs the error.
    """
    global _redis
    if _redis is not None:
        return _redis

    async with _redis_lock:
        if _redis is not None:
            return _redis
        url = _build_redis_url()
        try:
            client = Redis.from_url(url, encoding="utf-8", decode_responses=False)
            await client.ping()
        except Exception as exc:  # noqa: BLE001
            logger.warning("Redis is unavailable at {}: {}", url, exc)
            return None
        _redis = client
        return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.close()
        _redis = None
