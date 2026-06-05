# Testing Guide - Smart Networking Engine

## Prerequisites Checklist

Before testing, ensure:
- [ ] MongoDB is running on `localhost:27017`
- [ ] Backend server is running on `http://localhost:8000`
- [ ] Frontend server is running on `http://localhost:5173`
- [ ] Database has been seeded with demo data (run `SEED_DATABASE.bat`)

---

## Test Flow 1: Complete User Registration

### Steps:
1. Open browser to `http://localhost:5173`
2. Click "Create account" button
3. **Step 1 - Basic Info**:
   - Enter Name: `Test User`
   - Enter Email: `test@example.com`
   - Enter Password: `password123`
   - Click "Next Step"
4. **Step 2 - Professional**:
   - Select Industry: `Technology`
   - Enter Role: `Software Engineer`
   - Enter Company: `Test Company`
   - Select Experience: `1-3 years`
   - Click "Next Step"
5. **Step 3 - Education**:
   - Enter University: `Test University`
   - Select Degree: `B.Tech`
   - Enter Branch: `Computer Science`
   - Select Graduation Year: `2023`
   - Click "Next Step"
6. **Step 4 - Skills**:
   - Select at least 3 skills (e.g., React, Python, FastAPI)
   - Select at least 2 interests (e.g., AI/ML, Startup Ecosystem)
   - Click "Next Step"
7. **Step 5 - Goals**:
   - Enter Bio: `A passionate software engineer...`
   - Enter Career Goals: `Looking to build innovative products...`
   - Review profile summary
   - Click "Create Account"

### Expected Results:
- [ ] Registration completes successfully
- [ ] Redirected to `/dashboard`
- [ ] User is logged in (token stored in localStorage)
- [ ] Profile data persists in MongoDB

---

## Test Flow 2: Login & Session Persistence

### Steps:
1. If logged in, click "Logout" in sidebar
2. Navigate to `http://localhost:5173/login`
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Click "Sign In"
6. After successful login, refresh the page (F5)
7. Close browser tab and reopen to `http://localhost:5173`

### Expected Results:
- [ ] Login succeeds and redirects to dashboard
- [ ] User stays logged in after page refresh
- [ ] User stays logged in after reopening browser
- [ ] Profile data loads correctly
- [ ] JWT token is in localStorage (key: `sne_token`)

---

## Test Flow 3: Profile Management

### Steps:
1. Log in as a registered user
2. Click "Profile" in sidebar
3. Click "Edit Profile" button
4. Update Bio field
5. Update Career Goals field
6. Update University field
7. Update Branch field
8. Click "Save Changes"
9. Refresh the page

### Expected Results:
- [ ] Edit modal opens
- [ ] All fields pre-populated with existing data
- [ ] Changes save successfully
- [ ] Modal closes
- [ ] Updated data displays on profile page
- [ ] Changes persist after page refresh
- [ ] Data updated in MongoDB

---

## Test Flow 4: AI Recommendations

### Steps:
1. Log in
2. Click "Recommendations" in sidebar
3. Wait for recommendations to load
4. Apply industry filter
5. Apply minimum score filter
6. Search for a name or skill
7. Click "Why this match?" on any recommendation card
8. Click "Connect" button
9. Click "View Profile" button

### Expected Results:
- [ ] Recommendations load from backend API
- [ ] Match percentages display (0-100)
- [ ] AI insights show below each card
- [ ] Industry filter works
- [ ] Score filter works
- [ ] Search filters results
- [ ] Match reasons expand/collapse
- [ ] Connect button changes to "Pending" after click
- [ ] View Profile navigates to user profile page
- [ ] No hardcoded data (all from MongoDB)

---

## Test Flow 5: Mentor Matching

### Steps:
1. Click "Mentors" in sidebar
2. Wait for mentor list to load
3. Filter by industry
4. Click "Request Mentorship" on any mentor
5. Check notifications

### Expected Results:
- [ ] Only users with role "Mentor" display
- [ ] Mentor compatibility scores show
- [ ] Industry filter works
- [ ] Request mentorship button works
- [ ] Success message displays
- [ ] Data comes from backend API

---

## Test Flow 6: Connections & Network

### Steps:
1. Navigate to Recommendations page
2. Click "Connect" on 3 different users
3. Navigate to "My Network" page
4. Check "Pending" tab
5. As another user, accept one connection request
6. Check "All Connections" tab
7. Reject one connection request

