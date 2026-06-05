@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
cd "smart networking engine for alumini collaboration\backend"
echo Current directory: %CD%
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
echo API Docs will be available at http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
