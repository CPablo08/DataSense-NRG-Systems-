# DataSense - Professional Meteorological Data Processing

## 🪟 **Windows Desktop Application for NRG Systems Data**

DataSense is a comprehensive desktop application for processing NRG Systems meteorological data, featuring automated RLD file conversion, email processing, and interactive data visualization.

---

## **🚀 Quick Start (Windows)**

### **1. Download DataSense**
```bash
# Clone or download the repository
git clone https://github.com/CPablo08/DataSense-NRG-Systems-.git
cd DataSense-NRG-Systems-
```

### **2. Start DataSense**
```bash
# Double-click the start script
start-datasense.bat
```

**That's it!** The script will automatically:
- ✅ Install Node.js and Python if missing
- ✅ Install all dependencies
- ✅ Set up the complete environment
- ✅ Start the desktop application

---

## **📋 System Requirements**

### **🪟 Windows Requirements:**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection for dependencies
- **Software:** NRG Systems software (for RLD conversion)

---

## **🎮 How to Use**

### **📁 Import RLD Files:**
1. **Click "Import RLD File"** button in the main dashboard
2. **Select your .rld file** using the native file dialog
3. **Data automatically converts** using nrgpy local conversion
4. **Data appears immediately** on the interactive dashboard

### **📊 Dashboard Features:**
- **Real-time Charts** - Interactive data visualization
- **Status Panel** - System health monitoring
- **Library** - Browse all imported files
- **Email Automation** - Automatic RLD processing from emails

---

## **🔧 Technical Details**

### **🏗️ Architecture:**
```
DataSense Windows App
├── React Frontend (Port 3000)
├── FastAPI Backend (Port 5000)
├── SQLite Database
├── nrgpy Local Conversion
└── NRG Systems Software
```

### **📦 Key Features:**
- **Local RLD Conversion** - Uses nrgpy with NRG Systems software
- **Email Automation** - Automatic RLD file processing
- **Database Storage** - SQLite database for data persistence
- **Interactive Dashboard** - Real-time data visualization
- **Professional UI** - Modern desktop application interface

---

## **⚠️ Platform Support**

### **✅ Windows (Primary):**
- **Full functionality** with nrgpy local conversion
- **Direct NRG Systems software** integration
- **Best performance** and reliability
- **Professional desktop application**

### **⚠️ Linux/Mac (Limited):**
- **Requires Windows VM** for RLD conversion
- **See VM setup guides** for alternatives
- **Limited functionality** without Windows

---

## **📁 Project Structure**

```
DataSense-NRG-Systems-/
├── start-datasense.bat              # Windows start script
├── start-datasense-linux.sh        # Linux info script
├── start-datasense-mac.command     # Mac info script
├── backend/                         # Python backend
│   ├── app.py                      # FastAPI application
│   ├── database.py                 # Database models
│   ├── email_service.py            # Email automation
│   └── requirements.txt            # Python dependencies
├── src/                            # React frontend
│   ├── App.js                      # Main React component
│   └── services/api.js             # API service
├── public/                         # Static assets
└── package.json                    # Node.js dependencies
```

---

## **🛠️ Development**

### **Start Development:**
```bash
# Start both frontend and backend
npm run start:dev

# Or start individually
npm run start:frontend  # React frontend (port 3000)
npm run start:backend   # Python backend (port 5000)
```

### **Build for Production:**
```bash
# Build React frontend
npm run build
```

---

## **📞 Support**

### **🪟 Windows Issues:**
- **Check system requirements**
- **Verify NRG Systems software** installation
- **Run as Administrator** if needed
- **Check antivirus settings**

### **🐧 Linux/Mac Issues:**
- **See VM setup guides** for alternatives
- **Use Windows machine** for conversion
- **Consider cloud-based** solutions

---

## **🎉 Benefits**

### **✅ For Users:**
- **Zero technical setup** required
- **Professional desktop application**
- **Automatic RLD conversion**
- **Interactive data visualization**
- **Email automation** capabilities

### **✅ For Developers:**
- **Modern tech stack** (React + FastAPI)
- **Easy deployment** and maintenance
- **Cross-platform** frontend
- **Scalable architecture**

---

## **📋 Next Steps**

1. **Download DataSense** folder
2. **Double-click** `start-datasense.bat`
3. **Wait** for automatic setup
4. **Start using** DataSense!

**DataSense provides professional meteorological data processing with the power of NRG Systems software!** 🎉
