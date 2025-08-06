#!/bin/bash

echo "🚀 Creating Portable DataSense..."
echo "======================================"

# Create portable directory
PORTABLE_DIR="DataSense_Portable"
if [ -d "$PORTABLE_DIR" ]; then
    rm -rf "$PORTABLE_DIR"
fi
mkdir "$PORTABLE_DIR"

# Build the application
echo "📦 Building application..."
npm run build

# Copy build files
echo "📋 Copying files..."
cp -r build/* "$PORTABLE_DIR/"

# Create portable start script for Unix/Linux/macOS
cat > "$PORTABLE_DIR/start-portable.sh" << 'EOF'
#!/bin/bash
echo "🚀 DataSense - Portable Version"
echo "===================================="
echo ""

# Check if serve is available
if command -v serve &> /dev/null; then
    echo "✅ Serve found, starting application..."
    serve -s . -l 3000 &
    SERVE_PID=$!
else
    echo "❌ Serve not found. Installing..."
    npm install -g serve
    echo "✅ Serve installed, starting application..."
    serve -s . -l 3000 &
    SERVE_PID=$!
fi

# Wait a moment for server to start
sleep 3

# Auto-open browser
echo "🌐 Opening browser automatically..."
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
else
    echo "📋 Please manually open: http://localhost:3000"
fi

echo "✅ DataSense is running!"
echo "🔄 Press Ctrl+C to stop the application"
echo ""

# Wait for serve to finish
wait $SERVE_PID
EOF

# Create Windows batch file
cat > "$PORTABLE_DIR/start-portable.bat" << 'EOF'
@echo off
echo 🚀 DataSense - Portable Version
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

echo ✅ DataSense is running!
echo 🔄 Press Ctrl+C to stop the application
echo.

REM Keep the window open
pause
EOF

# Make Unix script executable
chmod +x "$PORTABLE_DIR/start-portable.sh"

# Create README for portable
cat > "$PORTABLE_DIR/README.md" << 'EOF'
# 🚀 DataSense - Portable Version

## Quick Start

### Windows:
1. Double-click `start-portable.bat`
2. Browser will open automatically to http://localhost:3000

### macOS/Linux:
1. Open terminal in this folder
2. Run: `./start-portable.sh`
3. Browser will open automatically to http://localhost:3000

## Requirements
- Node.js installed on target computer
- Internet connection (for first serve installation)

## Features
- ✅ Complete DataSense functionality
- ✅ Professional boot screen
- ✅ All data visualization features
- ✅ PDF report generation
- ✅ Cross-platform compatibility
- ✅ Auto-browser opening

## Troubleshooting
- If serve fails to install, manually run: `npm install -g serve`
- Ensure Node.js is installed: https://nodejs.org/
- Check firewall settings if localhost:3000 doesn't work
- If browser doesn't open automatically, manually navigate to http://localhost:3000
EOF

echo "✅ Portable package created successfully!"
echo "📁 Location: $PORTABLE_DIR/"
echo ""
echo "📋 To deploy:"
echo "1. Copy the entire folder to USB drive"
echo "2. On target computer, ensure Node.js is installed"
echo "3. Run start-portable.sh (Linux/Mac) or start-portable.bat (Windows)"
echo "4. Browser will open automatically to http://localhost:3000" 