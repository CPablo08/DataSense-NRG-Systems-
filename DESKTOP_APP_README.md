# 🖥️ NRG DataSense Desktop Application

## 📋 **Overview**

The NRG DataSense Desktop Application is a professional system tray application that runs in the background, monitoring emails for NRG Systems meteorological data, processing RLD files, and providing easy access to the web interface.

## ✨ **Features**

### **🔄 Background Monitoring**
- **Email Monitoring**: Automatically checks emails for RLD attachments
- **RLD to TXT Conversion**: Converts NRG data files using local software
- **Data Processing**: Processes and sends data to the web interface
- **Continuous Operation**: Runs 24/7 in the background

### **🎯 System Tray Integration**
- **Professional Icon**: Custom app icon in system tray
- **Right-Click Menu**: Easy access to all features
- **Status Indicators**: Shows monitoring status
- **Notifications**: System notifications for important events

### **⚙️ Easy Configuration**
- **Settings Dialog**: User-friendly configuration interface
- **Email Setup**: Configure email server, username, and password
- **API Configuration**: Set backend API URL
- **Auto-Start**: Option to start monitoring automatically

### **🌐 Web Interface Access**
- **One-Click Access**: Open web interface from system tray
- **Auto-Launch**: Option to open browser when monitoring starts
- **Backend Management**: Automatically starts backend if needed

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
# Install desktop app requirements
pip install -r desktop_app_requirements.txt

# Or use the launcher (auto-installs dependencies)
python launch_app.py
```

### **2. Generate App Icon**
```bash
# Create professional app icon
python create_app_icon.py
```

### **3. Launch the App**
```bash
# Method 1: Direct launch
python desktop_app.py

# Method 2: Using launcher
python launch_app.py
```

## 🎯 **How It Works**

### **System Tray Icon**
```
┌─────────────────┐
│   📊 NRG        │ ← System Tray Icon
│   DataSense     │
└─────────────────┘
```

### **Right-Click Menu**
```
┌─────────────────────────┐
│ Open Web Interface      │
│ Start Monitoring        │
│ Stop Monitoring         │
│ ─────────────────────── │
│ Settings                │
│ View Logs               │
│ ─────────────────────── │
│ About                   │
│ Quit                    │
└─────────────────────────┘
```

### **Background Process**
```
1. 📧 Check Email → 2. 📁 Download RLD → 3. 🔄 Convert to TXT → 4. 📊 Process Data → 5. 🌐 Send to Web Interface
```

## ⚙️ **Configuration**

### **Email Settings**
- **Server**: Email server (e.g., `imap.gmail.com`)
- **Username**: Your email address
- **Password**: Your email password or app password
- **Search Text**: Text to search for in emails
- **Mail Folder**: Email folder to monitor (default: INBOX)

### **API Settings**
- **API URL**: Backend API URL (default: `http://localhost:5000`)
- **Monitor Interval**: How often to check emails (default: 300 seconds)

### **Options**
- **Auto-Start**: Start monitoring when app launches
- **Open Browser**: Open web interface when monitoring starts

## 🖱️ **User Interface**

### **Settings Dialog**
```
┌─────────────────────────────────────┐
│ NRG DataSense - Settings            │
├─────────────────────────────────────┤
│ Email Settings                      │
│ ┌─────────────────────────────────┐ │
│ │ Server: [imap.gmail.com      ] │ │
│ │ Username: [your@email.com    ] │ │
│ │ Password: [******************] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ API Settings                        │
│ ┌─────────────────────────────────┐ │
│ │ API URL: [http://localhost:5000]│ │
│ │ Monitor Interval: [300        ] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Options                             │
│ ☑ Start monitoring on app launch   │
│ ☑ Open browser when monitoring     │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

### **About Dialog**
```
┌─────────────────────────────────────┐
│ About                               │
├─────────────────────────────────────┤
│ NRG DataSense v1.0.0                │
│                                     │
│ A desktop application for monitoring│
│ and processing NRG Systems          │
│ meteorological data.                │
│                                     │
│ Features:                           │
│ • Email monitoring for RLD          │
│   attachments                       │
│ • Automatic RLD to TXT conversion   │
│ • Data processing and visualization │
│ • System tray integration           │
│ • Web interface access              │
│                                     │
│ © 2024 NRG DataSense Platform       │
└─────────────────────────────────────┘
```

## 📁 **File Structure**

```
DataSense-NRG-Systems-/
├── desktop_app.py              # Main desktop application
├── launch_app.py               # App launcher
├── create_app_icon.py          # Icon generator
├── desktop_app_requirements.txt # Desktop app dependencies
├── app_icon.png               # Generated app icon
├── app_icon_64.png            # 64x64 icon version
├── nrg_client_config.json     # Configuration file
├── logs/                      # Application logs
│   └── desktop_app.log        # Desktop app log
├── downloads/                 # Downloaded email attachments
├── converted/                 # Converted TXT files
└── backend/                   # FastAPI backend
```

## 🔧 **Installation**

### **Automatic Installation**
```bash
# Clone the repository
git clone https://github.com/CPablo08/DataSense-NRG-Systems-.git
cd DataSense-NRG-Systems-

# Install all dependencies
pip install -r desktop_app_requirements.txt

# Generate app icon
python create_app_icon.py

# Launch the app
python desktop_app.py
```

### **Manual Installation**
```bash
# Install required packages
pip install pillow pystray requests nrgpy data_email_client pandas numpy

# Generate icon
python create_app_icon.py

