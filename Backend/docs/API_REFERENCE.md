# API Reference — Smart Networking Engine

**Base URL (local):** `http://localhost:8000/api`  
**Auth:** Bearer Token (JWT) — pass in `Authorization: Bearer <token>` header  
**Response format:** All responses follow the standard shape below.

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },
  "pagination": { "page": 1, "page_size": 10, "total": 42, "total_pages": 5 }
}
```

---

## Authentication

### `POST /api/auth/register`
Register a new user account (creates a linked profile stub automatically).

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "id": "...", "email": "...", "full_name": "..." }
}
```

---

### `POST /api/auth/login`
Authenticate and receive a JWT access token.

**Body (JSON):**
```json
{ "email": "john@example.com", "password": "SecurePass123!" }
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": { "id": "...", "email": "...", "full_name": "..." }
  }
}
```

---

## User (Protected)

### `GET /api/me`
Returns current user info **and** their full profile in one call.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Current user data retrieved successfully",
  "data": {
    "user": { "id": "...", "email": "...", "full_name": "..." },
    "profile": { "role": "Alumni", "skills": [...], "industry": "...", ... }
  }
}
```

---

## Profiles (Protected)

### `GET /api/profile/me`
Get the logged-in user's own profile.

### `PUT /api/profile/me`
Update the logged-in user's profile.

**Body (JSON, all fields optional):**
```json
{
  "full_name": "John Doe",
  "role": "Alumni",
  "bio": "Software engineer...",
  "skills": ["Python", "FastAPI"],
  "interests": ["AI", "Networking"],
  "industry": "Technology",
  "career_goals": "Become a tech lead",
  "graduation_year": 2021,
  "experience_years": 4
}
```

### `GET /api/profile/search`
Search profiles with filters and pagination.

| Query Param | Type | Description |
|-------------|------|-------------|
| `skills` | string | Comma-separated skill keywords |
| `interests` | string | Comma-separated interest keywords |
| `industry` | string | Industry name (case-insensitive) |
| `role` | string | `Student` \| `Alumni` \| `Mentor` |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Results per page (default: 10, max: 100) |

### `GET /api/profile/{user_id}`
Get another user's public profile by their `user_id`.

---

## AI Recommendations (Protected)

### `GET /api/recommendations/similar`
Get AI-matched alumni connections ranked by compatibility.

| Query Param | Type | Description |
|-------------|------|-------------|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Results per page (default: 10, max: 50) |
| `industry` | string | Filter by industry |
| `role` | string | Filter by role |
| `min_experience` | int | Minimum years of experience |
| `max_experience` | int | Maximum years of experience |
| `skills` | string | Comma-separated required skills (any match) |
| `interests` | string | Comma-separated required interests (any match) |
| `sort_by` | string | `score` (default) \| `experience` \| `industry_match` |

**Response item shape:**
```json
{
  "compatibility_score": 82.4,
  "label": "Excellent Match",
  "match_reason": "Shared skills: Python, FastAPI | Same industry: Technology",
  "score_breakdown": {
    "tfidf_similarity": 71.2,
    "skill_overlap_score": 80.0,
    "interest_overlap_score": 60.0,
    "industry_match_score": 100.0
  },
  "skill_overlap": ["Python", "FastAPI"],
  "interest_overlap": ["AI"],
  "profile": { "full_name": "...", "role": "...", ... }
}
```

---

### `GET /api/recommendations/mentors`
Get mentors matched to your profile.

Same query params as `/similar` (minus `role` — always filtered to `Mentor`).

---

### `GET /api/recommendations/collaborate/{candidate_id}`
Calculate pairwise compatibility with a specific user.

**Path Param:** `candidate_id` — the `user_id` (24-char hex) of the candidate.

---

## Analytics (Protected)

### `GET /api/analytics/overview`
Dashboard summary: user counts by role, total recommendations, total activities, last 5 activity logs.

### `GET /api/analytics/skills`
Top 10 most common skills across all profiles.

### `GET /api/analytics/industries`
Top 10 most common industries across all profiles.

---

## Health

### `GET /health`
Live health check with MongoDB connectivity status.

```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "environment": "development"
}
```

### `GET /api/version`
```json
{
  "success": true,
  "data": { "name": "Smart Networking Engine...", "version": "1.0.0", "environment": "development" }
}
```
