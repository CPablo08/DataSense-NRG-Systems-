# 🚀 NRG DataSense Platform - Deployment Guide

## 📋 **Overview**

This guide explains how to deploy the NRG DataSense Platform to Render with the new architecture:
- **FastAPI Backend** (Render Web Service)
- **React Frontend** (Render Static Site)
- **Local NRG Client** (Your Computer)

## 🏗️ **Architecture on Render**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Local Client  │    │   FastAPI Backend│    │  React Frontend │
│   (Your PC)     │───▶│   (Render)       │◀───│  (Render)       │
│                 │    │                  │    │                 │
│ • Email Monitor │    │ • POST /api/data │    │ • Visualization │
│ • RLD→TXT Conv  │    │ • Data Storage   │    │ • Charts/Graphs │
│ • Data Process  │    │ • TXT Processing │    │ • Reports       │
│ • API Client    │    │ • CSV Generation │    │ • File Upload   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 **Step 1: Prepare for Deployment**

### **1.1 Update Local Client Configuration**

Before deploying, update your local client to point to the deployed backend:

```bash
# Edit nrg_client_config.json
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
  "api_url": "https://nrg-datasense-backend.onrender.com",  # ← Updated URL
  "monitor_interval": 300,
  "max_files_per_batch": 10
}
```

### **1.2 Commit and Push Changes**

```bash
git add .
git commit -m "Prepare for Render deployment - FastAPI backend"
git push origin main
```

## 🚀 **Step 2: Deploy to Render**

### **2.1 Create Render Account**

