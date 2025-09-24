#!/usr/bin/env node

/**
 * DataSense Desktop Launcher
 * This script helps users launch the DataSense desktop application
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

console.log('🚀 DataSense Desktop Launcher');
console.log('============================');

// Check if we're in development or production
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log('📦 Development Mode');
  console.log('Starting DataSense in development mode...');
  
  // Start the development server
  const startDev = spawn('npm', ['run', 'start:dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  startDev.on('error', (err) => {
    console.error('❌ Error starting development server:', err);
  });
  
} else {
  console.log('📦 Production Mode');
  console.log('Starting DataSense desktop application...');
  
  // Start the Electron app
  const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
  const mainPath = path.join(__dirname, 'main.js');
  
  const electronProcess = spawn(electronPath, [mainPath], {
    stdio: 'inherit',
    shell: true
  });
  
  electronProcess.on('error', (err) => {
    console.error('❌ Error starting Electron app:', err);
    console.log('💡 Make sure you have run: npm install');
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down DataSense...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down DataSense...');
  process.exit(0);
});
