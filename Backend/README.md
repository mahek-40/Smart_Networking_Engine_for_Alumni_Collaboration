# Smart Networking Engine for Alumni Collaboration

> **Internship Project — Backend & AI/ML**
> An AI-powered alumni networking backend that recommends compatible connections, matches mentors, and predicts collaboration compatibility.

Built with **FastAPI**, **MongoDB (Atlas)**, **JWT Authentication**, and **Scikit-learn** (TF-IDF + Cosine Similarity).

---

## Features

| Feature | Details |
|---------|---------|
| 🔐 Secure Authentication | JWT bearer tokens, bcrypt password hashing, expired-token error messages |
| 👤 Profile Management | Alumni, Student, and Mentor profiles with skills, interests, industry, bio |
| 🤖 AI Recommendations | TF-IDF + Cosine Similarity with skill/interest/industry weighting |
| 🎯 Mentor Matching | Role-filtered mentor discovery with experience and skill alignment |
| 🤝 Collaboration Prediction | Pairwise compatibility score with full score breakdown |
| 📊 Analytics Dashboard | Top skills, industries, recommendation stats, top mentors |
| 🔍 Advanced Filtering | Filter by industry, role, experience range, skills, interests |
| 📄 Pagination | All list endpoints paginated with `total`, `total_pages` |
| 📝 Explainable AI | Every recommendation includes a plain-English `match_reason` |
| 🚀 Production Ready | Render deployment, MongoDB Atlas support, Docker, structured logging |

---

## AI Scoring Weights

| Component | Weight | Description |
|-----------|--------|-------------|
| TF-IDF Cosine Similarity | **40%** | Semantic overlap of full profile text |
| Skill Overlap | **30%** | Exact matching of skill tags |
| Interest Alignment | **20%** | Shared professional/academic interests |
| Industry Match | **10%** | Both users in the same industry |

Match labels: `Excellent Match (≥75%)` · `Strong Match (≥55%)` · `Good Match (≥35%)` · `Moderate Match (<35%)`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API Framework | FastAPI 0.110+ |
| Database | MongoDB via Motor (async driver) |
| Authentication | PyJWT + bcrypt |
| ML / AI | Scikit-learn (TF-IDF, Cosine Similarity), NumPy |
| Config | Pydantic BaseSettings |
| Deployment | Render.com + MongoDB Atlas |
| Container | Docker (python:3.11-slim) |
| Python | 3.11+ |

---

## Project Structure

```
smart-networking-engine/
├── backend/
│   ├── app/
│   │   ├── main.py                  # Entry point, middleware, exception handlers
│   │   ├── auth/
│   │   │   ├── deps.py              # JWT auth dependency (Depends guard)
│   │   │   └── security.py          # bcrypt hashing + JWT create/decode
│   │   ├── config/
│   │   │   └── settings.py          # Centralized Pydantic BaseSettings
│   │   ├── database/
│   │   │   └── connection.py        # Motor client, index creation, ping
│   │   ├── ml/
│   │   │   └── engine.py            # TF-IDF + Cosine Similarity engine
│   │   ├── models/
│   │   │   ├── activity.py          # Activity log + recommendation history schemas
│   │   │   ├── filters.py           # RecommendationFilters Pydantic model
│   │   │   ├── profile.py           # Profile schemas (create, update, response)
│   │   │   ├── recommendation.py    # Recommendation response models
│   │   │   └── user.py              # User registration/login/response schemas
│   │   ├── routes/
│   │   │   ├── admin.py             # Admin: demo seed reset
│   │   │   ├── analytics.py         # Dashboard aggregations
│   │   │   ├── auth.py              # Register + Login
│   │   │   ├── profile.py           # Profile CRUD + paginated search
│   │   │   ├── recommendations.py   # AI recommendations, mentors, collaboration
│   │   │   └── user.py              # /me (user+profile) + /version
│   │   ├── services/
│   │   │   ├── activity_service.py  # Activity + recommendation history logging
│   │   │   └── recommendation_service.py # ML orchestration (filter, sort, paginate)
│   │   └── utils/
│   │       ├── config.py            # Backward-compat shim → app.config.settings
│   │       ├── logger.py            # Shared structured logger
│   │       ├── mongo.py             # PyObjectId Pydantic v2 validator
│   │       ├── responses.py         # success_response, error_response, paginated_response
│   │       └── seed_data.py         # 20 demo profiles (5 students, 8 alumni, 7 mentors)
│   ├── sample_data/                 # JSON payloads for Postman / Thunder Client
│   │   ├── register.json
│   │   ├── login.json
│   │   └── profile_update.json
│   ├── .env.example                 # Environment variable template
│   ├── Procfile                     # Heroku / Railway deployment
│   ├── HANDOFF.md                   # Frontend integration guide
│   ├── requirements.txt             # Pinned Python dependencies
│   └── test_api.py                  # Integration test runner
├── docs/
│   ├── API_REFERENCE.md             # Full endpoint reference for frontend
│   ├── ARCHITECTURE.md              # System architecture diagrams
│   ├── AI_EXPLANATION.md            # How TF-IDF + cosine similarity works
│   └── PRESENTATION_NOTES.md        # Mentor Q&A prep + demo workflow
├── .env                             # Local secrets (DO NOT commit)
├── .env.example → backend/.env.example
├── .gitignore
├── Dockerfile                       # Production container
├── render.yaml                      # Render.com deployment config
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- MongoDB running locally (`mongod`) **OR** a MongoDB Atlas URI

### 1 — Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/smart-networking-engine.git
cd "smart networking engine for alumini collaboration"

python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r backend/requirements.txt
```

