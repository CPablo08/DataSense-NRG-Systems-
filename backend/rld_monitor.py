"""
RLD Folder Monitor Service
Monitors a folder for RLD files and automatically converts them to TXT using nrgpy local conversion
"""

import os
import time
import threading
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# Import nrgpy for local RLD conversion
try:
    import nrgpy
    NRGPY_AVAILABLE = True
    print("✅ nrgpy library imported successfully")
except ImportError as e:
    print(f"⚠️ nrgpy library not available: {e}")
    NRGPY_AVAILABLE = False

# Import database models
from database import get_db, FileMetadata, SensorData
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RLDMonitor:
    """
    Monitors a folder for RLD files and automatically converts them using nrgpy local conversion
    """
    
    def __init__(self, rld_dir: str = "Raw .RLD Files", scan_interval: int = 60):
        """
        Initialize RLD Monitor
        
        Args:
            rld_dir: Directory to monitor for RLD files
            scan_interval: Time in seconds between folder scans
        """
        self.rld_dir = Path(rld_dir)
        self.scan_interval = scan_interval
        self.running = False
        self.thread = None
        self.stats = {
            "files_processed": 0,
            "last_scan": None,
            "last_processed_file": None,
            "errors": 0
        }
        
        # Ensure directories exist
        self._ensure_directories()
        
        logger.info(f"RLD Monitor initialized - monitoring: {self.rld_dir}")
    
    def _ensure_directories(self):
        """Ensure required directories exist"""
        try:
            # Create RLD directory
            self.rld_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"✅ RLD directory ensured: {self.rld_dir}")
            
            # Create text output directory
            text_output_dir = Path("text_outputs")
            text_output_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"✅ Text output directory ensured: {text_output_dir}")
            
        except Exception as e:
            logger.error(f"❌ Error creating directories: {e}")
            raise
    
    def start_monitoring(self):
        """Start the RLD monitoring service"""
        if self.running:
            logger.warning("RLD Monitor is already running")
            return
        
        if not NRGPY_AVAILABLE:
            logger.error("❌ Cannot start RLD Monitor: nrgpy library not available")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.thread.start()
        logger.info("✅ RLD Monitor started")
    
    def stop_monitoring(self):
        """Stop the RLD monitoring service"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("✅ RLD Monitor stopped")
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        logger.info(f"🔍 Starting RLD monitoring loop - scanning every {self.scan_interval} seconds")
        
        while self.running:
            try:
                self._scan_and_process()
                self.stats["last_scan"] = datetime.now()
            except Exception as e:
                logger.error(f"❌ Error in monitoring loop: {e}")
                self.stats["errors"] += 1
            
            # Wait for next scan
            time.sleep(self.scan_interval)
    
    def _scan_and_process(self):
        """Scan folder for RLD files and process them"""
        try:
            # Find all RLD files in the directory
            rld_files = list(self.rld_dir.glob("*.rld"))
            
            if not rld_files:
                logger.debug("No RLD files found in directory")
                return
            
            logger.info(f"🔍 Found {len(rld_files)} RLD file(s) to process")
            
            for rld_file in rld_files:
                try:
                    self._process_rld_file(rld_file)
                except Exception as e:
                    logger.error(f"❌ Error processing {rld_file.name}: {e}")
                    self.stats["errors"] += 1
                    
        except Exception as e:
            logger.error(f"❌ Error scanning directory: {e}")
            self.stats["errors"] += 1
    
    def _process_rld_file(self, rld_file: Path):
        """
        Process a single RLD file: convert to TXT and import to database
        
        Args:
            rld_file: Path to the RLD file to process
        """
        logger.info(f"🔄 Processing RLD file: {rld_file.name}")
        
        try:
            # Step 1: Convert RLD to TXT using nrgpy local conversion
            text_output_dir = Path("text_outputs")
            txt_file = self._convert_rld_to_txt(rld_file, text_output_dir)
            
            if not txt_file or not txt_file.exists():
                raise Exception("RLD to TXT conversion failed")
            
            # Step 2: Import TXT data to database
            self._import_txt_to_database(txt_file, rld_file.name)
            
            # Step 3: Clean up files after successful processing
            self._cleanup_files(rld_file, txt_file)
            
            # Update stats
            self.stats["files_processed"] += 1
            self.stats["last_processed_file"] = rld_file.name
            
            logger.info(f"✅ Successfully processed: {rld_file.name}")
            
        except Exception as e:
            logger.error(f"❌ Failed to process {rld_file.name}: {e}")
            raise
    
    def _convert_rld_to_txt(self, rld_file: Path, output_dir: Path) -> Optional[Path]:
        """
        Convert RLD file to TXT using nrgpy local conversion
        
        Args:
            rld_file: Path to RLD file
            output_dir: Directory to save TXT file
            
        Returns:
            Path to converted TXT file or None if conversion failed
        """
        try:
            logger.info(f"🔄 Converting RLD to TXT: {rld_file.name}")
            
            # Use nrgpy local conversion
            converter = nrgpy.local_rld(
                rld_dir=str(rld_file.parent),
                out_dir=str(output_dir),
                file_filter=rld_file.name
            )
            
            # Perform conversion
            converter.convert()
            
            # Find the generated TXT file
            txt_filename = rld_file.stem + ".txt"
            txt_file = output_dir / txt_filename
            
            if txt_file.exists():
                logger.info(f"✅ RLD conversion successful: {txt_file.name}")
                return txt_file
            else:
                logger.error(f"❌ TXT file not found after conversion: {txt_filename}")
                return None
                
        except Exception as e:
            logger.error(f"❌ RLD conversion failed: {e}")
            return None
    
    def _import_txt_to_database(self, txt_file: Path, original_filename: str):
        """
        Import TXT file data to database using existing TXT processing logic
        
        Args:
            txt_file: Path to TXT file to import
            original_filename: Original RLD filename for reference
        """
        try:
            logger.info(f"📊 Importing TXT data to database: {txt_file.name}")
            
            # Read and process TXT file using existing logic
            with open(txt_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if not lines:
                raise Exception("TXT file is empty")
            
            # Parse header to find timestamp column
            header = lines[0].strip().split('\t')
            timestamp_col = None
            for i, col in enumerate(header):
                if 'timestamp' in col.lower():
                    timestamp_col = i
                    break
            
            if timestamp_col is None:
                raise Exception("Timestamp column not found in TXT file")
            
            # Process data lines
            records_added = 0
            db = next(get_db())
            
            try:
                for line_num, line in enumerate(lines[1:], 2):  # Skip header
                    if not line.strip():
                        continue
                    
                    try:
                        # Parse line data
                        values = line.strip().split('\t')
                        if len(values) < len(header):
                            continue
                        
                        # Extract timestamp
                        timestamp_str = values[timestamp_col]
                        
                        # Create sensor data record
                        sensor_data = SensorData(
                            timestamp=datetime.now(),
                            time=timestamp_str,
                            NRG_40C_Anem=float(values[1]) if len(values) > 1 and values[1] else 0.0,
                            NRG_200M_Vane=float(values[2]) if len(values) > 2 and values[2] else 0.0,
                            NRG_T60_Temp=float(values[3]) if len(values) > 3 and values[3] else 0.0,
                            NRG_RH5X_Humi=float(values[4]) if len(values) > 4 and values[4] else 0.0,
                            NRG_BP60_Baro=float(values[18]) if len(values) > 18 and values[18] else 0.0,
                            Rain_Gauge=float(values[6]) if len(values) > 6 and values[6] else 0.0,
                            NRG_PVT1_PV_Temp=float(values[7]) if len(values) > 7 and values[7] else 0.0,
                            PSM_c_Si_Isc_Soil=float(values[30]) if len(values) > 30 and values[30] else 0.0,
                            PSM_c_Si_Isc_Clean=float(values[34]) if len(values) > 34 and values[34] else 0.0,
                            Solar_Irradiance_1=float(values[8]) if len(values) > 8 and values[8] else 0.0,
                            Solar_Irradiance_2=float(values[9]) if len(values) > 9 and values[9] else 0.0,
                            Solar_Irradiance_3=float(values[10]) if len(values) > 10 and values[10] else 0.0,
                            Average_12V_Battery=float(values[22]) if len(values) > 22 and values[22] else 0.0,
                            file_source=original_filename
                        )
                        
                        db.add(sensor_data)
                        records_added += 1
                        
                    except (ValueError, IndexError) as e:
                        logger.warning(f"⚠️ Skipping invalid line {line_num}: {e}")
                        continue
                
                # Create file metadata record
                file_metadata = FileMetadata(
                    filename=original_filename,
                    records_added=records_added,
                    records_count=records_added,
                    file_size=txt_file.stat().st_size,
                    file_type="rld_auto_processed",
                    processing_date=datetime.now().strftime("%Y-%m-%d"),
                    upload_date=datetime.now(),
                    status="processed",
                    tags=["auto_processed", "rld_converted"],
                    source="rld_monitor",
                    category="automated",
                    description=f"Auto-processed from RLD file: {original_filename}",
                    version=1,
                    checksum=None,
                    last_accessed=datetime.now()
                )
                
                db.add(file_metadata)
                db.commit()
                
                logger.info(f"✅ Database import successful: {records_added} records added")
                
            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"❌ Database import failed: {e}")
            raise
    
    def _cleanup_files(self, rld_file: Path, txt_file: Path):
        """
        Clean up RLD and TXT files after successful processing
        
        Args:
            rld_file: Path to RLD file to delete
            txt_file: Path to TXT file to delete
        """
        try:
            # Delete RLD file
            if rld_file.exists():
                rld_file.unlink()
                logger.info(f"🗑️ Deleted RLD file: {rld_file.name}")
            
            # Delete TXT file
            if txt_file.exists():
                txt_file.unlink()
                logger.info(f"🗑️ Deleted TXT file: {txt_file.name}")
                
        except Exception as e:
            logger.error(f"❌ Error cleaning up files: {e}")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current monitor status
        
        Returns:
            Dictionary with monitor status information
        """
        return {
            "running": self.running,
            "monitoring_directory": str(self.rld_dir),
            "scan_interval": self.scan_interval,
            "stats": self.stats.copy(),
            "nrgpy_available": NRGPY_AVAILABLE
        }
    
    def manual_scan(self) -> Dict[str, Any]:
        """
        Manually trigger a folder scan
        
        Returns:
            Dictionary with scan results
        """
        try:
            logger.info("🔍 Manual scan triggered")
            self._scan_and_process()
            self.stats["last_scan"] = datetime.now()
            
            return {
                "success": True,
                "message": "Manual scan completed",
                "stats": self.stats.copy()
            }
        except Exception as e:
            logger.error(f"❌ Manual scan failed: {e}")
            return {
                "success": False,
                "message": str(e),
                "stats": self.stats.copy()
            }


# Global monitor instance
_rld_monitor = None

def get_rld_monitor() -> RLDMonitor:
    """Get the global RLD monitor instance"""
    global _rld_monitor
    if _rld_monitor is None:
        _rld_monitor = RLDMonitor()
    return _rld_monitor

def start_rld_monitoring():
    """Start the global RLD monitoring service"""
    monitor = get_rld_monitor()
    monitor.start_monitoring()
    return monitor

def stop_rld_monitoring():
    """Stop the global RLD monitoring service"""
    global _rld_monitor
    if _rld_monitor:
        _rld_monitor.stop_monitoring()

def get_rld_monitor_status():
    """Get the status of the global RLD monitor"""
    monitor = get_rld_monitor()
    return monitor.get_status()

def trigger_manual_scan():
    """Manually trigger a folder scan"""
    monitor = get_rld_monitor()
    return monitor.manual_scan()
