// API service for communicating with the NRG RLD Converter backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nrg-datasense-backend.onrender.com'
  : 'http://localhost:5000';

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

  // Get file metadata with timestamps
  async getFileMetadata() {
    try {
      const response = await fetch(`${this.baseURL}/api/files`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // Get data for a specific filename
  async getDataByFilename(filename) {
    try {
      const response = await fetch(`${this.baseURL}/api/data/${encodeURIComponent(filename)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting data for filename:', error);
      throw error;
    }
  }

  // Get all current data
  async getData() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  }

  // Delete a file
  async deleteFile(filename) {
    try {
      const response = await fetch(`${this.baseURL}/api/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Process TXT file directly
  async processTxtFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}/api/process-txt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'TXT processing failed');
      }

      const result = await response.json();
      console.log('Processing result:', result);
      return result;
    } catch (error) {
      console.error('TXT processing failed:', error);
      throw error;
    }
  }

  // Convert RLD to TXT without processing
  async convertRldToTxt(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}/api/convert-rld-to-txt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'RLD to TXT conversion failed');
      }

      return await response.json();
    } catch (error) {
      console.error('RLD to TXT conversion failed:', error);
      throw error;
    }
  }
}

// Library Management Functions
export const libraryService = {
  // Get library files with advanced filtering
  async getLibraryFiles(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/api/library/files?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch library files: ${response.statusText}`);
    }
    return await response.json();
  },

  // Add file to library
  async addToLibrary(fileData) {
    const response = await fetch(`${API_BASE_URL}/api/library/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileData),
    });
    if (!response.ok) {
      throw new Error(`Failed to add file to library: ${response.statusText}`);
    }
    return await response.json();
  },

  // Delete file from library
  async deleteLibraryFile(fileId) {
    const response = await fetch(`${API_BASE_URL}/api/library/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete library file: ${response.statusText}`);
    }
    return await response.json();
  },

  // Bulk delete files
  async bulkDeleteFiles(fileIds) {
    const response = await fetch(`${API_BASE_URL}/api/library/files/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_ids: fileIds }),
    });
    if (!response.ok) {
      throw new Error(`Failed to bulk delete files: ${response.statusText}`);
    }
    return await response.json();
  },

  // Update library file metadata
  async updateLibraryFile(fileId, updates) {
    const response = await fetch(`${API_BASE_URL}/api/library/files/${fileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update library file: ${response.statusText}`);
    }
    return await response.json();
  },

  // Get library statistics
  async getLibraryStats() {
    const response = await fetch(`${API_BASE_URL}/api/library/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch library stats: ${response.statusText}`);
    }
    return await response.json();
  },

  // Export library file
  async exportLibraryFile(fileId, format = 'json') {
    const response = await fetch(`${API_BASE_URL}/api/library/export/${fileId}?format=${format}`);
    if (!response.ok) {
      throw new Error(`Failed to export library file: ${response.statusText}`);
    }
    return await response.json();
  },

  // Get file data by ID
  async getFileData(fileId) {
    const response = await fetch(`${API_BASE_URL}/api/data/${fileId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch file data: ${response.statusText}`);
    }
    return await response.json();
  }
};

// Create singleton instance
const apiService = new ApiService();

export default apiService;
