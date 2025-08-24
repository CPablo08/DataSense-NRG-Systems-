# 🌤️ NRG DataSense Platform

## 📋 **Overview**

NRG DataSense is a modern web platform for processing and visualizing NRG Systems meteorological data. The platform converts RLD files to TXT using local nrgpy, processes the data, and provides real-time visualization through a beautiful web interface.

## ✨ **Features**

### **⚙️ Local Data Processing**
- **Local nrgpy Conversion**: Uses your installed NRG software (no cloud API fees)
- **RLD to TXT Conversion**: Converts NRG data files locally
- **Data Processing**: Extracts and processes meteorological sensor data
- **Real-time Processing**: Data appears immediately in the web interface

### **📊 Data Visualization**
- **Interactive Charts**: Real-time meteorological data visualization
- **Multiple Sensors**: Wind speed, temperature, humidity, pressure, rainfall, solar, and battery
- **Time Series Analysis**: Historical data trends and patterns
- **Export Capabilities**: PDF reports and data export
- **Full-Screen Analysis**: Detailed data analysis with time range selection

### **🌐 Modern Web Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data updates via WebSocket
- **Professional UI**: Modern, intuitive interface with dark theme
- **Multi-language**: English and Spanish support
- **Data Library**: Store and manage historical data files

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Uploads  │    │   FastAPI Backend│    │  React Frontend │
│   RLD Files     │───▶│   (Render)       │◀───│  (Render)       │
│                 │    │                  │    │                 │
│ • RLD Files     │    │ • File Processing│    │ • Visualization │
│ • Direct Upload │    │ • Local nrgpy    │    │ • Real-time UI  │
│ • Batch Process │    │ • Data Processing│    │ • Charts/Graphs │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **1. Deploy to Render**

#### **Option A: Blueprint Deployment (Recommended)**
1. **Fork/Clone** this repository
2. **Go to** [Render.com](https://render.com)
3. **Click "New +"** → **"Blueprint"**
4. **Connect Repository**: Your forked repository
5. **Select Branch**: `main`
6. **Click "Apply"**

#### **Option B: Manual Deployment**
1. **Create Web Service** for backend (`nrg-datasense-backend`)
2. **Create Static Site** for frontend (`nrg-datasense-frontend`)
3. **Set Environment Variables** for frontend:
   - `REACT_APP_API_URL`: Your backend URL

### **2. Use the Platform**

#### **Upload and Process RLD Files**
1. **Open** your deployed frontend URL
2. **Upload RLD Files**: Select 1-10 RLD files from your computer
3. **Process Files**: Click "Process Files" to convert and analyze
4. **View Results**: Data appears in real-time charts and graphs

#### **Data Visualization**
- **Dashboard**: View all sensor data in interactive charts
- **Full-Screen Analysis**: Double-click any chart for detailed analysis
- **Export Data**: Generate PDF reports of your data
- **Data Library**: Store and manage processed files

## 🔧 **Technical Requirements**

### **Backend (FastAPI)**
- **Python 3.12+**
- **nrgpy**: For RLD to TXT conversion
- **FastAPI**: Web framework
- **WebSockets**: Real-time communication

### **Frontend (React)**
- **Node.js 18+**
- **React 18**: UI framework
- **Recharts**: Data visualization
- **Styled Components**: Styling

## 📊 **Supported Sensors**

- **Wind Speed** (NRG_40C_Anem): m/s
- **Wind Direction** (NRG_200M_Vane): degrees
- **Temperature** (NRG_T60_Temp): °C
- **Humidity** (NRG_RH5X_Humi): %
- **Pressure** (NRG_BP60_Baro): hPa
- **Rainfall** (Rain_Gauge): mm
- **Solar Current** (PSM_c_Si_Isc_*): mA
- **Battery Voltage** (Average_12V_Battery): V

## 🌐 **API Endpoints**

### **Core Endpoints**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/data` - Get processed data
- `POST /api/process-rld` - Upload and process RLD file
- `POST /api/upload-data` - Upload processed data

### **Real-time Endpoints**
- `WebSocket /ws` - Real-time data updates

## 💰 **Cost Structure**

### **Render Free Tier**
- **Backend Service**: 750 hours/month (free)
- **Frontend Site**: Unlimited (free)
- **Total Cost**: **$0/month**

### **Optional Upgrades**
- **Custom Domain**: $5/month
- **Team Access**: $19/month

## 🔒 **Security**

### **Data Security**
- **Local Processing**: Data processed locally
- **No External APIs**: No cloud conversion fees
- **Secure Storage**: Data stored securely
- **File-based**: No database required

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. RLD Conversion Failed**
```bash
# Check nrgpy installation
- Verify NRG software is installed
- Check file permissions
- Ensure file format is correct
```

#### **2. Web Interface Not Loading**
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

# View logs in Render dashboard
```

## 📈 **Performance**

### **Processing Performance**
- **Processing Time**: ~30 seconds per RLD file
- **Real-time Updates**: Instant via WebSocket
- **Data Storage**: File-based (no database required)
- **Batch Processing**: Handles multiple files efficiently

## 🔄 **Updates and Maintenance**

### **Automatic Updates**
- **Render**: Automatic deployments from Git
- **Dependencies**: Automatic security updates

### **Manual Updates**
```bash
# Update repository
git pull origin main

# Render will auto-deploy
# No manual intervention needed
```

## 🎯 **Success Checklist**

- [ ] Platform deployed on Render
- [ ] Backend service running
- [ ] Frontend site accessible
- [ ] Upload RLD files successfully
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