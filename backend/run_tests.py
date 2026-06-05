"""
Full integration test runner with embedded server management.
Starts the FastAPI server, waits for it, seeds DB, runs all tests, then shuts down.

Usage (from project root):
    python backend/run_tests.py
"""
import sys
import os
import json
import time
import subprocess
import signal

# ── Add backend to path ──────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

PORT = 8999
BASE = f"http://127.0.0.1:{PORT}"
PYTHON = sys.executable

PASS = "✅"
FAIL = "❌"

results = []
server_proc = None


def check(name, condition, detail=""):
    results.append((name, condition, detail))
    icon = PASS if condition else FAIL
    msg = f"  {icon}  {name}"
    if detail:
        msg += f" — {detail}"
    print(msg)
    return condition


def section(title):
    print(f"\n{'='*65}")
    print(f"  {title}")
    print(f"{'='*65}")


def start_server():
    global server_proc
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(project_root, "backend")
    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir

    cmd = [
        PYTHON, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1",
        "--port", str(PORT),
        "--app-dir", backend_dir,
        "--log-level", "warning",
    ]
    server_proc = subprocess.Popen(
        cmd,
        cwd=project_root,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(f"  Server PID: {server_proc.pid}")


def wait_for_server(timeout=20):
    import httpx
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = httpx.get(f"{BASE}/health", timeout=2)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(1)
    return False


def stop_server():
    if server_proc:
        server_proc.terminate()
        try:
            server_proc.wait(timeout=5)
        except Exception:
            server_proc.kill()


def seed_database():
    """Seed demo data via the seed script."""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(project_root, "backend")
    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir
    result = subprocess.run(
        [PYTHON, "app/utils/seed_data.py"],
        cwd=backend_dir,
        env=env,
        capture_output=True,
        text=True,
        timeout=60,
    )
    return result.returncode == 0, result.stdout + result.stderr


# ════════════════════════════════════════════════════════════════
print("\n" + "="*65)
print("  SMART NETWORKING ENGINE — FULL BACKEND INTEGRATION TEST")
print("="*65)

# ── Start server ─────────────────────────────────────────────────
print("\n📦 Starting test server...")
start_server()

print("⏳ Waiting for server to be ready...", end="", flush=True)
if not wait_for_server(timeout=25):
    print("\n⛔ Server did not start in time.")
    print("  Make sure MongoDB is running: mongod")
    stop_server()
    sys.exit(1)
print(" READY\n")

# ── Seed database ────────────────────────────────────────────────
print("🌱 Seeding demo database (20 profiles)...")
ok, seed_out = seed_database()
if ok:
    print("  Seed OK — 20 profiles inserted\n")
else:
    print(f"  Seed warning: {seed_out[:200]}")

# ── Now run tests ─────────────────────────────────────────────────
import httpx

try:
    # ── HEALTH ───────────────────────────────────────────────────
    section("1. HEALTH & VERSION ENDPOINTS")

    r = httpx.get(f"{BASE}/health", timeout=10)
    body = r.json()
    check("GET /health → 200", r.status_code == 200)
    check("health.status present", "status" in body)
    check("health.database present", "database" in body)
    check("health.version present", "version" in body)
    print(f"     DB: {body.get('database')}, Env: {body.get('environment')}, Ver: {body.get('version')}")

    r = httpx.get(f"{BASE}/", timeout=5)
    check("GET / (root) → 200", r.status_code == 200)

    r = httpx.get(f"{BASE}/api/version", timeout=5)
    body = r.json()
    check("GET /api/version → 200", r.status_code == 200)
    check("version.success = true", body.get("success") is True)
    check("version.timestamp present", "timestamp" in body)

    # ── REGISTER ─────────────────────────────────────────────────
    section("2. REGISTRATION & LOGIN")

    EMAIL = f"testuser_{int(time.time())}@test.dev"
    PASSWORD = "TestPass123!"
    FULL_NAME = "Integration Test User"

    r = httpx.post(f"{BASE}/api/auth/register", json={
        "email": EMAIL, "password": PASSWORD, "full_name": FULL_NAME,
    }, timeout=10)
    body = r.json()
    check("POST /api/auth/register → 201", r.status_code == 201)
    check("register.success = true", body.get("success") is True)
    check("register.timestamp present", "timestamp" in body)
    check("register.data.email correct", body.get("data", {}).get("email") == EMAIL)

    # Duplicate registration → 400
    r2 = httpx.post(f"{BASE}/api/auth/register", json={
        "email": EMAIL, "password": PASSWORD, "full_name": FULL_NAME,
    }, timeout=5)
    check("Duplicate register → 400", r2.status_code == 400)
    check("Duplicate register success=false", r2.json().get("success") is False)

    # Invalid email → 422
    r3 = httpx.post(f"{BASE}/api/auth/register", json={
        "email": "not-valid", "password": "pw", "full_name": "X",
    }, timeout=5)
    check("Invalid email format → 422", r3.status_code == 422)
    check("422 response success=false", r3.json().get("success") is False)

    # ── LOGIN ─────────────────────────────────────────────────────
    r = httpx.post(f"{BASE}/api/auth/login", json={
        "email": EMAIL, "password": PASSWORD,
    }, timeout=10)
    body = r.json()
    check("POST /api/auth/login → 200", r.status_code == 200)
    check("login.success = true", body.get("success") is True)
    check("login.data.access_token present", "access_token" in body.get("data", {}))
    check("login.data.expires_at present", "expires_at" in body.get("data", {}))
    check("login.data.token_type = bearer", body.get("data", {}).get("token_type") == "bearer")
    check("login.data.user.email correct", body.get("data", {}).get("user", {}).get("email") == EMAIL)
    check("login.timestamp present", "timestamp" in body)
    TOKEN = body["data"]["access_token"]
    EXPIRES_AT = body["data"].get("expires_at", "")
    print(f"     Token: {TOKEN[:25]}... | Expires: {EXPIRES_AT}")

    # Wrong password → 401
    r_bad = httpx.post(f"{BASE}/api/auth/login", json={
        "email": EMAIL, "password": "wrongpassword",
    }, timeout=5)
    check("Wrong password → 401", r_bad.status_code == 401)
    check("Wrong password success=false", r_bad.json().get("success") is False)

    AUTH = {"Authorization": f"Bearer {TOKEN}"}

    # ── CURRENT USER ─────────────────────────────────────────────
    section("3. CURRENT USER (GET /api/me)")

    r = httpx.get(f"{BASE}/api/me", headers=AUTH, timeout=10)
    body = r.json()
    check("GET /api/me → 200", r.status_code == 200)
    check("me.success = true", body.get("success") is True)
    check("me.data.user present", "user" in body.get("data", {}))
    check("me.data.profile present", "profile" in body.get("data", {}))
    check("me.data.user.email correct", body.get("data", {}).get("user", {}).get("email") == EMAIL)
    check("me.timestamp present", "timestamp" in body)

    # ── PROFILE UPDATE ────────────────────────────────────────────
    section("4. PROFILE MANAGEMENT")

    r = httpx.put(f"{BASE}/api/profile/me", headers=AUTH, json={
        "full_name": FULL_NAME,
        "role": "Alumni",
        "bio": "Backend developer with Python and FastAPI skills",
        "skills": ["Python", "FastAPI", "MongoDB", "Docker", "Machine Learning"],
        "interests": ["Backend Development", "AI Engineering", "Open Source"],
        "industry": "Software Development",
        "career_goals": "Build scalable AI-powered APIs and mentor junior developers",
        "graduation_year": 2022,
        "experience_years": 3,
    }, timeout=10)
    body = r.json()
    check("PUT /api/profile/me → 200", r.status_code == 200)
    check("profile.success = true", body.get("success") is True)
    check("profile.data.skills updated", "Python" in body.get("data", {}).get("skills", []))
    check("profile.data.role = Alumni", body.get("data", {}).get("role") == "Alumni")
    check("profile.data.experience_years present", "experience_years" in body.get("data", {}))
    check("profile.timestamp present", "timestamp" in body)

    # Get own profile
    r = httpx.get(f"{BASE}/api/profile/me", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/profile/me → 200", r.status_code == 200)
    check("profile.data.industry = Software Development",
          body.get("data", {}).get("industry") == "Software Development")

    # Profile search (paginated)
    r = httpx.get(f"{BASE}/api/profile/search?page=1&page_size=5", headers=AUTH, timeout=10)
    body = r.json()
    check("GET /api/profile/search → 200", r.status_code == 200)
    check("search.success = true", body.get("success") is True)
    check("search.pagination present", "pagination" in body)
    check("search.pagination.total_pages ≥ 1", body.get("pagination", {}).get("total_pages", 0) >= 1)
    check("search.timestamp present", "timestamp" in body)
    total_profiles = body.get("pagination", {}).get("total", 0)
    print(f"     {total_profiles} profiles found in network")

    # Search with filter
    r = httpx.get(f"{BASE}/api/profile/search?skills=Python&role=Alumni&page=1", headers=AUTH, timeout=5)
    check("Profile search ?skills=Python&role=Alumni → 200", r.status_code == 200)
    check("Filtered search success=true", r.json().get("success") is True)

    # Search page out of bounds
    r = httpx.get(f"{BASE}/api/profile/search?page=999&page_size=10", headers=AUTH, timeout=5)
    check("Search page 999 → 200 (empty gracefully)", r.status_code == 200)

    # ── AI RECOMMENDATIONS ────────────────────────────────────────
    section("5. AI RECOMMENDATIONS (TF-IDF + Cosine Similarity)")

    r = httpx.get(f"{BASE}/api/recommendations/similar?page=1&page_size=5", headers=AUTH, timeout=30)
    body = r.json()
    check("GET /api/recommendations/similar → 200", r.status_code == 200)
    check("recs.success = true", body.get("success") is True)
    check("recs.pagination present", "pagination" in body)
    check("recs.timestamp present", "timestamp" in body)
    items = body.get("data", [])
    if items:
        first = items[0]
        check("Rec item has compatibility_score (float)", isinstance(first.get("compatibility_score"), (int, float)))
        check("Rec item has label (string)", isinstance(first.get("label"), str))
        check("Rec item label is valid", first.get("label") in ["Excellent Match", "Strong Match", "Good Match", "Moderate Match"])
        check("Rec item has match_reason", bool(first.get("match_reason")))
        check("Rec item has score_breakdown (dict)", isinstance(first.get("score_breakdown"), dict))
        check("score_breakdown has tfidf_similarity", "tfidf_similarity" in first.get("score_breakdown", {}))
        check("score_breakdown has skill_overlap_score", "skill_overlap_score" in first.get("score_breakdown", {}))
        check("Rec item has skill_overlap (list)", isinstance(first.get("skill_overlap"), list))
        check("Rec item has interest_overlap (list)", isinstance(first.get("interest_overlap"), list))
        check("Rec item has profile (dict)", isinstance(first.get("profile"), dict))
        score = first.get("compatibility_score", 0)
        label = first.get("label", "")
        reason = first.get("match_reason", "")
        print(f"     Top match: {label} ({score}%)")
        print(f"     Reason: {reason[:80]}")
    else:
        print(f"     No recs yet — message: {body.get('message')}")

    # With filters
    r = httpx.get(
        f"{BASE}/api/recommendations/similar?industry=Software+Development&sort_by=score&page=1&page_size=3",
        headers=AUTH, timeout=30
    )
    check("Recs with industry+sort filter → 200", r.status_code == 200)

    # With extreme filter (should return empty gracefully)
    r = httpx.get(f"{BASE}/api/recommendations/similar?min_experience=999&page=1", headers=AUTH, timeout=10)
    body = r.json()
    check("Recs extreme filter → 200 (empty gracefully)", r.status_code == 200)
    check("Empty recs success=true", body.get("success") is True)
    check("Empty recs message present", bool(body.get("message")))

    # ── MENTOR MATCHING ───────────────────────────────────────────
    section("6. MENTOR MATCHING")

    r = httpx.get(f"{BASE}/api/recommendations/mentors?page=1&page_size=5", headers=AUTH, timeout=30)
    body = r.json()
    check("GET /api/recommendations/mentors → 200", r.status_code == 200)
    check("mentors.success = true", body.get("success") is True)
    check("mentors.pagination present", "pagination" in body)
    items = body.get("data", [])
    if items:
        first = items[0]
        check("Mentor item has compatibility_score", "compatibility_score" in first)
        check("Mentor item has label", "label" in first)
        check("Mentor item has match_reason", "match_reason" in first)
        check("Mentor profile.role = Mentor", first.get("profile", {}).get("role") == "Mentor")
        print(f"     Top mentor: {first.get('profile',{}).get('full_name')} — {first.get('compatibility_score')}%")
    else:
        print(f"     No mentors found — message: {body.get('message')}")

    # With experience filter
    r = httpx.get(f"{BASE}/api/recommendations/mentors?min_experience=5&page=1", headers=AUTH, timeout=30)
    check("Mentors ?min_experience=5 → 200", r.status_code == 200)

    # ── COLLABORATION PREDICTION ──────────────────────────────────
    section("7. COLLABORATION PREDICTION")

    # Invalid ID format → 400
    r = httpx.get(f"{BASE}/api/recommendations/collaborate/not-valid-id", headers=AUTH, timeout=5)
    check("Collaborate invalid ID → 400", r.status_code == 400)
    check("Invalid ID success=false", r.json().get("success") is False)
    check("Invalid ID has message", bool(r.json().get("message")))

    # Valid hex but non-existent user → 404
    r = httpx.get(f"{BASE}/api/recommendations/collaborate/507f1f77bcf86cd799439011", headers=AUTH, timeout=5)
    check("Collaborate non-existent ID → 404", r.status_code == 404)
    check("404 success=false", r.json().get("success") is False)

    # ── ANALYTICS ────────────────────────────────────────────────
    section("8. ANALYTICS & DASHBOARD")

    r = httpx.get(f"{BASE}/api/analytics/overview", headers=AUTH, timeout=10)
    body = r.json()
    check("GET /api/analytics/overview → 200", r.status_code == 200)
    check("overview.success = true", body.get("success") is True)
    check("overview.data.metrics present", "metrics" in body.get("data", {}))
    m = body.get("data", {}).get("metrics", {})
    check("metrics.total_users > 0", m.get("total_users", 0) > 0)
    check("metrics.roles.mentors present", "mentors" in m.get("roles", {}))
    check("metrics.roles.alumni present", "alumni" in m.get("roles", {}))
    check("metrics.roles.students present", "students" in m.get("roles", {}))
    check("overview.timestamp present", "timestamp" in body)
    print(f"     Users: {m.get('total_users')} | Roles: {m.get('roles')}")

    r = httpx.get(f"{BASE}/api/analytics/skills", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/skills → 200", r.status_code == 200)
    check("skills.data is list", isinstance(body.get("data"), list))
    if body.get("data"):
        top = body["data"][0]
        check("skills item has skill+count", "skill" in top and "count" in top)
        print(f"     Top skill: {top.get('skill')} ({top.get('count')} users)")

    r = httpx.get(f"{BASE}/api/analytics/industries", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/industries → 200", r.status_code == 200)
    check("industries.data is list", isinstance(body.get("data"), list))
    if body.get("data"):
        top_ind = body["data"][0]
        print(f"     Top industry: {top_ind.get('industry')} ({top_ind.get('count')} users)")

    r = httpx.get(f"{BASE}/api/analytics/recommendations-summary", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/recommendations-summary → 200", r.status_code == 200)
    check("rec-summary.success = true", body.get("success") is True)
    d = body.get("data", {})
    check("rec-summary has total_recommendations_generated", "total_recommendations_generated" in d)
    check("rec-summary has unique_users_with_recommendations", "unique_users_with_recommendations" in d)
    check("rec-summary has average_compatibility_score", "average_compatibility_score" in d)

    r = httpx.get(f"{BASE}/api/analytics/top-mentors", headers=AUTH, timeout=5)
    body = r.json()
    check("GET /api/analytics/top-mentors → 200", r.status_code == 200)
    check("top-mentors.data is list", isinstance(body.get("data"), list))

    # ── AUTH PROTECTION ───────────────────────────────────────────
    section("9. AUTH PROTECTION (401 checks)")

    protected = [
        ("/api/me", "GET"),
        ("/api/profile/me", "GET"),
        ("/api/recommendations/similar", "GET"),
        ("/api/recommendations/mentors", "GET"),
        ("/api/analytics/overview", "GET"),
        ("/api/analytics/skills", "GET"),
        ("/api/analytics/industries", "GET"),
        ("/api/analytics/recommendations-summary", "GET"),
    ]
    for path, method in protected:
        r = httpx.get(f"{BASE}{path}", timeout=5)  # no auth
        check(f"No-auth {path} → 401", r.status_code == 401, "")

    # Bad token
    r = httpx.get(f"{BASE}/api/me", headers={"Authorization": "Bearer fake.token.here"}, timeout=5)
    body = r.json()
    check("Bad token → 401", r.status_code == 401)
    check("Bad token success=false", body.get("success") is False)
    check("Bad token has message", bool(body.get("message")))
    print(f"     401 message: '{body.get('message')}'")


except Exception as e:
    import traceback
    print(f"\n⛔ Unexpected error during testing: {e}")
    traceback.print_exc()
finally:
    stop_server()

# ── FINAL SUMMARY ────────────────────────────────────────────────
section("FINAL SUMMARY")
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
            print(f"    {FAIL}  {name}" + (f" ({detail})" if detail else ""))
    print()

if failed == 0:
    print("  🎉  ALL CHECKS PASSED!")
    print("  🚀  Backend is READY for frontend integration!")
elif failed <= 3:
    print("  ⚠️   Mostly ready — fix the failed items above before sharing.")
else:
    print("  ⛔  Multiple failures — review the errors above.")

print()
sys.exit(0 if failed == 0 else 1)
