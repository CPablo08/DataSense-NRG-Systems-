const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  // Menu actions
  onMenuImportFile: (callback) => {
    ipcRenderer.on('menu-import-file', callback);
  },
  
  // App info
  getVersion: () => process.versions,
  getPlatform: () => process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // File system access
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
