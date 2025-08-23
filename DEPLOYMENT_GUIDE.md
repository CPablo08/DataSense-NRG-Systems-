# 🚀 NRG DataSense Platform - Deployment Guide

## 📋 **Overview**

This guide explains how to deploy the NRG DataSense Platform on Render and set up the local client for complete functionality.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local Client  │    │   FastAPI Backend│    │  React Frontend │
│   (Your PC)     │    │   (Render)       │    │  (Render)       │
│                 │    │                  │    │                 │
│ • Email Monitor │───▶│ • POST /api/data │◀───│ • File Upload   │
│ • RLD→TXT Conv  │    │ • Data Storage   │    │ • Visualization │
│ • Data Process  │    │ • TXT Processing │    │ • Charts/Graphs │
│ • API Client    │    │ • CSV Generation │    │ • Reports       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 **Deployment Strategy**

### **1. Render Deployment (Backend + Frontend)**
- **FastAPI Backend**: Web service on Render
- **React Frontend**: Static site on Render
- **No Database**: Simplified architecture

### **2. Local Client (Your Computer)**
- **Email Monitoring**: Runs on your local machine
- **RLD Conversion**: Uses local NRG software
- **Data Processing**: Processes and sends data to Render backend

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Your Code**

1. **Make sure all changes are committed:**
```bash
git add .
git commit -m "Ready for deployment - new FastAPI architecture"
git push origin main
```

2. **Use the startup script to prepare:**
```bash
chmod +x start_all.sh
./start_all.sh deploy
```

### **Step 2: Deploy to Render**

1. **Go to Render Dashboard:**
   - Visit: https://render.com
   - Sign in with your GitHub account

2. **Create Blueprint Deployment:**
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository: `CPablo08/DataSense-NRG-Systems-`
   - Select branch: **`main`**
   - Click **"Apply"** to deploy

3. **Wait for Deployment:**
   - Render will automatically deploy both services
   - Backend: `nrg-datasense-backend`
   - Frontend: `nrg-datasense-frontend`

### **Step 3: Configure Local Client**

1. **Create local client configuration:**
```bash
./start_all.sh config
```

2. **Edit the configuration file:**
```bash
nano nrg_client_config.json
```

3. **Update with your settings:**
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
  "api_url": "https://nrg-datasense-backend.onrender.com",
  "monitor_interval": 300,
  "max_files_per_batch": 10
}
```

### **Step 4: Start All Services**

1. **Install dependencies and start everything:**
```bash
./start_all.sh start
```

2. **Check status:**
```bash
./start_all.sh status
```

## 🔧 **Service URLs**

After deployment, your services will be available at:

- **Frontend**: `https://nrg-datasense-frontend.onrender.com`
- **Backend**: `https://nrg-datasense-backend.onrender.com`
- **Health Check**: `https://nrg-datasense-backend.onrender.com/health`

## 📊 **Data Flow After Deployment**

### **Automatic Data Processing:**
1. **Local Client** monitors your email for RLD attachments
2. **Downloads** RLD files to local directory
3. **Converts** RLD to TXT using local NRG software
4. **Processes** TXT data and extracts sensor readings
5. **Sends** processed data to Render backend via API
6. **Frontend** displays data in real-time

### **Manual TXT Upload:**
1. **Upload** TXT files directly through the frontend
2. **Process** files for visualization
3. **View** charts, graphs, and reports

## 🛠️ **Management Commands**

### **Start All Services:**
```bash
./start_all.sh start
```

### **Stop All Services:**
```bash
./start_all.sh stop
```

### **Check Status:**
```bash
./start_all.sh status
```

### **View Logs:**
```bash
./start_all.sh logs backend    # Backend logs
./start_all.sh logs frontend   # Frontend logs
./start_all.sh logs local      # Local client logs
```

### **Install Dependencies:**
```bash
./start_all.sh install
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Backend Not Starting:**
   ```bash
   ./start_all.sh logs backend
   ```
   - Check if port 5000 is available
   - Verify Python dependencies are installed

2. **Frontend Not Starting:**
   ```bash
   ./start_all.sh logs frontend
   ```
   - Check if port 3000 is available
   - Verify Node.js dependencies are installed

3. **Local Client Issues:**
   ```bash
   ./start_all.sh logs local
   ```
   - Check email configuration
   - Verify NRG software is installed
   - Check API URL in config

4. **Render Deployment Issues:**
   - Check Render logs in dashboard
   - Verify environment variables
   - Check build commands

### **Email Configuration Issues:**

1. **IMAP Access:**
   - Enable IMAP in your email settings
   - Use app-specific passwords if 2FA is enabled

2. **Server Settings:**
   - Gmail: `imap.gmail.com`
   - Outlook: `outlook.office365.com`
   - Yahoo: `imap.mail.yahoo.com`

### **NRG Software Issues:**

1. **Installation:**
   - Ensure NRG software is installed on your machine
   - Verify `nrgpy` library is working

2. **File Permissions:**
   - Check write permissions for download and output folders
   - Ensure RLD files are accessible

## 🔄 **Updating After Changes**

1. **Commit and push changes:**
```bash
git add .
git commit -m "Update description"
git push origin main
```

2. **Render will automatically redeploy** (if auto-deploy is enabled)

3. **Update local client if needed:**
```bash
./start_all.sh stop
./start_all.sh start
```

## 📈 **Monitoring and Maintenance**

### **Health Checks:**
- **Backend**: `https://nrg-datasense-backend.onrender.com/health`
- **Frontend**: Check if accessible in browser
- **Local Client**: Check logs for activity

### **Log Monitoring:**
```bash
# Monitor all logs in real-time
tail -f backend.log frontend.log local_client.log
```

### **Performance Monitoring:**
- **Render Dashboard**: Monitor service performance
- **Local Client**: Check processing times in logs
- **Email Monitoring**: Verify attachment downloads

## 🎯 **Benefits of This Architecture**

✅ **Cost Effective**: No database costs, minimal API usage
✅ **Reliable**: Local processing, no external dependencies
✅ **Scalable**: Easy to add more local clients
✅ **Secure**: Sensitive data stays local until processed
✅ **Fast**: Local RLD conversion is much faster
✅ **Simple**: Clear separation of concerns

## 📞 **Support**

For issues or questions:
1. Check the logs using `./start_all.sh logs [service]`
2. Verify configuration settings
3. Test each component individually
4. Check Render dashboard for deployment issues

## 🚀 **Next Steps**

After successful deployment:
1. **Test the platform** with sample TXT files
2. **Configure email monitoring** with your email settings
3. **Set up automatic data processing** with RLD files
4. **Monitor the system** for optimal performance