# Run the app
python desktop_app.py
```

## 🎯 **Usage**

### **First Time Setup**
1. **Launch the app**: `python desktop_app.py`
2. **Right-click** the system tray icon
3. **Click "Settings"**
4. **Configure your email settings**:
   - Email server (e.g., `imap.gmail.com`)
   - Username (your email address)
   - Password (your email password or app password)
5. **Set API URL** (default: `http://localhost:5000`)
6. **Click "Save"**

### **Start Monitoring**
1. **Right-click** the system tray icon
2. **Click "Start Monitoring"**
3. **The app will**:
   - Start monitoring emails
   - Show a notification
   - Optionally open the web interface
   - Display status in the tray icon tooltip

### **Access Web Interface**
1. **Right-click** the system tray icon
2. **Click "Open Web Interface"**
3. **The browser will open** to the data visualization platform

### **View Logs**
1. **Right-click** the system tray icon
2. **Click "View Logs"**
3. **Your default text editor** will open with the log file

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. App Won't Start**
```bash
# Check Python version
python --version  # Should be 3.7+

# Check dependencies
pip list | grep -E "(pillow|pystray)"

# Install missing dependencies
pip install -r desktop_app_requirements.txt
```

#### **2. System Tray Icon Not Visible**
- **Windows**: Check system tray overflow area
- **macOS**: Check menu bar (top of screen)
- **Linux**: Check notification area

#### **3. Email Connection Failed**
- Verify email server settings
- Check username and password
- Enable IMAP access in email settings
- For Gmail: Use App Password instead of regular password

#### **4. Backend Connection Failed**
- Ensure backend is running: `python backend/run.py`
- Check API URL in settings
- Verify network connectivity

### **Debug Mode**
```bash
# Run with verbose logging
python desktop_app.py --debug

# Check log file
tail -f logs/desktop_app.log
```

## 🔄 **Integration with Web Platform**

### **Complete Workflow**
```
Desktop App → Email Monitoring → RLD Download → TXT Conversion → Data Processing → Web Interface
```

### **Data Flow**
1. **Desktop App** monitors emails every 5 minutes (configurable)
2. **Downloads** RLD attachments from emails
3. **Converts** RLD to TXT using local NRG software
4. **Processes** data and sends to FastAPI backend
5. **Web Interface** displays the processed data

### **Synchronization**
- **Real-time**: Data appears in web interface immediately after processing
- **Automatic**: No manual intervention required
- **Reliable**: Handles network issues and retries

## 🎨 **Customization**

### **App Icon**
```bash
# Generate custom icon
python create_app_icon.py

# Replace icon files
# - app_icon.png (256x256)
# - app_icon_64.png (64x64)
# - app_icon_32.png (32x32)
# - app_icon_16.png (16x16)
```

### **Configuration**
```json
{
  "email": {
    "server": "your_email_server.com",
    "username": "your_email@domain.com",
    "password": "your_password",
    "search_text": "Custom search text",
    "mail_folder": "INBOX",
    "file_extension": ".rld",
    "download_folder": "./downloads",
    "delete_emails": false,
    "store_password": false
  },
  "nrg": {
    "output_folder": "./converted",
    "file_filter": "000110"
  },
  "api_url": "http://localhost:5000",
  "monitor_interval": 300,
  "max_files_per_batch": 10,
  "auto_start": true,
  "open_browser_on_start": true
}
```

## 📊 **Monitoring and Logs**

### **Log Files**
- **Location**: `logs/desktop_app.log`
- **Format**: Timestamp - Level - Message
- **Rotation**: Automatic (new file each day)

### **Log Levels**
- **INFO**: Normal operations
- **WARNING**: Non-critical issues
- **ERROR**: Critical errors
- **DEBUG**: Detailed debugging information

### **Example Log**
```
2024-01-01 12:00:00 - INFO - Starting NRG DataSense v1.0.0
2024-01-01 12:00:02 - INFO - Starting NRG client monitoring...
2024-01-01 12:00:05 - INFO - Checking for new emails...
2024-01-01 12:00:07 - INFO - Found 2 new RLD files
2024-01-01 12:00:10 - INFO - Converting RLD to TXT...
2024-01-01 12:00:15 - INFO - Successfully converted 2 files
2024-01-01 12:00:18 - INFO - Sending data to API...
2024-01-01 12:00:20 - INFO - Data sent successfully
```

## 🔒 **Security**

### **Password Storage**
- **Local Storage**: Passwords stored locally in JSON file
- **No Encryption**: Consider using environment variables for production
- **File Permissions**: Ensure config file has restricted permissions

### **Network Security**
- **HTTPS**: Use HTTPS for API communication in production
- **Authentication**: Implement API authentication if needed
- **Firewall**: Ensure proper firewall configuration

## 🚀 **Deployment**

### **Production Setup**
1. **Install on server** with email access
2. **Configure email settings** for production email
3. **Set API URL** to production backend
4. **Run as service** for 24/7 operation

### **Service Installation**
```bash
# Create systemd service (Linux)
sudo nano /etc/systemd/system/nrg-datasense.service

# Service file content:
[Unit]
Description=NRG DataSense Desktop App
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/DataSense-NRG-Systems-
ExecStart=/usr/bin/python3 desktop_app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable nrg-datasense
sudo systemctl start nrg-datasense
```

## 📞 **Support**

### **Getting Help**
1. **Check logs**: `logs/desktop_app.log`
2. **Verify configuration**: `nrg_client_config.json`
3. **Test components**: Run each part individually
4. **Check documentation**: This README and other guides

### **Common Solutions**
- **Email issues**: Check server settings and credentials
- **Connection issues**: Verify API URL and network
- **Performance issues**: Adjust monitor interval
- **Icon issues**: Regenerate icon with `create_app_icon.py`

---

**🎉 Enjoy using NRG DataSense Desktop Application!**
