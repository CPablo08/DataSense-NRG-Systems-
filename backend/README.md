# NRG RLD Converter Backend

This is the backend service for the NRG DataSense platform that handles RLD to TXT conversion using the `nrgpy` library.

## Features

- Convert RLD files to TXT format using NRG Cloud Convert API
- RESTful API endpoints for file processing
- Automatic cleanup of temporary files
- CORS support for frontend integration
- Configurable settings via environment variables

## Prerequisites

- Python 3.8 or higher
- NRG Cloud Convert API credentials (Client ID and Client Secret)

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (create a `.env` file):
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

## Usage

### Development
```bash
python run.py
```

### Production
```bash
export FLASK_CONFIG=production
python run.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns service status

### Convert RLD Files
- **POST** `/convert-rld`
- Converts uploaded RLD files to TXT format

**Request:**
- `files`: RLD files (multipart/form-data)
- `client_id`: NRG Cloud Convert Client ID
- `client_secret`: NRG Cloud Convert Client Secret
- `file_filter`: Optional file filter (e.g., "000110")
- `start_date`: Optional start date (YYYY-MM-DD)
- `end_date`: Optional end date (YYYY-MM-DD)

**Response:**
- ZIP file containing converted TXT files

### Service Status
- **GET** `/convert-status`
- Returns service configuration and capabilities

## Configuration

The application can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_CONFIG` | Configuration environment | `default` |
| `FLASK_DEBUG` | Enable debug mode | `False` |
| `PORT` | Server port | `5000` |
| `HOST` | Server host | `0.0.0.0` |
| `MAX_CONTENT_LENGTH` | Max file size (bytes) | `104857600` (100MB) |
| `TEMP_FILE_RETENTION_HOURS` | Temp file cleanup hours | `1` |
| `LOG_LEVEL` | Logging level | `INFO` |

## File Structure

```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration management
├── run.py              # Startup script
├── requirements.txt    # Python dependencies
├── README.md          # This file
├── uploads/           # Upload directory (auto-created)
└── temp/              # Temporary files (auto-created)
```

## Error Handling

The service includes comprehensive error handling:

- Invalid file types are rejected
- Missing credentials return appropriate errors
- Conversion failures are logged and reported
- Temporary files are automatically cleaned up

## Security

- File uploads are validated for allowed extensions
- Temporary files are automatically cleaned up
- CORS is configured for frontend integration
- Environment variables for sensitive configuration

## Integration with Frontend

This backend is designed to work with the React frontend. The frontend will:

1. Upload RLD files to `/convert-rld`
2. Receive converted TXT files as a ZIP download
3. Process the TXT files for visualization

## Troubleshooting

### Common Issues

1. **Import Error for nrgpy**: Ensure nrgpy is installed correctly
2. **CORS Errors**: Check CORS configuration for your frontend domain
3. **File Upload Failures**: Verify file size limits and allowed extensions
4. **Conversion Failures**: Check NRG Cloud Convert API credentials

### Logs

The application logs all operations. Check the console output for detailed information about:

- File uploads
- Conversion progress
- Error messages
- Cleanup operations

## License

This project is part of the NRG DataSense platform.
