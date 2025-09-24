#!/usr/bin/env python3
"""
Email Automation Service for NRG DataSense
Automatically scans email for new station data and processes it
"""

import os
import logging
import asyncio
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional
import tempfile

from data_email_client.email_client import Mailer
from sqlalchemy.orm import Session

from database import get_db, FileMetadata, SensorData

# Import NRG library for conversion
try:
    import nrgpy
    print("✅ NRG library imported successfully in email service")
except ImportError as e:
    print(f"❌ Error importing NRG library in email service: {e}")
    nrgpy = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('email_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def convert_rld_to_txt_local(rld_file_path: str, output_folder: str = "./converted") -> str:
    """Convert RLD file to TXT using nrgpy local conversion"""
    try:
        if not nrgpy:
            logger.error("NRG library not available for RLD conversion")
            return None
            
        logger.info(f"Converting {rld_file_path} to TXT using nrgpy local...")
        
        # Ensure output directory exists
        os.makedirs(output_folder, exist_ok=True)
        
        # Use nrgpy local conversion
        converter = nrgpy.convert_rld_to_txt(
            rld_file_path,
            output_folder,
            unzip=True,
            progress_bar=False
        )
        
        # Find the converted TXT file
        txt_filename = os.path.basename(rld_file_path).replace('.rld', '.txt')
        txt_file_path = os.path.join(output_folder, txt_filename)
        
        if os.path.exists(txt_file_path):
            logger.info(f"Successfully converted {rld_file_path} to {txt_file_path}")
            return txt_file_path
        else:
            logger.warning(f"TXT file not found for {rld_file_path}")
            return None
            
    except Exception as e:
        logger.error(f"Error converting {rld_file_path} with nrgpy local: {e}")
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
                        
                    except Exception as e:
                        logger.warning(f"Error processing line {i+1}: {e}")
                        continue
        
        logger.info(f"Successfully processed {txt_file} with {len(processed_data)} records")
        return processed_data
        
    except Exception as e:
        logger.error(f"Error processing {txt_file}: {e}")
        return []

class EmailAutomationService:
    """Automated email scanning and data processing service"""
    
    def __init__(self, 
                 email_server: str,
                 email_username: str,
                 email_password: str,
                 scan_interval: int = 300,  # 5 minutes default
                 data_folder: str = "./email_data"):
        self.email_server = email_server
        self.email_username = email_username
        self.email_password = email_password
        self.scan_interval = scan_interval
        self.data_folder = Path(data_folder)
        self.data_folder.mkdir(exist_ok=True)
        
        self.is_running = False
        self.thread = None
        self.processed_emails = set()  # Track processed emails to avoid duplicates
        
        logger.info(f"Email automation service initialized for {email_username}")
        logger.info("Using nrgpy local for RLD file conversion")
    
    def start(self):
        """Start the email automation service in a background thread"""
        if self.is_running:
            logger.warning("Email automation service is already running")
            return
        
        self.is_running = True
        self.thread = threading.Thread(target=self._run_service, daemon=True)
        self.thread.start()
        logger.info("Email automation service started")
    
    def stop(self):
        """Stop the email automation service"""
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Email automation service stopped")
    
    def _run_service(self):
        """Main service loop"""
        logger.info(f"Starting email scan loop (interval: {self.scan_interval}s)")
        
        while self.is_running:
            try:
                self._scan_for_new_data()
                time.sleep(self.scan_interval)
            except Exception as e:
                logger.error(f"Error in email service loop: {e}")
                time.sleep(60)  # Wait 1 minute before retrying
    
    def _scan_for_new_data(self):
        """Scan email for new NRG data files"""
        try:
            logger.info("Scanning email for new NRG data...")
            
            # Initialize email client
            mailer = Mailer(
                server=self.email_server,
                username=self.email_username,
                password=self.email_password
            )
            
            # Connect to email server
            mailer.connect()
            
            # Search for NRG data emails
            data_boxes = [m for m in mailer.mailboxes if 'data' in m.lower()]
            if not data_boxes:
                data_boxes = ['INBOX']  # Fallback to INBOX
            
            # Search for SymphoniePRO data emails
            body_text = 'SymphoniePRO Logger data attached.'
            mailer.search_for_messages(text=body_text, area='body', folder=data_boxes)
            
            # Download attachments
            downloaded_files = mailer.download_attachments(
                out_dir=str(self.data_folder),
                extension='rld',
                delete=False,
                archive_folder='INBOX/Archive'
            )
            
            if downloaded_files:
                logger.info(f"Downloaded {len(downloaded_files)} new files")
                self._process_downloaded_files(downloaded_files)
            else:
                logger.info("No new NRG data files found")
                
        except Exception as e:
            logger.error(f"Error scanning email: {e}")
    
    def _process_downloaded_files(self, files: List[str]):
        """Process downloaded NRG data files"""
        for file_path in files:
            try:
                file_path = Path(file_path)
                if not file_path.exists():
                    continue
                
                # Check if already processed
                if str(file_path) in self.processed_emails:
                    continue
                
                logger.info(f"Processing downloaded file: {file_path.name}")
                
                # Process based on file type
                if file_path.suffix.lower() == '.rld':
                    self._process_rld_file(file_path)
                elif file_path.suffix.lower() == '.txt':
                    self._process_txt_file(file_path)
                else:
                    logger.warning(f"Unsupported file type: {file_path.suffix}")
                    continue
                
                # Mark as processed
                self.processed_emails.add(str(file_path))
                
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {e}")
    
    def _process_rld_file(self, rld_file: Path):
        """Process RLD file with cloud conversion"""
        try:
            logger.info(f"Converting RLD file: {rld_file.name}")
            
            # Convert RLD to TXT using nrgpy local
            txt_file = convert_rld_to_txt_local(
                str(rld_file), 
                str(self.data_folder)
            )
            
            if txt_file and Path(txt_file).exists():
                # Process the converted TXT file
                self._process_txt_file(Path(txt_file), original_file=rld_file)
            else:
                logger.error(f"Failed to convert RLD file: {rld_file.name}")
                
        except Exception as e:
            logger.error(f"Error processing RLD file {rld_file.name}: {e}")
    
    def _process_txt_file(self, txt_file: Path, original_file: Path = None):
        """Process TXT file and save to database"""
        try:
            logger.info(f"Processing TXT file: {txt_file.name}")
            
            # Process the TXT file
            processed_data = process_txt_file(str(txt_file))
            
            if not processed_data:
                logger.warning(f"No data extracted from {txt_file.name}")
                return
            
            # Save to database
            self._save_to_database(processed_data, txt_file.name, original_file)
            
            logger.info(f"Successfully processed {txt_file.name} with {len(processed_data)} records")
            
        except Exception as e:
            logger.error(f"Error processing TXT file {txt_file.name}: {e}")
    
    def _save_to_database(self, processed_data: List[Dict], filename: str, original_file: Path = None):
        """Save processed data to database"""
        try:
            # Get database session
            db = next(get_db())
            
            # Save sensor data
            for record in processed_data:
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
                    Solar_Irradiance_1=record.get('Solar_Irradiance_1'),
                    Solar_Irradiance_2=record.get('Solar_Irradiance_2'),
                    Solar_Irradiance_3=record.get('Solar_Irradiance_3'),
                    Average_12V_Battery=record.get('Average_12V_Battery')
                )
                db.add(sensor_record)
            
            # Add file metadata
            file_metadata = FileMetadata(
                filename=filename,
                file_size=len(processed_data) * 100,  # Approximate size
                records_count=len(processed_data),
                records_added=len(processed_data),  # Also set records_added for compatibility
                file_type="TXT" if not original_file else "RLD",
                upload_date=datetime.now(),
                category="email_auto",
                description=f"Automatically processed from email: {filename}",
                source="email_automation",
                status="processed"
            )
            db.add(file_metadata)
            
            db.commit()
            logger.info(f"✅ Successfully registered {filename} in database:")
            logger.info(f"   - {len(processed_data)} sensor records saved")
            logger.info(f"   - File metadata registered")
            logger.info(f"   - Category: email_auto")
            logger.info(f"   - Source: email_automation")
            
        except Exception as e:
            logger.error(f"❌ Error saving to database: {e}")
            if 'db' in locals():
                db.rollback()

