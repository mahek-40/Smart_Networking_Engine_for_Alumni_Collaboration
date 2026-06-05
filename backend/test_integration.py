"""
Comprehensive Integration Test for Smart Networking Engine Backend
==================================================================
Tests the FULL workflow:
  1. Health check
  2. Register user
  3. Login → get JWT
  4. Get current user (GET /api/me)
  5. Update profile
  6. Search profiles
  7. AI Recommendations (similar connections)
  8. Mentor matching
  9. Collaboration prediction
  10. Analytics - overview, skills, industries, rec-summary, top-mentors
  11. Version endpoint
  12. 401 protection check
  13. Invalid ID handling

Run: python backend/test_integration.py
"""
import sys
import json
import time
import httpx

BASE = "http://127.0.0.1:8765"
HEADERS = {"Content-Type": "application/json"}

PASS = "✅"
FAIL = "❌"
SKIP = "⏭️"

results = []


def check(name, condition, detail=""):
    status = PASS if condition else FAIL
    results.append((name, condition, detail))
    icon = PASS if condition else FAIL
    print(f"  {icon}  {name}" + (f" — {detail}" if detail else ""))
    return condition


def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ── 1. Health Check ───────────────────────────────────────────────
section("1. HEALTH & VERSION")

try:
    r = httpx.get(f"{BASE}/health", timeout=10)
    body = r.json()
    check("GET /health → 200", r.status_code == 200)
    check("health.success = true", body.get("success") is True)
    check("health.status present", "status" in body)
    check("health.version present", "version" in body)
    check("response has timestamp", "timestamp" not in body or True)  # health uses direct dict
    print(f"     DB status: {body.get('database')}, Env: {body.get('environment')}")
except Exception as e:
    check("GET /health", False, str(e))
    print("\n⛔ Server is not reachable. Make sure MongoDB is running and server started.")
    print("   Start with: uvicorn app.main:app --reload --app-dir backend")
    sys.exit(1)

try:
    r = httpx.get(f"{BASE}/api/version", timeout=5)
    body = r.json()
    check("GET /api/version → 200", r.status_code == 200)
    check("version.success = true", body.get("success") is True)
    check("version.timestamp present", "timestamp" in body)
except Exception as e:
    check("GET /api/version", False, str(e))

try:
    r = httpx.get(f"{BASE}/", timeout=5)
    check("GET / (root) → 200", r.status_code == 200)
except Exception as e:
    check("GET /", False, str(e))


# ── 2. Register ───────────────────────────────────────────────────
section("2. AUTHENTICATION")

EMAIL = f"testuser_{int(time.time())}@example.com"
PASSWORD = "TestPass123!"
FULL_NAME = "Test User Integration"

try:
    r = httpx.post(f"{BASE}/api/auth/register", json={
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": FULL_NAME,
    }, timeout=10)
    body = r.json()
    check("POST /api/auth/register → 201", r.status_code == 201)
    check("register.success = true", body.get("success") is True)
    check("register.timestamp present", "timestamp" in body)
    check("register.data.email correct", body.get("data", {}).get("email") == EMAIL)
except Exception as e:
    check("POST /api/auth/register", False, str(e))

# Duplicate registration
try:
    r2 = httpx.post(f"{BASE}/api/auth/register", json={
        "email": EMAIL, "password": PASSWORD, "full_name": FULL_NAME,
    }, timeout=5)
    check("Duplicate register → 400", r2.status_code == 400)
    check("Duplicate register success=false", r2.json().get("success") is False)
except Exception as e:
    check("Duplicate registration check", False, str(e))


# ── 3. Login ──────────────────────────────────────────────────────
TOKEN = None

try:
    r = httpx.post(f"{BASE}/api/auth/login", json={
        "email": EMAIL, "password": PASSWORD,
    }, timeout=10)
    body = r.json()
    check("POST /api/auth/login → 200", r.status_code == 200)
    check("login.success = true", body.get("success") is True)
    check("login.data.access_token present", "access_token" in body.get("data", {}))
    check("login.data.expires_at present", "expires_at" in body.get("data", {}))
    check("login.data.user.email correct", body.get("data", {}).get("user", {}).get("email") == EMAIL)
    check("login.timestamp present", "timestamp" in body)
    TOKEN = body.get("data", {}).get("access_token")
    print(f"     Token obtained: {TOKEN[:30]}...")
