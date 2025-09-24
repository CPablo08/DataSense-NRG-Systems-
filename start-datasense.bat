@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    DataSense Desktop Application
echo ========================================
echo.
echo 🚀 Starting DataSense in Windows VM...
echo.
echo ✅ Windows VM detected - Full nrgpy support available
echo ✅ NRG Systems software compatibility
echo ✅ Complete DataSense application running in VM
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Node.js is not installed!
    echo.
    echo Installing Node.js automatically...
    echo.
    
    REM Check if Chocolatey is installed
    choco --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Installing Chocolatey package manager...
        powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to install Chocolatey
            echo Please install Node.js manually from: https://nodejs.org/
            pause
            exit /b 1
        )
        echo [SUCCESS] Chocolatey installed successfully
    )
    
    REM Install Node.js via Chocolatey
    echo [INFO] Installing Node.js via Chocolatey...
    choco install nodejs -y
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Node.js via Chocolatey
        echo Please install Node.js manually from: https://nodejs.org/
        pause
        exit /b 1
    )
    
    REM Refresh environment variables
    call refreshenv
    echo [SUCCESS] Node.js installed successfully
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js found: %NODE_VERSION%
)

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
        echo [WARNING] Python is not installed!
        echo.
        echo Installing Python 3 automatically...
        echo.
        
        REM Install Python via Chocolatey
        echo [INFO] Installing Python 3 via Chocolatey...
        choco install python3 -y
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to install Python 3 via Chocolatey
            echo Please install Python 3 manually from: https://python.org/
            pause
            exit /b 1
        )
        
        REM Refresh environment variables
        call refreshenv
        echo [SUCCESS] Python 3 installed successfully
        set PYTHON_CMD=python
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
