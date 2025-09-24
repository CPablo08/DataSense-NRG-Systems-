#!/usr/bin/env node

/**
 * Desktop Shortcut Creator
 * Creates desktop shortcuts for DataSense on different platforms
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = process.platform;

console.log('🔗 Creating Desktop Shortcut');
console.log('============================');

function createWindowsShortcut() {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktopPath, 'DataSense.lnk');
  
  // Windows shortcut content (simplified)
  const shortcutContent = `[InternetShortcut]
URL=file:///${path.join(__dirname, '..', 'dist', 'DataSense.exe').replace(/\\/g, '/')}
IconFile=${path.join(__dirname, '..', 'public', 'assets', 'datasense-logo.png')}
IconIndex=0`;
  
  try {
    fs.writeFileSync(shortcutPath, shortcutContent);
    console.log('✅ Windows shortcut created:', shortcutPath);
  } catch (error) {
    console.error('❌ Failed to create Windows shortcut:', error.message);
  }
}

function createMacShortcut() {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const appPath = path.join(__dirname, '..', 'dist', 'DataSense.app');
  
  if (fs.existsSync(appPath)) {
    try {
      // Create symbolic link to desktop
      const shortcutPath = path.join(desktopPath, 'DataSense.app');
      fs.symlinkSync(appPath, shortcutPath);
      console.log('✅ Mac shortcut created:', shortcutPath);
    } catch (error) {
      console.error('❌ Failed to create Mac shortcut:', error.message);
    }
  } else {
    console.log('⚠️ DataSense.app not found. Run build first.');
  }
}

function createLinuxShortcut() {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktopPath, 'DataSense.desktop');
  
  const shortcutContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=DataSense
Comment=Professional meteorological data processing system
Exec=${path.join(__dirname, '..', 'dist', 'DataSense.AppImage')}
Icon=${path.join(__dirname, '..', 'public', 'assets', 'datasense-logo.png')}
Terminal=false
Categories=Utility;Science;`;
  
  try {
    fs.writeFileSync(shortcutPath, shortcutContent);
    // Make executable
    fs.chmodSync(shortcutPath, '755');
    console.log('✅ Linux shortcut created:', shortcutPath);
  } catch (error) {
    console.error('❌ Failed to create Linux shortcut:', error.message);
  }
}

// Create shortcut based on platform
switch (platform) {
  case 'win32':
    createWindowsShortcut();
    break;
  case 'darwin':
    createMacShortcut();
    break;
  case 'linux':
    createLinuxShortcut();
    break;
  default:
    console.log('⚠️ Unsupported platform for shortcut creation');
}

console.log('\n🎉 Desktop shortcut creation completed!');
