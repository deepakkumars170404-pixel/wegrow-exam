@echo off
title WEGROW Examination Platform - Command Center
color 0b
cls

:MENU
echo =====================================================================
echo           WEGROW MNC EXAMINATION PLATFORM - COMMAND CENTER
echo =====================================================================
echo.
echo  [1] Start Local Examination Server (http://localhost:3000)
echo  [2] Start Server with Public Live Link (Cloudflare Tunnel)
echo  [3] Run Automated 29-Point System Verification Tests
echo  [4] Seed / Sync 970 Questions to Supabase Cloud Database
echo  [5] Exit
echo.
echo =====================================================================
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto START_SERVER
if "%choice%"=="2" goto START_TUNNEL
if "%choice%"=="3" goto RUN_TESTS
if "%choice%"=="4" goto SEED_SUPABASE
if "%choice%"=="5" exit
goto MENU

:START_SERVER
cls
echo =====================================================================
echo  Starting WEGROW Examination Server on http://localhost:3000...
echo =====================================================================
cd /d "%~dp0"
node server.js
pause
goto MENU

:START_TUNNEL
cls
echo =====================================================================
echo  Starting Node Server + Cloudflare Live Tunnel...
echo =====================================================================
cd /d "%~dp0"
start /b node server.js
echo Server launched in background. Initializing public tunnel...
timeout /t 3 >nul
npx --yes cloudflared tunnel --url http://localhost:3000
pause
goto MENU

:RUN_TESTS
cls
echo =====================================================================
echo  Running System Verification Tests...
echo =====================================================================
cd /d "%~dp0"
npm test
pause
goto MENU

:SEED_SUPABASE
cls
echo =====================================================================
echo  Seeding 970 Questions & 9 Modules to Supabase...
echo =====================================================================
cd /d "%~dp0"
npm run seed:supabase
pause
goto MENU
