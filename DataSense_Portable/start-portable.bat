@echo off
echo 🚀 NRG DataSense - Portable Version
echo ====================================
echo.

REM Check if serve is available
where serve >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Serve found, starting application...
    start /B serve -s . -l 3000
) else (
    echo ❌ Serve not found. Installing...
    npm install -g serve
    echo ✅ Serve installed, starting application...
    start /B serve -s . -l 3000
)

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Auto-open browser
echo 🌐 Opening browser automatically...
start http://localhost:3000

echo ✅ NRG DataSense is running!
echo 🔄 Press Ctrl+C to stop the application
echo.

REM Keep the window open
pause
