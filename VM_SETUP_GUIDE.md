# DataSense VM Setup Guide

## 🖥️ **Complete Windows VM Setup for DataSense**

This guide walks you through setting up a Windows VM to run the complete DataSense application alongside the official NRG Systems software.

---

## **🎯 Overview**

### **What We're Building:**
- **Windows VM** with complete DataSense application
- **NRG Systems software** for RLD conversion
- **Full nrgpy integration** for local conversion
- **Professional desktop application** experience

### **Benefits:**
- **Works on any host OS** (Linux, Mac, Windows)
- **Isolated environment** - no host system conflicts
- **Complete functionality** with NRG Systems software
- **Easy deployment** - single VM image

---

## **📋 VM Requirements**

### **🖥️ Host System Requirements:**
- **RAM:** 8GB minimum (4GB for host + 4GB for VM)
- **Storage:** 50GB+ free space
- **CPU:** 4+ cores recommended
- **Software:** VirtualBox, VMware, or Parallels

### **🪟 Windows VM Requirements:**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 6GB recommended
- **Storage:** 50GB+ free space
- **Network:** Internet connection for dependencies

---

## **🚀 Step-by-Step Setup**

### **Step 1: Choose Virtualization Software**

#### **Option A: VirtualBox (Free)**
```bash
# Download VirtualBox
# https://www.virtualbox.org/wiki/Downloads

# Install VirtualBox
# Follow installation wizard
```

#### **Option B: VMware (Professional)**
```bash
# Download VMware Workstation/Fusion
# https://www.vmware.com/products/workstation-pro.html

# Install VMware
# Follow installation wizard
```

#### **Option C: Parallels (Mac Only)**
```bash
# Download Parallels Desktop
# https://www.parallels.com/products/desktop/

# Install Parallels
# Follow installation wizard
```

### **Step 2: Create Windows VM**

#### **VM Settings:**
- **Name:** DataSense-Windows
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 6GB recommended
- **Storage:** 50GB+ (dynamically allocated)
- **Network:** NAT or Bridged
- **Display:** 3D acceleration enabled

#### **Installation:**
1. **Download Windows ISO** from Microsoft
2. **Boot VM** from Windows ISO
3. **Install Windows** following standard process
4. **Install VM tools** (VirtualBox Guest Additions, VMware Tools, etc.)

### **Step 3: Install NRG Systems Software**

#### **In Windows VM:**
1. **Download NRG Systems software** from official website
2. **Install NRG Systems software** in Windows VM
3. **Configure for local conversion**
4. **Test with sample RLD file**

### **Step 4: Install DataSense**

#### **In Windows VM:**
```bash
# Download DataSense inside Windows VM
git clone https://github.com/CPablo08/DataSense-NRG-Systems-.git
cd DataSense-NRG-Systems-

# Run the start script
start-datasense.bat
```

### **Step 5: Configure VM for Best Performance**

#### **VM Settings Optimization:**
- **Enable hardware acceleration**
- **Allocate sufficient RAM**
- **Enable 3D acceleration**
- **Configure shared folders** (optional)
- **Set up network access**

---

## **🔧 VM Configuration Details**

### **🖥️ VirtualBox Setup:**
```bash
# Create VM
VBoxManage createvm --name "DataSense-Windows" --ostype Windows10_64
VBoxManage modifyvm "DataSense-Windows" --memory 4096
VBoxManage modifyvm "DataSense-Windows" --cpus 2
VBoxManage createhd --filename "DataSense-Windows.vdi" --size 50000
VBoxManage storagectl "DataSense-Windows" --name "SATA Controller" --add sata
VBoxManage storageattach "DataSense-Windows" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "DataSense-Windows.vdi"
```

### **🖥️ VMware Setup:**
```bash
# Create VM through VMware interface
# - Select Windows 10/11 template
# - Allocate 4GB+ RAM
# - Create 50GB+ virtual disk
# - Enable 3D acceleration
```

