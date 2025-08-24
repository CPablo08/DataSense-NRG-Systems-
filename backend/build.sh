#!/bin/bash

# Build script for NRG DataSense Backend
echo "Starting build process..."

# Install system dependencies if needed
echo "Installing system dependencies..."
apt-get update -qq && apt-get install -y -qq \
    build-essential \
    python3-dev \
    libssl-dev \
    libffi-dev \
    pkg-config

# Install Python packages
echo "Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p downloads converted logs

echo "Build completed successfully!"
