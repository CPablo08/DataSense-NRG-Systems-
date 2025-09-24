# DataSense Windows VM Setup Guide

## 🖥️ **Windows Virtual Machine Solution for NRG Systems Software**

Since the local nrgpy conversion requires the official NRG Systems software (Windows-only), we'll set up a Windows virtual machine on Linux/Mac systems to run the conversion process.

---

## **🎯 Solution Architecture:**

### **✅ Hybrid Approach:**
- **Frontend & Backend:** Run natively on Linux/Mac
- **RLD Conversion:** Run in Windows VM with NRG Systems software
- **Communication:** API calls between host and VM
- **Result:** Best of both worlds - native performance + Windows compatibility

---

## **🛠️ Virtual Machine Setup Options:**

### **Option 1: VMware (Recommended)**
- **Professional solution** with excellent performance
- **Easy setup** and configuration
- **Good Linux/Mac support**
- **Cost:** VMware Workstation/Fusion (paid)

### **Option 2: VirtualBox (Free)**
- **Open source** and free
- **Good performance** for development
- **Cross-platform** support
- **Cost:** Free

### **Option 3: Parallels (Mac Only)**
- **Excellent Mac integration**
- **Best performance** on Mac
- **Easy setup**
- **Cost:** Parallels Desktop (paid)

---

## **📋 Windows VM Requirements:**

### **🪟 Windows VM Specifications:**
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 50GB minimum
- **CPU:** 2 cores minimum
- **Network:** Bridged or NAT for communication

### **📦 Software to Install in VM:**
- **NRG Systems Software** (official installer)
- **Python 3** (for nrgpy)
- **Node.js** (for API server)
- **DataSense Backend** (conversion service)

---

## **🔧 Implementation Strategy:**

### **🏗️ Architecture:**
```
Linux/Mac Host                    Windows VM
├── DataSense Frontend            ├── NRG Systems Software
├── DataSense Backend             ├── nrgpy (local conversion)
├── File Upload API               ├── Conversion Service API
└── Database                      └── File Processing
```

### **📡 Communication Flow:**
1. **User uploads RLD file** → Linux/Mac frontend
2. **File sent to Windows VM** → Conversion service
3. **NRG Systems software** → Converts RLD to TXT
4. **Converted file sent back** → Linux/Mac backend
5. **Data processed and stored** → Database

---

## **🚀 Setup Instructions:**

### **Step 1: Create Windows VM**
```bash
# Using VirtualBox (example)
# 1. Download VirtualBox
# 2. Create new VM with Windows 10/11
# 3. Allocate 4GB RAM, 50GB storage
# 4. Enable network access (bridged or NAT)
```

### **Step 2: Install NRG Systems Software in VM**
```bash
# 1. Download official NRG Systems software
# 2. Install in Windows VM
# 3. Configure for local conversion
# 4. Test with sample RLD file
```

### **Step 3: Set Up Conversion Service in VM**
```bash
# 1. Install Python 3 in VM
# 2. Install nrgpy in VM
# 3. Create conversion API service
# 4. Configure network access
```

### **Step 4: Configure Host System**
```bash
# 1. Modify DataSense backend to use VM conversion
# 2. Set up API communication
# 3. Configure file transfer
# 4. Test end-to-end workflow
```

---

## **💻 Code Implementation:**

### **🔧 Modified Backend for VM Conversion:**
```python
# backend/vm_conversion.py
import requests
import os

class VMConversionService:
    def __init__(self, vm_host="192.168.1.100", vm_port=5001):
        self.vm_host = vm_host
        self.vm_port = vm_port
        self.base_url = f"http://{vm_host}:{vm_port}"
    
    def convert_rld_to_txt(self, rld_file_path):
        """Send RLD file to Windows VM for conversion"""
        try:
            # Send file to VM
            with open(rld_file_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(
                    f"{self.base_url}/convert-rld",
                    files=files
                )
            
            if response.status_code == 200:
                # Save converted file
                converted_path = rld_file_path.replace('.rld', '.txt')
                with open(converted_path, 'wb') as f:
                    f.write(response.content)
                return converted_path
            else:
                raise Exception(f"VM conversion failed: {response.text}")
                
        except Exception as e:
            print(f"VM conversion error: {e}")
            return None
```

