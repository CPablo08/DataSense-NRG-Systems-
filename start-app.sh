#!/bin/bash

echo "🚀 DataSense - Professional Meteorological Data Visualization Platform"
echo "=================================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"
echo "🌐 Starting DataSense..."
echo "📊 Application will be available at: http://localhost:3000"
echo "⏰ Boot screen will show for 3 seconds..."
echo ""

# Start the application in background
npm start &
APP_PID=$!

# Wait a moment for the server to start
sleep 5

# Auto-open browser
echo "🌐 Opening browser automatically..."
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000
elif command -v start &> /dev/null; then
    # Windows (if running in WSL)
    start http://localhost:3000
else
    echo "📋 Please manually open: http://localhost:3000"
fi

echo "✅ DataSense is running!"
echo "🔄 Press Ctrl+C to stop the application"
echo ""

# Wait for the app to finish
wait $APP_PID 