1. Go to [https://render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

### **2.2 Deploy Using Blueprint**

1. **Click "New +"** → **"Blueprint"**
2. **Connect Repository**: `CPablo08/DataSense-NRG-Systems-`
3. **Select Branch**: `main`
4. **Click "Apply"**

### **2.3 Manual Deployment (Alternative)**

If Blueprint doesn't work, deploy services manually:

#### **Deploy Backend (FastAPI)**
1. **Click "New +"** → **"Web Service"**
2. **Connect Repository**: `CPablo08/DataSense-NRG-Systems-`
3. **Configure**:
   - **Name**: `nrg-datasense-backend`
   - **Environment**: `Python`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python run.py`
   - **Plan**: `Free`

#### **Deploy Frontend (React)**
1. **Click "New +"** → **"Static Site"**
2. **Connect Repository**: `CPablo08/DataSense-NRG-Systems-`
3. **Configure**:
   - **Name**: `nrg-datasense-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: `Free`

4. **Add Environment Variable**:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://nrg-datasense-backend.onrender.com`

## 🔧 **Step 3: Configure Local Client**

### **3.1 Install Local Dependencies**

```bash
# Install local client dependencies
pip install -r local_client_requirements.txt

# Or use the startup script
chmod +x start_all.sh
./start_all.sh
```

### **3.2 Configure Email Settings**

Edit `nrg_client_config.json` with your email settings:

```json
{
  "email": {
    "server": "imap.gmail.com",           // Your email server
    "username": "your_email@gmail.com",   // Your email
    "password": "your_app_password",      // Your password
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

### **3.3 Email Configuration Tips**

#### **Gmail Setup**
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account Settings
   - Security → App Passwords
   - Generate password for "Mail"
3. Use App Password in config

#### **Other Email Providers**
- **Outlook**: `outlook.office365.com`
- **Yahoo**: `imap.mail.yahoo.com`
- **Custom**: Check your email provider's IMAP settings

## 🚀 **Step 4: Start All Services**

### **4.1 Using the Startup Script**

```bash
# Make script executable
chmod +x start_all.sh

# Start all services
./start_all.sh

# Check status
./start_all.sh status

# View logs
./start_all.sh logs backend
./start_all.sh logs frontend
./start_all.sh logs local_client
```

### **4.2 Manual Startup**

```bash
# Terminal 1: Start Backend
cd backend
python run.py

# Terminal 2: Start Frontend
npm start

# Terminal 3: Start Local Client
python local_nrg_client.py
```

## 🌐 **Step 5: Access Your Platform**

### **Deployed URLs**
- **Frontend**: `https://nrg-datasense-frontend.onrender.com`
- **Backend API**: `https://nrg-datasense-backend.onrender.com`
- **Health Check**: `https://nrg-datasense-backend.onrender.com/health`

### **Local URLs**
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

## 🔍 **Step 6: Testing**

### **6.1 Test Backend**
```bash
# Test health endpoint
curl https://nrg-datasense-backend.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "service": "nrg-datasense-api",
  "timestamp": "2024-01-01T12:00:00",
  "version": "1.0.0"
}
```

### **6.2 Test Frontend**
1. Open frontend URL in browser
2. Upload a TXT file
3. Verify data visualization works

### **6.3 Test Local Client**
1. Send an email with RLD attachment
2. Check local client logs: `./start_all.sh logs local_client`
3. Verify data appears in frontend

## 🔧 **Step 7: Monitoring & Maintenance**

### **7.1 View Logs**
```bash
# View all logs
./start_all.sh logs backend
./start_all.sh logs frontend
./start_all.sh logs local_client

# Or view log files directly
tail -f backend.log
tail -f frontend.log
tail -f local_client.log
```

### **7.2 Check Service Status**
```bash
./start_all.sh status
```

### **7.3 Restart Services**
```bash
./start_all.sh restart
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Backend Deployment Failed**
- Check build logs in Render dashboard
- Verify `backend/requirements.txt` is correct
- Ensure `backend/run.py` exists and is executable

#### **2. Frontend Can't Connect to Backend**
- Verify `REACT_APP_API_URL` environment variable
- Check CORS settings in backend
- Test backend health endpoint

#### **3. Local Client Connection Failed**
- Verify `api_url` in `nrg_client_config.json`
- Check network connectivity
- Test with `curl` command

#### **4. Email Connection Failed**
- Verify email server settings
- Check username/password
- Enable IMAP access in email settings

### **Debug Commands**
```bash
# Test backend locally
cd backend
python run.py

# Test frontend locally
npm start

# Test local client
python local_nrg_client.py

# Check all processes
ps aux | grep -E "(python|node)" | grep -v grep
```

## 📊 **Performance Monitoring**

### **Render Dashboard**
- Monitor service health
- Check response times
- View error logs
- Monitor resource usage

### **Local Monitoring**
```bash
# Check service status
./start_all.sh status

# Monitor logs in real-time
./start_all.sh logs backend &
./start_all.sh logs frontend &
./start_all.sh logs local_client &
```

## 🔄 **Updates and Maintenance**

### **Update Deployed Services**
```bash
# Push changes to GitHub
git add .
git commit -m "Update description"
git push origin main

# Render will automatically redeploy
```

### **Update Local Client**
```bash
# Pull latest changes
git pull origin main

# Restart local client
./start_all.sh restart
```

## 💰 **Cost Considerations**

### **Render Free Tier**
- **Backend**: 750 hours/month (free)
- **Frontend**: Unlimited (free)
- **Bandwidth**: 100GB/month (free)

### **Scaling Options**
- **Starter Plan**: $7/month per service
- **Standard Plan**: $25/month per service
- **Pro Plan**: $50/month per service

## 🎯 **Success Checklist**

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Local client configured and running
- [ ] Email monitoring working
- [ ] RLD to TXT conversion working
- [ ] Data visualization working
- [ ] All services communicating properly

## 📞 **Support**

If you encounter issues:
1. Check the logs: `./start_all.sh logs [service]`
2. Verify configuration files
3. Test each component individually
4. Check Render dashboard for deployment issues
5. Review this deployment guide

---

**🎉 Congratulations! Your NRG DataSense Platform is now deployed and running!**