### Expected Results:
- [ ] Connect button works
- [ ] Connection status changes to "Pending"
- [ ] Pending requests show in "My Network" → "Pending"
- [ ] Accepted connections show in "All Connections"
- [ ] Accept button works
- [ ] Reject button works
- [ ] Connection statuses persist in database

---

## Test Flow 7: Notifications

### Steps:
1. Send 2-3 connection requests
2. Click "Notifications" in sidebar
3. View notification list
4. Click "Mark as Read" on one notification
5. Click "Mark All as Read"
6. Delete a notification
7. Check unread count badge

### Expected Results:
- [ ] Notifications page loads
- [ ] Notifications from backend display
- [ ] Each notification shows sender name/avatar
- [ ] Mark as Read changes notification style
- [ ] Mark All as Read works
- [ ] Delete removes notification
- [ ] Unread count updates
- [ ] Badge shows correct unread count

---

## Test Flow 8: Project Collaboration

### Steps:
1. Click "Collaboration" in sidebar
2. Click "Create Project" button (if available)
3. Fill in project details:
   - Title: `Test Collaboration Project`
   - Description: `Looking for developers to build an app...`
   - Required Skills: Select 2-3 skills
   - Tags: Add relevant tags
4. Submit project
5. Browse other projects
6. Click "Apply to Join" on a project
7. Navigate to "My Projects"
8. View project details

### Expected Results:
- [ ] Projects list loads from backend
- [ ] Create project form works
- [ ] Project created successfully
- [ ] Project shows in "My Projects"
- [ ] Apply to Join button works
- [ ] Application status shows "Pending"
- [ ] Project details page loads
- [ ] Member list displays

---

## Test Flow 9: Analytics Dashboard

### Steps:
1. Click "Analytics" in sidebar
2. View KPI cards
3. View Top Skills chart
4. View Top Industries chart
5. Scroll down to Recent Activities
6. Click "Export CSV"
7. Click "Export JSON"
8. Open downloaded files

### Expected Results:
- [ ] Analytics page loads
- [ ] User counts display (Students, Alumni, Mentors)
- [ ] Recommendations count shows
- [ ] Top Skills chart renders
- [ ] Top Industries chart renders
- [ ] Recent activities list shows
- [ ] Export CSV downloads file
- [ ] Export JSON downloads file
- [ ] Downloaded files contain real data from MongoDB
- [ ] No hardcoded statistics

---

## Test Flow 10: Search & Discovery

### Steps:
1. Click "Search" in sidebar (if available)
2. Search for profiles by:
   - Skills
   - Interests
   - Industry
   - Role
3. View search results
4. Click on a profile to view details

### Expected Results:
- [ ] Search page loads
- [ ] Search filters work
- [ ] Results load from backend
- [ ] Profile cards display correctly
- [ ] Clicking profile navigates to user profile page

---

## Test Flow 11: View User Profile

### Steps:
1. From Recommendations page, click "View Profile"
2. On user profile page:
   - View About tab
   - View Skills tab
   - View Timeline tab
   - View Interests tab
3. Click "Connect" button (if not already connected)

### Expected Results:
- [ ] User profile page loads
- [ ] Correct user data displays
- [ ] All tabs render properly
- [ ] Skills with proficiency bars show
- [ ] Education timeline displays
- [ ] Connect button works
- [ ] Profile data matches database record

---

## Test Flow 12: Logout

### Steps:
1. While logged in, click "Logout" in sidebar
2. Verify redirect to login page
3. Try accessing `/dashboard` directly
4. Try accessing `/profile` directly

### Expected Results:
- [ ] Logout succeeds
- [ ] Redirected to login page
- [ ] JWT token removed from localStorage
- [ ] Accessing protected routes redirects to login
- [ ] User must log in again to access dashboard

---

## API Endpoint Tests

### Using Browser Dev Tools or Postman:

1. **Test Registration**:
   ```http
   POST http://localhost:8000/api/auth/register
   Content-Type: application/json
   
   {
     "email": "apitest@example.com",
     "password": "password123",
     "full_name": "API Test User"
   }
   ```
   Expected: 201 Created, user object returned

2. **Test Login**:
   ```http
   POST http://localhost:8000/api/auth/login
   Content-Type: application/json
   
   {
     "email": "apitest@example.com",
     "password": "password123"
   }
   ```
   Expected: 200 OK, access_token returned

