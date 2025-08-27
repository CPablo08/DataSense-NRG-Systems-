#!/usr/bin/env python3
"""
NRG DataSense Backend
FastAPI backend for RLD file processing and data visualization
"""

import os
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from sqlalchemy.orm import Session

# Import database
from database import get_db, create_tables, FileMetadata, SensorData

# Import NRG library
try:
    import nrgpy
    print("✅ NRG library imported successfully")
except ImportError as e:
    print(f"❌ Error importing NRG library: {e}")
    print("Please ensure nrgpy is installed")
    raise ImportError(f"Required NRG library not available: {e}")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="NRG DataSense API",
    description="Unified backend for NRG Systems meteorological data processing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://nrg-datasense-frontend.onrender.com",
        "https://nrg-datasense.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class NRGConfig(BaseModel):
    output_folder: str = "./converted"
    file_filter: str = "000110"

class ProcessedData(BaseModel):
    timestamp: str
    data: List[Dict[str, Any]]
    file_count: int
    total_records: int

# Global variables
data_storage_file = "data_storage.json"
websocket_connections: List[WebSocket] = []
processed_data: List[Dict] = []
is_monitoring = False  # Flag to track monitoring status

def setup_directories():
    """Create necessary directories"""
    dirs = ["uploads", "converted", "logs"]
    for dir_name in dirs:
        Path(dir_name).mkdir(exist_ok=True)
        logger.info(f"Created directory: {dir_name}")

def convert_rld_to_txt(rld_file_path: str, output_folder: str = "./converted") -> str:
    """Convert RLD file to TXT using local nrgpy"""
    try:
        logger.info(f"Converting {rld_file_path} to TXT...")
        
        # Use nrgpy.local_rld for local conversion
        converter = nrgpy.local_rld(
            rld_dir=os.path.dirname(rld_file_path),
            out_dir=output_folder,
            file_filter="000110"
        )
        
        # Convert the file
        converter.convert()
        
        # Find the converted TXT file
        txt_file = rld_file_path.replace('.rld', '.txt')
        txt_file = os.path.join(output_folder, os.path.basename(txt_file))
        
        if os.path.exists(txt_file):
            logger.info(f"Successfully converted {rld_file_path} to {txt_file}")
            return txt_file
        else:
            logger.warning(f"TXT file not found for {rld_file_path}")
            return None
            
    except Exception as e:
        logger.error(f"Error converting {rld_file_path}: {e}")
        return None

