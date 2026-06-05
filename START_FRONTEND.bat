@echo off
echo ========================================
echo Starting Frontend Development Server
echo ========================================
echo Current directory: %CD%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting Vite dev server on http://localhost:5173
echo.
call npm run dev
