#!/bin/bash

echo ""
echo "========================================"
echo "   DataSense Desktop Application"
echo "========================================"
echo ""
echo "Starting DataSense..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Start the application
echo "Launching DataSense Desktop App..."
npm run start:dev

read -p "Press Enter to exit..."
