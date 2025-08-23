#!/usr/bin/env python3
"""
NRG DataSense FastAPI Backend
Run this script to start the FastAPI server
"""

import uvicorn
from app import app

if __name__ == "__main__":
    print("Starting NRG DataSense FastAPI Backend...")
    print("Configuration: default")
    print("Host: 0.0.0.0")
    print("Port: 5000")
    print("Debug: True")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
