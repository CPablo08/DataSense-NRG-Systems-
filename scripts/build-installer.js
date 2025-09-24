#!/usr/bin/env node

/**
 * DataSense Installer Builder
 * Creates platform-specific installers for the DataSense desktop app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.platform;
const arch = process.arch;

console.log('🔨 DataSense Installer Builder');
console.log('==============================');
console.log(`Platform: ${platform}`);
console.log(`Architecture: ${arch}`);

// Build the application
console.log('\n📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create platform-specific installer
console.log('\n📦 Creating installer...');
try {
  let command;
  
  switch (platform) {
    case 'win32':
      command = 'npm run dist:win';
      break;
    case 'darwin':
      command = 'npm run dist:mac';
      break;
    case 'linux':
      command = 'npm run dist:linux';
      break;
    default:
      console.error('❌ Unsupported platform:', platform);
      process.exit(1);
  }
  
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Installer created successfully');
  
  // Show installer location
  const distPath = path.join(__dirname, '..', 'dist');
  console.log(`\n📁 Installer location: ${distPath}`);
  
  // List created files
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log('\n📋 Created files:');
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
} catch (error) {
  console.error('❌ Installer creation failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 DataSense installer ready!');
console.log('Your client can now install and use DataSense as a desktop application.');
