# DataSense - Windows-Focused Deployment

## 🪟 **Professional Meteorological Data Processing System**

DataSense is a comprehensive desktop application for processing NRG Systems meteorological data, with full RLD file conversion capabilities.

---

## **🎯 Platform Support:**

### **✅ Primary Platform: Windows**
- **Full functionality** with nrgpy local conversion
- **Direct NRG Systems software** integration
- **Best performance** and reliability
- **Professional desktop application**

### **⚠️ Secondary Platforms: Linux/Mac**
- **Limited functionality** (requires Windows VM)
- **VM setup required** for RLD conversion
- **Alternative deployment** options available

---

## **🚀 Quick Start:**

### **🪟 Windows Users (Recommended):**
```bash
# 1. Download DataSense folder
# 2. Double-click start-datasense.bat
# 3. Wait for automatic setup
# 4. Use DataSense like any other desktop app
```

### **🐧 Linux Users:**
```bash
# 1. Double-click start-datasense-linux.sh
# 2. Follow VM setup instructions
# 3. Use Windows VM for DataSense
```

### **🍎 Mac Users:**
```bash
# 1. Double-click start-datasense-mac.command
# 2. Follow VM setup instructions
# 3. Use Windows VM for DataSense
```

---

## **📋 System Requirements:**

### **🪟 Windows (Primary):**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection for dependencies
- **Software:** NRG Systems software (for RLD conversion)

### **🐧 Linux (VM Required):**
- **OS:** Ubuntu 18.04+, CentOS 7+, or equivalent
- **RAM:** 8GB minimum (4GB for host + 4GB for VM)
- **Storage:** 20GB free space
- **Software:** VirtualBox or VMware
- **VM:** Windows 10/11 with NRG Systems software

### **🍎 Mac (VM Required):**
- **OS:** macOS 10.14+ (Mojave or later)
- **RAM:** 8GB minimum (4GB for host + 4GB for VM)
- **Storage:** 20GB free space
- **Software:** Parallels Desktop or VMware Fusion
- **VM:** Windows 10/11 with NRG Systems software

---

## **🔧 Installation Options:**

### **Option 1: Windows Direct (Recommended)**
- **Best performance** and reliability
- **Full nrgpy integration**
- **Professional desktop app**
- **Easy maintenance**

### **Option 2: Windows VM on Linux/Mac**
- **VirtualBox/VMware** setup
- **Windows VM** with NRG Systems software
- **DataSense** in Windows VM
- **Good performance** with VM overhead

### **Option 3: Cloud Windows Service**
- **AWS/Azure Windows VM**
- **Remote conversion service**
- **Web-based interface**
- **Scalable solution**

---

## **📁 File Structure:**

```
DataSense-NRG-Systems-/
├── start-datasense.bat              # Windows (full functionality)
├── start-datasense-linux.sh        # Linux (VM setup info)
├── start-datasense-mac.command     # Mac (VM setup info)
├── WINDOWS_VM_SETUP.md             # VM setup guide
├── WINDOWS_ONLY_DEPLOYMENT.md      # Deployment strategy
└── README_WINDOWS_FOCUSED.md       # This file
```

---

## **🎮 Usage Instructions:**

### **🪟 Windows Users:**
1. **Download** the DataSense folder
2. **Double-click** `start-datasense.bat`
3. **Wait** for automatic dependency installation (first time)
4. **DataSense opens** in a professional desktop window
5. **Import RLD files** using the "Import RLD File" button
6. **View data** on the interactive dashboard

### **🐧 Linux Users:**
1. **Set up Windows VM** (see VM setup guide)
2. **Install DataSense** in Windows VM
3. **Use Windows VM** for RLD conversion
4. **Alternative:** Use Windows machine for conversion

### **🍎 Mac Users:**
1. **Set up Windows VM** (see VM setup guide)
2. **Install DataSense** in Windows VM
3. **Use Windows VM** for RLD conversion
4. **Alternative:** Use Windows machine for conversion

---

## **🔧 Technical Details:**

### **🪟 Windows Architecture:**
```
DataSense Windows App
├── Electron Desktop App
├── React Frontend
├── FastAPI Backend
├── SQLite Database
├── nrgpy Local Conversion
└── NRG Systems Software
```

### **🐧 Linux/Mac Architecture:**
```
Linux/Mac Host                    Windows VM
├── DataSense Frontend            ├── NRG Systems Software
├── DataSense Backend             ├── nrgpy Conversion
├── File Upload API               ├── Conversion Service
└── Database                      └── File Processing
```

---

## **💡 Why Windows-Focused?**

### **✅ Technical Reasons:**
- **NRG Systems software** is Windows-only
- **nrgpy local conversion** requires Windows
- **Best performance** without VM overhead
- **Simplified deployment** and maintenance

### **✅ Business Reasons:**
- **Target market** primarily uses Windows
- **Easier support** and troubleshooting
- **Professional deployment** experience
- **Lower complexity** for clients

---

## **🚀 Deployment Strategies:**

### **🎯 For Windows Clients:**
- **Direct installation** on Windows machines
- **Professional desktop application**
- **Full functionality** with nrgpy
- **Easy updates** and maintenance

### **🎯 For Linux/Mac Clients:**
- **Windows VM setup** guide
- **Alternative deployment** options
- **Cloud-based** conversion service
- **Hybrid solutions**

---

## **📞 Support and Troubleshooting:**

### **🪟 Windows Issues:**
- **Check system requirements**
- **Verify NRG Systems software** installation
- **Run as Administrator** if needed
- **Check antivirus settings**

### **🐧 Linux/Mac Issues:**
- **Follow VM setup guide**
- **Ensure Windows VM** is running
- **Check network connectivity**
- **Verify NRG Systems software** in VM

---

## **🎉 Benefits:**

### **✅ For Windows Users:**
- **Zero technical setup** required
- **Professional desktop application**
- **Full nrgpy integration**
- **Best performance** and reliability

### **✅ For Linux/Mac Users:**
- **Clear alternatives** provided
- **VM setup guidance**
- **Flexible deployment** options
- **Professional support**

---

## **📋 Next Steps:**

1. **Choose your platform** (Windows recommended)
2. **Follow installation** instructions
3. **Set up VM** if using Linux/Mac
4. **Test DataSense** functionality
5. **Contact support** if needed

**DataSense provides professional meteorological data processing with the flexibility to work on your preferred platform!** 🎉
