"""
Full backend integration test — runs against a live server on port 8765.
Tests all endpoints: auth, profile, recommendations, analytics, admin.
"""
import httpx
import json
import sys

BASE = "http://127.0.0.1:8765"
PASS_LIST = []
FAIL_LIST = []
TOKEN = ""
CANDIDATE_ID = ""


def chk(name, resp, expected_status=200, expect_success=True, show_extra=""):
    try:
        body = resp.json()
        ok = (resp.status_code == expected_status) and (body.get("success") == expect_success)
        ts = "timestamp" in body
        status_icon = "PASS" if ok else "FAIL"
        if ok:
            PASS_LIST.append(name)
        else:
            FAIL_LIST.append(name)
        extra = f"  {show_extra}" if show_extra else ""
        print(f"  {status_icon}  [{resp.status_code}]  {name}{extra}")
        if not ok:
            print(f"         ↳ body={json.dumps(body)[:200]}")
        return body
    except Exception as e:
        FAIL_LIST.append(name)
        print(f"  FAIL  {name}  exception={e}  raw={resp.text[:150]}")
        return {}


# ─── 1. HEALTH ────────────────────────────────────────────────────────────────
print("\n=== [1] HEALTH & ROOT ===")
r = httpx.get(f"{BASE}/health")
body = chk("GET /health", r)
print(f"       db={body.get('database')}  status={body.get('status')}  version={body.get('version')}")

r = httpx.get(f"{BASE}/")
chk("GET /", r)

# ─── 2. REGISTER ──────────────────────────────────────────────────────────────
print("\n=== [2] AUTH: REGISTER ===")
reg = {"email": "integtest@alumni.dev", "password": "Test1234!", "full_name": "Integration Tester"}
r = httpx.post(f"{BASE}/api/auth/register", json=reg)
if r.status_code == 201:
    chk("POST /api/auth/register (new)", r, expected_status=201)
elif r.status_code == 400 and "already" in r.json().get("message", ""):
    PASS_LIST.append("POST /api/auth/register (exists-ok)")
    print("  PASS  [400]  POST /api/auth/register  (user already exists — OK)")
else:
    chk("POST /api/auth/register", r, expected_status=201)

# ─── 3. LOGIN ─────────────────────────────────────────────────────────────────
print("\n=== [3] AUTH: LOGIN ===")
r = httpx.post(f"{BASE}/api/auth/login", json={"email": "integtest@alumni.dev", "password": "Test1234!"})
body = chk("POST /api/auth/login", r)
TOKEN = body.get("data", {}).get("access_token", "")
expires = body.get("data", {}).get("expires_at", "MISSING")
print(f"       token={TOKEN[:35]}...")
print(f"       expires_at={expires}")
if expires == "MISSING":
    FAIL_LIST.append("Login response missing expires_at")
    print("  FAIL  expires_at missing from login response!")

HDR = {"Authorization": f"Bearer {TOKEN}"}

# ─── 4. AUTH EDGE CASES ───────────────────────────────────────────────────────
print("\n=== [4] AUTH EDGE CASES ===")
r = httpx.post(f"{BASE}/api/auth/login", json={"email": "integtest@alumni.dev", "password": "wrongpass"})
body = chk("POST /api/auth/login (wrong password)", r, expected_status=401, expect_success=False)
print(f"       message: {body.get('message')}")

r = httpx.get(f"{BASE}/api/me")
chk("GET /api/me (no token → 401)", r, expected_status=401, expect_success=False)

r = httpx.get(f"{BASE}/api/me", headers={"Authorization": "Bearer fake.bad.token"})
body = chk("GET /api/me (invalid token → 401)", r, expected_status=401, expect_success=False)
print(f"       message: {body.get('message')}")

# ─── 5. USER ENDPOINTS ────────────────────────────────────────────────────────
print("\n=== [5] USER ENDPOINTS ===")
r = httpx.get(f"{BASE}/api/me", headers=HDR)
body = chk("GET /api/me", r)
user_data = body.get("data", {})
print(f"       user.email={user_data.get('user', {}).get('email')}")
print(f"       profile fields={list(user_data.get('profile', {}).keys())}")

r = httpx.get(f"{BASE}/api/version", headers=HDR)
body = chk("GET /api/version", r)
print(f"       version={body.get('data', {}).get('version')}  env={body.get('data', {}).get('environment')}")

# ─── 6. PROFILE CRUD ──────────────────────────────────────────────────────────
print("\n=== [6] PROFILE CRUD ===")
r = httpx.get(f"{BASE}/api/profile/me", headers=HDR)
chk("GET /api/profile/me", r)

profile_payload = {
    "full_name": "Integration Tester",
    "role": "Student",
    "skills": ["Python", "FastAPI", "MongoDB", "Machine Learning"],
    "interests": ["Backend Development", "AI Engineering", "Open Source"],
    "industry": "Software Development",
    "career_goals": "Building AI-powered networking tools",
    "bio": "Integration test user with realistic data",
    "graduation_year": 2026,
    "experience_years": 1
}
r = httpx.put(f"{BASE}/api/profile/me", json=profile_payload, headers=HDR)
body = chk("PUT /api/profile/me", r)

# ─── 7. PROFILE SEARCH ────────────────────────────────────────────────────────
print("\n=== [7] PROFILE SEARCH & FILTER ===")
r = httpx.get(f"{BASE}/api/profile/search?page=1&page_size=5", headers=HDR)
body = chk("GET /api/profile/search (page 1)", r)
pg = body.get("pagination", {})
print(f"       total={pg.get('total')}  total_pages={pg.get('total_pages')}  returned={len(body.get('data', []))}")