def process_txt_file(txt_file: str) -> List[Dict]:
    """Process SymphoniePRO TXT file and extract sensor data efficiently"""
    try:
        logger.info(f"Starting to process {txt_file}")
        
        # Read file line by line to handle large files efficiently
        processed_data = []
        header_line_index = -1
        sensor_mapping = {}
        
        with open(txt_file, 'r') as f:
            for i, line in enumerate(f):
                line = line.strip()
                
                # Find header line
                if "Timestamp" in line and header_line_index == -1:
                    header_line_index = i
                    headers = line.split('\t')
                    
                    # Map column indices to sensor names based on actual file structure
                    sensor_mapping = {
                        "NRG_40C_Anem": 1,      # Ch1_Anem_0.00m_N_Avg_m/s (Wind Speed)
                        "NRG_200M_Vane": 7,     # Ch13_Vane_0.00m_N_Avg_Deg (Wind Direction)
                        "NRG_T60_Temp": 10,     # Ch14_Analog_0.00m_N_Avg_C (Temperature)
                        "NRG_RH5X_Humi": 14,    # Ch16_Analog_0.00m_N_Avg_%RH (Humidity)
                        "NRG_BP60_Baro": 18,    # Ch17_Analog_0.00m_N_Avg_hPa (Pressure)
                        "Rain_Gauge": 6,        # Ch4_Total_0.00m_N_Sum_mm (Rainfall)
                        "NRG_PVT1_PV_Temp": 26, # Ch21_Therm_0.00m_N_Avg_C (PV Temperature)
                        "PSM_c_Si_Isc_Soil": 30, # Ch22_Analog_0.00m_N_Avg_A (Solar Current Soil)
                        "PSM_c_Si_Isc_Clean": 34, # Ch23_Analog_0.00m_N_Avg_A (Solar Current Clean)
                        "Solar_Irradiance_1": 38, # Ch24_Analog_0.00m_N_Avg_W/m2 (Solar Irradiance 1)
                        "Solar_Irradiance_2": 42, # Ch25_Analog_0.00m_N_Avg_W/m2 (Solar Irradiance 2)
                        "Solar_Irradiance_3": 46, # Ch26_Analog_0.00m_N_Avg_W/m2 (Solar Irradiance 3)
                        "Average_12V_Battery": 22  # Ch20_Analog_0.00m_N_Avg_hPa (Battery Voltage)
                    }
                    
                    logger.info(f"Found header at line {i+1}, sensor mapping: {sensor_mapping}")
                    continue
                
                # Process data lines after header
                if header_line_index != -1 and i > header_line_index and line and not line.startswith('#'):
                    try:
                        # Parse tab-separated values
                        values = line.split('\t')
                        if len(values) < 2:  # Need at least timestamp
                            continue
                        
                        # Extract timestamp
                        timestamp = values[0].strip()
                        if not timestamp or len(timestamp) < 19:
                            continue
                        
                        # Create data record with mapped sensor values
                        record = {
                            "time": timestamp,
                            "timestamp": timestamp,
                            "filename": os.path.basename(txt_file)
                        }
                        
                        # Add sensor values based on mapping
                        for sensor_name, column_index in sensor_mapping.items():
                            if column_index < len(values):
                                try:
                                    value = float(values[column_index].strip()) if values[column_index].strip() else 0
                                    record[sensor_name] = value
                                except (ValueError, IndexError):
                                    record[sensor_name] = 0
                            else:
                                record[sensor_name] = 0
                        
                        # Add default values for missing sensors
                        default_sensors = [
                            "NRG_40C_Anem", "NRG_200M_Vane", "NRG_T60_Temp", "NRG_RH5X_Humi",
                            "NRG_BP60_Baro", "Rain_Gauge", "NRG_PVT1_PV_Temp", 
                            "PSM_c_Si_Isc_Soil", "PSM_c_Si_Isc_Clean", "Average_12V_Battery"
                        ]
                        
                        for sensor in default_sensors:
                            if sensor not in record:
                                record[sensor] = 0
                        
                        processed_data.append(record)
                        
                        # Log progress every 1000 records
                        if len(processed_data) % 1000 == 0:
                            logger.info(f"Processed {len(processed_data)} records so far...")
                        
                    except Exception as e:
                        logger.warning(f"Error parsing line {i+1} in {txt_file}: {e}")
                        continue
        
        logger.info(f"Successfully processed {len(processed_data)} records from {txt_file}")
        return processed_data
        
    except Exception as e:
        logger.error(f"Error processing {txt_file}: {e}")
        return []

