@echo off
title WEGROW MNC EXAM PLATFORM - LIVE HOST
color 0A
cls

echo =====================================================================
echo           WEGROW MNC PLACEMENT EXAM PLATFORM (LIVE SERVER)
echo =====================================================================
echo.
echo  [1/2] Starting Node.js Exam Server...
cd /d "D:\WEGROW\Exam"

:: Kill any old node instances on port 3000 if running
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: Start node server in background
start /b node server.js

echo  [2/2] Launching Secure Cloudflare Live Tunnel...
echo.
echo =====================================================================
echo  SHARE THESE LINKS WITH YOUR STUDENTS TOMORROW:
echo.
echo  PUBLIC INTERNET LINK (For any phone/laptop/home/Wi-Fi):
echo  Run: npx cloudflared tunnel --url http://localhost:3000
echo.
echo  LOCAL WI-FI LINK (For students in the same room/campus Wi-Fi):
echo  http://192.168.1.36:3000
echo.
echo  INSTRUCTOR ADMIN PORTAL:
echo  http://localhost:3000/admin.html
echo  Email: deepakkumars170404@gmail.com
echo  PIN:   wegrow2026
echo =====================================================================
echo.
echo Starting live public tunnel now... Please wait 5 seconds...
echo.

npx --yes cloudflared tunnel --url http://localhost:3000
pause