# Global email service instance
email_service = None

def start_email_automation(email_config: Dict):
    """Start the email automation service"""
    global email_service
    
    if email_service and email_service.is_running:
        logger.warning("Email automation service is already running")
        return
    
    email_service = EmailAutomationService(
        email_server=email_config.get('server'),
        email_username=email_config.get('username'),
        email_password=email_config.get('password'),
        scan_interval=email_config.get('scan_interval', 300)
    )
    
    email_service.start()
    return email_service

def stop_email_automation():
    """Stop the email automation service"""
    global email_service
    
    if email_service:
        email_service.stop()
        email_service = None
        logger.info("Email automation service stopped")

def get_email_service_status():
    """Get the current status of the email automation service"""
    global email_service
    
    if not email_service:
        return {
            "running": False,
            "status": "not_initialized"
        }
    
    return {
        "running": email_service.is_running,
        "status": "running" if email_service.is_running else "stopped",
        "email": email_service.email_username,
        "scan_interval": email_service.scan_interval
    }

def test_database_connection():
    """Test if the email service can connect to the database"""
    try:
        db = next(get_db())
        # Try to query the database using SQLAlchemy
        from sqlalchemy import text
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def manual_scan_for_data():
    """Manually trigger email scan for new data (useful for testing)"""
    global email_service
    
    if not email_service:
        logger.error("Email service not initialized")
        return False
    
    try:
        logger.info("🔍 Manual email scan triggered...")
        email_service._scan_for_new_data()
        return True
    except Exception as e:
        logger.error(f"Manual scan failed: {e}")
        return False
