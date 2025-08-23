from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="NRG DataSense API",
    description="API for processing meteorological data from NRG Systems",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "nrg-datasense-api",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Endpoint to receive processed TXT data
@app.post("/api/upload-data")
async def upload_data(data: Dict[str, Any]):
    """
    Receive processed TXT data from the local NRG client
    """
    try:
        logger.info("Received data upload request")
        
        # Validate required fields
        required_fields = ["filename", "content", "processed_data"]
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        filename = data["filename"]
        content = data["content"]
        processed_data = data["processed_data"]
        
        logger.info(f"Processing file: {filename}")
        logger.info(f"Data points received: {len(processed_data)}")
        
        # Validate processed data structure
        if not isinstance(processed_data, list):
            raise HTTPException(status_code=400, detail="processed_data must be a list")
        
        # Process the data (similar to frontend processing)
        processed_records = []
        
        for record in processed_data:
            # Validate record structure
            if not isinstance(record, dict):
                continue
                
            # Extract sensor data
            sensor_data = {
                "time": record.get("time", ""),
                "timestamp": record.get("timestamp", ""),
                "NRG_40C_Anem": float(record.get("NRG_40C_Anem", 0)),
                "NRG_200M_Vane": float(record.get("NRG_200M_Vane", 0)),
                "NRG_T60_Temp": float(record.get("NRG_T60_Temp", 0)),
                "NRG_RH5X_Humi": float(record.get("NRG_RH5X_Humi", 0)),
                "NRG_BP60_Baro": float(record.get("NRG_BP60_Baro", 0)),
                "Rain_Gauge": float(record.get("Rain_Gauge", 0)),
                "NRG_PVT1_PV_Temp": float(record.get("NRG_PVT1_PV_Temp", 0)),
                "PSM_c_Si_Isc_Soil": float(record.get("PSM_c_Si_Isc_Soil", 0)),
                "PSM_c_Si_Isc_Clean": float(record.get("PSM_c_Si_Isc_Clean", 0)),
                "Average_12V_Battery": float(record.get("Average_12V_Battery", 0))
            }
            processed_records.append(sensor_data)
        
        # Generate summary statistics
        if processed_records:
            df = pd.DataFrame(processed_records)
            summary = {
                "total_records": len(processed_records),
                "sensor_count": len([col for col in df.columns if col not in ["time", "timestamp"]]),
                "file_count": 1,
                "last_update": datetime.now().isoformat(),
                "filename": filename
            }
        else:
            summary = {
                "total_records": 0,
                "sensor_count": 0,
                "file_count": 0,
                "last_update": datetime.now().isoformat(),
                "filename": filename
            }
        
        logger.info(f"Successfully processed {len(processed_records)} records from {filename}")
        
        return {
            "status": "success",
            "message": f"Successfully processed {len(processed_records)} records",
            "filename": filename,
            "processed_records": len(processed_records),
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Endpoint to get processed data (for frontend)
@app.get("/api/data")
async def get_data():
    """
    Get the latest processed data
    """
    try:
        # For now, return empty data - this will be populated by the local client
        return {
            "status": "success",
            "data": [],
            "summary": {
                "total_records": 0,
                "sensor_count": 0,
                "file_count": 0,
                "last_update": datetime.now().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error retrieving data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
