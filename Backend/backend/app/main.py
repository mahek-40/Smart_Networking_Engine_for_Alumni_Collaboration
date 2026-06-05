"""
FastAPI application entry point — Smart Networking Engine for Alumni Collaboration.

Startup order:
  1. Connect to MongoDB (local or Atlas)
  2. Create database indexes
  3. Register all routers
  4. Attach middleware (CORS, Request-ID, global exception handlers)
"""
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.settings import settings
from app.database.connection import (
    connect_to_mongo,
    close_mongo_connection,
    create_indexes,
    ping_database,
)
from app.utils.logger import get_logger
from app.utils.responses import error_response, success_response

from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.recommendations import router as recommendations_router
from app.routes.analytics import router as analytics_router
from app.routes.user import router as user_router
from app.routes.admin import router as admin_router
from app.routes.connections import router as connections_router
from app.routes.notifications import router as notifications_router
from app.routes.projects import router as projects_router

logger = get_logger(__name__)


# ─── Request-ID Middleware ─────────────────────────────────────────────────────

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a unique X-Request-ID header to every request/response for tracing."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


# ─── Lifespan ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting %s v%s [%s]",
        settings.PROJECT_NAME,
        settings.APP_VERSION,
        settings.APP_ENV,
    )
    connect_to_mongo()
    await create_indexes()
    logger.info("Application startup complete — API is ready")
    yield
    close_mongo_connection()
    logger.info("Application shut down cleanly")


# ─── App instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
## Smart Networking Engine for Alumni Collaboration

An **AI-powered alumni networking backend** built with FastAPI, MongoDB, JWT, and Scikit-learn.

### Features
- 🔐 Secure JWT authentication with bcrypt password hashing
- 👤 Alumni / Student / Mentor profile management with skills, interests, industry, and goals
- 🤖 **TF-IDF + Cosine Similarity** recommendation engine with explainable match reasons
- 🎯 Mentor matching filtered by role, experience, and skill alignment
- 🤝 Pairwise collaboration compatibility prediction with score breakdown
- 📊 Analytics dashboard — top skills, industries, user counts, activity logs
- 🔍 Advanced filtering, sorting, and pagination on all list endpoints
- 🚀 Production-ready: structured logging, MongoDB Atlas support, Render deployment

### AI Scoring Weights
| Component | Weight |
|-----------|--------|
| TF-IDF Cosine Similarity | 40% |
| Skill Overlap | 30% |
| Interest Alignment | 20% |
| Industry Match | 10% |
""",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    contact={
        "name": "Backend Team",
        "email": "backend@alumninetwork.dev",
    },
    license_info={"name": "MIT"},
    openapi_tags=[
        {"name": "Auth", "description": "Register, login — returns JWT bearer token"},
        {"name": "User", "description": "Current user bootstrap endpoint (`/me`) and version info"},
        {"name": "Profiles", "description": "Profile CRUD, search, and filter with pagination"},
        {
            "name": "AI Recommendations",
            "description": (
                "ML-powered endpoints: connection recommendations, mentor matching, "
                "and pairwise collaboration compatibility prediction. "
                "All results include compatibility scores, match labels, and explainable reasons."
            ),
        },
        {"name": "Dashboard & Analytics", "description": "Aggregated platform metrics for dashboards"},
        {"name": "Admin", "description": "Admin-only operations (demo seed reset)"},
        {"name": "Health", "description": "Liveness and readiness probes"},
    ],
)

# ─── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(connections_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

# ─── Global exception handlers ────────────────────────────────────────────────

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(
        "HTTP %d | path=%s | detail=%s",
        exc.status_code, request.url.path, exc.detail,
    )
    return error_response(message=str(exc.detail), status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = exc.errors()
    message = "Validation error"
    if details:
        loc = details[0].get("loc", [])
        field = loc[-1] if loc else "unknown"
        message = f"Field '{field}': {details[0]['msg']}"
    logger.warning("Validation error | path=%s | %s", request.url.path, message)
    return error_response(message=message, status_code=422, details=details)


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception | path=%s | %s",
        request.url.path, exc, exc_info=True,
    )
    return error_response(
        message="An internal server error occurred. Please try again later.",
        status_code=500,
    )


# ─── Root & Health ────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"], summary="API root — welcome message and links")
async def root():
    return {
        "success": True,
        "message": f"Welcome to the {settings.PROJECT_NAME} API",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", tags=["Health"], summary="Live health check with database ping")
async def health_check():
    """
    Liveness + readiness probe.

    - Pings MongoDB to confirm database connectivity.
    - Returns `status: healthy` when DB is connected, `degraded` otherwise.
    - Safe to call without authentication.
    """
    db_ok = await ping_database()
    return {
        "success": True,
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }
