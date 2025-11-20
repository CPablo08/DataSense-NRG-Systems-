# DataSense NRG Systems

Automated meteorological data processing system for NRG Systems data loggers. This application automatically monitors email inboxes for RLD files, converts them to TXT format using the NRG Desktop App, and imports the data into a local database for visualization and analysis.

## Features

- **Email Automation**: Monitors IMAP email inboxes for RLD file attachments
- **RLD Conversion**: Automatically converts RLD files to TXT using NRG Desktop App
- **Data Import**: Imports converted data into SQLite database
- **Data Visualization**: Interactive charts and graphs for sensor data analysis
- **File Management**: Automatic cleanup of processed files
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

Before installing DataSense, ensure you have the following installed on your Windows computer:

1. **Python 3.8 or higher**
   - Download from [python.org](https://www.python.org/downloads/)
   - During installation, check "Add Python to PATH"

2. **Node.js 16 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - This includes npm (Node Package Manager)

3. **Git for Windows** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Or use Git Bash (included with Git for Windows)

4. **NRG SymPRO Desktop** (required for RLD conversion)
   - Download from NRG Systems website
   - Install to default location: `C:\Program Files (x86)\Renewable NRG Systems\SymPRO Desktop\`
   - If installed elsewhere, note the path for configuration

## Installation

### Step 1: Clone or Download the Repository

If you have Git installed:
```bash
git clone <repository-url>
cd DataSense-NRG-Systems-
```

Or download the ZIP file and extract it to your desired location.

### Step 2: Run the Startup Script

The startup script will automatically:
- Create a Python virtual environment
- Install all Python dependencies
- Install all Node.js dependencies
- Start both backend and frontend servers

**Using Git Bash (Recommended):**
1. Right-click in the project folder
2. Select "Git Bash Here"
3. Run: `./start-datasense.sh`

**Using Command Prompt:**
1. Open Command Prompt in the project folder
2. Run: `bash start-datasense.sh`

**Using PowerShell:**
1. Open PowerShell in the project folder
2. Run: `bash start-datasense.sh`

The script will automatically:
- Check for Python and Node.js
- Create virtual environment if needed
- Install dependencies
- Start the application

### Step 3: Access the Application

Once started, the application will automatically open in your default browser at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Configuration

### Email IMAP Configuration

To enable email automation, you need to configure your email settings in `backend/config.py`:

1. Open `backend/config.py` in a text editor
2. Find the `EMAIL_CONFIG` section
3. Update the following values:

```python
EMAIL_CONFIG = {
    "imap_server": "imap.gmail.com",  # Your email provider's IMAP server
    "imap_port": 993,                  # Usually 993 for SSL
    "email_address": "your-email@example.com",  # Your email address
    "email_password": "your-app-password",      # Your email password or app password
    "folder": "INBOX",                 # IMAP folder to monitor (usually "INBOX")
    "scan_interval": 300               # Scan interval in seconds (300 = 5 minutes)
}
```

#### Common IMAP Server Settings

**Gmail:**
- `imap_server`: `imap.gmail.com`
- `imap_port`: `993`
- **Important**: You must use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
  - Go to Google Account → Security → 2-Step Verification → App Passwords
  - Generate an app password for "Mail"
  - Use this 16-character password in the config

**Outlook/Office 365:**
- `imap_server`: `outlook.office365.com`
- `imap_port`: `993`
- Use your regular email password

**Other Providers:**
- Check your email provider's documentation for IMAP server settings
- Common ports: 993 (SSL) or 143 (TLS)

### NRG Desktop App Configuration

The application needs to know where NRG SymPRO Desktop is installed:

1. Open `backend/config.py` in a text editor
2. Find the `NRG_LOCAL_CONFIG` section
3. Verify or update the `sympro_path`:

```python
NRG_LOCAL_CONFIG = {
    "conversion_method": "local",
    "output_folder": "./converted",
    "temp_folder": "./temp_rld",
    "sympro_path": r"C:\Program Files (x86)\Renewable NRG Systems\SymPRO Desktop\SymPRODesktop.exe"
}
```

**Default Installation Path:**
- If SymPRO Desktop is installed in the default location, the path should already be correct
- The default path is: `C:\Program Files (x86)\Renewable NRG Systems\SymPRO Desktop\SymPRODesktop.exe`

**Custom Installation Path:**
- If SymPRO Desktop is installed elsewhere, update the `sympro_path` with the full path to `SymPRODesktop.exe`
- Use raw string format (prefix with `r`) or double backslashes: `r"C:\Custom\Path\SymPRODesktop.exe"`

**Verifying the Path:**
1. Open File Explorer
2. Navigate to where SymPRO Desktop is installed
3. Find `SymPRODesktop.exe`
4. Right-click → Properties → Copy the full path
5. Paste it into the config file

## Running the Application

### Starting the Application

Simply run the startup script:
```bash
./start-datasense.sh
```

The script will:
1. Clean up any existing processes
2. Start the backend server (Python/FastAPI)
3. Start the frontend server (React)
4. Open the application in your browser

### Stopping the Application

Press `Ctrl+C` in the terminal where the script is running. This will:
- Stop the backend server
- Stop the frontend server
- Clean up all processes

## How It Works

1. **Email Monitoring**: The application connects to your email via IMAP and scans the specified folder every 5 minutes (configurable)

2. **File Detection**: When an email with an RLD file attachment is found, the application downloads it

3. **RLD Conversion**: The RLD file is converted to TXT format using NRG SymPRO Desktop via the `nrgpy` library

4. **Data Import**: The converted TXT file is parsed and sensor data is imported into the SQLite database

5. **File Cleanup**: After successful import, both the original RLD file and converted TXT file are deleted

6. **Data Visualization**: Imported data is immediately available in the web interface for viewing and analysis

## Troubleshooting

### Python Not Found

**Error**: `python: command not found`

**Solution**:
- Ensure Python is installed and added to PATH
- Try using `python3` instead of `python`
- Reinstall Python and check "Add Python to PATH" during installation

### Node.js Not Found

**Error**: `npm: command not found`

**Solution**:
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation
- Verify with: `node --version` and `npm --version`

### Port Already in Use

**Error**: Port 3000 or 5000 is already in use

**Solution**:
- Close any other applications using these ports
- The startup script will attempt to kill existing processes automatically
- Manually kill processes:
```bash
  # Windows PowerShell
  Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
  Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
  ```

### Email Connection Failed

**Error**: Cannot connect to IMAP server

**Solutions**:
- Verify your email address and password are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check that IMAP is enabled in your email account settings
- Verify the IMAP server address and port are correct
- Check your firewall/antivirus isn't blocking the connection

### NRG Desktop App Not Found

**Error**: SymPRODesktop.exe not found

**Solutions**:
- Verify SymPRO Desktop is installed
- Check the path in `backend/config.py` is correct
- Ensure the path uses raw string format (prefix with `r`) or double backslashes
- Try running SymPRO Desktop manually to ensure it's working

### RLD Conversion Fails

**Error**: RLD file conversion fails

**Solutions**:
- Ensure SymPRO Desktop is installed and the path is correct
- Verify the RLD file is not corrupted
- Check that SymPRO Desktop can open the file manually
- Review `backend.log` for detailed error messages

### Virtual Environment Issues

**Error**: Module not found or import errors

**Solutions**:
- Delete the `backend/venv` folder
- Run the startup script again (it will recreate the virtual environment)
- Manually activate and install:
```bash
  cd backend
  python -m venv venv
  venv\Scripts\activate  # Windows
  python -m pip install -r requirements.txt
  ```

## File Structure

```
DataSense-NRG-Systems-/
├── backend/
│   ├── app.py              # Main FastAPI application
│   ├── config.py           # Configuration file (EDIT THIS!)
│   ├── database.py          # Database models
│   ├── email_service.py     # Email monitoring service
│   ├── requirements.txt    # Python dependencies
│   ├── venv/               # Python virtual environment (auto-created)
│   └── instance/
│       └── nrg_config.db   # SQLite database (auto-created)
├── src/
│   ├── App.js              # Main React application
│   └── services/
│       └── api.js          # API service layer
├── start-datasense.sh      # Startup script
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review log files: `backend.log` and `frontend.log`
3. Verify all configuration settings in `backend/config.py`
4. Ensure all prerequisites are installed correctly

## License

[Add your license information here]

## Version

Current Version: 1.0.0

