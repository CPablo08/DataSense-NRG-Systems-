# NRG DataSense Configuration Guide

This guide will help you configure the NRG DataSense platform to work with your NRG Cloud Convert API credentials.

## 🔑 Getting NRG Cloud Convert API Credentials

### Step 1: Access NRG Cloud Convert
1. Go to [NRG Cloud Convert](https://cloud.nrgsystems.com/data-manager/api-setup)
2. Sign in to your NRG Systems account
3. Navigate to the API setup section

### Step 2: Generate API Credentials
1. Click "Generate New API Key" or similar option
2. Note down your **Client ID** and **Client Secret**
3. Keep these credentials secure - they provide access to your NRG data

## ⚙️ Platform Configuration

### Method 1: Using the Settings Panel (Recommended)

1. **Start the Platform**:
   ```bash
   ./start.sh
   ```

2. **Open the Application**:
   - Navigate to `http://localhost:3000`
   - The frontend will automatically open in your browser

3. **Access Settings**:
   - Click the settings icon (⚙️) in the top-right corner
   - This opens the configuration panel

4. **Configure NRG API**:
   - **Client ID**: Enter your NRG Cloud Convert Client ID
   - **Client Secret**: Enter your NRG Cloud Convert Client Secret
   - **File Filter**: Optional - specify file filter (e.g., "000110")
   - **Start Date**: Optional - specify start date (YYYY-MM-DD)
   - **End Date**: Optional - specify end date (YYYY-MM-DD)

5. **Save Configuration**:
   - Click "Save" to store your settings
   - The configuration will be saved for future sessions

### Method 2: Environment Variables (Advanced)

1. **Create Environment File**:
   ```bash
   cd backend
   cp .env.example .env  # if example exists
   # or create .env manually
   ```

2. **Edit .env File**:
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

3. **Restart Backend**:
   ```bash
   # Stop the current backend (Ctrl+C)
   # Then restart
   cd backend
   python run.py
   ```

## 🧪 Testing Your Configuration

### Test Backend Setup
```bash
cd backend
python test_setup.py
```

This will verify:
- ✅ All Python packages are installed
- ✅ nrgpy library is working
- ✅ Flask application can start

### Test API Connection
1. **Upload a Test RLD File**:
   - Use the "Upload Files" button
   - Select a small RLD file for testing
   - Click "Process Files"

2. **Check Processing Log**:
   - Watch the processing log in the sidebar
   - Look for success messages
   - Check for any error messages

## 📁 File Format Support

### Supported Input Formats
- **RLD Files**: NRG Systems raw data files
- **TXT Files**: Converted or exported text files

### Processing Options
- **File Filter**: Filter specific file types (e.g., "000110")
- **Date Range**: Process files within specific date ranges
- **Batch Processing**: Upload multiple files at once

## 🔍 Troubleshooting Configuration

### Common Issues

1. **"Backend Service Unavailable"**
   - Ensure Python backend is running on port 5000
   - Check terminal for error messages
   - Verify virtual environment is activated

2. **"NRG API credentials not configured"**
   - Open Settings panel
   - Enter Client ID and Client Secret
   - Click Save

3. **"Conversion failed"**
   - Verify API credentials are correct
   - Check internet connection
   - Ensure RLD file format is valid

4. **"Port already in use"**
   - Backend uses port 5000
   - Frontend uses port 3000
   - Stop conflicting services

### Verification Steps

1. **Check Backend Health**:
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status": "healthy", "service": "nrgpy-rld-converter"}`

2. **Check Service Status**:
   ```bash
   curl http://localhost:5000/convert-status
   ```
   Should return service capabilities

3. **Test File Upload**:
   - Use a small RLD file for testing
   - Monitor the processing log
   - Check for successful conversion

## 🔒 Security Notes

- **Keep Credentials Secure**: Don't share your Client ID and Client Secret
- **Environment Variables**: Use .env files for production deployments
- **Network Security**: Ensure proper firewall rules for production use
- **File Privacy**: RLD files are processed locally and not stored permanently

## 📞 Getting Help

If you encounter issues:

1. **Check the Logs**: Use the processing log panel in the application
2. **Verify Setup**: Run `python test_setup.py` in the backend directory
3. **Test API**: Verify your NRG Cloud Convert API credentials work
4. **Check Documentation**: Review the main README.md file

## 🎯 Next Steps

Once configured:

1. **Upload RLD Files**: Use the upload button to select your files
2. **Process Data**: Click "Process Files" to convert and visualize
3. **Explore Charts**: Use the interactive dashboard for data analysis
4. **Generate Reports**: Create PDF reports for documentation
5. **Save to Library**: Store processed data for future access

---

**Note**: The platform requires valid NRG Cloud Convert API credentials to process RLD files. If you don't have access to the NRG Cloud Convert API, you can still process TXT files that have been converted using other methods.
