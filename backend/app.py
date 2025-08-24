#!/usr/bin/env python3
"""
NRG DataSense Unified Backend
FastAPI backend with email monitoring, local nrgpy conversion, and real-time data processing
"""

import os
import json
import time
import threading
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import asyncio

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Import NRG libraries
try:
    import nrgpy
    from data_email_client import mailer
    print("✅ NRG libraries imported successfully")
except ImportError as e:
    print(f"❌ Error importing NRG libraries: {e}")
    print("Please ensure nrgpy and data_email_client are installed")
    raise ImportError(f"Required NRG libraries not available: {e}")

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class EmailConfig(BaseModel):
    server: str
    username: str
    password: str
    search_text: str = "SymphoniePRO Logger data attached."
    mail_folder: str = "INBOX"
    file_extension: str = ".rld"
    delete_emails: bool = False

class NRGConfig(BaseModel):
    output_folder: str = "./converted"
    file_filter: str = "000110"

class AppConfig(BaseModel):
    email: EmailConfig
    nrg: NRGConfig
    monitor_interval: int = 300
    max_files_per_batch: int = 10

# Global variables
config_file = "app_config.json"
data_storage_file = "data_storage.json"
is_monitoring = False
monitor_thread = None
websocket_connections: List[WebSocket] = []
processed_data: List[Dict] = []

class EmailMonitor:
    def __init__(self, config: AppConfig):
        self.config = config
        self.setup_directories()
        
    def setup_directories(self):
        """Create necessary directories"""
        dirs = ["downloads", "converted", "logs"]
        for dir_name in dirs:
            Path(dir_name).mkdir(exist_ok=True)
            logger.info(f"Created directory: {dir_name}")
    
    def download_email_attachments(self) -> List[str]:
        """Download RLD attachments from emails"""
            
        try:
            email_config = self.config.email
            
            # Initialize email client
            imap = mailer(
                server=email_config.server,
                username=email_config.username,
                password=email_config.password
            )
            
            # Search for data emails
            body_text = email_config.search_text
            data_boxes = [box for box in imap.mailboxes if 'data' in box.lower()]
            
            if not data_boxes:
                data_boxes = [email_config.mail_folder]
            
            # Search for messages with attachments
            imap.search_for_messages(
                body_text=body_text,
                area='body',
                folder=data_boxes
            )
            
            # Download attachments
            downloaded_files = imap.download_attachments(
                out_dir=email_config.file_extension.replace('.', ''),
                extension=email_config.file_extension,
                delete=email_config.delete_emails,
                archive_folder=f"{email_config.mail_folder}/Archive"
            )
            
            logger.info(f"Downloaded {len(downloaded_files)} RLD files")
            return downloaded_files
            
        except Exception as e:
            logger.error(f"Error downloading email attachments: {e}")
            return []
    
    def convert_rld_to_txt(self, rld_files: List[str]) -> List[str]:
        """Convert RLD files to TXT using local nrgpy"""
            
        converted_files = []
        
        for rld_file in rld_files:
            try:
                logger.info(f"Converting {rld_file} to TXT...")
                
                # Use nrgpy.local_rld for local conversion
                converter = nrgpy.local_rld(
                    rld_dir=os.path.dirname(rld_file),
                    out_dir=self.config.nrg.output_folder,
                    file_filter=self.config.nrg.file_filter
                )
                
                # Convert the file
                converter.convert()
                
                # Find the converted TXT file
                txt_file = rld_file.replace('.rld', '.txt')
                txt_file = os.path.join(self.config.nrg.output_folder, os.path.basename(txt_file))
                
                if os.path.exists(txt_file):
                    converted_files.append(txt_file)
                    logger.info(f"Successfully converted {rld_file} to {txt_file}")
                else:
                    logger.warning(f"TXT file not found for {rld_file}")
                    
            except Exception as e:
                logger.error(f"Error converting {rld_file}: {e}")
        
        return converted_files
    
    def process_txt_file(self, txt_file: str) -> List[Dict]:
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

# Global email monitor instance
email_monitor = None

def load_config() -> AppConfig:
    """Load configuration from file"""
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config_data = json.load(f)
            return AppConfig(**config_data)
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return get_default_config()
    else:
        config = get_default_config()
        save_config(config)
        return config

