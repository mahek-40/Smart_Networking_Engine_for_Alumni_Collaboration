# System Architecture — Smart Networking Engine

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│         React Frontend (handled by project partner)                 │
│         Communicates via HTTP REST API                              │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / JWT Bearer Token
┌───────────────────────────▼─────────────────────────────────────────┐
│                    FASTAPI BACKEND (Python 3.11)                    │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │  Auth Layer │  │  API Routes  │  │   ML / AI Engine           │ │
│  │  JWT + bcrypt│  │  /api/...   │  │   TF-IDF + Cosine Sim      │ │
│  └─────────────┘  └──────────────┘  └────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Services Layer (Business Logic)                │   │
│  │  recommendation_service.py  |  activity_service.py         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │            Database Layer (Motor Async Driver)              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Motor (async)
┌───────────────────────────▼─────────────────────────────────────────┐
│                    MongoDB (Atlas or Local)                          │
│                                                                     │
│  Collections:                                                       │
│   users           → email, hashed_password, full_name              │
│   profiles        → skills, interests, industry, bio, goals        │
│   activities      → user_id, action, details, timestamp            │
│   recommendations → user_id, recommended_user_id, score, reason    │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### `app/main.py`
Application entry point. Manages startup (MongoDB connect → create indexes), CORS middleware, global exception handlers, and route registration.

### `app/auth/`
- `security.py` — bcrypt hashing and PyJWT token creation/decoding
- `deps.py` — FastAPI `Depends()` guard that validates the bearer token on every protected route

### `app/config/settings.py`
Pydantic BaseSettings — single source of truth for all environment variables (`MONGODB_URL`, `JWT_SECRET_KEY`, `ALLOWED_ORIGINS`, etc.).

### `app/database/connection.py`
Motor async client wrapper. Handles local and Atlas connections, creates indexes on startup, and exposes `ping_database()` for health checks.

### `app/ml/engine.py`
The AI recommendation core:
1. Builds text representations from profile fields
2. TF-IDF vectorizes them via Scikit-learn
3. Computes cosine similarity
4. Blends with explicit skill/interest/industry overlap scores
5. Returns explainable results with labels and match reasons

### `app/services/`
Business logic layer — keeps route handlers thin:
- `recommendation_service.py` — filtering, ML invocation, sorting, pagination, logging
- `activity_service.py` — writes to the activities and recommendations collections

### `app/routes/`
FastAPI `APIRouter` modules per domain:
- `auth.py`, `profile.py`, `recommendations.py`, `analytics.py`, `user.py`, `admin.py`

### `app/models/`
Pydantic v2 models for request validation, response serialization, and internal data contracts.

## Data Flow — Recommendation Request

```
User hits GET /api/recommendations/similar
        │
        ▼
1. deps.py validates JWT → extracts user_id
        │
        ▼
2. recommendations.py (route) parses query params → builds RecommendationFilters
        │
        ▼
3. recommendation_service.py fetches target profile + filtered candidates from MongoDB
        │
        ▼
4. ml/engine.py → TF-IDF vectorize → cosine similarity → weighted score → label → match reason
        │
        ▼
5. Service sorts + paginates results
        │
        ▼
6. Log activity + recommendation history to MongoDB (async)
        │
        ▼
7. Route returns paginated_response with items, pagination metadata
```

## Deployment Architecture

```
GitHub → Render.com (Web Service)
              │
              ├── Build: pip install -r backend/requirements.txt
              ├── Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend
              └── Health: GET /health → MongoDB ping
                              │
                              ▼
                    MongoDB Atlas (Cloud)
                    mongodb+srv://cluster.mongodb.net/alumni_network
```
