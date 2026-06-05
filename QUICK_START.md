# Quick Start Guide - 5 Minutes to Demo

## Prerequisites (Install These First)
- [ ] Python 3.9+ → `python --version`
- [ ] Node.js 16+ → `node --version`
- [ ] MongoDB 6.0+ → Download from https://www.mongodb.com/try/download/community

---

## Step 1: Start MongoDB (1 minute)

**Windows**:
```bash
# Option A: Start MongoDB service (if installed as service)
net start MongoDB

# Option B: Start MongoDB manually
mongod --dbpath C:\data\db
```

**Verify MongoDB is running**:
```bash
mongosh
# If connection succeeds, MongoDB is running. Type 'exit' to quit.
```

---

## Step 2: Start Backend Server (1 minute)

**Double-click**: `START_BACKEND.bat`

OR run manually:
```bash
cd "smart networking engine for alumini collaboration\backend"
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend is running**:
- Open browser to `http://localhost:8000`
- You should see: `{"success": true, "message": "Welcome to the Smart Networking Engine API"}`
- API docs: `http://localhost:8000/docs`

---

## Step 3: Seed Database with Demo Data (30 seconds)

**Double-click**: `SEED_DATABASE.bat`

OR run manually:
```bash
curl -X POST "http://localhost:8000/api/admin/seed" ^
  -H "X-Admin-Key: 4eb81b2aef58ef8a9a2c351bbdf794ff8a38b556b68b7ea84ef9b4bc0fae6bc4" ^
  -H "Content-Type: application/json"
```

**Expected output**:
```json
{
  "success": true,
  "message": "Database seeded successfully with 20 demo profiles"
}
```

---

## Step 4: Start Frontend Server (1 minute)

**Double-click**: `START_FRONTEND.bat`

OR run manually:
```bash
npm install
npm run dev
```

**Verify frontend is running**:
- Open browser to `http://localhost:5173`
- You should see the landing page

---

## Step 5: Test the Application (2 minutes)

### Option A: Register New User
1. Go to `http://localhost:5173`
2. Click "Create account"
3. Fill the 5-step form:
   - Name: `Demo User`
   - Email: `demo@example.com`
   - Password: `password123`
   - Select Industry, Role, University, Skills, etc.
4. Click "Create Account"
5. You'll be logged in automatically

### Option B: Use Existing Demo Data
Since database is seeded, you can browse profiles immediately after logging in with any newly registered account.

---

## Quick Demo Checklist

After logging in, test these features:

1. **Dashboard** → View stats and metrics
2. **Profile** → View your profile, click Edit Profile
3. **Recommendations** → See AI-matched profiles with scores
4. **Mentors** → View mentor recommendations
5. **My Network** → Send connection requests
6. **Notifications** → View notifications
7. **Collaboration** → Browse projects
8. **Analytics** → View charts and stats

---

## Troubleshooting

### MongoDB won't start
```bash
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

### Backend errors
```bash
# Check Python version
python --version  # Should be 3.9 or higher

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "No data" in application
```bash
# Re-run seed script
SEED_DATABASE.bat
```

### CORS errors
Check backend `.env` file has:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Ports Used

| Service  | Port | URL |
|----------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend  | 8000 | http://localhost:8000 |
| MongoDB  | 27017 | mongodb://localhost:27017 |

---

## Next Steps

- Read `INTEGRATION_SETUP.md` for detailed setup
- Read `TESTING_GUIDE.md` for testing procedures
- Read `COMPLETE_INTEGRATION_REPORT.md` for technical details

---

## Quick Commands

```bash
# Check if MongoDB is running
mongosh

# Check if backend is running
curl http://localhost:8000/health

# Check if frontend is running
curl http://localhost:5173

# View MongoDB data
mongosh
use alumni_network
db.users.count()
db.profiles.count()
```

---

## Demo Credentials (After Registration)

Use any email/password you registered with. The system doesn't have preset credentials - you create your own account during registration.

---

**You're Ready to Demo!** 🎉

Open `http://localhost:5173` and start exploring the Smart Networking Engine.
