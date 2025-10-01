#!/bin/bash

# DataSense Desktop Application - Unified Startup Script
# Works on macOS, Linux, and Windows (via Git Bash/WSL)

set -e

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   DataSense Desktop Application v1.0.0    ║"
echo "║   Meteorological Data Processing System   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to check if a port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1 || netstat -an | grep -q ":$1.*LISTEN" 2>/dev/null
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    echo "⏳ Waiting for $name to be ready..."
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo "❌ $name failed to start"
    return 1
}

# Function to open browser based on OS
open_browser() {
    local url=$1
    
    if command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" >/dev/null 2>&1; then
        # macOS with Chrome - app mode
        echo "📱 Opening DataSense in Chrome app mode..."
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
            --app="$url" \
            --window-size=1400,900 \
            --user-data-dir="$HOME/.datasense-browser" \
            > /dev/null 2>&1 &
    elif command -v google-chrome >/dev/null 2>&1; then
        # Linux with Chrome - app mode
        echo "📱 Opening DataSense in Chrome app mode..."
        google-chrome --app="$url" --window-size=1400,900 \
            --user-data-dir="$HOME/.datasense-browser" > /dev/null 2>&1 &
    elif command -v chromium-browser >/dev/null 2>&1; then
        # Linux with Chromium - app mode
        echo "📱 Opening DataSense in Chromium app mode..."
        chromium-browser --app="$url" --window-size=1400,900 \
            --user-data-dir="$HOME/.datasense-browser" > /dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        # macOS fallback
        echo "📱 Opening DataSense in default browser..."
        open "$url"
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux fallback
        echo "📱 Opening DataSense in default browser..."
        xdg-open "$url"
    elif command -v start >/dev/null 2>&1; then
        # Windows fallback
        echo "📱 Opening DataSense in default browser..."
        start "$url"
    else
        echo "📱 Please open your browser and go to: $url"
    fi
}

# Clean up function
cleanup() {
    echo ""
    echo "🛑 Shutting down DataSense..."
    pkill -f "python.*app.py" || true
    pkill -f "react-scripts" || true
    lsof -ti:3000,5000 | xargs kill -9 2>/dev/null || true
    echo "✅ DataSense stopped"
    exit 0
}

# Set up cleanup trap
trap cleanup INT TERM

# Step 1: Kill all potentially interfering processes
echo "🧹 Cleaning up any existing DataSense processes..."

# Kill Python backend processes
pkill -f "python.*app.py" 2>/dev/null || true

# Kill React dev server processes
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*start.js" 2>/dev/null || true

# Kill any Chrome instances with DataSense browser profile
pkill -f "Chrome.*datasense-browser" 2>/dev/null || true

# Kill any processes on ports 3000 and 5000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Wait for cleanup to complete
sleep 2
echo "✅ Cleanup complete"
echo ""

# Step 2: Start Backend
echo "🔧 Starting backend server..."
cd backend

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    echo "❌ Virtual environment not found. Please run: python -m venv venv"
    exit 1
fi

# Start Python backend
python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
if ! wait_for_service "http://localhost:5000/health" "Backend"; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Step 3: Start Frontend
echo "⚛️  Starting React development server..."
npm run start:frontend > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
if ! wait_for_service "http://localhost:3000" "Frontend"; then
    echo "❌ Frontend failed to start. Check frontend.log for details."
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Step 4: Open Desktop App
echo ""
echo "🎉 DataSense is now running!"
echo ""
echo "═══════════════════════════════════════════"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "═══════════════════════════════════════════"
echo ""

# Open browser
open_browser "http://localhost:3000"

echo ""
echo "✨ Desktop application opened successfully!"
echo ""
echo "📝 Logs:"
echo "   • Backend:  backend.log"
echo "   • Frontend: frontend.log"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

# Keep script running and wait for processes
wait $BACKEND_PID $FRONTEND_PID