def get_default_config() -> AppConfig:
    """Get default configuration"""
    return AppConfig(
        email=EmailConfig(
            server="outlook.office365.com",
            username="",
            password="",
            search_text="SymphoniePRO Logger data attached.",
            mail_folder="INBOX",
            file_extension=".rld",
            delete_emails=False
        ),
        nrg=NRGConfig(
            output_folder="./converted",
            file_filter="000110"
        ),
        monitor_interval=300,
        max_files_per_batch=10
    )

def save_config(config: AppConfig):
    """Save configuration to file"""
    try:
        with open(config_file, 'w') as f:
            json.dump(config.model_dump(), f, indent=2)
        logger.info(f"Configuration saved to {config_file}")
    except Exception as e:
        logger.error(f"Error saving config: {e}")

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

async def broadcast_to_websockets(message: Dict):
    """Broadcast message to all connected WebSocket clients"""
    if websocket_connections:
        for connection in websocket_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")

def monitor_emails():
    """Background email monitoring function"""
    global email_monitor, processed_data
    
    while is_monitoring:
        try:
            logger.info("Checking for new emails...")
            
            # Download email attachments
            rld_files = email_monitor.download_email_attachments()
            
            if rld_files:
                # Convert RLD to TXT
                txt_files = email_monitor.convert_rld_to_txt(rld_files)
                
                if txt_files:
                    # Process each TXT file
                    for txt_file in txt_files:
                        try:
                            # Process the data
                            new_data = email_monitor.process_txt_file(txt_file)
                            
                            if new_data:
                                # Add to global data
                                processed_data.extend(new_data)
                                
                                # Save to file
                                save_data(processed_data)
                                
                                # Broadcast to WebSocket clients
                                threading.Thread(
                                    target=lambda: asyncio.run(
                                        broadcast_to_websockets({
                                            "type": "new_data",
                                            "data": new_data,
                                            "timestamp": datetime.now().isoformat()
                                        })
                                    )
                                ).start()
                                
                                logger.info(f"Successfully processed {len(new_data)} records from {txt_file}")
                            else:
                                logger.warning(f"No data extracted from {txt_file}")
                                
                        except Exception as e:
                            logger.error(f"Error processing {txt_file}: {e}")
            else:
                logger.info("No new RLD files found")
            
            # Wait for next check
            time.sleep(email_monitor.config.monitor_interval)
            
        except Exception as e:
            logger.error(f"Error in email monitoring: {e}")
            time.sleep(60)  # Wait 1 minute before retrying

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

@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    try:
        config = load_config()
        return config.model_dump()
    except Exception as e:
        logger.error(f"Error getting config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/config")
async def update_config(config: AppConfig):
    """Update configuration"""
    try:
        save_config(config)
        
        # Restart monitoring if running
        global email_monitor, is_monitoring
        if is_monitoring:
            await stop_monitoring()
            email_monitor = EmailMonitor(config)
            await start_monitoring()
        
        return {"message": "Configuration updated successfully"}
    except Exception as e:
        logger.error(f"Error updating config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/monitoring/start")
async def start_monitoring():
    """Start email monitoring"""
    global is_monitoring, monitor_thread, email_monitor
    
    if is_monitoring:
        return {"message": "Monitoring is already running"}
    
    try:
        config = load_config()
        email_monitor = EmailMonitor(config)
        
        is_monitoring = True
        monitor_thread = threading.Thread(target=monitor_emails, daemon=True)
        monitor_thread.start()
        
        logger.info("Email monitoring started")
        return {"message": "Email monitoring started successfully"}
    except Exception as e:
        logger.error(f"Error starting monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/monitoring/stop")
async def stop_monitoring():
    """Stop email monitoring"""
    global is_monitoring
    
    if not is_monitoring:
        return {"message": "Monitoring is not running"}
    
    try:
        is_monitoring = False
        if monitor_thread and monitor_thread.is_alive():
            monitor_thread.join(timeout=5)
        
        logger.info("Email monitoring stopped")
        return {"message": "Email monitoring stopped successfully"}
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/monitoring/status")
async def get_monitoring_status():
    """Get monitoring status"""
    return {
        "is_monitoring": is_monitoring,
        "config": load_config().model_dump() if os.path.exists(config_file) else None
    }

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
