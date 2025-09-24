@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    DataSense Desktop Application
echo ========================================
echo.
echo 🚀 Starting DataSense...
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version for Windows
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js found: %NODE_VERSION%

REM Check if npm is installed
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Node.js dependencies
        echo.
        echo Troubleshooting:
        echo 1. Make sure you have internet connection
        echo 2. Try running as Administrator
        echo 3. Check if antivirus is blocking npm
        echo.
        pause
        exit /b 1
    )
    echo [SUCCESS] Node.js dependencies installed
) else (
    echo [SUCCESS] Node.js dependencies already installed
)

REM Check if Python is installed
echo [INFO] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not installed!
        echo.
        echo Please install Python 3 from: https://python.org/
        echo Make sure to check "Add Python to PATH" during installation
        echo.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=python3
    )
) else (
    set PYTHON_CMD=python
)

for /f "tokens=*" %%i in ('%PYTHON_CMD% --version') do set PYTHON_VERSION=%%i
echo [SUCCESS] Python found: %PYTHON_VERSION%

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the DataSense project directory
    pause
    exit /b 1
)

REM Setup Python virtual environment
if not exist "backend\venv" (
    echo [INFO] Setting up Python virtual environment...
    cd backend
    %PYTHON_CMD% -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create Python virtual environment
        pause
        exit /b 1
    )
    cd ..
    echo [SUCCESS] Python virtual environment created
)

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
cd backend
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies
    echo.
    echo Troubleshooting:
    echo 1. Make sure you have internet connection
    echo 2. Try running as Administrator
    echo 3. Check if antivirus is blocking pip
    echo.
    pause
    exit /b 1
)
call deactivate.bat
cd ..
echo [SUCCESS] Python dependencies installed

REM Start the application
echo [INFO] Starting DataSense Desktop Application...
echo.
echo [SUCCESS] 🎉 DataSense is starting up!
echo.
echo The application will open in a new window.
echo You can close this terminal window once the app is running.
echo.

REM Start the development version
npm run start:dev

REM Keep terminal open if there's an error
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] DataSense failed to start
    echo.
    echo Troubleshooting tips:
    echo 1. Make sure all dependencies are installed
    echo 2. Check if ports 3000 and 5000 are available
    echo 3. Try running: npm install
    echo 4. Try running as Administrator
    echo.
    pause
)