def extract_site_properties(txt_file: str) -> Dict:
    """Extract site properties from SymphoniePRO TXT file header"""
    try:
        with open(txt_file, 'r') as f:
            content = f.read()
        
        lines = content.split('\n')
        site_properties = {}
        
        for line in lines:
            line = line.strip()
            if ':' in line and not line.startswith('#'):
                parts = line.split(':', 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    value = parts[1].strip()
                    
                    if key in ['Site Number', 'Location', 'Latitude', 'Longitude', 'Elevation', 'Time Zone']:
                        site_properties[key] = value
        
        return site_properties
    except Exception as e:
        logger.error(f"Error extracting site properties: {e}")
        return {}

def extract_site_properties_from_data(data: List[Dict]) -> Dict:
    """Extract site properties from processed data"""
    if not data or len(data) == 0:
        return {}
    
    # Get the first record to extract site properties
    first_record = data[0]
    
    # Extract site properties (these would be in the header of the original file)
    site_properties = {
        "site_name": "NRG DataSense Site",
        "location": "Unknown",
        "elevation": "Unknown",
        "coordinates": "Unknown",
        "installation_date": "Unknown",
        "last_calibration": "Unknown"
    }
    
    return site_properties

def load_data() -> List[Dict]:
    """Load processed data from file"""
    if os.path.exists(data_storage_file):
        try:
            with open(data_storage_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading data: {e}")
    return []

def save_data(data: List[Dict]):
    """Save processed data to file"""
    try:
        with open(data_storage_file, 'w') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Data saved to {data_storage_file}")
    except Exception as e:
        logger.error(f"Error saving data: {e}")

def save_file_metadata(metadata: Dict, db: Session):
    """Save file metadata with timestamps to database"""
    try:
        db_metadata = FileMetadata(
            filename=metadata["filename"],
            timestamp=datetime.fromisoformat(metadata["timestamp"]),
            records_added=metadata["records_added"],
            file_size=metadata["file_size"],
            processing_date=metadata["processing_date"],
            status=metadata["status"],
            tags=metadata.get("tags", []),
            source=metadata.get("source", "backend")
        )
        db.add(db_metadata)
        db.commit()
        logger.info(f"File metadata saved to database: {metadata['filename']}")
    except Exception as e:
        logger.error(f"Error saving file metadata: {e}")
        db.rollback()

def get_file_metadata(db: Session) -> List[Dict]:
    """Get all file metadata from database"""
    try:
        db_metadata = db.query(FileMetadata).order_by(FileMetadata.timestamp.desc()).all()
        return [
            {
                "id": item.id,
                "filename": item.filename,
                "timestamp": item.timestamp.isoformat(),
                "records_added": item.records_added,
                "file_size": item.file_size,
                "processing_date": item.processing_date,
                "status": item.status,
                "tags": item.tags,
                "source": item.source
            }
            for item in db_metadata
        ]
    except Exception as e:
        logger.error(f"Error loading file metadata: {e}")
        return []

async def broadcast_to_websockets(message: Dict):
    """Broadcast message to all connected WebSocket clients"""
    if websocket_connections:
        for connection in websocket_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NRG DataSense Unified Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "nrg-datasense-api",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "monitoring": is_monitoring
    }

@app.post("/api/process-rld")
async def process_rld_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Process uploaded RLD file"""
    try:
        # Save uploaded file
        upload_path = f"uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Convert RLD to TXT
        txt_file = convert_rld_to_txt(upload_path)
        if not txt_file:
            raise HTTPException(status_code=400, detail="Failed to convert RLD file")
        
        # Process TXT file
        new_data = process_txt_file(txt_file)
        if not new_data:
            raise HTTPException(status_code=400, detail="No data extracted from file")
        
        # Add to global data
        global processed_data
        processed_data.extend(new_data)
        
        # Save to file
        save_data(processed_data)
        
        # Create file metadata with timestamp
        file_metadata = {
            "filename": file.filename,
            "timestamp": datetime.now().isoformat(),
            "records_added": len(new_data),
            "file_size": len(content),
            "processing_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "processed"
        }
        
        # Save file metadata to database
        save_file_metadata(file_metadata, db)
        
        # Save sensor data to database
        for record in new_data:
            sensor_record = SensorData(
                file_source=file.filename,
                time=record.get('time', ''),
                timestamp=datetime.fromisoformat(record.get('timestamp', datetime.now().isoformat())),
                NRG_40C_Anem=record.get('NRG_40C_Anem'),
                NRG_200M_Vane=record.get('NRG_200M_Vane'),
                NRG_T60_Temp=record.get('NRG_T60_Temp'),
                NRG_RH5X_Humi=record.get('NRG_RH5X_Humi'),
                NRG_BP60_Baro=record.get('NRG_BP60_Baro'),
                Rain_Gauge=record.get('Rain_Gauge'),
                NRG_PVT1_PV_Temp=record.get('NRG_PVT1_PV_Temp'),
                PSM_c_Si_Isc_Soil=record.get('PSM_c_Si_Isc_Soil'),
                PSM_c_Si_Isc_Clean=record.get('PSM_c_Si_Isc_Clean'),
                Average_12V_Battery=record.get('Average_12V_Battery')
            )
            db.add(sensor_record)
        
        db.commit()
        logger.info(f"Saved {len(new_data)} sensor records to database for file: {file.filename}")
        
        # Broadcast to WebSocket clients
        await broadcast_to_websockets({
            "type": "new_data",
            "data": new_data,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "message": "RLD file processed successfully",
            "records_added": len(new_data),
            "filename": file.filename
        }
        
    except Exception as e:
        logger.error(f"Error processing RLD file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-txt")
async def process_txt_file_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Process uploaded TXT file directly"""
    try:
        # Check if file is TXT
        if not file.filename.lower().endswith('.txt'):
            raise HTTPException(status_code=400, detail="File must be a TXT file")
        
        # Save uploaded file
        upload_path = f"uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process TXT file
        new_data = process_txt_file(upload_path)
        if not new_data:
            raise HTTPException(status_code=400, detail="No data extracted from file")
        
        # Add to global data
        global processed_data
        processed_data.extend(new_data)
        
        # Save to file
        save_data(processed_data)
        
        # Create file metadata with timestamp
        file_metadata = {
            "filename": file.filename,
            "timestamp": datetime.now().isoformat(),
            "records_added": len(new_data),
            "file_size": len(content),
            "processing_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "processed",
            "source": "txt_upload"
        }
        
        # Save file metadata to database
        save_file_metadata(file_metadata, db)
        
        # Save sensor data to database
        for record in new_data:
            sensor_record = SensorData(
                file_source=file.filename,
                time=record.get('time', ''),
                timestamp=datetime.fromisoformat(record.get('timestamp', datetime.now().isoformat())),
                NRG_40C_Anem=record.get('NRG_40C_Anem'),
                NRG_200M_Vane=record.get('NRG_200M_Vane'),
                NRG_T60_Temp=record.get('NRG_T60_Temp'),
                NRG_RH5X_Humi=record.get('NRG_RH5X_Humi'),
                NRG_BP60_Baro=record.get('NRG_BP60_Baro'),
                Rain_Gauge=record.get('Rain_Gauge'),
                NRG_PVT1_PV_Temp=record.get('NRG_PVT1_PV_Temp'),
                PSM_c_Si_Isc_Soil=record.get('PSM_c_Si_Isc_Soil'),
                PSM_c_Si_Isc_Clean=record.get('PSM_c_Si_Isc_Clean'),
                Average_12V_Battery=record.get('Average_12V_Battery')
            )
            db.add(sensor_record)
        
        db.commit()
        logger.info(f"Saved {len(new_data)} sensor records to database for file: {file.filename}")
        
        # Broadcast to WebSocket clients
        await broadcast_to_websockets({
            "type": "new_data",
            "data": new_data,
            "timestamp": datetime.now().isoformat()
        })
        
        # Extract site properties
        site_properties = extract_site_properties(upload_path)
        
        # Create summary for the processed data
        summary = {
            "totalRecords": len(processed_data),
            "sensorCount": len(new_data[0]) if new_data else 0,
            "fileCount": 1,
            "lastUpdate": datetime.now().isoformat(),
            "siteProperties": site_properties
        }
        
        return {
            "message": "TXT file processed successfully",
            "records_added": len(new_data),
            "filename": file.filename,
            "data": new_data,
            "summary": summary,
            "siteProperties": site_properties
        }
        
    except Exception as e:
        logger.error(f"Error processing TXT file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert-rld-to-txt")
async def convert_rld_to_txt_endpoint(file: UploadFile = File(...)):
    """Convert RLD file to TXT without processing data"""
    try:
        # Save uploaded file
        upload_path = f"uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Convert RLD to TXT
        txt_file = convert_rld_to_txt(upload_path)
        if not txt_file:
            raise HTTPException(status_code=400, detail="Failed to convert RLD file")
        
        # Read the converted TXT file
        with open(txt_file, 'r') as f:
            txt_content = f.read()
        
        return {
            "message": "RLD file converted to TXT successfully",
            "txt_filename": os.path.basename(txt_file),
            "txt_content": txt_content,
            "original_filename": file.filename,
            "converted_file_path": txt_file
        }
        
    except Exception as e:
        logger.error(f"Error converting RLD to TXT: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data")
async def get_data():
    """Get all processed data"""
    try:
        data = load_data()
        return {
            "data": data,
            "count": len(data),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/{file_id}")
async def get_data_by_file_id(file_id: int, db: Session = Depends(get_db)):
    """Get processed data for a specific file ID from database"""
    try:
        # Get file metadata
        file_metadata = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get associated sensor data
        sensor_data = db.query(SensorData).filter(SensorData.file_source == file_metadata.filename).all()
        
        if not sensor_data:
            # Fallback to global data if no specific file data
            data = load_data()
            if not data or len(data) == 0:
                raise HTTPException(status_code=404, detail="No data available")
        else:
            # Convert sensor data to the expected format
            data = []
            for record in sensor_data:
                data_point = {
                    'time': record.time,
                    'timestamp': record.timestamp.isoformat(),
                    'NRG_40C_Anem': record.NRG_40C_Anem,
                    'NRG_200M_Vane': record.NRG_200M_Vane,
                    'NRG_T60_Temp': record.NRG_T60_Temp,
                    'NRG_RH5X_Humi': record.NRG_RH5X_Humi,
                    'NRG_BP60_Baro': record.NRG_BP60_Baro,
                    'Rain_Gauge': record.Rain_Gauge,
                    'NRG_PVT1_PV_Temp': record.NRG_PVT1_PV_Temp,
                    'PSM_c_Si_Isc_Soil': record.PSM_c_Si_Isc_Soil,
                    'PSM_c_Si_Isc_Clean': record.PSM_c_Si_Isc_Clean,
                    'Average_12V_Battery': record.Average_12V_Battery
                }
                data.append(data_point)
        
        return {
            "data": data,
            "filename": file_metadata.filename,
            "records": len(data),
            "siteProperties": extract_site_properties_from_data(data) if data else {},
            "fileMetadata": {
                "id": file_metadata.id,
                "filename": file_metadata.filename,
                "records_added": file_metadata.records_added,
                "processing_date": file_metadata.processing_date,
                "status": file_metadata.status,
                "tags": file_metadata.tags,
                "category": getattr(file_metadata, 'category', 'general')
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting data for file ID {file_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/files/{filename}")
async def delete_file(filename: str, db: Session = Depends(get_db)):
    """Delete a file from the system"""
    try:
        # Remove file metadata from database
        db_metadata = db.query(FileMetadata).filter(FileMetadata.filename == filename).first()
        if db_metadata:
            db.delete(db_metadata)
            db.commit()
            logger.info(f"File metadata deleted from database: {filename}")
        
        # Remove uploaded file
        upload_path = f"uploads/{filename}"
        if os.path.exists(upload_path):
            os.remove(upload_path)
            logger.info(f"Uploaded file deleted: {upload_path}")
        
        # Remove converted file if it exists
        converted_path = f"converted/{filename}"
        if os.path.exists(converted_path):
            os.remove(converted_path)
            logger.info(f"Converted file deleted: {converted_path}")
        
        return {
            "message": f"File {filename} deleted successfully",
            "filename": filename
        }
        
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files")
async def get_files(db: Session = Depends(get_db)):
    """Get all file metadata with timestamps"""
    try:
        metadata = get_file_metadata(db)
        return {
            "files": metadata,
            "count": len(metadata),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting file metadata: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-data")
async def upload_data(filename: str, content: str, new_data: List[Dict], db: Session = Depends(get_db)):
    """Upload processed data (for manual uploads)"""
    try:
        global processed_data
        
        # Add to global data
        processed_data.extend(new_data)
        
        # Save to file
        save_data(processed_data)
        
        # Save sensor data to database
        for record in new_data:
            sensor_record = SensorData(
                file_source=filename,
                time=record.get('time', ''),
                timestamp=datetime.fromisoformat(record.get('timestamp', datetime.now().isoformat())),
                NRG_40C_Anem=record.get('NRG_40C_Anem'),
                NRG_200M_Vane=record.get('NRG_200M_Vane'),
                NRG_T60_Temp=record.get('NRG_T60_Temp'),
                NRG_RH5X_Humi=record.get('NRG_RH5X_Humi'),
                NRG_BP60_Baro=record.get('NRG_BP60_Baro'),
                Rain_Gauge=record.get('Rain_Gauge'),
                NRG_PVT1_PV_Temp=record.get('NRG_PVT1_PV_Temp'),
                PSM_c_Si_Isc_Soil=record.get('PSM_c_Si_Isc_Soil'),
                PSM_c_Si_Isc_Clean=record.get('PSM_c_Si_Isc_Clean'),
                Average_12V_Battery=record.get('Average_12V_Battery')
            )
            db.add(sensor_record)
        
        db.commit()
        logger.info(f"Saved {len(new_data)} sensor records to database for file: {filename}")
        
        # Broadcast to WebSocket clients
        await broadcast_to_websockets({
            "type": "new_data",
            "data": new_data,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "message": "Data uploaded successfully",
            "records_added": len(new_data)
        }
    except Exception as e:
        logger.error(f"Error uploading data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        # Send initial data
        data = load_data()
        await websocket.send_json({
            "type": "initial_data",
            "data": data,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)
        logger.info("WebSocket client disconnected")

# Add new library management endpoints after the existing endpoints

@app.post("/api/library/add")
async def add_to_library(
    file_data: dict,
    db: Session = Depends(get_db)
):
    """Add file to library with enhanced metadata and robust database registration"""
    try:
        # Extract data from request body
        filename = file_data.get("filename")
        file_size = file_data.get("file_size", 0)
        records_count = file_data.get("records_count", 0)
        tags = file_data.get("tags", [])
        category = file_data.get("category", "general")
        description = file_data.get("description", "")
        
        if not filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        logger.info(f"Attempting to add file to database: {filename} (records: {records_count}, size: {file_size})")
        logger.info(f"Attempting to add file to database: {filename} (records: {records_count}, size: {file_size})")
        
        # Check if file already exists
        existing_file = db.query(FileMetadata).filter(FileMetadata.filename == filename).first()
        if existing_file:
            # Update existing file
            logger.info(f"File already exists in database, updating: {filename}")
            existing_file.records_added = records_count
            existing_file.file_size = file_size
            existing_file.tags = tags
            existing_file.status = "updated"
            existing_file.processing_date = datetime.now().isoformat()
            db.commit()
            logger.info(f"✅ Successfully updated existing file in database: {filename} (ID: {existing_file.id})")
            return {
                "message": f"File {filename} updated in database",
                "file_id": existing_file.id,
                "action": "updated",
                "filename": filename,
                "records_count": records_count
            }
        
        # Create new library entry
        logger.info(f"Creating new database entry for file: {filename}")
        new_file = FileMetadata(
            filename=filename,
            records_added=records_count,
            file_size=file_size,
            processing_date=datetime.now().isoformat(),
            status="active",
            tags=tags,
            source="backend"
        )
        
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        
        logger.info(f"✅ Successfully added file to database: {filename} (ID: {new_file.id})")
        
        # Verify the file was actually saved
        verification = db.query(FileMetadata).filter(FileMetadata.id == new_file.id).first()
        if verification:
            logger.info(f"✅ Database verification successful: File {filename} confirmed in database")
        else:
            logger.error(f"❌ Database verification failed: File {filename} not found after save")
            raise Exception("Database verification failed")
        
        return {
            "message": f"File {filename} successfully registered in database",
            "file_id": new_file.id,
            "action": "created",
            "filename": filename,
            "records_count": records_count,
            "verified": True
        }
        
    except Exception as e:
        logger.error(f"❌ Error adding file to database: {filename} - {e}")
        # Rollback any partial changes
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database registration failed: {str(e)}")

@app.get("/api/library/files")
async def get_library_files(
    search: str = "",
    category: str = "",
    tags: str = "",
    page: int = 1,
    limit: int = 20,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    db: Session = Depends(get_db)
):
    """Get library files with advanced filtering and pagination"""
    try:
        query = db.query(FileMetadata)
        
        # Apply search filter
        if search:
            query = query.filter(FileMetadata.filename.contains(search))
        
        # Apply category filter
        if category:
            query = query.filter(FileMetadata.category == category)
        
        # Apply tags filter
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            for tag in tag_list:
                query = query.filter(FileMetadata.tags.contains([tag]))
        
        # Apply sorting
        if sort_by == "filename":
            query = query.order_by(FileMetadata.filename.asc() if sort_order == "asc" else FileMetadata.filename.desc())
        elif sort_by == "size":
            query = query.order_by(FileMetadata.file_size.asc() if sort_order == "asc" else FileMetadata.file_size.desc())
        elif sort_by == "records":
            query = query.order_by(FileMetadata.records_added.asc() if sort_order == "asc" else FileMetadata.records_added.desc())
        else:  # timestamp
            query = query.order_by(FileMetadata.timestamp.asc() if sort_order == "asc" else FileMetadata.timestamp.desc())
        
        # Apply pagination
        total_count = query.count()
        offset = (page - 1) * limit
        files = query.offset(offset).limit(limit).all()
        
        # Convert to response format
        file_list = []
        for file in files:
            file_list.append({
                "id": file.id,
                "name": file.filename,
                "records": file.records_added,
                "file_size": file.file_size,
                "processing_date": file.processing_date,
                "timestamp": file.timestamp.isoformat(),
                "status": file.status,
                "tags": file.tags or [],
                "source": file.source,
                "category": getattr(file, 'category', 'general')
            })
        
        return {
            "files": file_list,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit
            },
            "filters": {
                "search": search,
                "category": category,
                "tags": tags,
                "sort_by": sort_by,
                "sort_order": sort_order
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting library files: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/library/files/{file_id}")
async def delete_library_file(file_id: int, db: Session = Depends(get_db)):
    """Delete file from library and database permanently"""
    try:
        file_metadata = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        filename = file_metadata.filename
        
        # Delete associated sensor data first
        deleted_sensor_records = db.query(SensorData).filter(SensorData.file_source == filename).delete()
        logger.info(f"Deleted {deleted_sensor_records} sensor records for file: {filename}")
        
        # Delete file metadata
        db.delete(file_metadata)
        db.commit()
        
        # Delete physical files
        upload_path = f"uploads/{filename}"
        converted_path = f"converted/{filename}"
        
        if os.path.exists(upload_path):
            os.remove(upload_path)
            logger.info(f"Deleted uploaded file: {upload_path}")
        if os.path.exists(converted_path):
            os.remove(converted_path)
            logger.info(f"Deleted converted file: {converted_path}")
        
        # Also remove from global processed data if it exists
        global processed_data
        if processed_data:
            # This is a simplified approach - in a real implementation you'd track which data belongs to which file
            logger.info(f"Note: Global processed data may still contain data from {filename}")
        
        logger.info(f"Permanently deleted file from database: {filename}")
        return {
            "message": f"File {filename} permanently deleted from database",
            "file_id": file_id,
            "deleted_sensor_records": deleted_sensor_records
        }
        
    except Exception as e:
        logger.error(f"Error deleting library file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/library/files/bulk-delete")
async def bulk_delete_files(file_ids: List[int], db: Session = Depends(get_db)):
    """Delete multiple files from library"""
    try:
        deleted_files = []
        failed_files = []
        
        for file_id in file_ids:
            try:
                file_metadata = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
                if file_metadata:
                    filename = file_metadata.filename
                    
                    # Delete from database
                    db.delete(file_metadata)
                    
                    # Delete associated sensor data
                    db.query(SensorData).filter(SensorData.file_source == filename).delete()
                    
                    # Delete physical files
                    upload_path = f"uploads/{filename}"
                    converted_path = f"converted/{filename}"
                    
                    if os.path.exists(upload_path):
                        os.remove(upload_path)
                    if os.path.exists(converted_path):
                        os.remove(converted_path)
                    
                    deleted_files.append(filename)
                    logger.info(f"Deleted file from library: {filename}")
                else:
                    failed_files.append(f"File ID {file_id} not found")
            except Exception as e:
                failed_files.append(f"Error deleting file ID {file_id}: {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Bulk delete completed",
            "deleted_files": deleted_files,
            "failed_files": failed_files,
            "total_deleted": len(deleted_files),
            "total_failed": len(failed_files)
        }
        
    except Exception as e:
        logger.error(f"Error in bulk delete: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/library/files/{file_id}")
async def update_library_file(
    file_id: int,
    tags: List[str] = None,
    category: str = None,
    description: str = None,
    db: Session = Depends(get_db)
):
    """Update library file metadata"""
    try:
        file_metadata = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        if tags is not None:
            file_metadata.tags = tags
        if category is not None:
            file_metadata.category = category
        if description is not None:
            file_metadata.description = description
        
        file_metadata.status = "updated"
        db.commit()
        
        logger.info(f"Updated library file: {file_metadata.filename}")
        return {
            "message": f"File {file_metadata.filename} updated",
            "file_id": file_id
        }
        
    except Exception as e:
        logger.error(f"Error updating library file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/library/stats")
async def get_library_stats(db: Session = Depends(get_db)):
    """Get comprehensive library statistics"""
    try:
        total_files = db.query(FileMetadata).count()
        total_records = db.query(FileMetadata.records_added).all()
        total_records_sum = sum([r[0] for r in total_records if r[0]])
        
        # Get file size statistics
        file_sizes = db.query(FileMetadata.file_size).all()
        total_size = sum([s[0] for s in file_sizes if s[0]])
        
        # Get recent files (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_files = db.query(FileMetadata).filter(FileMetadata.timestamp >= thirty_days_ago).count()
        
        # Get files by source
        backend_files = db.query(FileMetadata).filter(FileMetadata.source == "backend").count()
        local_files = total_files - backend_files
        
        # Get most common tags
        all_tags = []
        for file in db.query(FileMetadata).all():
            if file.tags:
                all_tags.extend(file.tags)
        
        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_files": total_files,
            "total_records": total_records_sum,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "recent_files_30_days": recent_files,
            "backend_files": backend_files,
            "local_files": local_files,
            "top_tags": top_tags,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting library stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/library/export/{file_id}")
async def export_library_file(file_id: int, format: str = "json", db: Session = Depends(get_db)):
    """Export library file in different formats"""
    try:
        file_metadata = db.query(FileMetadata).filter(FileMetadata.id == file_id).first()
        if not file_metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        filename = file_metadata.filename
        
        # Get associated sensor data
        sensor_data = db.query(SensorData).filter(SensorData.file_source == filename).all()
        
        if format.lower() == "json":
            data = {
                "metadata": {
                    "id": file_metadata.id,
                    "filename": file_metadata.filename,
                    "records": file_metadata.records_added,
                    "file_size": file_metadata.file_size,
                    "processing_date": file_metadata.processing_date,
                    "timestamp": file_metadata.timestamp.isoformat(),
                    "status": file_metadata.status,
                    "tags": file_metadata.tags,
                    "source": file_metadata.source
                },
                "sensor_data": [
                    {
                        "timestamp": record.timestamp.isoformat(),
                        "time": record.time,
                        "NRG_40C_Anem": record.NRG_40C_Anem,
                        "NRG_200M_Vane": record.NRG_200M_Vane,
                        "NRG_T60_Temp": record.NRG_T60_Temp,
                        "NRG_RH5X_Humi": record.NRG_RH5X_Humi,
                        "NRG_BP60_Baro": record.NRG_BP60_Baro,
                        "Rain_Gauge": record.Rain_Gauge,
                        "NRG_PVT1_PV_Temp": record.NRG_PVT1_PV_Temp,
                        "PSM_c_Si_Isc_Soil": record.PSM_c_Si_Isc_Soil,
                        "PSM_c_Si_Isc_Clean": record.PSM_c_Si_Isc_Clean,
                        "Average_12V_Battery": record.Average_12V_Battery
                    }
                    for record in sensor_data
                ]
            }
            return JSONResponse(content=data)
        
        elif format.lower() == "csv":
            # Return CSV format
            csv_content = "timestamp,time,NRG_40C_Anem,NRG_200M_Vane,NRG_T60_Temp,NRG_RH5X_Humi,NRG_BP60_Baro,Rain_Gauge,NRG_PVT1_PV_Temp,PSM_c_Si_Isc_Soil,PSM_c_Si_Isc_Clean,Average_12V_Battery\n"
            for record in sensor_data:
                csv_content += f"{record.timestamp},{record.time},{record.NRG_40C_Anem},{record.NRG_200M_Vane},{record.NRG_T60_Temp},{record.NRG_RH5X_Humi},{record.NRG_BP60_Baro},{record.Rain_Gauge},{record.NRG_PVT1_PV_Temp},{record.PSM_c_Si_Isc_Soil},{record.PSM_c_Si_Isc_Clean},{record.Average_12V_Battery}\n"
            
            return JSONResponse(content={"csv_data": csv_content, "filename": f"{filename}.csv"})
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use 'json' or 'csv'")
        
    except Exception as e:
        logger.error(f"Error exporting library file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def ensure_file_registered_to_database(filename: str, records_count: int, file_size: int, source: str = "backend", db: Session = None):
    """Ensure file is registered in the database library"""
    try:
        if not db:
            db = next(get_db())
        
        # Check if file already exists
        existing_file = db.query(FileMetadata).filter(FileMetadata.filename == filename).first()
        
        if existing_file:
            # Update existing file
            existing_file.records_added = records_count
            existing_file.file_size = file_size
            existing_file.status = "updated"
            existing_file.processing_date = datetime.now().isoformat()
            db.commit()
            logger.info(f"✅ Updated existing file in database: {filename}")
            return existing_file.id
        else:
            # Create new entry
            new_file = FileMetadata(
                filename=filename,
                records_added=records_count,
                file_size=file_size,
                processing_date=datetime.now().isoformat(),
                status="active",
                tags=[],
                source=source
            )
            db.add(new_file)
            db.commit()
            db.refresh(new_file)
            logger.info(f"✅ Registered new file to database: {filename} (ID: {new_file.id})")
            return new_file.id
            
    except Exception as e:
        logger.error(f"❌ Error ensuring file registration in database: {filename} - {e}")
        if db:
            db.rollback()
        return None

# Setup directories
setup_directories()

# Initialize database tables
create_tables()

# Load initial data
processed_data = load_data()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
