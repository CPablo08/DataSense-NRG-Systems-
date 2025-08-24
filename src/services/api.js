// API service for communicating with the NRG RLD Converter backend

const API_BASE_URL = 'https://nrg-datasense-backend.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Health check endpoint
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend service is not available');
    }
  }

  // Get conversion service status
  async getConvertStatus() {
    try {
      const response = await fetch(`${this.baseURL}/convert-status`);
      return await response.json();
    } catch (error) {
      console.error('Status check failed:', error);
      throw new Error('Unable to get service status');
    }
  }

  // Convert RLD files to TXT format
  async convertRLDFiles(files, config) {
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add configuration
      formData.append('client_id', config.client_id);
      formData.append('client_secret', config.client_secret);
      
      if (config.file_filter) {
        formData.append('file_filter', config.file_filter);
      }
      
      if (config.start_date) {
        formData.append('start_date', config.start_date);
      }
      
      if (config.end_date) {
        formData.append('end_date', config.end_date);
      }

      const response = await fetch(`${this.baseURL}/convert-rld`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      // Return the blob for download
      return await response.blob();
    } catch (error) {
      console.error('RLD conversion failed:', error);
      throw error;
    }
  }

  // Convert folder of RLD files to TXT format
  async convertFolder(files, config) {
    try {
      const formData = new FormData();
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add configuration
      formData.append('client_id', config.client_id);
      formData.append('client_secret', config.client_secret);
      
      if (config.file_filter) {
        formData.append('file_filter', config.file_filter);
      }
      
      if (config.start_date) {
        formData.append('start_date', config.start_date);
      }
      
      if (config.end_date) {
        formData.append('end_date', config.end_date);
      }

      const response = await fetch(`${this.baseURL}/convert-folder`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Folder conversion failed');
      }

      // Return the blob for download
      return await response.blob();
    } catch (error) {
      console.error('Folder conversion failed:', error);
      throw error;
    }
  }

  // Download converted files
  downloadConvertedFiles(blob, filename = 'converted_rld_files.zip') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Extract TXT files from ZIP blob
  async extractTxtFilesFromZip(blob) {
    try {
      // Use JSZip library to extract files
      const JSZip = require('jszip');
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(blob);
      
      const txtFiles = [];
      
      // Extract all TXT files
      for (const [filename, file] of Object.entries(zipContent.files)) {
        if (filename.endsWith('.txt') && !file.dir) {
          const content = await file.async('text');
          txtFiles.push({
            name: filename,
            content: content,
            size: content.length
          });
        }
      }
      
      return txtFiles;
    } catch (error) {
      console.error('Failed to extract TXT files from ZIP:', error);
      throw new Error('Failed to extract converted files');
    }
  }

  // Configuration management
  async saveConfiguration(sessionId, nrgConfig, sensorUnits) {
    try {
      const response = await fetch(`${this.baseURL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          nrg_config: nrgConfig,
          sensor_units: sensorUnits
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }

  async loadConfiguration(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/config?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
