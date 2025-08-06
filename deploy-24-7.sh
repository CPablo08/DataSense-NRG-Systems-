#!/bin/bash

echo "🌙 DataSense - 24/7 Deployment Script"
echo "============================================="
echo ""

# Build the application
echo "🔨 Building application..."
npm run build

# Install serve globally if not installed
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve globally..."
    npm install -g serve
fi

echo "✅ Build complete"
echo "🚀 Starting 24/7 server..."
echo "📊 Application will be available at: http://localhost:3000"
echo "🔄 Server will restart automatically if it crashes"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Auto-open browser after a moment
(sleep 3 && echo "🌐 Opening browser automatically..." && 
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v start &> /dev/null; then
    start http://localhost:3000
else
    echo "📋 Please manually open: http://localhost:3000"
fi) &

# Start the server with automatic restart
while true; do
    echo "🔄 Starting DataSense server..."
    serve -s build -l 3000
    echo "⚠️  Server stopped. Restarting in 5 seconds..."
    sleep 5
done 