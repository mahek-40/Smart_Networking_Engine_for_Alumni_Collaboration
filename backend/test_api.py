import subprocess
import time
import sys
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    # Initialize httpx client
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Test Home & Health
        print("\n--- Testing Health Check Endpoints ---")
        res = client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "success"
        print("GET / -> Success")

        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        print("GET /health -> Success")

        # 2. Test Register
        print("\n--- Testing Registration API ---")
        register_payload = {
            "email": "test.user@example.com",
            "password": "testpassword123",
            "full_name": "Testy McTestface"
        }
        
        # Register test user
        res = client.post("/api/auth/register", json=register_payload)
        # Note: If already exists from previous failed run, it might be 400, which is fine, but since we seeded, it's clean.
        assert res.status_code in [201, 400], f"Registration failed: {res.text}"
        if res.status_code == 201:
            assert res.json()["status"] == "success"
            print("POST /api/auth/register -> Success")
        else:
            print("POST /api/auth/register -> Success (Already registered)")

        # Try duplicate registration
        res = client.post("/api/auth/register", json=register_payload)
        assert res.status_code == 400
        print("POST /api/auth/register (Duplicate) -> Successfully Rejected (400)")

        # 3. Test Login
        print("\n--- Testing Login & JWT API ---")
        login_payload = {
            "email": "test.user@example.com",
            "password": "testpassword123"
        }
        res = client.post("/api/auth/login", json=login_payload)
        assert res.status_code == 200
        res_data = res.json()["data"]
        token = res_data["access_token"]
        assert res_data["token_type"] == "bearer"
        print("POST /api/auth/login -> Success (JWT Received)")

        headers = {"Authorization": f"Bearer {token}"}

        # 4. Test Get My Profile
        print("\n--- Testing Profile Retrieval ---")
        res = client.get("/api/profile/me", headers=headers)
        assert res.status_code == 200
        profile_data = res.json()["data"]
        assert profile_data["email"] == "test.user@example.com"
        print("GET /api/profile/me -> Success")

        # 5. Test Update Profile
        print("\n--- Testing Profile Modification ---")
        update_payload = {
            "role": "Student",
            "skills": ["Python", "FastAPI", "React", "Machine Learning"],
            "interests": ["Backend Development", "AI Engineering", "Web Development"],
            "industry": "Software Development",
            "career_goals": "Seeking backend internships and mentoring.",
            "bio": "CS junior building AI apps.",
            "graduation_year": 2027,
            "experience_years": 1
        }
        res = client.put("/api/profile/me", headers=headers, json=update_payload)
        assert res.status_code == 200
        updated_profile = res.json()["data"]
        assert updated_profile["role"] == "Student"
        assert "FastAPI" in updated_profile["skills"]
        print("PUT /api/profile/me -> Success")

        # 6. Test Search Profiles
        print("\n--- Testing Profile Search and Filtering ---")
        res = client.get("/api/profile/search?skills=Docker,AWS", headers=headers)
        assert res.status_code == 200
        search_results = res.json()["data"]
        assert len(search_results) > 0
        print(f"GET /api/profile/search?skills=Docker,AWS -> Found {len(search_results)} matching profiles")

        # 7. Test AI Connection Recommendations (Day 4 / Day 5)
        print("\n--- Testing AI Alumni Recommendations ---")
        res = client.get("/api/recommendations/similar?limit=3", headers=headers)
        assert res.status_code == 200
        recs = res.json()["data"]
        assert len(recs) > 0
        print("GET /api/recommendations/similar -> Success")
        print("Top matched profile:")
        print(f" - Name: {recs[0]['profile']['full_name']}")
        print(f" - Compatibility: {recs[0]['compatibility_score']}%")
        print(f" - Reason: {recs[0]['match_reason']}")

        # Save target ID for pairwise prediction
        target_id = recs[0]["profile"]["user_id"]

        # 8. Test Mentor Matching
        print("\n--- Testing Mentor Matching ---")
        res = client.get("/api/recommendations/mentors?limit=3", headers=headers)
        assert res.status_code == 200
        mentors = res.json()["data"]
        assert len(mentors) > 0
        assert mentors[0]["profile"]["role"] == "Mentor"
        print("GET /api/recommendations/mentors -> Success")
        print("Top matched mentor:")
        print(f" - Name: {mentors[0]['profile']['full_name']}")
        print(f" - Compatibility: {mentors[0]['compatibility_score']}%")
        print(f" - Reason: {mentors[0]['match_reason']}")

        # 9. Test Pairwise Collaboration Prediction
        print("\n--- Testing Collaboration Prediction API ---")
        res = client.get(f"/api/recommendations/collaborate/{target_id}", headers=headers)
        assert res.status_code == 200
        pred = res.json()["data"]
        assert "compatibility_score" in pred
        assert "match_reason" in pred
        print(f"GET /api/recommendations/collaborate/{target_id} -> Success")
        print(f" - Collaboration compatibility: {pred['compatibility_score']}%")
        print(f" - Reason: {pred['match_reason']}")

        # 10. Test Analytics Dashboard (Day 7)
        print("\n--- Testing Analytics & Dashboard ---")
        res = client.get("/api/analytics/overview", headers=headers)
        assert res.status_code == 200
        metrics = res.json()["data"]["metrics"]
        assert metrics["total_users"] > 0
        assert metrics["roles"]["mentors"] > 0
        print("GET /api/analytics/overview -> Success")

        res = client.get("/api/analytics/skills", headers=headers)
        assert res.status_code == 200
        skills_data = res.json()["data"]
        assert len(skills_data) > 0
        print(f"GET /api/analytics/skills -> Success. Top skill: {skills_data[0]['skill']} (count: {skills_data[0]['count']})")

        res = client.get("/api/analytics/industries", headers=headers)
        assert res.status_code == 200
        industries_data = res.json()["data"]
        assert len(industries_data) > 0
        print(f"GET /api/analytics/industries -> Success. Top industry: {industries_data[0]['industry']} (count: {industries_data[0]['count']})")

        print("\n==============================================")
        print("ALL API AND AI ENGINE TESTS COMPLETED SUCCESSFULLY!")
        print("==============================================")

def main():
    # 1. Seed database by calling seed_data script
    print("Seeding database...")
    subprocess.run(["../.venv/Scripts/python", "app/utils/seed_data.py"], check=True)
    
    # 2. Start Uvicorn server in the background
    print("Starting Uvicorn server...")
    uvicorn_process = subprocess.Popen(
        ["../.venv/Scripts/python", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    
    # Give server time to startup
    time.sleep(4)
    
    try:
        # Check if process is still running
        if uvicorn_process.poll() is not None:
            print("Failed to start Uvicorn server. Process exited immediately.")
            sys.exit(1)
            
        run_tests()
    finally:
        print("Stopping Uvicorn server...")
        uvicorn_process.terminate()
        try:
            uvicorn_process.wait(timeout=5)
            print("Uvicorn server stopped.")
        except subprocess.TimeoutExpired:
            uvicorn_process.kill()
            print("Uvicorn server killed.")

if __name__ == "__main__":
    main()