### 2 — Configure Environment

```bash
# Copy the template
copy backend\.env.example .env   # Windows
cp backend/.env.example .env     # macOS/Linux
```

Edit `.env`:
```ini
# Local MongoDB
MONGODB_URL=mongodb://localhost:27017

# OR MongoDB Atlas
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

DATABASE_NAME=alumni_network
JWT_SECRET_KEY=your-32-char-hex-secret-here   # python -c "import secrets; print(secrets.token_hex(32))"
ACCESS_TOKEN_EXPIRE_MINUTES=120
APP_ENV=development
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3 — Seed Demo Data

```bash
cd backend
# Windows PowerShell
$env:PYTHONPATH = "."
python app/utils/seed_data.py

# macOS / Linux
PYTHONPATH=. python app/utils/seed_data.py
```

Inserts 20 profiles: 5 students, 8 alumni, 7 mentors.

### 4 — Start Server

```bash
uvicorn app.main:app --reload --app-dir backend
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Deployment (Render + MongoDB Atlas)

### MongoDB Atlas Setup
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with `readWrite` permissions
3. Allow access from `0.0.0.0/0` (all IPs) for Render
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/`

### Render Deployment
1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your GitHub repo
3. Set these env vars in Render dashboard:
   - `MONGODB_URL` → your Atlas URI
   - `JWT_SECRET_KEY` → generate with `python -c "import secrets; print(secrets.token_hex(32))"`
   - `APP_ENV` → `production`
   - `ALLOWED_ORIGINS` → your frontend URL (e.g. `https://yourapp.vercel.app`)
4. Build command: `pip install -r backend/requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`
6. Health check path: `/health`

Or use the included `render.yaml` for automatic configuration.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login → JWT token + `expires_at` |
| GET | `/api/me` | ✅ | Current user + profile (bootstrap) |
| GET | `/api/profile/me` | ✅ | My profile |
| PUT | `/api/profile/me` | ✅ | Update my profile |
| GET | `/api/profile/search` | ✅ | Search profiles (paginated) |
| GET | `/api/profile/{user_id}` | ✅ | View another user's profile |
| GET | `/api/recommendations/similar` | ✅ | AI connection recommendations |
| GET | `/api/recommendations/mentors` | ✅ | Mentor matching |
| GET | `/api/recommendations/collaborate/{id}` | ✅ | Pairwise compatibility |
| GET | `/api/analytics/overview` | ✅ | Dashboard metrics |
| GET | `/api/analytics/skills` | ✅ | Top 10 skills |
| GET | `/api/analytics/industries` | ✅ | Top 10 industries |
| GET | `/api/analytics/recommendations-summary` | ✅ | Recommendation stats |
| GET | `/api/analytics/top-mentors` | ✅ | Most recommended mentors |
| POST | `/api/admin/seed` | `X-Admin-Key` | Reset demo data |
| GET | `/health` | ❌ | DB ping + status |
| GET | `/api/version` | ❌ | App version info |

See [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) for full request/response examples.

---

## Standard Response Format

```json
{
  "success": true,
  "message": "Found 4 compatible profiles",
  "timestamp": "2026-06-04T10:00:00Z",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 4,
    "total_pages": 1
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Your session has expired. Please log in again.",
  "timestamp": "2026-06-04T10:00:00Z"
}
```

---

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture diagrams and component breakdown
- [`docs/AI_EXPLANATION.md`](docs/AI_EXPLANATION.md) — How the TF-IDF recommendation engine works (plain English)
- [`docs/PRESENTATION_NOTES.md`](docs/PRESENTATION_NOTES.md) — Mentor Q&A prep, tech justification, demo workflow
- [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) — Full API reference for frontend integration
- [`backend/HANDOFF.md`](backend/HANDOFF.md) — Frontend integration guide

---

## Running Integration Tests

```bash
cd backend
python test_api.py
```

The test runner spawns a Uvicorn process, seeds the database, and validates all major endpoints.

---

*Built as part of an internship project — Backend & AI/ML deliverables (Day 1–18).*
