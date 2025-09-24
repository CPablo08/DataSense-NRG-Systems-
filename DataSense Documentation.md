# DataSense Documentation
## Professional Meteorological Data Processing System

---

## 📋 **TABLE OF CONTENTS**

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Windows VM Setup](#windows-vm-setup)
4. [Installation & Setup](#installation--setup)
5. [Using DataSense](#using-datasense)
6. [Features & Functionality](#features--functionality)
7. [Troubleshooting](#troubleshooting)
8. [Error Handling](#error-handling)
9. [Maintenance](#maintenance)
10. [Technical Details](#technical-details)

---

## 🎯 **OVERVIEW**

DataSense is a comprehensive desktop application for processing NRG Systems meteorological data. It features automated RLD file conversion, email processing, interactive data visualization, and professional database management.

### **Key Features:**
- **Local RLD Conversion** using nrgpy with NRG Systems software
- **Email Automation** for automatic RLD file processing
- **Interactive Dashboard** with real-time data visualization
- **Database Management** with SQLite storage
- **Professional UI** with status monitoring
- **Cross-platform VM Support** for universal deployment

---

## 🖥️ **SYSTEM REQUIREMENTS**

### **Host System (Any OS):**
- **RAM:** 8GB minimum (4GB for host + 4GB for VM)
- **Storage:** 50GB+ free space
- **CPU:** 4+ cores recommended
- **Software:** VirtualBox, VMware, or Parallels

### **Windows VM Requirements:**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 6GB recommended
- **Storage:** 50GB+ free space
- **Network:** Internet connection for dependencies
- **Software:** NRG Systems software (for RLD conversion)

---

## 🚀 **WINDOWS VM SETUP**

### **Step 1: Choose Virtualization Software**

#### **Option A: VirtualBox (Free)**
1. Download VirtualBox from https://www.virtualbox.org/wiki/Downloads
2. Install VirtualBox following the installation wizard
3. Create new VM with Windows 10/11 template

#### **Option B: VMware (Professional)**
1. Download VMware Workstation/Fusion from https://www.vmware.com/products/workstation-pro.html
2. Install VMware following the installation wizard
3. Create new VM with Windows 10/11 template

#### **Option C: Parallels (Mac Only)**
1. Download Parallels Desktop from https://www.parallels.com/products/desktop/
2. Install Parallels following the installation wizard
3. Create new VM with Windows 10/11 template

### **Step 2: Configure Windows VM**

#### **VM Settings:**
- **Name:** DataSense-Windows
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 6GB recommended
- **Storage:** 50GB+ (dynamically allocated)
- **Network:** NAT or Bridged
- **Display:** 3D acceleration enabled

#### **Windows Installation:**
1. Download Windows ISO from Microsoft
2. Boot VM from Windows ISO
3. Install Windows following standard process
4. Install VM tools (VirtualBox Guest Additions, VMware Tools, etc.)

### **Step 3: Install NRG Systems Software**

1. Download NRG Systems software from official website
2. Install NRG Systems software in Windows VM
3. Configure for local conversion
4. Test with sample RLD file

---

## 📦 **INSTALLATION & SETUP**

### **Step 1: Download DataSense**

```bash
# Clone or download the repository inside Windows VM
git clone https://github.com/CPablo08/DataSense-NRG-Systems-.git
cd DataSense-NRG-Systems-
```

### **Step 2: Start DataSense**

```bash
# Double-click the start script inside Windows VM
start-datasense.bat
```

**The script will automatically:**
- ✅ Install Node.js and Python if missing
- ✅ Install all dependencies
- ✅ Set up the complete environment
- ✅ Start the desktop application

### **Step 3: First-Time Setup**

1. **Wait for automatic setup** (first time only)
2. **DataSense opens** in Windows VM
3. **Configure email settings** (optional)
4. **Test with sample RLD file**

---

## 🎮 **USING DATASENSE**

### **📁 Importing RLD Files**

#### **Manual Import:**
1. **Click "Import RLD File"** button in the main dashboard
2. **Select your .rld file** using the native file dialog
3. **Data automatically converts** using nrgpy local conversion
4. **Data appears immediately** on the interactive dashboard

#### **Email Automation:**
1. **Configure email settings** in DataSense
2. **Email automation** processes RLD files automatically
3. **Converted data** appears on dashboard
4. **Professional workflow** with minimal user intervention

### **📊 Dashboard Features**

#### **Real-time Charts:**
- **Wind Speed & Direction** - Interactive wind rose
- **Temperature & Humidity** - Environmental data
- **Solar Irradiance** - Solar panel performance
- **Battery Status** - Power system monitoring
- **Rainfall** - Precipitation tracking

#### **Status Panel:**
- **Frontend Status** - React application health
- **Backend Status** - FastAPI server status
- **Email Automation** - Email service status
- **RLD Processing** - File conversion status
- **Database Status** - SQLite database health

#### **Library Management:**
- **File Browser** - View all processed files
- **Search & Filter** - Find specific data
- **Export Options** - Download data in various formats
- **Delete Files** - Remove unwanted data

---

## ⚙️ **FEATURES & FUNCTIONALITY**

### **🔧 Core Features**

#### **RLD File Processing:**
- **Local Conversion** using nrgpy with NRG Systems software
- **Automatic Processing** of RLD files to TXT format
- **Data Extraction** from converted files
- **Database Storage** with SQLite
- **Real-time Visualization** on dashboard

#### **Email Automation:**
- **IMAP Client** for email monitoring
- **Attachment Processing** for RLD files
- **Automatic Conversion** using nrgpy
- **Database Registration** of processed files
- **Status Monitoring** with real-time updates

#### **Data Visualization:**
- **Interactive Charts** with Recharts
- **Real-time Updates** via WebSocket
- **Multiple Sensor Types** support
- **Time Series Analysis** capabilities
- **Export to PDF** functionality

#### **Database Management:**
- **SQLite Database** for data storage
- **File Metadata** tracking
- **Sensor Data** storage
- **Library Management** with CRUD operations
- **Statistics & Analytics** reporting

### **🎯 Advanced Features**

#### **Status Monitoring:**
- **Real-time Status** indicators
- **Auto-refresh** every 10 seconds
- **Timeout Handling** for unresponsive services
- **Error Detection** and reporting
- **System Health** monitoring

#### **File Management:**
- **Library System** with file organization
- **Search & Filter** capabilities
- **Bulk Operations** for multiple files
- **Export Options** in various formats
- **File Metadata** tracking

#### **User Interface:**
- **Professional Design** with dark theme
- **Responsive Layout** for different screen sizes
- **Interactive Controls** with tooltips
- **Progress Indicators** for long operations
- **Error Messages** with helpful guidance

---

## 🔧 **TROUBLESHOOTING**

### **🚨 Common Issues**

#### **Backend Not Starting:**
```
Error: Backend service is not available
```
**Solution:**
1. Check if Python is installed: `python --version`
2. Check if dependencies are installed: `pip install -r requirements.txt`
3. Check if port 5000 is available: `netstat -an | findstr :5000`
4. Restart the backend: `python app.py`

#### **Database Connection Failed:**
```
Error: Database connection failed
```
**Solution:**
1. Check if SQLite database exists: `ls backend/nrg_config.db`
2. Check database permissions
3. Restart the backend service
4. Check database schema: `python -c "from database import create_tables; create_tables()"`

#### **RLD Conversion Failed:**
```
Error: Failed to convert RLD file
```
**Solution:**
1. Verify NRG Systems software is installed
2. Check if nrgpy is properly installed: `pip install nrgpy`
3. Test with a known good RLD file
4. Check file permissions and paths

#### **Email Automation Not Working:**
```
Error: Email credentials not configured
```
**Solution:**
1. Configure email settings in the application
2. Check email server settings
3. Verify email credentials
4. Test email connection manually

### **🔍 Diagnostic Commands**

#### **Check System Status:**
```bash
# Check backend status
curl http://localhost:5000/health

# Check database status
curl http://localhost:5000/api/library/stats

# Check email status
curl http://localhost:5000/api/email/status
```

#### **Check Dependencies:**
```bash
# Check Python packages
pip list | grep -E "(nrgpy|fastapi|sqlalchemy)"

# Check Node.js packages
npm list

# Check system resources
tasklist | findstr python
tasklist | findstr node
```

---

## ⚠️ **ERROR HANDLING**

### **🚨 Error Types & Solutions**

#### **File Processing Errors:**
- **Invalid RLD File** - Check file format and integrity
- **Conversion Failed** - Verify NRG Systems software installation
- **Database Error** - Check database connection and schema
- **Memory Error** - Check available system resources

#### **Network Errors:**
- **Connection Timeout** - Check network connectivity
- **Port Conflicts** - Verify port 5000 is available
- **Firewall Issues** - Check Windows Firewall settings
- **Proxy Problems** - Configure proxy settings if needed

#### **Database Errors:**
- **Schema Mismatch** - Run database migration
- **Permission Denied** - Check file permissions
- **Disk Space** - Verify sufficient storage space
- **Corruption** - Restore from backup if available

### **🔄 Recovery Procedures**

#### **System Recovery:**
1. **Stop all services** (backend and frontend)
2. **Check system resources** (RAM, disk space)
3. **Restart services** in correct order
4. **Verify database integrity**
5. **Test with sample data**

#### **Data Recovery:**
1. **Check database backup** if available
2. **Restore from backup** if necessary
3. **Re-process files** if needed
4. **Verify data integrity**
5. **Update system status**

---

## 🛠️ **MAINTENANCE**

### **📅 Regular Maintenance**

#### **Daily Tasks:**
- **Check system status** indicators
- **Monitor email automation** logs
- **Verify database** integrity
- **Check disk space** usage
- **Review error logs**

#### **Weekly Tasks:**
- **Backup database** files
- **Clean temporary** files
- **Update dependencies** if needed
- **Review system** performance
- **Check for updates**

#### **Monthly Tasks:**
- **Full system backup**
- **Dependency updates**
- **Performance optimization**
- **Security updates**
- **Documentation review**

### **🔧 Maintenance Commands**

#### **Database Maintenance:**
```bash
# Backup database
cp backend/nrg_config.db backup/nrg_config_$(date +%Y%m%d).db

# Check database integrity
python -c "from database import get_db; db = next(get_db()); print('Database OK')"

# Clean old data
python -c "from database import clean_old_data; clean_old_data()"
```

#### **System Maintenance:**
```bash
# Check system resources
systeminfo | findstr "Total Physical Memory"
dir backend\*.db /s

# Clean temporary files
del /q backend\uploads\*
del /q backend\converted\*
del /q backend\logs\*.log
```

---

## 🔬 **TECHNICAL DETAILS**

### **🏗️ Architecture**

#### **System Components:**
```
DataSense Application
├── React Frontend (Port 3000)
│   ├── Interactive Dashboard
│   ├── Status Monitoring
│   ├── File Management
│   └── Data Visualization
├── FastAPI Backend (Port 5000)
│   ├── RLD Processing
│   ├── Email Automation
│   ├── Database Management
│   └── API Endpoints
├── SQLite Database
│   ├── File Metadata
│   ├── Sensor Data
│   └── System Logs
└── NRG Systems Software
    ├── RLD Conversion
    ├── Data Processing
    └── File Management
```

#### **Technology Stack:**
- **Frontend:** React 18, Styled Components, Recharts
- **Backend:** FastAPI, SQLAlchemy, nrgpy
- **Database:** SQLite with SQLAlchemy ORM
- **Processing:** nrgpy for RLD conversion
- **Email:** IMAP client for automation
- **Visualization:** Recharts for interactive charts

### **📊 Database Schema**

#### **FileMetadata Table:**
```sql
CREATE TABLE file_metadata (
    id INTEGER PRIMARY KEY,
    filename VARCHAR,
    timestamp DATETIME,
    records_added INTEGER,
    records_count INTEGER,
    file_size INTEGER,
    file_type VARCHAR,
    processing_date VARCHAR,
    upload_date DATETIME,
    status VARCHAR,
    tags JSON,
    source VARCHAR,
    category VARCHAR,
    description TEXT,
    version INTEGER,
    checksum VARCHAR,
    last_accessed DATETIME
);
```

#### **SensorData Table:**
```sql
CREATE TABLE sensor_data (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    time VARCHAR,
    NRG_40C_Anem FLOAT,
    NRG_200M_Vane FLOAT,
    NRG_T60_Temp FLOAT,
    NRG_RH5X_Humi FLOAT,
    NRG_BP60_Baro FLOAT,
    Rain_Gauge FLOAT,
    NRG_PVT1_PV_Temp FLOAT,
    PSM_c_Si_Isc_Soil FLOAT,
    PSM_c_Si_Isc_Clean FLOAT,
    Average_12V_Battery FLOAT,
    Solar_Irradiance_1 FLOAT,
    Solar_Irradiance_2 FLOAT,
    Solar_Irradiance_3 FLOAT,
    file_source VARCHAR
);
```

### **🔌 API Endpoints**

#### **Core Endpoints:**
- `GET /health` - System health check
- `GET /api/data` - Get all processed data
- `POST /api/upload-rld` - Upload and convert RLD files
- `GET /api/files` - Get file metadata
- `DELETE /api/files/{filename}` - Delete files

#### **Library Management:**
- `GET /api/library/files` - Get library files
- `POST /api/library/add` - Add files to library
- `DELETE /api/library/files/{id}` - Delete library files
- `GET /api/library/stats` - Get library statistics
- `GET /api/library/export/{id}` - Export file data

#### **Email Automation:**
- `POST /api/email/start` - Start email service
- `POST /api/email/stop` - Stop email service
- `GET /api/email/status` - Get email status
- `GET /api/email/test-database` - Test database connection
- `POST /api/email/manual-scan` - Manual email scan

### **📁 File Structure**

```
DataSense-NRG-Systems-/
├── start-datasense.bat              # Windows start script
├── backend/                         # Python backend
│   ├── app.py                      # FastAPI application
│   ├── database.py                 # Database models
│   ├── email_service.py            # Email automation
│   ├── config.py                   # Configuration
│   ├── requirements.txt            # Python dependencies
│   └── nrg_config.db               # SQLite database
├── src/                            # React frontend
│   ├── App.js                      # Main React component
│   ├── services/api.js             # API service
│   └── components/                 # React components
├── public/                         # Static assets
│   ├── index.html                  # HTML template
│   └── assets/                     # Images and icons
└── package.json                    # Node.js dependencies
```

### **🔧 Configuration**

#### **Backend Configuration:**
```python
# Email settings
EMAIL_CONFIG = {
    "server": "imap.gmail.com",
    "username": "your-email@gmail.com",
    "password": "your-app-password",
    "scan_interval": 300
}

# NRG settings
NRG_LOCAL_CONFIG = {
    "conversion_method": "local",
    "output_folder": "./converted"
}
```

#### **Frontend Configuration:**
```javascript
// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nrg-datasense-backend.onrender.com'
  : 'http://localhost:5000';
```

---

## 🎉 **CONCLUSION**

DataSense is a comprehensive meteorological data processing system designed for professional use. With its Windows VM deployment strategy, it provides universal compatibility while maintaining full NRG Systems software integration.

### **Key Benefits:**
- **Universal Deployment** - Works on any host OS via Windows VM
- **Professional Features** - Complete data processing workflow
- **Real-time Monitoring** - Comprehensive status indicators
- **Easy Maintenance** - Automated setup and configuration
- **Reliable Operation** - Robust error handling and recovery

### **Support:**
For technical support or questions, refer to this documentation or contact the system administrator.

**DataSense - Professional Meteorological Data Processing Made Simple!** 🚀

---

*Last Updated: January 2025*
*Version: 1.0.0*
*Documentation: Complete*
