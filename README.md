# NRG DataSense Platform

A comprehensive environmental data visualization and analysis platform designed specifically for processing NRG Systems meteorological station data. The platform now integrates with the NRG Cloud Convert API using the `nrgpy` library to convert RLD files to TXT format for enhanced data processing and visualization.

## 🚀 Features

### Core Functionality
- **RLD to TXT Conversion**: Convert NRG Systems RLD files to TXT format using the NRG Cloud Convert API
- **Real-time Data Visualization**: Interactive charts for wind speed, temperature, humidity, pressure, rainfall, solar current, and battery voltage
- **Wind Rose Analysis**: Specialized wind direction visualization with degree-based analysis
- **Multi-format Support**: Process both RLD files (via conversion) and TXT files directly
- **Historical Data Library**: Store and retrieve processed data files
- **Full-screen Analysis**: Detailed data analysis with time range selection

### Technical Features
- **Modern React Frontend**: Built with React.js, Styled Components, and Recharts
- **Python Backend**: Flask-based API service with nrgpy integration
- **Multi-language Support**: English and Spanish (Dominican Republic) localization
- **Responsive Design**: Modern, dark-themed UI optimized for data visualization
- **PDF Report Generation**: Export comprehensive data analysis reports
- **Automatic Cleanup**: Smart file management and cleanup systems

## 🏗️ Architecture

The platform consists of two main components:

### Frontend (React)
- **Location**: `src/` directory
- **Port**: 3000 (default)
- **Technologies**: React, Styled Components, Recharts, Framer Motion
- **Features**: Data visualization, file upload, settings management

### Backend (Python/Flask)
- **Location**: `backend/` directory
- **Port**: 5000 (default)
- **Technologies**: Flask, nrgpy, CORS
- **Features**: RLD to TXT conversion, file processing, API endpoints

## 📋 Prerequisites

- **Node.js**: 16.x or higher
- **Python**: 3.8 or higher
- **NRG Cloud Convert API**: Client ID and Client Secret
- **Operating System**: macOS, Linux, or Windows

## 🛠️ Installation

### Quick Start (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd DataSense-NRG-Systems-
   ```

2. **Run the startup script**:
   ```bash
   ./start.sh
   ```

   This script will:
   - Create Python virtual environment
   - Install all dependencies
   - Start both backend and frontend services
   - Open the application in your browser

### Manual Installation

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

#### Frontend Setup
```bash
npm install
npm start
```

## ⚙️ Configuration

### NRG API Credentials

1. **Access the Settings Panel**: Click the settings icon in the top-right corner
2. **Configure NRG API**:
   - **Client ID**: Your NRG Cloud Convert API Client ID
   - **Client Secret**: Your NRG Cloud Convert API Client Secret
   - **File Filter**: Optional filter for specific file types (e.g., "000110")
   - **Date Range**: Optional start and end dates for data processing

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# NRG Cloud Convert API credentials
NRG_CLIENT_ID=your_client_id_here
NRG_CLIENT_SECRET=your_client_secret_here

# Optional settings
DEFAULT_FILE_FILTER=000110
DEFAULT_START_DATE=2024-01-01
DEFAULT_END_DATE=2024-12-31
FLASK_DEBUG=True
LOG_LEVEL=INFO
```

## 📊 Usage

### Processing RLD Files

1. **Upload Files**: Click "Upload Files" and select your RLD files
2. **Configure Settings**: Ensure NRG API credentials are set in Settings
3. **Process Files**: Click "Process Files" to convert RLD to TXT
4. **View Results**: Data will be automatically visualized in the dashboard

### Processing TXT Files

1. **Upload Files**: Select TXT files (converted from RLD or direct exports)
2. **Process Files**: Click "Process Files" for direct processing
3. **Visualize Data**: View charts and analysis in the dashboard

### Data Analysis

- **Interactive Charts**: Click and drag to zoom, hover for details
- **Full-screen Analysis**: Double-click any chart for detailed view
- **Time Range Selection**: Use the analysis window for specific time periods
- **PDF Reports**: Generate comprehensive reports with the PDF button

## 🔧 API Endpoints

### Backend API (Port 5000)

- `GET /health` - Service health check
- `GET /convert-status` - Conversion service status
- `POST /convert-rld` - Convert RLD files to TXT format

### Request Format for RLD Conversion

```javascript
const formData = new FormData();
formData.append('files', rldFile);
formData.append('client_id', 'your_client_id');
formData.append('client_secret', 'your_client_secret');
formData.append('file_filter', '000110'); // optional
formData.append('start_date', '2024-01-01'); // optional
formData.append('end_date', '2024-12-31'); // optional
```

## 📁 File Structure

```
DataSense-NRG-Systems-/
├── backend/                 # Python backend service
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration management
│   ├── run.py              # Startup script
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Backend documentation
├── src/                    # React frontend
│   ├── App.js             # Main application component
│   ├── services/          # API services
│   │   └── api.js         # Backend communication
│   └── index.js           # Application entry point
├── public/                # Static assets
├── package.json           # Node.js dependencies
├── start.sh              # Platform startup script
└── README.md             # This file
```

## 🎯 Supported Sensor Types

The platform supports the following NRG Systems sensors:

- **Wind Speed** (NRG_40C_Anem): Anemometer readings in m/s
- **Wind Direction** (NRG_200M_Vane): Wind vane readings in degrees
- **Temperature** (NRG_T60_Temp): Temperature sensor in °C
- **Humidity** (NRG_RH5X_Humi): Relative humidity in %
- **Pressure** (NRG_BP60_Baro): Barometric pressure in hPa
- **Rainfall** (Rain_Gauge): Rainfall accumulation in mm
- **Solar Current** (PSM_c_Si_Isc_*): Solar panel current in mA
- **Battery Voltage** (Average_12V_Battery): Battery voltage in V

## 🔍 Troubleshooting

### Common Issues

1. **Backend Service Unavailable**
   - Ensure Python backend is running on port 5000
   - Check virtual environment is activated
   - Verify all dependencies are installed

2. **RLD Conversion Fails**
   - Verify NRG API credentials are correct
   - Check file format is valid RLD
   - Ensure internet connection for API calls

3. **Port Conflicts**
   - Backend uses port 5000
   - Frontend uses port 3000
   - Use `lsof -i :<port>` to check port usage

4. **File Upload Issues**
   - Maximum file size: 100MB
   - Supported formats: .rld, .txt
   - Check browser console for errors

### Logs and Debugging

- **Frontend Logs**: Check browser developer console
- **Backend Logs**: View terminal output where backend is running
- **Processing Logs**: Use the processing log panel in the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the NRG DataSense platform and is designed for environmental data analysis and visualization.

## 🆘 Support

For technical support or questions:
- Check the troubleshooting section
- Review the backend and frontend documentation
- Ensure all prerequisites are met
- Verify NRG API credentials are valid

---

**Note**: This platform requires valid NRG Cloud Convert API credentials to process RLD files. Please ensure you have the necessary API access before using the RLD conversion features. 