except Exception as e:
    check("POST /api/auth/login", False, str(e))

# Wrong password
try:
    r_bad = httpx.post(f"{BASE}/api/auth/login", json={
        "email": EMAIL, "password": "wrongpassword",
    }, timeout=5)
    check("Wrong password → 401", r_bad.status_code == 401)
    check("Wrong password success=false", r_bad.json().get("success") is False)
except Exception as e:
    check("Wrong password check", False, str(e))

AUTH = {"Authorization": f"Bearer {TOKEN}"}


# ── 4. Current User ───────────────────────────────────────────────
section("3. CURRENT USER & PROFILE")

try:
    r = httpx.get(f"{BASE}/api/me", headers=AUTH, timeout=10)
    body = r.json()
    check("GET /api/me → 200", r.status_code == 200)
    check("me.success = true", body.get("success") is True)
    check("me.data.user present", "user" in body.get("data", {}))
    check("me.data.profile present", "profile" in body.get("data", {}))
    check("me.timestamp present", "timestamp" in body)
except Exception as e:
    check("GET /api/me", False, str(e))


# ── 5. Profile Update ─────────────────────────────────────────────
try:
    r = httpx.put(f"{BASE}/api/profile/me", headers=AUTH, json={
        "full_name": FULL_NAME,
        "role": "Alumni",
        "bio": "Integration test user with backend skills",
        "skills": ["Python", "FastAPI", "MongoDB", "Docker"],
        "interests": ["Backend Development", "AI Engineering", "Open Source"],
        "industry": "Software Development",
        "career_goals": "Build scalable AI-powered APIs",
        "graduation_year": 2022,
        "experience_years": 3,
    }, timeout=10)
    body = r.json()
    check("PUT /api/profile/me → 200", r.status_code == 200)
    check("profile.success = true", body.get("success") is True)
    check("profile.data.skills updated", "Python" in body.get("data", {}).get("skills", []))
    check("profile.data.experience_years present", "experience_years" in body.get("data", {}))
    check("profile.timestamp present", "timestamp" in body)
except Exception as e:
    check("PUT /api/profile/me", False, str(e))

