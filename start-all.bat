@echo off
title Prescription NER Extractor - Launcher
echo ===================================================
echo     Prescription NER Extractor - Full Stack Launcher
echo ===================================================
echo.

:: 1. Check / Start MongoDB
echo [1/3] Checking MongoDB on localhost:27017...
netstat -ano | findstr ":27017" >nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB is already running.
) else (
    echo Starting local MongoDB instance...
    if not exist "%~dp0data\db" mkdir "%~dp0data\db"
    start "MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%~dp0data\db" --logpath "%~dp0data\db\mongod.log" --setParameter diagnosticDataCollectionEnabled=false --bind_ip 127.0.0.1
    timeout /t 3 /nobreak >nul
)

:: 2. Start ML Microservice (FastAPI :8001)
echo [2/3] Starting Python ML Microservice (FastAPI :8001)...
start "ML Service (:8001)" cmd /k "cd /d %~dp0ml_service && ..\venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 2 /nobreak >nul

:: 3. Start Node.js Express Backend (:5000)
echo [3/4] Starting Express Backend (:5000)...
start "Backend API (:5000)" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak >nul

:: 4. Start React Frontend (:3000)
echo [4/4] Starting React Frontend (:3000)...
start "Frontend (:3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   All services launched!
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:5000
echo   ML API   : http://localhost:8001/docs
echo ===================================================
pause
