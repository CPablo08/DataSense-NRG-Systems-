#!/usr/bin/env python3
"""
NRG RLD Converter Backend Startup Script
"""

import os
import sys
from app import app
from config import config

def main():
    """Main startup function"""
    
    # Get configuration from environment
    config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    # Apply configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Get host from environment or use default
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"Starting NRG RLD Converter Backend...")
    print(f"Configuration: {config_name}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Debug: {app.config['DEBUG']}")
    
    # Start the application
    app.run(
        host=host,
        port=port,
        debug=app.config['DEBUG']
    )

if __name__ == '__main__':
    main()