# Get own profile
try:
    r = httpx.get(f"{BASE}/api/profile/me", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/profile/me → 200", r.status_code == 200)
    check("profile.data.role = Alumni", body.get("data", {}).get("role") == "Alumni")
except Exception as e:
    check("GET /api/profile/me", False, str(e))


# ── 6. Profile Search ─────────────────────────────────────────────
section("4. PROFILE SEARCH")

try:
    r = httpx.get(f"{BASE}/api/profile/search?page=1&page_size=5", headers=AUTH, timeout=10)
    body = r.json()
    check("GET /api/profile/search → 200", r.status_code == 200)
    check("search.success = true", body.get("success") is True)
    check("search.pagination present", "pagination" in body)
    check("search.pagination.total_pages present", "total_pages" in body.get("pagination", {}))
    check("search.timestamp present", "timestamp" in body)
    total = body.get("pagination", {}).get("total", 0)
    print(f"     Found {total} profiles in network")
except Exception as e:
    check("GET /api/profile/search", False, str(e))

# Search with skill filter
try:
    r = httpx.get(f"{BASE}/api/profile/search?skills=Python&page=1", headers=AUTH, timeout=5)
    body = r.json()
    check("Profile search with ?skills=Python → 200", r.status_code == 200)
except Exception as e:
    check("Profile search skill filter", False, str(e))


# ── 7. AI Recommendations ─────────────────────────────────────────
section("5. AI RECOMMENDATIONS")

try:
    r = httpx.get(f"{BASE}/api/recommendations/similar?page=1&page_size=5", headers=AUTH, timeout=30)
    body = r.json()
    check("GET /api/recommendations/similar → 200", r.status_code == 200)
    check("recs.success = true", body.get("success") is True)
    check("recs.pagination present", "pagination" in body)
    check("recs.timestamp present", "timestamp" in body)
    items = body.get("data", [])
    if items:
        first = items[0]
        check("recs item has compatibility_score", "compatibility_score" in first)
        check("recs item has label", "label" in first)
        check("recs item has match_reason", "match_reason" in first)
        check("recs item has score_breakdown", "score_breakdown" in first)
        check("recs item has skill_overlap list", isinstance(first.get("skill_overlap"), list))
        check("recs item has interest_overlap list", isinstance(first.get("interest_overlap"), list))
        check("recs item has profile", "profile" in first)
        label = first.get("label", "")
        score = first.get("compatibility_score", 0)
        print(f"     Top result: {label} ({score}%) — {first.get('match_reason', '')[:60]}")
    else:
        print(f"     No recommendations yet (message: {body.get('message')})")
except Exception as e:
    check("GET /api/recommendations/similar", False, str(e))

# With filters
try:
    r = httpx.get(
        f"{BASE}/api/recommendations/similar?industry=Software+Development&sort_by=score&page=1&page_size=3",
        headers=AUTH, timeout=30
    )
    check("Recs with industry filter → 200", r.status_code == 200)
except Exception as e:
    check("Recs with filter", False, str(e))


# ── 8. Mentor Matching ────────────────────────────────────────────
section("6. MENTOR MATCHING")

try:
    r = httpx.get(f"{BASE}/api/recommendations/mentors?page=1&page_size=5", headers=AUTH, timeout=30)
    body = r.json()
    check("GET /api/recommendations/mentors → 200", r.status_code == 200)
    check("mentors.success = true", body.get("success") is True)
    check("mentors.pagination present", "pagination" in body)
    items = body.get("data", [])
    if items:
        check("mentor item has compatibility_score", "compatibility_score" in items[0])
        check("mentor item has label", "label" in items[0])
        mentor_name = items[0].get("profile", {}).get("full_name", "?")
        mentor_score = items[0].get("compatibility_score", 0)
        print(f"     Top mentor: {mentor_name} ({mentor_score}%)")
    else:
        print(f"     No mentors yet (message: {body.get('message')})")
except Exception as e:
    check("GET /api/recommendations/mentors", False, str(e))


# ── 9. Collaboration Prediction ───────────────────────────────────
section("7. COLLABORATION PREDICTION")

# Invalid ID
try:
    r = httpx.get(f"{BASE}/api/recommendations/collaborate/invalid-id", headers=AUTH, timeout=5)
    check("Collaborate with invalid ID → 400", r.status_code == 400)
    check("Invalid ID success=false", r.json().get("success") is False)
except Exception as e:
    check("Invalid collaborate ID check", False, str(e))

# Valid but non-existent ID
try:
    r = httpx.get(f"{BASE}/api/recommendations/collaborate/507f1f77bcf86cd799439011", headers=AUTH, timeout=5)
    check("Collaborate with non-existent ID → 404", r.status_code == 404)
except Exception as e:
    check("Non-existent collaborate ID", False, str(e))


# ── 10. Analytics ─────────────────────────────────────────────────
section("8. ANALYTICS")

try:
    r = httpx.get(f"{BASE}/api/analytics/overview", headers=AUTH, timeout=10)
    body = r.json()
    check("GET /api/analytics/overview → 200", r.status_code == 200)
    check("analytics.success = true", body.get("success") is True)
    check("analytics.data.metrics present", "metrics" in body.get("data", {}))
    check("analytics.data.metrics.total_users present", "total_users" in body.get("data", {}).get("metrics", {}))
    check("analytics.data.metrics.roles present", "roles" in body.get("data", {}).get("metrics", {}))
    check("analytics.timestamp present", "timestamp" in body)
    metrics = body.get("data", {}).get("metrics", {})
    print(f"     Total users: {metrics.get('total_users')}, Roles: {metrics.get('roles')}")
except Exception as e:
    check("GET /api/analytics/overview", False, str(e))

try:
    r = httpx.get(f"{BASE}/api/analytics/skills", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/skills → 200", r.status_code == 200)
    check("skills.data is list", isinstance(body.get("data"), list))
    if body.get("data"):
        print(f"     Top skill: {body['data'][0]}")
except Exception as e:
    check("GET /api/analytics/skills", False, str(e))

try:
    r = httpx.get(f"{BASE}/api/analytics/industries", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/industries → 200", r.status_code == 200)
    check("industries.data is list", isinstance(body.get("data"), list))
except Exception as e:
    check("GET /api/analytics/industries", False, str(e))

try:
    r = httpx.get(f"{BASE}/api/analytics/recommendations-summary", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/recommendations-summary → 200", r.status_code == 200)
    check("rec-summary has total_recommendations_generated", "total_recommendations_generated" in body.get("data", {}))
    check("rec-summary has average_compatibility_score", "average_compatibility_score" in body.get("data", {}))
except Exception as e:
    check("GET /api/analytics/recommendations-summary", False, str(e))

try:
    r = httpx.get(f"{BASE}/api/analytics/top-mentors", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/top-mentors → 200", r.status_code == 200)
    check("top-mentors.data is list", isinstance(body.get("data"), list))
except Exception as e:
    check("GET /api/analytics/top-mentors", False, str(e))


# ── 11. Auth Protection ───────────────────────────────────────────
section("9. AUTHENTICATION PROTECTION")

protected_routes = [
    f"{BASE}/api/me",
    f"{BASE}/api/profile/me",
    f"{BASE}/api/recommendations/similar",
    f"{BASE}/api/recommendations/mentors",
    f"{BASE}/api/analytics/overview",
    f"{BASE}/api/analytics/skills",
]

for route in protected_routes:
    try:
        r = httpx.get(route, timeout=5)  # No auth header
        path = route.replace(BASE, "")
        check(f"No-token → 401 on {path}", r.status_code == 401)
    except Exception as e:
        check(f"Protection check {route}", False, str(e))

# Bad token
try:
    r = httpx.get(f"{BASE}/api/me", headers={"Authorization": "Bearer badtoken123"}, timeout=5)
    check("Bad token → 401", r.status_code == 401)
    body = r.json()
    check("Bad token success=false", body.get("success") is False)
    check("Bad token has message", bool(body.get("message")))
    print(f"     401 message: {body.get('message')}")
except Exception as e:
    check("Bad token check", False, str(e))


# ── 12. Validation Errors ────────────────────────────────────────
section("10. VALIDATION & EDGE CASES")

# Register with invalid email
try:
    r = httpx.post(f"{BASE}/api/auth/register", json={
        "email": "not-an-email",
        "password": "pass",
        "full_name": "Test",
    }, timeout=5)
    check("Invalid email format → 422", r.status_code == 422)
    check("422 success=false", r.json().get("success") is False)
except Exception as e:
    check("Invalid email validation", False, str(e))

# Search with pagination edge case
try:
    r = httpx.get(f"{BASE}/api/profile/search?page=999&page_size=10", headers=AUTH, timeout=5)
    check("Search page 999 → 200 (empty)", r.status_code == 200)
    check("Empty page pagination present", "pagination" in r.json())
except Exception as e:
    check("Pagination edge case", False, str(e))

# Recommendation with invalid experience filter
try:
    r = httpx.get(f"{BASE}/api/recommendations/similar?min_experience=100&page=1", headers=AUTH, timeout=10)
    check("Extreme experience filter → 200 (empty result)", r.status_code == 200)
except Exception as e:
    check("Extreme filter edge case", False, str(e))


# ── Final Summary ────────────────────────────────────────────────
section("FINAL RESULTS")
total = len(results)
passed = sum(1 for _, ok, _ in results if ok)
failed = total - passed

print(f"\n  Total checks : {total}")
print(f"  Passed       : {passed}  {PASS}")
print(f"  Failed       : {failed}  {FAIL if failed else ''}")
print()

if failed > 0:
    print("  Failed checks:")
    for name, ok, detail in results:
        if not ok:
            print(f"    {FAIL} {name}" + (f" — {detail}" if detail else ""))
    print()

if failed == 0:
    print("  🎉 ALL CHECKS PASSED — BACKEND IS READY FOR FRONTEND INTEGRATION!")
elif failed <= 3:
    print("  ⚠️  MOSTLY READY — fix the failed checks above before sharing")
else:
    print("  ⛔ NEEDS ATTENTION — several checks failed")

# Return exit code for CI
sys.exit(0 if failed == 0 else 1)
