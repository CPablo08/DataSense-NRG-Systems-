# NRG DataSense Platform - New Architecture

## 🎯 **Overview**

This platform has been redesigned with a **local-first approach** for better performance, reliability, and cost-effectiveness. The new architecture separates concerns and uses local NRG software for RLD conversion.

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local Client  │    │   FastAPI Backend│    │  React Frontend │
│                 │    │                  │    │                 │
│ • Email Monitor │───▶│ • POST /api/data │◀───│ • File Upload   │
│ • RLD→TXT Conv  │    │ • Data Storage   │    │ • Visualization │
│ • Data Process  │    │ • TXT Processing │    │ • Charts/Graphs │
│ • API Client    │    │ • CSV Generation │    │ • Reports       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 **Components**

### **1. React Frontend (`src/`)**
- **Purpose**: Data visualization and user interface
- **Features**: 
  - TXT file upload and processing
  - Real-time data visualization
  - Sensor unit configuration
  - PDF report generation
  - Multi-language support (English/Spanish)

### **2. FastAPI Backend (`backend/`)**
- **Purpose**: API server for data processing and storage
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /api/upload-data` - Receive processed data from local client
  - `GET /api/data` - Retrieve processed data for frontend

### **3. Local NRG Client (`local_nrg_client.py`)**
- **Purpose**: Monitor emails, convert RLD files locally, send data to API
- **Features**:
  - Email monitoring for RLD attachments
  - Local RLD to TXT conversion using `nrgpy`
  - Data processing and validation
  - Automatic API data upload

## 🚀 **Setup Instructions**

### **Step 1: Install Dependencies**

#### **Frontend (React)**
```bash
npm install
```

#### **Backend (FastAPI)**
```bash
cd backend
pip install -r requirements.txt
```

#### **Local Client**
```bash
pip install -r local_client_requirements.txt
```

### **Step 2: Configure Local Client**

1. **Edit `nrg_client_config.json`** (created automatically on first run):
```json
{
  "email": {
    "server": "your_email_server.com",
    "username": "your_email@domain.com",
    "password": "your_password",
    "search_text": "SymphoniePRO Logger data attached.",
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
  "max_files_per_batch": 10
}
```

### **Step 3: Start Services**

#### **Start FastAPI Backend**
```bash
cd backend
python run.py
```
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

#### **Start React Frontend**
```bash
npm start
```
- **URL**: http://localhost:3000

#### **Start Local NRG Client**
```bash
python local_nrg_client.py
```

## 🔧 **Usage Workflow**

### **Automatic Data Processing**
1. **Local Client** monitors email for RLD attachments
2. **Downloads** RLD files to local directory
3. **Converts** RLD to TXT using local NRG software
4. **Processes** TXT data and extracts sensor readings
5. **Sends** processed data to FastAPI backend
6. **Frontend** displays data in real-time

### **Manual TXT Upload**
1. **Upload** TXT files directly through frontend
2. **Process** files for visualization
3. **View** charts, graphs, and reports

## 📊 **Data Flow**

```
Email with RLD → Local Client → RLD→TXT → Process Data → FastAPI → Frontend
     ↓              ↓           ↓         ↓           ↓         ↓
  Monitor      Download    Convert    Extract    Store    Visualize
```

## 🛠️ **Configuration**

### **Email Settings**
- **Server**: Your email server (IMAP)
- **Username**: Email address
- **Password**: Email password
- **Search Text**: Text to search for in email body
- **File Extension**: `.rld` for RLD files

### **NRG Settings**
- **Output Folder**: Where converted TXT files are saved
- **File Filter**: Filter for specific station files (e.g., "000110")

### **API Settings**
- **API URL**: FastAPI backend URL
- **Monitor Interval**: How often to check for new emails (seconds)
- **Max Files**: Maximum files to process per batch

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Email Connection Failed**
   - Check email server settings
   - Verify username/password
   - Enable IMAP access in email settings

2. **RLD Conversion Failed**
   - Ensure NRG software is installed
   - Check file permissions
   - Verify RLD file format

3. **API Connection Failed**
   - Ensure FastAPI backend is running
   - Check API URL in config
   - Verify network connectivity

### **Logs**
- **Local Client**: `nrg_client.log`
- **Backend**: Console output
- **Frontend**: Browser console

## 🚀 **Deployment**

### **Render Deployment**
1. **Backend**: Deploy FastAPI to Render
2. **Frontend**: Deploy React to Render
3. **Local Client**: Run on your local machine

### **Environment Variables**
```bash
# Backend
DATABASE_URL=postgresql://...
REACT_APP_API_URL=https://your-backend.onrender.com

# Local Client
API_URL=https://your-backend.onrender.com
```

## 📈 **Benefits of New Architecture**

✅ **Better Performance** - Local RLD conversion is faster than cloud API
✅ **More Reliable** - No dependency on external NRG Cloud API
✅ **Cost Effective** - No API usage fees
✅ **Real-time Processing** - Email monitoring for automatic data ingestion
✅ **Simpler Architecture** - Clear separation of concerns
✅ **Better Security** - Sensitive data stays local until processed

## 🔄 **Migration from Old Architecture**

The platform has been simplified:
- ❌ Removed RLD upload from frontend
- ❌ Removed NRG API configuration
- ❌ Removed folder selection workflow
- ✅ Added local email monitoring
- ✅ Added local RLD conversion
- ✅ Simplified backend to FastAPI

## 📞 **Support**

For issues or questions:
1. Check the logs for error messages
2. Verify configuration settings
3. Ensure all dependencies are installed
4. Test each component individually
