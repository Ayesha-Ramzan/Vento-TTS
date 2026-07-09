@echo off
echo ==========================================
echo      VENTO TTS - Quick Start
echo ==========================================
echo.
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.
echo Starting Vento Server...
echo.
node server.js
pause

#open in browser
#npm Start
#http://localhost:3001