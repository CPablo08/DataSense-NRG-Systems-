# 🌤️ NRG DataSense Platform

## 📋 **Overview**

NRG DataSense is a unified web platform for monitoring, processing, and visualizing NRG Systems meteorological data. The platform automatically monitors emails for RLD attachments, converts them to TXT using local nrgpy, processes the data, and provides real-time visualization through a modern web interface.

## ✨ **Features**

### **🔄 Automatic Email Monitoring**
- **24/7 Email Monitoring**: Continuously checks for new NRG Systems emails
- **RLD Attachment Detection**: Automatically finds and downloads RLD files
- **Organization Email Support**: Works with Outlook, Office 365, Gmail, and more
- **Configurable Search**: Customizable email search criteria

### **⚙️ Local Data Processing**
- **Local nrgpy Conversion**: Uses your installed NRG software (no cloud API fees)
- **RLD to TXT Conversion**: Converts NRG data files locally
- **Data Processing**: Extracts and processes meteorological sensor data
- **Real-time Processing**: Data appears immediately in the web interface

### **📊 Data Visualization**
- **Interactive Charts**: Real-time meteorological data visualization
- **Multiple Sensors**: Wind speed, temperature, humidity, pressure, and more
- **Time Series Analysis**: Historical data trends and patterns
- **Export Capabilities**: PDF reports and data export

### **🌐 Modern Web Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data updates via WebSocket
- **Professional UI**: Modern, intuitive interface
- **Multi-language**: English and Spanish support

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Email Server  │    │   FastAPI Backend│    │  React Frontend │
│   (Outlook/365) │───▶│   (Render)       │◀───│  (Render)       │
│                 │    │                  │    │                 │
│ • RLD Emails    │    │ • Email Monitor  │    │ • Visualization │
│ • IMAP Access   │    │ • Local nrgpy    │    │ • Real-time UI  │
│ • Attachments   │    │ • Data Processing│    │ • Charts/Graphs │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **1. Deploy to Render (Recommended)**

