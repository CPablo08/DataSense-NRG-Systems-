#!/usr/bin/env python3
"""
NRG DataSense Desktop Application
A system tray application that runs the local NRG client in the background
and provides easy access to the web interface.
"""

import sys
import os
import threading
import webbrowser
import json
import time
from pathlib import Path
from datetime import datetime

# GUI imports
try:
    import tkinter as tk
    from tkinter import messagebox, simpledialog
    from PIL import Image, ImageTk
    import pystray
    from pystray import MenuItem as item
except ImportError as e:
    print(f"Error importing GUI libraries: {e}")
    print("Please install required packages:")
    print("pip install pillow pystray")
    sys.exit(1)

# Import our local NRG client
try:
    from local_nrg_client import LocalNRGClient
except ImportError:
    print("Error: local_nrg_client.py not found")
    sys.exit(1)

class NRGDataSenseApp:
    def __init__(self):
        self.app_name = "NRG DataSense"
        self.version = "1.0.0"
        self.config_file = "nrg_client_config.json"
        self.client = None
        self.client_thread = None
        self.is_running = False
        self.icon = None
        self.tray_icon = None
        
        # Create necessary directories
        self.setup_directories()
        
        # Load or create configuration
        self.load_config()
        
        # Initialize GUI
        self.setup_gui()
        
    def setup_directories(self):
        """Create necessary directories"""
        dirs = ["downloads", "converted", "logs"]
        for dir_name in dirs:
            Path(dir_name).mkdir(exist_ok=True)
    
    def load_config(self):
        """Load or create configuration"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}")
                self.config = self.get_default_config()
        else:
            self.config = self.get_default_config()
            self.save_config()
    
    def get_default_config(self):
        """Get default configuration"""
        return {
            "email": {
                "server": "imap.gmail.com",
                "username": "",
                "password": "",
                "search_text": "SymphoniePRO Logger data attached.",
                "mail_folder": "INBOX",
                "file_extension": ".rld",
                "download_folder": "./downloads",
                "delete_emails": False,
                "store_password": False
            },
            "nrg": {
                "output_folder": "./converted",
                "file_filter": "000110"
            },
            "api_url": "http://localhost:5000",
            "monitor_interval": 300,
            "max_files_per_batch": 10,
            "auto_start": True,
            "open_browser_on_start": True
        }
    
    def save_config(self):
        """Save configuration"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    def setup_gui(self):
        """Setup the GUI and system tray"""
        # Create the main window (hidden)
        self.root = tk.Tk()
        self.root.withdraw()  # Hide the main window
        
        # Create system tray icon
        self.create_tray_icon()
        
        # Setup logging
        self.setup_logging()
        
    def create_tray_icon(self):
        """Create the system tray icon"""
        # Create a simple icon (you can replace this with a proper icon file)
        icon_image = self.create_icon_image()
        
        # Create menu
        menu = pystray.Menu(
            item('Open Web Interface', self.open_web_interface),
            item('Start Monitoring', self.start_monitoring, enabled=True),
            item('Stop Monitoring', self.stop_monitoring, enabled=False),
            pystray.Menu.SEPARATOR,
            item('Settings', self.show_settings),
            item('View Logs', self.view_logs),
            pystray.Menu.SEPARATOR,
            item('About', self.show_about),
            item('Quit', self.quit_app)
        )
        
        # Create tray icon
        self.tray_icon = pystray.Icon(
            "nrg_datasense",
            icon_image,
            self.app_name,
            menu
        )
        
        # Store menu items for later access
        self.menu_items = {
            'start': menu[1],
            'stop': menu[2]
        }
    
    def create_icon_image(self):
        """Create or load the app icon"""
        # Try to load the generated icon first
        icon_paths = ["app_icon.png", "app_icon_64.png"]
        
        for icon_path in icon_paths:
            if os.path.exists(icon_path):
                try:
                    image = Image.open(icon_path)
                    # Resize to 64x64 for system tray
                    image = image.resize((64, 64), Image.Resampling.LANCZOS)
                    return image
                except Exception as e:
                    print(f"Error loading icon {icon_path}: {e}")
        
        # If no icon file exists, create a simple one
        print("No icon file found, creating simple icon...")
        size = 64
        image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        from PIL import ImageDraw
        draw = ImageDraw.Draw(image)
        
        # Draw a blue circle with white border
        draw.ellipse([8, 8, size-8, size-8], fill=(52, 152, 219), outline=(255, 255, 255), width=2)
        
        # Draw some data lines
        draw.line([16, 20, 48, 20], fill=(255, 255, 255), width=2)
        draw.line([16, 30, 48, 30], fill=(255, 255, 255), width=2)
        draw.line([16, 40, 48, 40], fill=(255, 255, 255), width=2)
        
        return image
    
    def setup_logging(self):
        """Setup logging for the application"""
        import logging
        
        # Create logs directory if it doesn't exist
        Path("logs").mkdir(exist_ok=True)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('logs/desktop_app.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def start_monitoring(self, icon=None, item=None):
        """Start the NRG client monitoring"""
        if self.is_running:
            return
        
        try:
            self.logger.info("Starting NRG client monitoring...")
            
            # Create and configure the client
            self.client = LocalNRGClient(self.config_file)
            
            # Start the client in a separate thread
            self.client_thread = threading.Thread(target=self.run_client, daemon=True)
            self.client_thread.start()
            
            self.is_running = True
            
            # Update menu
            self.menu_items['start'].enabled = False
            self.menu_items['stop'].enabled = True
            
            # Update tray icon tooltip
            self.tray_icon.title = f"{self.app_name} - Monitoring Active"
            
            # Show notification
            self.show_notification("Monitoring Started", "NRG DataSense is now monitoring for new data")
            
            # Open browser if configured
            if self.config.get('open_browser_on_start', True):
                threading.Timer(3.0, self.open_web_interface).start()
                
        except Exception as e:
            self.logger.error(f"Error starting monitoring: {e}")
            messagebox.showerror("Error", f"Failed to start monitoring: {e}")
    
    def run_client(self):
        """Run the NRG client in a loop"""
        try:
            while self.is_running:
                try:
                    # Process one batch
                    self.client.process_batch()
                    
                    # Wait for next check
                    interval = self.config.get('monitor_interval', 300)
                    for _ in range(interval):
                        if not self.is_running:
                            break
                        time.sleep(1)
                        
                except Exception as e:
                    self.logger.error(f"Error in client loop: {e}")
                    time.sleep(60)  # Wait 1 minute before retrying
                    
        except Exception as e:
            self.logger.error(f"Fatal error in client thread: {e}")
    
    def stop_monitoring(self, icon=None, item=None):
        """Stop the NRG client monitoring"""
        if not self.is_running:
            return
        
        try:
            self.logger.info("Stopping NRG client monitoring...")
            
            self.is_running = False
            
            # Wait for thread to finish
            if self.client_thread and self.client_thread.is_alive():
                self.client_thread.join(timeout=5)
            
            # Update menu
            self.menu_items['start'].enabled = True
            self.menu_items['stop'].enabled = False
            
            # Update tray icon tooltip
            self.tray_icon.title = self.app_name
            
            # Show notification
            self.show_notification("Monitoring Stopped", "NRG DataSense monitoring has been stopped")
            
        except Exception as e:
            self.logger.error(f"Error stopping monitoring: {e}")
            messagebox.showerror("Error", f"Failed to stop monitoring: {e}")
    
    def open_web_interface(self, icon=None, item=None):
        """Open the web interface in browser"""
        try:
            # Try to open the local frontend first
            frontend_url = "http://localhost:3000"
            backend_url = self.config.get('api_url', 'http://localhost:5000')
            
            # Check if backend is running
            import requests
            try:
                response = requests.get(f"{backend_url}/health", timeout=5)
                if response.status_code == 200:
                    webbrowser.open(frontend_url)
                else:
                    # If local backend is not running, try to start it
                    self.start_backend()
                    threading.Timer(3.0, lambda: webbrowser.open(frontend_url)).start()
            except:
                # If local backend is not running, try to start it
                self.start_backend()
                threading.Timer(3.0, lambda: webbrowser.open(frontend_url)).start()
                
        except Exception as e:
            self.logger.error(f"Error opening web interface: {e}")
            messagebox.showerror("Error", f"Failed to open web interface: {e}")
    
    def start_backend(self):
        """Start the FastAPI backend"""
        try:
            import subprocess
            import sys
            
            # Start backend in background
            if sys.platform == "win32":
                subprocess.Popen(["python", "backend/run.py"], 
                               cwd=os.getcwd(), 
                               creationflags=subprocess.CREATE_NEW_CONSOLE)
            else:
                subprocess.Popen(["python3", "backend/run.py"], 
                               cwd=os.getcwd())
            
            self.logger.info("Backend started")
            
        except Exception as e:
            self.logger.error(f"Error starting backend: {e}")
    
    def show_settings(self, icon=None, item=None):
        """Show settings dialog"""
        try:
            # Create settings window
            settings_window = tk.Toplevel(self.root)
            settings_window.title(f"{self.app_name} - Settings")
            settings_window.geometry("500x600")
            settings_window.resizable(False, False)
            
            # Center the window
            settings_window.transient(self.root)
            settings_window.grab_set()
            
            # Create settings form
            self.create_settings_form(settings_window)
            
        except Exception as e:
            self.logger.error(f"Error showing settings: {e}")
            messagebox.showerror("Error", f"Failed to show settings: {e}")
    
    def create_settings_form(self, parent):
        """Create the settings form"""
        # Email Settings Frame
        email_frame = tk.LabelFrame(parent, text="Email Settings", padx=10, pady=10)
        email_frame.pack(fill="x", padx=10, pady=5)
        
        # Server
        tk.Label(email_frame, text="Email Server:").grid(row=0, column=0, sticky="w", pady=2)
        server_var = tk.StringVar(value=self.config['email']['server'])
        server_entry = tk.Entry(email_frame, textvariable=server_var, width=30)
        server_entry.grid(row=0, column=1, sticky="w", pady=2)
        
        # Username
        tk.Label(email_frame, text="Username:").grid(row=1, column=0, sticky="w", pady=2)
        username_var = tk.StringVar(value=self.config['email']['username'])
        username_entry = tk.Entry(email_frame, textvariable=username_var, width=30)
        username_entry.grid(row=1, column=1, sticky="w", pady=2)
        
        # Password
        tk.Label(email_frame, text="Password:").grid(row=2, column=0, sticky="w", pady=2)
        password_var = tk.StringVar(value=self.config['email']['password'])
        password_entry = tk.Entry(email_frame, textvariable=password_var, show="*", width=30)
        password_entry.grid(row=2, column=1, sticky="w", pady=2)
        
        # API Settings Frame
        api_frame = tk.LabelFrame(parent, text="API Settings", padx=10, pady=10)
        api_frame.pack(fill="x", padx=10, pady=5)
        
        # API URL
        tk.Label(api_frame, text="API URL:").grid(row=0, column=0, sticky="w", pady=2)
        api_url_var = tk.StringVar(value=self.config['api_url'])
        api_url_entry = tk.Entry(api_frame, textvariable=api_url_var, width=30)
        api_url_entry.grid(row=0, column=1, sticky="w", pady=2)
        
        # Monitor Interval
        tk.Label(api_frame, text="Monitor Interval (seconds):").grid(row=1, column=0, sticky="w", pady=2)
        interval_var = tk.StringVar(value=str(self.config['monitor_interval']))
        interval_entry = tk.Entry(api_frame, textvariable=interval_var, width=30)
        interval_entry.grid(row=1, column=1, sticky="w", pady=2)
        
        # Options Frame
        options_frame = tk.LabelFrame(parent, text="Options", padx=10, pady=10)
        options_frame.pack(fill="x", padx=10, pady=5)
        
        # Auto start
        auto_start_var = tk.BooleanVar(value=self.config.get('auto_start', True))
        auto_start_check = tk.Checkbutton(options_frame, text="Start monitoring on app launch", 
                                         variable=auto_start_var)
        auto_start_check.pack(anchor="w")
        
        # Open browser on start
        open_browser_var = tk.BooleanVar(value=self.config.get('open_browser_on_start', True))
        open_browser_check = tk.Checkbutton(options_frame, text="Open browser when monitoring starts", 
                                           variable=open_browser_var)
        open_browser_check.pack(anchor="w")
        
        # Buttons Frame
        buttons_frame = tk.Frame(parent)
        buttons_frame.pack(fill="x", padx=10, pady=10)
        
        def save_settings():
            try:
                # Update config
                self.config['email']['server'] = server_var.get()
                self.config['email']['username'] = username_var.get()
                self.config['email']['password'] = password_var.get()
                self.config['api_url'] = api_url_var.get()
                self.config['monitor_interval'] = int(interval_var.get())
                self.config['auto_start'] = auto_start_var.get()
                self.config['open_browser_on_start'] = open_browser_var.get()
                
                # Save config
                self.save_config()
                
                # Close window
                parent.destroy()
                
                messagebox.showinfo("Success", "Settings saved successfully!")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save settings: {e}")
        
        def cancel_settings():
            parent.destroy()
        
        # Save and Cancel buttons
        tk.Button(buttons_frame, text="Save", command=save_settings, 
                 bg="#4CAF50", fg="white", padx=20).pack(side="left", padx=5)
        tk.Button(buttons_frame, text="Cancel", command=cancel_settings, 
                 bg="#f44336", fg="white", padx=20).pack(side="left", padx=5)
    
    def view_logs(self, icon=None, item=None):
        """View application logs"""
        try:
            log_file = "logs/desktop_app.log"
            if os.path.exists(log_file):
                # Open log file with default text editor
                if sys.platform == "win32":
                    os.startfile(log_file)
                elif sys.platform == "darwin":
                    subprocess.run(["open", log_file])
                else:
                    subprocess.run(["xdg-open", log_file])
            else:
                messagebox.showinfo("Info", "No log file found")
        except Exception as e:
            self.logger.error(f"Error viewing logs: {e}")
            messagebox.showerror("Error", f"Failed to view logs: {e}")
    
    def show_about(self, icon=None, item=None):
        """Show about dialog"""
        about_text = f"""
{self.app_name} v{self.version}

A desktop application for monitoring and processing NRG Systems meteorological data.

Features:
• Email monitoring for RLD attachments
• Automatic RLD to TXT conversion
• Data processing and visualization
• System tray integration
• Web interface access

© 2024 NRG DataSense Platform
        """
        messagebox.showinfo("About", about_text.strip())
    
    def show_notification(self, title, message):
        """Show system notification"""
        try:
            self.tray_icon.notify(title, message)
        except Exception as e:
            self.logger.error(f"Error showing notification: {e}")
    
    def quit_app(self, icon=None, item=None):
        """Quit the application"""
        try:
            self.logger.info("Quitting application...")
            
            # Stop monitoring if running
            if self.is_running:
                self.stop_monitoring()
            
            # Stop tray icon
            if self.tray_icon:
                self.tray_icon.stop()
            
            # Destroy root window
            if self.root:
                self.root.quit()
            
        except Exception as e:
            self.logger.error(f"Error quitting app: {e}")
            sys.exit(1)
    
    def run(self):
        """Run the application"""
        try:
            self.logger.info(f"Starting {self.app_name} v{self.version}")
            
            # Auto-start monitoring if configured
            if self.config.get('auto_start', True):
                threading.Timer(2.0, self.start_monitoring).start()
            
            # Run the tray icon
            self.tray_icon.run()
            
        except Exception as e:
            self.logger.error(f"Error running app: {e}")
            sys.exit(1)

def main():
    """Main function"""
    try:
        app = NRGDataSenseApp()
        app.run()
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
