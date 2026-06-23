@echo off
chcp 65001 >nul
cd /d "%~dp0"
title ThermalGrid Durdurucu

echo Servisler durduruluyor...

REM Backend ve frontend pencerelerini kapat
taskkill /FI "WINDOWTITLE eq ThermalGrid Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq ThermalGrid Frontend*" /T /F >nul 2>&1

REM Veritabani container'ini durdur (veri silinmez)
docker compose stop

echo.
echo Durduruldu. (Veritabani verileri korunuyor)
pause