### **🪟 Windows VM Conversion Service:**
```python
# vm_conversion_service.py (runs in Windows VM)
from flask import Flask, request, send_file
import nrgpy
import os

app = Flask(__name__)

@app.route('/convert-rld', methods=['POST'])
def convert_rld():
    try:
        # Save uploaded RLD file
        rld_file = request.files['file']
        rld_path = f"temp_{rld_file.filename}"
        rld_file.save(rld_path)
        
        # Convert using nrgpy (requires NRG Systems software)
        txt_path = rld_path.replace('.rld', '.txt')
        nrgpy.convert_rld_to_txt(rld_path, output_folder=".", unzip=True)
        
        # Return converted file
        return send_file(txt_path, as_attachment=True)
        
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```

---

## **📱 Updated Start Scripts:**

### **🪟 Windows (No Changes Needed):**
- **Direct nrgpy conversion** (no VM needed)
- **Full local processing**
- **Best performance**

### **🐧 Linux (VM-Based):**
```bash
# start-datasense-linux-vm.sh
#!/bin/bash

echo "🚀 DataSense Linux VM Setup"
echo "============================="

# Check if Windows VM is running
if ! ping -c 1 192.168.1.100 > /dev/null 2>&1; then
    echo "❌ Windows VM not accessible"
    echo "Please start your Windows VM first"
    exit 1
fi

# Start DataSense with VM conversion
echo "✅ Windows VM detected"
echo "🔄 Starting DataSense with VM conversion..."
npm run start:vm
```

### **🍎 Mac (VM-Based):**
```bash
# start-datasense-mac-vm.command
#!/bin/bash

echo "🚀 DataSense Mac VM Setup"
echo "=========================="

# Check if Windows VM is running
if ! ping -c 1 192.168.1.100 > /dev/null 2>&1; then
    echo "❌ Windows VM not accessible"
    echo "Please start your Windows VM first"
    exit 1
fi

# Start DataSense with VM conversion
echo "✅ Windows VM detected"
echo "🔄 Starting DataSense with VM conversion..."
npm run start:vm
```

---

## **🎯 Benefits of VM Approach:**

### **✅ Advantages:**
- **Native performance** for frontend/backend
- **Windows compatibility** for NRG Systems software
- **Flexible deployment** options
- **Easy maintenance** and updates

### **✅ Use Cases:**
- **Linux servers** with Windows VM
- **Mac development** with Windows VM
- **Cloud deployment** with Windows VM
- **Hybrid environments**

---

## **🔧 Alternative Solutions:**

### **Option 1: Cloud Windows VM**
- **AWS EC2** Windows instance
- **Azure Windows VM**
- **Google Cloud** Windows VM
- **Always available** conversion service

### **Option 2: Docker Windows Container**
- **Windows Server Core** container
- **NRG Systems software** in container
- **API-based** conversion service
- **Scalable** solution

### **Option 3: Remote Windows Machine**
- **Dedicated Windows server**
- **Network-based** conversion
- **High performance** solution
- **Professional** setup

---

## **💡 Recommendations:**

### **🎯 For Development:**
- **Use VirtualBox** (free, easy setup)
- **Windows 10 VM** with NRG Systems software
- **Local network** communication

### **🎯 For Production:**
- **Use cloud Windows VM** (AWS/Azure)
- **Dedicated conversion service**
- **High availability** setup

### **🎯 For Clients:**
- **Windows-only deployment** (simplest)
- **VM setup guide** for Linux/Mac users
- **Cloud-based** conversion service

---

## **🚀 Next Steps:**

1. **Set up Windows VM** with NRG Systems software
2. **Create conversion service** in VM
3. **Modify DataSense backend** for VM communication
4. **Update start scripts** for VM-based conversion
5. **Test end-to-end** workflow

**This approach gives you the best of both worlds - native performance with Windows compatibility!** 🎉
