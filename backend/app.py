#!/usr/bin/env python3
"""
NRG DataSense Backend
FastAPI backend for RLD file processing and data visualization
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

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
    """Process TXT file and extract sensor data"""
    try:
        with open(txt_file, 'r') as f:
            content = f.read()
        
        # Parse the TXT file
        lines = content.split('\n')
        processed_data = []
        
        # Find data section
        data_start = -1
        headers = []
        
        for i, line in enumerate(lines):
            if line.strip().startswith('Timestamp'):
                data_start = i + 1
                headers = line.split('\t')
                break
        
        if data_start == -1:
            logger.warning(f"No data section found in {txt_file}")
            return []
        
        # Process data lines
        for i in range(data_start, len(lines)):
            line = lines[i].strip()
            if not line or line.startswith('#'):
                continue
            
            try:
                # Parse tab-separated values
                values = line.split('\t')
                if len(values) < 10:
                    continue
                
                # Extract timestamp
                timestamp = values[0] if values[0] else datetime.now().isoformat()
                
                # Create data record
                record = {
                    "time": timestamp,
                    "timestamp": timestamp,
                    "filename": os.path.basename(txt_file),
                    "NRG_40C_Anem": float(values[1]) if len(values) > 1 and values[1] else 0,
                    "NRG_200M_Vane": float(values[2]) if len(values) > 2 and values[2] else 0,
                    "NRG_T60_Temp": float(values[3]) if len(values) > 3 and values[3] else 0,
                    "NRG_RH5X_Humi": float(values[4]) if len(values) > 4 and values[4] else 0,
                    "NRG_BP60_Baro": float(values[5]) if len(values) > 5 and values[5] else 0,
                    "Rain_Gauge": float(values[6]) if len(values) > 6 and values[6] else 0,
                    "NRG_PVT1_PV_Temp": float(values[7]) if len(values) > 7 and values[7] else 0,
                    "PSM_c_Si_Isc_Soil": float(values[8]) if len(values) > 8 and values[8] else 0,
                    "PSM_c_Si_Isc_Clean": float(values[9]) if len(values) > 9 and values[9] else 0,
                    "Average_12V_Battery": float(values[10]) if len(values) > 10 and values[10] else 0
                }
                
                processed_data.append(record)
                
            except Exception as e:
                logger.warning(f"Error parsing line {i+1} in {txt_file}: {e}")
                continue
        
        logger.info(f"Processed {len(processed_data)} records from {txt_file}")
        return processed_data
        
    except Exception as e:
        logger.error(f"Error processing {txt_file}: {e}")
        return []

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

def save_file_metadata(metadata: Dict):
    """Save file metadata with timestamps"""
    try:
        metadata_file = "file_metadata.json"
        existing_metadata = []
        
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                existing_metadata = json.load(f)
        
        # Add new metadata
        existing_metadata.append(metadata)
        
        # Save updated metadata
        with open(metadata_file, 'w') as f:
            json.dump(existing_metadata, f, indent=2)
        
        logger.info(f"File metadata saved: {metadata['filename']}")
    except Exception as e:
        logger.error(f"Error saving file metadata: {e}")

def get_file_metadata() -> List[Dict]:
    """Get all file metadata"""
    try:
        metadata_file = "file_metadata.json"
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                return json.load(f)
        return []
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
async def process_rld_file(file: UploadFile = File(...)):
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
        
        # Save file metadata to database or file
        save_file_metadata(file_metadata)
        
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

@app.get("/api/files")
async def get_files():
    """Get all file metadata with timestamps"""
    try:
        metadata = get_file_metadata()
        return {
            "files": metadata,
            "count": len(metadata),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting file metadata: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-data")
async def upload_data(filename: str, content: str, new_data: List[Dict]):
    """Upload processed data (for manual uploads)"""
    try:
        global processed_data
        
        # Add to global data
        processed_data.extend(new_data)
        
        # Save to file
        save_data(processed_data)
        
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

# Load initial data
processed_data = load_data()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
