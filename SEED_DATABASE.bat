@echo off
echo ========================================
echo Seeding Database with Demo Data
echo ========================================
echo.
echo Calling seed endpoint...
echo.
curl -X POST "http://localhost:8000/api/admin/seed" ^
  -H "X-Admin-Key: 4eb81b2aef58ef8a9a2c351bbdf794ff8a38b556b68b7ea84ef9b4bc0fae6bc4" ^
  -H "Content-Type: application/json"
echo.
echo.
echo ========================================
echo Database seeded successfully!
echo ========================================
pause