#### **Option A: Blueprint Deployment**
1. **Fork/Clone** this repository
2. **Go to** [Render.com](https://render.com)
3. **Click "New +"** → **"Blueprint"**
4. **Connect Repository**: Your forked repository
5. **Select Branch**: `main`
6. **Click "Apply"**

#### **Option B: Manual Deployment**
1. **Create Web Service** for backend
2. **Create Static Site** for frontend
3. **Configure environment variables**

### **2. Configure Email Settings**

#### **Access the Platform**
1. **Open** your deployed frontend URL
2. **Go to Settings** in the sidebar
3. **Configure Email Settings**:
   - **Server**: `outlook.office365.com` (or your email server)
   - **Username**: Your email address
   - **Password**: Your email password or app password
   - **Search Text**: `SymphoniePRO Logger data attached.`

#### **Email Server Examples**
```json
{
  "server": "outlook.office365.com",    // Office 365
  "server": "imap.gmail.com",           // Gmail
  "server": "outlook.office365.com",    // Organization Outlook
  "server": "mail.yourcompany.com"      // Custom server
}
```

### **3. Start Monitoring**

1. **Click "Start Monitoring"** in the sidebar
2. **The platform will**:
   - Start monitoring emails every 5 minutes
   - Download RLD attachments automatically
   - Convert files using local nrgpy
   - Process and display data in real-time

## 🔧 **Configuration**

### **Email Settings**
- **Server**: Email server address (IMAP)
- **Username**: Your email address
- **Password**: Email password or app password
- **Search Text**: Text to search for in emails
- **Mail Folder**: Email folder to monitor (default: INBOX)
- **File Extension**: Attachment extension (default: .rld)
- **Delete Emails**: Whether to delete processed emails

### **NRG Settings**
- **Output Folder**: Where converted TXT files are saved
- **File Filter**: NRG file filter (default: 000110)

### **Monitoring Settings**
- **Monitor Interval**: How often to check emails (seconds)
- **Max Files Per Batch**: Maximum files to process at once

## 📊 **Data Processing**

### **Supported Sensors**
- **NRG_40C_Anem**: Wind speed anemometer
- **NRG_200M_Vane**: Wind direction vane
- **NRG_T60_Temp**: Temperature sensor
- **NRG_RH5X_Humi**: Humidity sensor
- **NRG_BP60_Baro**: Barometric pressure
- **Rain_Gauge**: Precipitation sensor
- **NRG_PVT1_PV_Temp**: PV temperature sensor
- **PSM_c_Si_Isc_Soil**: Soil irradiance sensor
- **PSM_c_Si_Isc_Clean**: Clean irradiance sensor
- **Average_12V_Battery**: Battery voltage

### **Data Flow**
```
1. 📧 Email Received → 2. 📁 RLD Downloaded → 3. 🔄 Converted to TXT → 4. 📊 Data Processed → 5. 🌐 Displayed in Browser
```

## 🌐 **API Endpoints**

### **Core Endpoints**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration
- `GET /api/data` - Get processed data

### **Monitoring Endpoints**
- `POST /api/monitoring/start` - Start email monitoring
- `POST /api/monitoring/stop` - Stop email monitoring
- `GET /api/monitoring/status` - Get monitoring status

### **Real-time Endpoints**
- `WebSocket /ws` - Real-time data updates

## 💰 **Cost Structure**

### **Render Free Tier**
- **Backend Service**: 750 hours/month (free)
- **Frontend Site**: Unlimited (free)
- **Total Cost**: **$0/month**

### **Optional Upgrades**
- **Database**: $7/month (after 90-day trial)
- **Custom Domain**: $5/month
- **Team Access**: $19/month

## 🔒 **Security**

### **Email Security**
- **IMAP SSL/TLS**: Encrypted email connections
- **App Passwords**: Secure authentication
- **No Email Storage**: Emails not stored permanently

### **Data Security**
- **Local Processing**: Data processed locally
- **No External APIs**: No cloud conversion fees
- **Secure Storage**: Data stored securely

## 🛠️ **Technical Requirements**

### **Backend Requirements**
- **Python 3.8+**
- **FastAPI**
- **nrgpy** (local installation)
- **data_email_client**
- **WebSocket support**

### **Frontend Requirements**
- **React 18+**
- **Node.js 16+**
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### **Email Requirements**
- **IMAP enabled** on email server
- **Valid credentials** (username/password)
- **Network access** to email server

## 🚀 **Deployment Options**

### **Render (Recommended)**
- **Easy deployment**
- **Free tier available**
- **Automatic scaling**
- **Professional hosting**

### **Other Platforms**
- **Heroku**: Similar deployment process
- **AWS**: More complex but scalable
- **Google Cloud**: Enterprise-grade
- **Self-hosted**: Full control

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Email Connection Failed**
```bash
# Check IMAP settings
- Verify server address
- Check username/password
- Ensure IMAP is enabled
- Test with email client
```

#### **2. RLD Conversion Failed**
```bash
# Check nrgpy installation
- Verify NRG software is installed
- Check file permissions
- Ensure file format is correct
```

#### **3. Web Interface Not Loading**
```bash
# Check deployment
- Verify Render services are running
- Check environment variables
- Review deployment logs
```

### **Debug Commands**
```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check monitoring status
curl https://your-backend.onrender.com/api/monitoring/status

# View logs in Render dashboard
```

## 📈 **Performance**

### **Monitoring Performance**
- **Email Check**: Every 5 minutes (configurable)
- **Processing Time**: ~30 seconds per RLD file
- **Real-time Updates**: Instant via WebSocket
- **Data Storage**: File-based (no database required)

### **Scalability**
- **Multiple Email Accounts**: Can monitor multiple sources
- **Batch Processing**: Handles multiple files efficiently
- **Memory Efficient**: Minimal resource usage
- **Auto-scaling**: Render handles infrastructure

## 🔄 **Updates and Maintenance**

### **Automatic Updates**
- **Render**: Automatic deployments from Git
- **Dependencies**: Automatic security updates
- **Monitoring**: Continuous operation

### **Manual Updates**
```bash
# Update repository
git pull origin main

# Render will auto-deploy
# No manual intervention needed
```

## 📞 **Support**

### **Getting Help**
1. **Check logs** in Render dashboard
2. **Verify configuration** settings
3. **Test email connection** manually
4. **Review troubleshooting** section

### **Common Solutions**
- **Email issues**: Check IMAP settings and credentials
- **Conversion issues**: Verify NRG software installation
- **Display issues**: Check browser compatibility
- **Performance issues**: Adjust monitoring intervals

## 🎯 **Success Checklist**

- [ ] Platform deployed on Render
- [ ] Email settings configured
- [ ] Monitoring started successfully
- [ ] Test email with RLD attachment sent
- [ ] Data appears in web interface
- [ ] Real-time updates working
- [ ] Charts and visualizations displaying correctly

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

---

**🎉 Congratulations! Your NRG DataSense Platform is now running and monitoring for meteorological data!**

For questions or support, please check the troubleshooting section or create an issue in the repository. 