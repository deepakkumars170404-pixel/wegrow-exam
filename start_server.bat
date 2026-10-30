@echo off
title WEGROW MNC Assessment Server
color 0b
echo ========================================================
echo       WEGROW MNC ASSESSMENT PLATFORM - EXAM PORTAL
echo ========================================================
echo.
echo Starting Examination Server on Port 3000...
echo.
cd /d "%~dp0"
node server.js
pause

