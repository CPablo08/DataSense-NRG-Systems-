#!/usr/bin/env python3
"""
DataSense Configuration
Hardcoded credentials for single-user deployment
"""

# Email Configuration
EMAIL_CONFIG = {
    "server": "imap.gmail.com",  # Change to your email server
    "username": "your-email@gmail.com",  # Change to your email
    "password": "your-app-password",  # Change to your app password
    "scan_interval": 300  # 5 minutes
}

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

# Email Search Configuration
EMAIL_SEARCH_CONFIG = {
    "body_text": "SymphoniePRO Logger data attached.",  # Text to search for in email body
    "attachment_extensions": [".rld", ".txt"],  # File extensions to download
    "archive_folder": "INBOX/Archive"  # Folder to move processed emails
}