### **🖥️ Parallels Setup:**
```bash
# Create VM through Parallels interface
# - Select Windows 10/11 template
# - Allocate 4GB+ RAM
# - Create 50GB+ virtual disk
# - Enable 3D acceleration
```

---

## **📦 Software Installation in VM**

### **🪟 Windows VM Software Stack:**
```
Windows VM
├── Windows 10/11
├── NRG Systems Software
├── DataSense Application
│   ├── Node.js + React Frontend
│   ├── Python + FastAPI Backend
│   ├── SQLite Database
│   └── nrgpy Local Conversion
└── VM Tools (Guest Additions)
```

### **📋 Installation Order:**
1. **Windows OS** (base system)
2. **VM Tools** (Guest Additions, VMware Tools, etc.)
3. **NRG Systems Software** (for RLD conversion)
4. **DataSense Application** (complete stack)
5. **Test and configure** (end-to-end testing)

---

## **🎮 Using DataSense in VM**

### **🚀 Starting DataSense:**
1. **Boot Windows VM**
2. **Open DataSense folder** in Windows VM
3. **Double-click** `start-datasense.bat`
4. **Wait** for automatic setup (first time)
5. **DataSense opens** in Windows VM

### **📁 Importing RLD Files:**
1. **Copy RLD files** to Windows VM
2. **Click "Import RLD File"** in DataSense
3. **Select RLD file** using Windows file dialog
4. **Data automatically converts** using nrgpy + NRG Systems software
5. **Data appears** on interactive dashboard

### **🔄 Email Automation:**
1. **Configure email settings** in DataSense
2. **Email automation** processes RLD files automatically
3. **Converted data** appears on dashboard
4. **Professional workflow** with minimal user intervention

---

## **💡 Pro Tips**

### **🎯 VM Performance:**
- **Allocate sufficient RAM** (4GB+ for Windows VM)
- **Enable hardware acceleration** for better performance
- **Use SSD storage** for faster VM operations
- **Close unnecessary host applications** when using VM

### **🎯 DataSense Usage:**
- **Keep VM running** for continuous email automation
- **Use shared folders** to transfer files between host and VM
- **Configure network access** for email automation
- **Regular backups** of VM for data safety

### **🎯 Troubleshooting:**
- **Check VM resources** if DataSense runs slowly
- **Verify NRG Systems software** installation
- **Test network connectivity** for email automation
- **Check Windows VM logs** for any issues

---

## **🔧 Advanced Configuration**

### **🌐 Network Setup:**
```bash
# Configure VM network for email automation
# - Set up NAT or Bridged networking
# - Configure port forwarding if needed
# - Test internet connectivity in VM
```

### **📁 Shared Folders:**
```bash
# Set up shared folders between host and VM
# - Create shared folder for RLD files
# - Configure automatic mounting
# - Test file transfer between host and VM
```

### **🔄 Automation:**
```bash
# Set up VM auto-start
# - Configure VM to start automatically
# - Set up DataSense auto-start
# - Configure email automation
```

---

## **📞 Support and Troubleshooting**

### **🖥️ VM Issues:**
- **Check host system resources**
- **Verify virtualization support** (Intel VT-x, AMD-V)
- **Update virtualization software**
- **Check VM configuration**

### **🪟 Windows VM Issues:**
- **Check Windows VM resources**
- **Verify NRG Systems software** installation
- **Test DataSense functionality**
- **Check Windows VM logs**

### **📧 DataSense Issues:**
- **Verify nrgpy installation**
- **Test RLD file conversion**
- **Check email automation** settings
- **Review DataSense logs**

---

## **🎉 Benefits of VM Approach**

### **✅ For Users:**
- **Works on any host OS** (Linux, Mac, Windows)
- **Complete DataSense functionality** with NRG Systems software
- **Professional desktop application** experience
- **Isolated environment** - no host system conflicts

### **✅ For Deployment:**
- **Single VM image** for distribution
- **Easy backup and restore**
- **Consistent environment** across different hosts
- **Professional setup** for clients

**DataSense in a Windows VM provides the perfect solution for cross-platform deployment with full NRG Systems software integration!** 🎉
