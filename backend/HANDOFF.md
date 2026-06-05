# Frontend Integration Handoff

## Project: Smart Networking Engine for Alumni Collaboration

This document is written for the **frontend developer** integrating with this backend API.

---

## 1. Base URL

| Environment | URL |
|-------------|-----|
| Local dev   | `http://localhost:8000` |
| API prefix  | `http://localhost:8000/api` |
| Swagger UI  | `http://localhost:8000/docs` |

---

## 2. Starting the Backend (Local)

```bash
# From the project root
cd "smart networking engine for alumini collaboration"

# Activate the virtual environment
.venv\Scripts\activate          # Windows
# source .venv/bin/activate    # macOS/Linux

# Start the server
uvicorn app.main:app --reload --app-dir backend
```

The backend is ready when you see:
```
INFO | Connected to MongoDB
INFO | MongoDB indexes verified/created
INFO | Application startup complete
```

---

## 3. Authentication Flow

```
1. POST /api/auth/register   → Create account
2. POST /api/auth/login      → Get access_token (JWT)
3. All protected routes      → Include header: Authorization: Bearer <access_token>
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Jane Smith"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Store `access_token` in localStorage or a state manager. Token expires in 120 minutes.**

---

## 4. Calling Protected Endpoints

```http
GET /api/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If the token is missing or expired, the API returns:
```json
{ "success": false, "message": "Not authenticated" }
```
HTTP status `401`.

---

## 5. Standard Response Shape

Every endpoint returns:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Paginated endpoints add a `pagination` block:

```json
{
  "success": true,
  "message": "...",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total": 47,
    "total_pages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "A user with this email is already registered"
}
```

---

## 6. Key Endpoints for Frontend

| Feature | Method | Endpoint | Auth |
|---------|--------|----------|------|
| Bootstrap (user + profile) | GET | `/api/me` | ✅ |
| Update profile | PUT | `/api/profile/me` | ✅ |
| Search alumni | GET | `/api/profile/search?skills=Python&page=1` | ✅ |
| AI connections | GET | `/api/recommendations/similar?page=1&page_size=5` | ✅ |
| Mentor matches | GET | `/api/recommendations/mentors` | ✅ |
| Collaboration score | GET | `/api/recommendations/collaborate/{user_id}` | ✅ |
| Dashboard stats | GET | `/api/analytics/overview` | ✅ |
| Top skills | GET | `/api/analytics/skills` | ✅ |
| Health check | GET | `/health` | ❌ |

---

## 7. Recommendation Response Fields

Each item in `/api/recommendations/similar` has:

| Field | Description |
|-------|-------------|
| `compatibility_score` | Float 0–100 |
| `label` | `"Excellent Match"` / `"Strong Match"` / `"Good Match"` / `"Moderate Match"` |
| `match_reason` | Plain text: e.g. `"Shared skills: Python, FastAPI | Same industry: Tech"` |
| `skill_overlap` | `["Python", "FastAPI"]` |
| `interest_overlap` | `["AI", "Networking"]` |
| `score_breakdown.tfidf_similarity` | TF-IDF component (0–100) |
| `score_breakdown.skill_overlap_score` | Skills component (0–100) |
| `score_breakdown.interest_overlap_score` | Interests component (0–100) |
| `score_breakdown.industry_match_score` | Industry component (0–100) |
| `profile` | Full candidate profile object |

---

## 8. CORS

The backend allows cross-origin requests from:
- `http://localhost:3000` (Create React App / Vite default React)
- `http://localhost:5173` (Vite default)

If your frontend runs on a different port, add it to `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4200
```

---

## 9. Postman / Thunder Client Quick Start

1. Import the Swagger at `http://localhost:8000/openapi.json`
2. Or use the sample JSON files in `backend/sample_data/`:
   - `register.json`
   - `login.json`
   - `profile_update.json`

---

## 10. Contact

For any API questions, check the Swagger docs at `/docs` first — all query params and response shapes are documented there with examples.
