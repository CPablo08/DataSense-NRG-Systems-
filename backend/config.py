#!/usr/bin/env python3
"""
DataSense Configuration
Hardcoded credentials for single-user deployment
"""


# NRG Local Configuration
NRG_LOCAL_CONFIG = {
    "conversion_method": "local",  # Using nrgpy local conversion
    "output_folder": "./converted",
    "temp_folder": "./temp_rld"
}

# Database Configuration
DATABASE_CONFIG = {
    "url": "sqlite:///./instance/nrg_config.db"
}

# Application Configuration
APP_CONFIG = {
    "title": "NRG DataSense API",
    "description": "Automated NRG data processing system",
    "version": "1.0.0",
    "debug": False
}