3. **Test Get Current User** (use token from login):
   ```http
   GET http://localhost:8000/api/me
   Authorization: Bearer <your_token_here>
   ```
   Expected: 200 OK, user + profile data

4. **Test Get Recommendations**:
   ```http
   GET http://localhost:8000/api/recommendations/similar?page=1&page_size=10
   Authorization: Bearer <your_token_here>
   ```
   Expected: 200 OK, array of recommendations

5. **Test Health Check**:
   ```http
   GET http://localhost:8000/health
   ```
   Expected: 200 OK, status: "healthy", database: "connected"

---

## Database Verification

### Using MongoDB Shell:

1. **Connect to database**:
   ```bash
   mongosh mongodb://localhost:27017/alumni_network
   ```

2. **Count users**:
   ```javascript
   db.users.count()
   ```

3. **View a user**:
   ```javascript
   db.users.findOne({email: "test@example.com"})
   ```

4. **Count profiles**:
   ```javascript
   db.profiles.count()
   ```

5. **View recommendations**:
   ```javascript
   db.recommendations.count()
   ```

6. **View connections**:
   ```javascript
   db.connections.count()
   ```

7. **View projects**:
   ```javascript
   db.projects.count()
   ```

8. **View notifications**:
   ```javascript
   db.notifications.count()
   ```

---

## Common Issues & Solutions

### Issue: "Failed to load recommendations"
**Solution**:
- Check backend logs for errors
- Verify user has a profile in database
- Ensure at least one other profile exists for recommendations
- Run seed script to populate demo data

### Issue: "401 Unauthorized" errors
**Solution**:
- Check JWT token exists in localStorage
- Token may be expired (default: 120 minutes)
- Log out and log in again to get fresh token

### Issue: "Connection to MongoDB failed"
**Solution**:
- Verify MongoDB is running: `mongosh`
- Check MongoDB URL in backend .env
- Restart MongoDB service

### Issue: "CORS errors in browser console"
**Solution**:
- Check ALLOWED_ORIGINS in backend .env includes `http://localhost:5173`
- Restart backend server after .env changes

### Issue: "Empty recommendations list"
**Solution**:
- Run `SEED_DATABASE.bat` to populate demo data
- Ensure current user has skills/interests set
- Check backend logs for ML engine errors

### Issue: "Profile updates not saving"
**Solution**:
- Check browser network tab for API errors
- Verify JWT token is valid
- Check backend logs for validation errors
- Ensure MongoDB is writable

---

## Performance Benchmarks

### Expected Load Times:
- Registration: < 2 seconds
- Login: < 1.5 seconds
- Load Dashboard: < 1 second
- Load Recommendations: < 2 seconds (with 20 profiles)
- Load Analytics: < 1.5 seconds
- Profile Update: < 1 second

### Expected API Response Times:
- Auth endpoints: < 200ms
- Profile endpoints: < 150ms
- Recommendations: < 500ms (depends on number of profiles)
- Analytics: < 300ms

---

## Security Tests

### Test Authentication:
1. [ ] Can't access protected routes without token
2. [ ] Invalid token returns 401
3. [ ] Expired token returns 401
4. [ ] Token refresh works (if implemented)

### Test Authorization:
1. [ ] Can't edit other users' profiles
2. [ ] Can't delete other users' notifications
3. [ ] Can only accept connection requests sent to you
4. [ ] Can only manage projects you own

### Test Input Validation:
1. [ ] Email validation on registration
2. [ ] Password minimum length (6 chars)
3. [ ] SQL injection protection
4. [ ] XSS protection in text inputs

---

## Demo Presentation Checklist

Before presenting:
- [ ] MongoDB running
- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Database seeded with demo data
- [ ] At least 2 test accounts created
- [ ] Browser cache cleared
- [ ] DevTools console cleared
- [ ] All tabs of application tested once
- [ ] No console errors in browser

Demo Flow:
1. Show landing page
2. Register new user (quick flow)
3. Show dashboard with stats
4. Show AI recommendations with scores
5. Send connection request
6. Show mentor matching
7. View a user profile
8. Show My Network page
9. Show Notifications
10. Show Projects collaboration
11. Show Analytics with charts
12. Export data (CSV/JSON)

---

**Testing Status**: Ready for Demo ✅
