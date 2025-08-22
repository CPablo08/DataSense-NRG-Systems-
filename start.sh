#!/bin/bash

# NRG DataSense Platform Startup Script
# This script starts both the Python backend and React frontend

echo "🚀 Starting NRG DataSense Platform..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    else
        echo "Port $1 is available"
        return 0
    fi
}

# Function to start backend
start_backend() {
    echo "🐍 Starting Python Backend..."
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Check if port 5000 is available
    if check_port 5000; then
        echo "Starting backend on http://localhost:5000"
        python run.py &
        BACKEND_PID=$!
        echo "Backend started with PID: $BACKEND_PID"
    else
        echo "❌ Port 5000 is already in use. Please stop the service using port 5000 and try again."
        exit 1
    fi
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting React Frontend..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing Node.js dependencies..."
        npm install
    fi
    
    # Check if port 3000 is available
    if check_port 3000; then
        echo "Starting frontend on http://localhost:3000"
        npm start &
        FRONTEND_PID=$!
        echo "Frontend started with PID: $FRONTEND_PID"
    else
        echo "❌ Port 3000 is already in use. Please stop the service using port 3000 and try again."
        exit 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Frontend stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
sleep 3  # Give backend time to start
start_frontend

echo "✅ NRG DataSense Platform is starting up!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
