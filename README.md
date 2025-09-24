# DataSense - Professional Meteorological Data Processing

## 🖥️ **Windows VM Desktop Application for NRG Systems Data**

DataSense is a comprehensive desktop application for processing NRG Systems meteorological data, designed to run inside a Windows VM alongside the official NRG Systems software. Features automated RLD file conversion, email processing, and interactive data visualization.

---

## **🚀 Quick Start (Windows VM)**

### **1. Set Up Windows VM**
- **Create Windows 10/11 VM** (VirtualBox, VMware, or Parallels)
- **Install NRG Systems software** in the VM
- **Allocate sufficient resources** (4GB+ RAM, 50GB+ storage)

### **2. Download DataSense in VM**
```bash
# Clone or download the repository inside Windows VM
git clone https://github.com/CPablo08/DataSense-NRG-Systems-.git
cd DataSense-NRG-Systems-
```

### **3. Start DataSense in VM**
```bash
# Double-click the start script inside Windows VM
start-datasense.bat
```

**That's it!** The script will automatically:
- ✅ Install Node.js and Python if missing
- ✅ Install all dependencies
- ✅ Set up the complete environment
- ✅ Start the desktop application

---

## **📋 System Requirements**

### **🖥️ Host System (Linux/Mac/Windows):**
- **OS:** Linux, macOS, or Windows
- **RAM:** 8GB minimum (4GB for host + 4GB for VM)
- **Storage:** 50GB+ free space
- **Software:** VirtualBox, VMware, or Parallels

### **🪟 Windows VM Requirements:**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 6GB recommended
- **Storage:** 50GB+ free space
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

## **🖥️ VM-Based Deployment**

### **✅ Universal Approach:**
- **Works on any host OS** (Linux, Mac, Windows)
- **Windows VM** contains complete DataSense application
- **NRG Systems software** runs alongside DataSense
- **Full functionality** with nrgpy local conversion
- **Professional desktop application** experience

### **🎯 Benefits:**
- **Cross-platform compatibility** - works on any host
- **Isolated environment** - no host system conflicts
- **Easy deployment** - single VM image
- **Professional setup** - dedicated Windows environment

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
