#!/usr/bin/env python3
"""
NRG DataSense Desktop App Launcher
Simple launcher script for the desktop application
"""

import sys
import os
import subprocess

def main():
    """Launch the desktop application"""
    try:
        # Check if we're in the right directory
        if not os.path.exists("desktop_app.py"):
            print("Error: desktop_app.py not found")
            print("Please run this script from the project root directory")
            sys.exit(1)
        
        # Check if requirements are installed
        try:
            import pystray
            import PIL
        except ImportError:
            print("Installing desktop app requirements...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "desktop_app_requirements.txt"])
        
        # Launch the desktop app
        print("Launching NRG DataSense Desktop App...")
        subprocess.run([sys.executable, "desktop_app.py"])
        
    except Exception as e:
        print(f"Error launching app: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
