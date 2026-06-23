@echo off
chcp 65001 >nul
cd /d "%~dp0"
title ThermalGrid Baslatici

echo ============================================
echo    ThermalGrid baslatiliyor...
echo ============================================
echo.

REM --- 1) Docker calisiyor mu? Degilse baslat ve bekle ---
docker info >nul 2>&1
if errorlevel 1 (
    echo [1/4] Docker Desktop baslatiliyor, lutfen bekle...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    :waitdocker
    timeout /t 3 >nul
    docker info >nul 2>&1
    if errorlevel 1 goto waitdocker
) else (
    echo [1/4] Docker zaten calisiyor.
)

REM --- 2) Veritabani (PostgreSQL) ---
echo [2/4] Veritabani baslatiliyor...
docker compose up -d

REM --- 3) Backend (FastAPI) ayri pencerede ---
echo [3/4] Backend baslatiliyor (port 8001)...
start "ThermalGrid Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001"

REM --- 4) Frontend (React/Vite) ayri pencerede ---
echo [4/4] Frontend baslatiliyor (port 5174)...
start "ThermalGrid Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM --- Tarayiciyi ac (servislerin acilmasi icin biraz bekle) ---
echo.
echo Servislerin acilmasi bekleniyor...
timeout /t 8 >nul
start http://localhost:5174

echo.
echo ============================================
echo  Hazir! Site: http://localhost:5174
echo  Backend:    http://localhost:8001/docs
echo.
echo  Kapatmak icin: durdur.bat
echo ============================================
echo Bu pencereyi kapatabilirsin.
pause
