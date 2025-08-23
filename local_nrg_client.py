#!/usr/bin/env python3
"""
Local NRG Data Client
This script monitors emails for RLD attachments, converts them to TXT locally,
and sends the processed data to the FastAPI endpoint.
"""

import os
import time
import json
import requests
import logging
from datetime import datetime
from pathlib import Path
import tempfile
import shutil

# Import NRG libraries
try:
    import nrgpy
    from data_email_client import mailer
except ImportError as e:
    print(f"Error importing NRG libraries: {e}")
    print("Please install required packages:")
    print("pip install nrgpy data_email_client")
    exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nrg_client.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LocalNRGClient:
    def __init__(self, config_file="nrg_client_config.json"):
        self.config_file = config_file
        self.config = self.load_config()
        self.api_url = self.config.get("api_url", "http://localhost:5000")
        
    def load_config(self):
        """Load configuration from JSON file"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading config: {e}")
                return self.get_default_config()
        else:
            config = self.get_default_config()
            self.save_config(config)
            return config
    
    def get_default_config(self):
        """Get default configuration"""
        return {
            "email": {
                "server": "your_email_server.com",
                "username": "your_email@domain.com",
                "password": "your_password",
                "search_text": "SymphoniePRO Logger data attached.",
                "mail_folder": "INBOX",
                "file_extension": ".rld",
                "download_folder": "./downloads",
                "delete_emails": False,
                "store_password": False
            },
            "nrg": {
                "output_folder": "./converted",
                "file_filter": "000110"
            },
            "api_url": "http://localhost:5000",
            "monitor_interval": 300,  # 5 minutes
            "max_files_per_batch": 10
        }
    
    def save_config(self, config):
        """Save configuration to JSON file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            logger.info(f"Configuration saved to {self.config_file}")
        except Exception as e:
            logger.error(f"Error saving config: {e}")
    
    def setup_directories(self):
        """Create necessary directories"""
        dirs = [
            self.config["email"]["download_folder"],
            self.config["nrg"]["output_folder"]
        ]
        for dir_path in dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            logger.info(f"Created directory: {dir_path}")
    
    def download_email_attachments(self):
        """Download RLD attachments from emails"""
        try:
            email_config = self.config["email"]
            
            # Initialize email client
            imap = mailer(
                server=email_config["server"],
                username=email_config["username"],
                password=email_config["password"]
            )
            
            # Search for data emails
            body_text = email_config["search_text"]
            data_boxes = [box for box in imap.mailboxes if 'data' in box.lower()]
            
            if not data_boxes:
                data_boxes = [email_config["mail_folder"]]
            
            # Search for messages with attachments
            imap.search_for_messages(
                body_text=body_text,
                area='body',
                folder=data_boxes
            )
            
            # Download attachments
            downloaded_files = imap.download_attachments(
                out_dir=email_config["download_folder"],
                extension=email_config["file_extension"],
                delete=email_config["delete_emails"],
                archive_folder=f"{email_config['mail_folder']}/Archive"
            )
            
            logger.info(f"Downloaded {len(downloaded_files)} RLD files")
            return downloaded_files
            
        except Exception as e:
            logger.error(f"Error downloading email attachments: {e}")
            return []
    
    def convert_rld_to_txt(self, rld_files):
        """Convert RLD files to TXT using local nrgpy"""
        converted_files = []
        
        for rld_file in rld_files:
            try:
                logger.info(f"Converting {rld_file} to TXT...")
                
                # Use nrgpy.local_rld for local conversion
                converter = nrgpy.local_rld(
                    rld_dir=os.path.dirname(rld_file),
                    out_dir=self.config["nrg"]["output_folder"],
                    file_filter=self.config["nrg"]["file_filter"]
                )
                
                # Convert the file
                converter.convert()
                
                # Find the converted TXT file
                txt_file = rld_file.replace('.rld', '.txt')
                txt_file = os.path.join(self.config["nrg"]["output_folder"], os.path.basename(txt_file))
                
                if os.path.exists(txt_file):
                    converted_files.append(txt_file)
                    logger.info(f"Successfully converted {rld_file} to {txt_file}")
                else:
                    logger.warning(f"TXT file not found for {rld_file}")
                    
            except Exception as e:
                logger.error(f"Error converting {rld_file}: {e}")
        
        return converted_files
    
    def process_txt_file(self, txt_file):
        """Process TXT file and extract sensor data"""
        try:
            with open(txt_file, 'r') as f:
                content = f.read()
            
            # Parse the TXT file (similar to frontend processing)
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
    
    def send_data_to_api(self, filename, content, processed_data):
        """Send processed data to FastAPI endpoint"""
        try:
            url = f"{self.api_url}/api/upload-data"
            
            payload = {
                "filename": filename,
                "content": content,
                "processed_data": processed_data
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Successfully sent data to API: {result['message']}")
                return True
            else:
                logger.error(f"API request failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending data to API: {e}")
            return False
    
    def process_batch(self):
        """Process a batch of RLD files"""
        try:
            # Download email attachments
            rld_files = self.download_email_attachments()
            
            if not rld_files:
                logger.info("No new RLD files found")
                return
            
            # Convert RLD to TXT
            txt_files = self.convert_rld_to_txt(rld_files)
            
            if not txt_files:
                logger.warning("No TXT files were generated")
                return
            
            # Process each TXT file
            for txt_file in txt_files:
                try:
                    # Read file content
                    with open(txt_file, 'r') as f:
                        content = f.read()
                    
                    # Process the data
                    processed_data = self.process_txt_file(txt_file)
                    
                    if processed_data:
                        # Send to API
                        filename = os.path.basename(txt_file)
                        success = self.send_data_to_api(filename, content, processed_data)
                        
                        if success:
                            logger.info(f"Successfully processed and sent {filename}")
                        else:
                            logger.error(f"Failed to send {filename} to API")
                    else:
                        logger.warning(f"No data extracted from {txt_file}")
                        
                except Exception as e:
                    logger.error(f"Error processing {txt_file}: {e}")
            
        except Exception as e:
            logger.error(f"Error in batch processing: {e}")
    
    def run(self):
        """Main run loop"""
        logger.info("Starting Local NRG Client...")
        logger.info(f"API URL: {self.api_url}")
        logger.info(f"Monitor interval: {self.config['monitor_interval']} seconds")
        
        # Setup directories
        self.setup_directories()
        
        # Main monitoring loop
        while True:
            try:
                logger.info("Checking for new data...")
                self.process_batch()
                
                # Wait for next check
                interval = self.config['monitor_interval']
                logger.info(f"Waiting {interval} seconds before next check...")
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("Shutting down Local NRG Client...")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                time.sleep(60)  # Wait 1 minute before retrying

def main():
    """Main function"""
    client = LocalNRGClient()
    client.run()

if __name__ == "__main__":
    main()
