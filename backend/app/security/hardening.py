import time
from typing import Dict, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects enterprise defense-in-depth HTTP security headers into every response.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' http: https:;"
        )
        return response


class RateLimiter:
    """
    In-memory Token Bucket rate limiter per client IP.
    Protects API Gateway from brute-force adversarial fuzzing and DoS.
    """

    def __init__(self, requests_per_minute: int = 120):
        self.rpm = requests_per_minute
        self.clients: Dict[str, Tuple[float, int]] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        if client_ip not in self.clients:
            self.clients[client_ip] = (now, 1)
            return True

        last_time, count = self.clients[client_ip]
        if now - last_time > 60.0:
            self.clients[client_ip] = (now, 1)
            return True

        if count < self.rpm:
            self.clients[client_ip] = (last_time, count + 1)
            return True

        return False


rate_limiter = RateLimiter(requests_per_minute=120)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "unknown"

        # Bypass rate limiting for health check probes
        if request.url.path.endswith("/health") or request.url.path == "/":
            return await call_next(request)

        if not rate_limiter.is_allowed(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "detail": "Rate limit exceeded. Maximum 120 requests per minute.",
                },
            )

        return await call_next(request)

