class DataProcessor {
  constructor() {
    this.sensorData = [];
    this.realTimeData = [];
    this.processingStatus = 'idle';
    this.updateCallbacks = [];
    this.realTimeInterval = null;
  }

  // Process RLD file data
  async processRLDFile(file) {
    try {
      this.processingStatus = 'processing';
      this.notifyUpdate();

      // Read file content
      const content = await this.readFileContent(file);
      
      // Parse based on file extension
      let processedData = [];
      
      if (file.name.toLowerCase().endsWith('.rld')) {
        processedData = this.parseRLDData(content);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        processedData = this.parseCSVData(content);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        processedData = this.parseJSONData(content);
      } else {
        // Default to RLD parsing for unknown formats
        processedData = this.parseRLDData(content);
      }

      // Add processed data to existing data
      this.sensorData = [...this.sensorData, ...processedData];
      this.updateRealTimeData();
      
      this.processingStatus = 'completed';
      this.notifyUpdate();
      return processedData;
    } catch (error) {
      console.error('Error processing file:', error);
      this.processingStatus = 'error';
      this.notifyUpdate();
      throw error;
    }
  }

  // Read file content as text
  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Parse CSV data
  parseCSVData(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        const value = parseFloat(values[index]) || 0;
        row[header] = value;
      });
      
      if (Object.keys(row).length > 0) {
        row.timestamp = new Date().toISOString();
        row.time = new Date().toLocaleTimeString();
        data.push(row);
      }
    }
    
    return data;
  }

  // Parse JSON data
  parseJSONData(content) {
    try {
      const jsonData = JSON.parse(content);
      const data = [];
      
      if (Array.isArray(jsonData)) {
        jsonData.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            item.timestamp = new Date().toISOString();
            item.time = new Date().toLocaleTimeString();
            data.push(item);
          }
        });
      } else if (typeof jsonData === 'object') {
        jsonData.timestamp = new Date().toISOString();
        jsonData.time = new Date().toLocaleTimeString();
        data.push(jsonData);
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }

  // Parse RLD data into sensor readings
  parseRLDData(rawData) {
    const sensorReadings = [];
    const lines = rawData.split('\n').filter(line => line.trim());
    
    // Parse each line of RLD data
    lines.forEach((line, index) => {
      if (line && line.trim()) {
        const timestamp = new Date();
        timestamp.setMinutes(timestamp.getMinutes() - (lines.length - index));
        
        // Extract sensor values from RLD format
        const values = this.extractSensorValues(line);
        
        if (values) {
          sensorReadings.push({
            timestamp: timestamp.toISOString(),
            time: timestamp.toLocaleTimeString(),
            ...values
          });
        }
      }
    });

    return sensorReadings;
  }

  // Extract sensor values from RLD line
  extractSensorValues(line) {
    try {
      // RLD format typically has fixed-width fields
      // This is a simplified parser - adjust based on actual RLD format
      const parts = line.split(/\s+/);
      
      if (parts.length >= 10) {
        return {
          NRG_40C_Anem: parseFloat(parts[0]) || 0,
          NRG_200M_Vane: parseFloat(parts[1]) || 0,
          NRG_T60_Temp: parseFloat(parts[2]) || 0,
          NRG_RH5X_Humi: parseFloat(parts[3]) || 0,
          NRG_BP60_Baro: parseFloat(parts[4]) || 0,
          Rain_Gauge: parseFloat(parts[5]) || 0,
          NRG_PVT1_PV_Temp: parseFloat(parts[6]) || 0,
          PSM_c_Si_Isc_Soil: parseFloat(parts[7]) || 0,
          PSM_c_Si_Isc_Clean: parseFloat(parts[8]) || 0,
          Average_12V_Battery: parseFloat(parts[9]) || 0
        };
      }
    } catch (error) {
      console.error('Error parsing RLD line:', error);
    }
    return null;
  }

  // Generate realistic sample data for testing
  generateSampleData(count = 50) {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const time = new Date(now.getTime() - (count - i) * 60000);
      const baseTime = time.getTime() / 100000;
      
      data.push({
        timestamp: time.toISOString(),
        time: time.toLocaleTimeString(),
        NRG_40C_Anem: 8 + 6 * Math.sin(baseTime * 0.1) + Math.random() * 2,
        NRG_200M_Vane: 180 + 90 * Math.sin(baseTime * 0.05) + Math.random() * 10,
        NRG_T60_Temp: 22 + 3 * Math.sin(baseTime * 0.08) + Math.random() * 1,
        NRG_RH5X_Humi: 65 + 8 * Math.sin(baseTime * 0.06) + Math.random() * 3,
        NRG_BP60_Baro: 1013 + 5 * Math.sin(baseTime * 0.04) + Math.random() * 0.5,
        Rain_Gauge: Math.max(0, 0.1 * Math.sin(baseTime * 2) + Math.random() * 0.2),
        NRG_PVT1_PV_Temp: 35 + 5 * Math.sin(baseTime * 0.07) + Math.random() * 2,
        PSM_c_Si_Isc_Soil: 2.4 + 0.5 * Math.sin(baseTime * 0.09) + Math.random() * 0.3,
        PSM_c_Si_Isc_Clean: 3.1 + 0.4 * Math.sin(baseTime * 0.08) + Math.random() * 0.2,
        Average_12V_Battery: 12.5 + 0.3 * Math.sin(baseTime * 0.03) + Math.random() * 0.1
      });
    }
    
    this.sensorData = [...this.sensorData, ...data];
    this.updateRealTimeData();
    this.notifyUpdate();
    return data;
  }

  // Update real-time data for live visualization
  updateRealTimeData() {
    if (this.sensorData.length > 0) {
      // Get the last 50 data points for real-time display
      this.realTimeData = this.sensorData.slice(-50);
    }
  }

  // Get sensor statistics
  getSensorStats(sensorName) {
    if (this.sensorData.length === 0) return null;
    
    const values = this.sensorData.map(d => d[sensorName]).filter(v => !isNaN(v));
    if (values.length === 0) return null;
    
    const sorted = values.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return { min, max, avg, median, current: values[values.length - 1] };
  }

  // Calculate sensor index (low/moderate/high)
  getSensorIndex(sensorName, value) {
    const stats = this.getSensorStats(sensorName);
    if (!stats) return { level: 'NORMAL', color: '#58a6ff' };
    
    const { min, max, avg } = stats;
    const range = max - min;
    const percentile = (value - min) / range;
    
    if (percentile <= 0.25) {
      return { level: 'LOW', color: '#58a6ff' };
    } else if (percentile <= 0.75) {
      return { level: 'MODERATE', color: '#f5a623' };
    } else {
      return { level: 'HIGH', color: '#d0021b' };
    }
  }

  // Get current sensor values
  getCurrentValues() {
    if (this.realTimeData.length === 0) return {};
    return this.realTimeData[this.realTimeData.length - 1];
  }

  // Get data for charts
  getChartData() {
    return this.realTimeData;
  }

  // Start real-time updates
  startRealTimeUpdates(interval = 5000) {
    this.updateInterval = setInterval(() => {
      this.addNewDataPoint();
    }, interval);
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Add new data point for real-time simulation
  addNewDataPoint() {
    if (this.sensorData.length === 0) return;
    
    const lastPoint = this.sensorData[this.sensorData.length - 1];
    const now = new Date();
    const baseTime = now.getTime() / 100000;
    
    const newPoint = {
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString(),
      NRG_40C_Anem: lastPoint.NRG_40C_Anem + (Math.random() - 0.5) * 2,
      NRG_200M_Vane: (lastPoint.NRG_200M_Vane + Math.random() * 10) % 360,
      NRG_T60_Temp: lastPoint.NRG_T60_Temp + (Math.random() - 0.5) * 0.5,
      NRG_RH5X_Humi: Math.max(0, Math.min(100, lastPoint.NRG_RH5X_Humi + (Math.random() - 0.5) * 2)),
      NRG_BP60_Baro: lastPoint.NRG_BP60_Baro + (Math.random() - 0.5) * 0.2,
      Rain_Gauge: Math.max(0, lastPoint.Rain_Gauge + (Math.random() - 0.5) * 0.1),
      NRG_PVT1_PV_Temp: lastPoint.NRG_PVT1_PV_Temp + (Math.random() - 0.5) * 1,
      PSM_c_Si_Isc_Soil: Math.max(0, lastPoint.PSM_c_Si_Isc_Soil + (Math.random() - 0.5) * 0.1),
      PSM_c_Si_Isc_Clean: Math.max(0, lastPoint.PSM_c_Si_Isc_Clean + (Math.random() - 0.5) * 0.1),
      Average_12V_Battery: lastPoint.Average_12V_Battery + (Math.random() - 0.5) * 0.05
    };
    
    this.sensorData.push(newPoint);
    this.updateRealTimeData();
    this.notifyUpdate();
  }

  // Subscribe to data updates
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  // Notify all subscribers
  notifyUpdate() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback({
          sensorData: this.sensorData,
          realTimeData: this.realTimeData,
          processingStatus: this.processingStatus,
          currentValues: this.getCurrentValues()
        });
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  // Get processing status
  getProcessingStatus() {
    return this.processingStatus;
  }

  // Clear all data
  clearData() {
    this.sensorData = [];
    this.realTimeData = [];
    this.notifyUpdate();
  }
}

export default new DataProcessor(); 