r = httpx.get(f"{BASE}/api/profile/search?role=Mentor&page=1&page_size=10", headers=HDR)
body = chk("GET /api/profile/search?role=Mentor", r)
mentors_found = body.get("pagination", {}).get("total", 0)
print(f"       mentors found={mentors_found}")

r = httpx.get(f"{BASE}/api/profile/search?industry=Software+Development", headers=HDR)
body = chk("GET /api/profile/search?industry=Software+Development", r)
print(f"       software dev profiles={body.get('pagination', {}).get('total', 0)}")

# Get a user ID for later tests
all_profiles = httpx.get(f"{BASE}/api/profile/search?page=1&page_size=3", headers=HDR)
profiles_data = all_profiles.json().get("data", [])
if profiles_data:
    CANDIDATE_ID = profiles_data[0].get("user_id", "") or profiles_data[0].get("_id", "")

# ─── 8. RECOMMENDATIONS ────────────────────────────────────────────────────────
print("\n=== [8] AI RECOMMENDATIONS ===")
r = httpx.get(f"{BASE}/api/recommendations/similar?page=1&page_size=5", headers=HDR, timeout=30)
body = chk("GET /api/recommendations/similar", r)
pg = body.get("pagination", {})
items = body.get("data", [])
print(f"       total={pg.get('total')}  returned={len(items)}")
if items:
    top = items[0]
    print(f"       top match: score={top.get('compatibility_score')}  label={top.get('label')}")
    print(f"       match_reason: {top.get('match_reason', '')[:80]}")
    print(f"       score_breakdown: {top.get('score_breakdown')}")
    print(f"       skill_overlap: {top.get('skill_overlap', [])[:4]}")

print()
r = httpx.get(f"{BASE}/api/recommendations/similar?industry=Software+Development&sort_by=score&page=1&page_size=3", headers=HDR, timeout=30)
body = chk("GET /api/recommendations/similar?industry=Software Development&sort_by=score", r)
print(f"       filtered total={body.get('pagination', {}).get('total')}")

print()
r = httpx.get(f"{BASE}/api/recommendations/similar?role=NonExistent", headers=HDR, timeout=30)
body = chk("GET /api/recommendations/similar?role=NonExistent (empty result)", r)
print(f"       empty message: {body.get('message')}")

print()
r = httpx.get(f"{BASE}/api/recommendations/mentors?page=1&page_size=5", headers=HDR, timeout=30)
body = chk("GET /api/recommendations/mentors", r)
pg = body.get("pagination", {})
items = body.get("data", [])
print(f"       total={pg.get('total')}  returned={len(items)}")
if items:
    print(f"       top mentor: {items[0].get('profile', {}).get('full_name')}  score={items[0].get('compatibility_score')}")

print()
r = httpx.get(f"{BASE}/api/recommendations/mentors?min_experience=8", headers=HDR, timeout=30)
body = chk("GET /api/recommendations/mentors?min_experience=8", r)
print(f"       senior mentors (8+ yrs): {body.get('pagination', {}).get('total')}")

print()
r = httpx.get(f"{BASE}/api/recommendations/collaborate/000000000000000000000000", headers=HDR, timeout=15)
chk("GET /api/recommendations/collaborate/invalid-id (404)", r, expected_status=404, expect_success=False)

r = httpx.get(f"{BASE}/api/recommendations/collaborate/notahexid", headers=HDR, timeout=15)
chk("GET /api/recommendations/collaborate/notahexid (400)", r, expected_status=400, expect_success=False)

# ─── 9. ANALYTICS ──────────────────────────────────────────────────────────────
print("\n=== [9] ANALYTICS ===")
r = httpx.get(f"{BASE}/api/analytics/overview", headers=HDR)
body = chk("GET /api/analytics/overview", r)
metrics = body.get("data", {}).get("metrics", {})
print(f"       total_users={metrics.get('total_users')}  roles={metrics.get('roles')}")
print(f"       recommendations_generated={metrics.get('recommendations_generated')}")

r = httpx.get(f"{BASE}/api/analytics/skills", headers=HDR)
body = chk("GET /api/analytics/skills", r)
skills = body.get("data", [])
if skills:
    print(f"       top skill: {skills[0].get('skill')} x{skills[0].get('count')}")

r = httpx.get(f"{BASE}/api/analytics/industries", headers=HDR)
body = chk("GET /api/analytics/industries", r)
inds = body.get("data", [])
if inds:
    print(f"       top industry: {inds[0].get('industry')} x{inds[0].get('count')}")

r = httpx.get(f"{BASE}/api/analytics/recommendations-summary", headers=HDR)
body = chk("GET /api/analytics/recommendations-summary", r)
print(f"       rec summary: {body.get('data')}")

r = httpx.get(f"{BASE}/api/analytics/top-mentors", headers=HDR)
body = chk("GET /api/analytics/top-mentors", r)
print(f"       top mentors data items: {len(body.get('data', []))}")

# ─── 10. ADMIN ─────────────────────────────────────────────────────────────────
print("\n=== [10] ADMIN ENDPOINT ===")
r = httpx.post(f"{BASE}/api/admin/seed", headers={"X-Admin-Key": "wrong-key"})
chk("POST /api/admin/seed (wrong key → 403)", r, expected_status=403, expect_success=False)

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
print()
print("=" * 60)
total = len(PASS_LIST) + len(FAIL_LIST)
print(f"RESULTS:  {len(PASS_LIST)} PASSED  /  {len(FAIL_LIST)} FAILED  /  {total} TOTAL")
print("=" * 60)
if FAIL_LIST:
    print("\nFAILED TESTS:")
    for f in FAIL_LIST:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("\nALL TESTS PASSED ✓")
