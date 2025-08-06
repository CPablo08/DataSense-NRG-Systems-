#!/bin/bash
echo "🚀 NRG DataSense - Portable Version"
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

echo "✅ NRG DataSense is running!"
echo "🔄 Press Ctrl+C to stop the application"
echo ""

# Wait for serve to finish
wait $SERVE_PID
