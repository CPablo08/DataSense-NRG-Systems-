from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import shutil
from werkzeug.utils import secure_filename
import nrgpy
import logging
from datetime import datetime
import json
from config import Config

# Add database support
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config.from_object(Config)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///nrg_config.db')
if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# User Configuration Model
class UserConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), unique=True, nullable=False)
    nrg_config = db.Column(db.Text, nullable=True)  # JSON string
    sensor_units = db.Column(db.Text, nullable=True)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'nrg_config': json.loads(self.nrg_config) if self.nrg_config else {},
            'sensor_units': json.loads(self.sensor_units) if self.sensor_units else {},
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
TEMP_FOLDER = 'temp'
ALLOWED_EXTENSIONS = {'rld'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TEMP_FOLDER'] = TEMP_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Create database tables
with app.app_context():
    db.create_all()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_temp_files():
    """Clean up temporary files older than 1 hour"""
    try:
        current_time = datetime.now()
        for filename in os.listdir(TEMP_FOLDER):
            filepath = os.path.join(TEMP_FOLDER, filename)
            file_time = datetime.fromtimestamp(os.path.getctime(filepath))
            if (current_time - file_time).total_seconds() > 3600:  # 1 hour
                os.remove(filepath)
                logger.info(f"Cleaned up temp file: {filename}")
    except Exception as e:
        logger.error(f"Error cleaning up temp files: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'nrgpy-rld-converter',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if db.engine.pool.checkedin() > 0 else 'disconnected'
    })

@app.route('/api/config', methods=['GET'])
def get_config():
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({'error': 'Session ID required'}), 400
    
    config = UserConfig.query.filter_by(session_id=session_id).first()
    if config:
        return jsonify(config.to_dict())
    else:
        return jsonify({'nrg_config': {}, 'sensor_units': {}})

@app.route('/api/config', methods=['POST'])
def save_config():
    session_id = request.json.get('session_id')
    nrg_config = request.json.get('nrg_config', {})
    sensor_units = request.json.get('sensor_units', {})
    
    if not session_id:
        return jsonify({'error': 'Session ID required'}), 400
    
    config = UserConfig.query.filter_by(session_id=session_id).first()
    
    if config:
        # Update existing config
        config.nrg_config = json.dumps(nrg_config)
        config.sensor_units = json.dumps(sensor_units)
        config.updated_at = datetime.utcnow()
    else:
        # Create new config
        config = UserConfig(
            session_id=session_id,
            nrg_config=json.dumps(nrg_config),
            sensor_units=json.dumps(sensor_units)
        )
        db.session.add(config)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Configuration saved successfully', 'config': config.to_dict()})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving configuration: {e}")
        return jsonify({'error': 'Failed to save configuration'}), 500

@app.route('/convert-rld', methods=['POST'])
def convert_rld():
    """Convert RLD files to TXT format using nrgpy"""
    try:
        # Clean up old temp files
        cleanup_temp_files()
        
        # Check if files were uploaded
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({'error': 'No files selected'}), 400
        
        # Get configuration from request
        config = request.form.to_dict()
        client_id = config.get('client_id', '')
        client_secret = config.get('client_secret', '')
        file_filter = config.get('file_filter', '')
        start_date = config.get('start_date', '')
        end_date = config.get('end_date', '')
        
        # Validate required parameters
        if not client_id or not client_secret:
            return jsonify({'error': 'Client ID and Client Secret are required'}), 400
        
        logger.info(f"Processing {len(files)} RLD files")
        logger.info(f"Client ID: {client_id}")
        logger.info(f"File filter: {file_filter}")
        logger.info(f"Date range: {start_date} to {end_date}")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            rld_dir = os.path.join(temp_dir, 'rlds')
            os.makedirs(rld_dir, exist_ok=True)
            
            # Save uploaded files to temporary directory
            uploaded_files = []
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    filepath = os.path.join(rld_dir, filename)
                    file.save(filepath)
                    uploaded_files.append(filename)
                    logger.info(f"Saved file: {filename}")
                else:
                    logger.warning(f"Skipped invalid file: {file.filename}")
            
            if not uploaded_files:
                return jsonify({'error': 'No valid RLD files uploaded'}), 400
            
            # Configure nrgpy convert_rld
            try:
                # Use the convert_rld function directly
                logger.info("Starting RLD to TXT conversion using nrgpy.convert_rld...")
                
                # Process each RLD file individually
                for rld_file in uploaded_files:
                    rld_filepath = os.path.join(rld_dir, rld_file)
                    logger.info(f"Converting {rld_file}...")
                    
                    # Use nrgpy.convert_rld function
                    nrgpy.convert_rld(
                        rld_filepath,
                        output_dir=temp_dir,
                        client_id=client_id,
                        client_secret=client_secret
                    )
                
                logger.info("Conversion completed successfully")
                
                # Find converted TXT files
                txt_files = []
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        if file.endswith('.txt'):
                            txt_files.append(os.path.join(root, file))
                
                if not txt_files:
                    return jsonify({'error': 'No TXT files were generated'}), 500
                
                logger.info(f"Found {len(txt_files)} converted TXT files")
                
                # Create a zip file containing all converted TXT files
                zip_path = os.path.join(TEMP_FOLDER, f'converted_files_{datetime.now().strftime("%Y%m%d_%H%M%S")}.zip')
                
                with zipfile.ZipFile(zip_path, 'w') as zipf:
                    for txt_file in txt_files:
                        # Get relative path for zip
                        rel_path = os.path.relpath(txt_file, temp_dir)
                        zipf.write(txt_file, rel_path)
                        logger.info(f"Added to zip: {rel_path}")
                
                # Return the zip file
                return send_file(
                    zip_path,
                    as_attachment=True,
                    download_name=f'converted_rld_files_{datetime.now().strftime("%Y%m%d_%H%M%S")}.zip',
                    mimetype='application/zip'
                )
                
            except Exception as e:
                logger.error(f"Error during nrgpy conversion: {str(e)}")
                return jsonify({'error': f'Conversion failed: {str(e)}'}), 500
                
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/convert-folder', methods=['POST'])
def convert_folder():
    """Convert a folder of RLD files to TXT format using nrgpy"""
    try:
        # Clean up old temp files
        cleanup_temp_files()
        
        # Check if files were uploaded
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({'error': 'No files selected'}), 400
        
        # Get configuration from request
        config = request.form.to_dict()
        client_id = config.get('client_id', '')
        client_secret = config.get('client_secret', '')
        file_filter = config.get('file_filter', '')
        start_date = config.get('start_date', '')
        end_date = config.get('end_date', '')
        
        # Validate required parameters
        if not client_id or not client_secret:
            return jsonify({'error': 'Client ID and Client Secret are required'}), 400
        
        logger.info(f"Processing folder with {len(files)} files")
        logger.info(f"Client ID: {client_id}")
        logger.info(f"File filter: {file_filter}")
        logger.info(f"Date range: {start_date} to {end_date}")
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            rld_dir = os.path.join(temp_dir, 'rlds')
            os.makedirs(rld_dir, exist_ok=True)
            
            # Save uploaded files to temporary directory, preserving folder structure
            uploaded_files = []
            for file in files:
                if file and allowed_file(file.filename):
                    # Preserve folder structure if present
                    filename = secure_filename(file.filename)
                    filepath = os.path.join(rld_dir, filename)
                    
                    # Create subdirectories if needed
                    os.makedirs(os.path.dirname(filepath), exist_ok=True)
                    
                    file.save(filepath)
                    uploaded_files.append(filename)
                    logger.info(f"Saved file: {filename}")
                else:
                    logger.warning(f"Skipped invalid file: {file.filename}")
            
            if not uploaded_files:
                return jsonify({'error': 'No valid RLD files uploaded'}), 400
            
            # Configure nrgpy convert_rld for folder processing
            try:
                # Use the convert_rld function directly for each file
                logger.info("Starting folder RLD to TXT conversion using nrgpy.convert_rld...")
                
                # Process each RLD file individually
                for rld_file in uploaded_files:
                    rld_filepath = os.path.join(rld_dir, rld_file)
                    logger.info(f"Converting {rld_file}...")
                    
                    # Use nrgpy.convert_rld function
                    nrgpy.convert_rld(
                        rld_filepath,
                        output_dir=temp_dir,
                        client_id=client_id,
                        client_secret=client_secret
                    )
                
                logger.info("Folder conversion completed successfully")
                
                # Find converted TXT files
                txt_files = []
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        if file.endswith('.txt'):
                            txt_files.append(os.path.join(root, file))
                
                if not txt_files:
                    return jsonify({'error': 'No TXT files were generated'}), 500
                
                logger.info(f"Found {len(txt_files)} converted TXT files from folder")
                
                # Create a zip file containing all converted TXT files
                zip_path = os.path.join(TEMP_FOLDER, f'converted_folder_{datetime.now().strftime("%Y%m%d_%H%M%S")}.zip')
                
                with zipfile.ZipFile(zip_path, 'w') as zipf:
                    for txt_file in txt_files:
                        # Get relative path for zip
                        rel_path = os.path.relpath(txt_file, temp_dir)
                        zipf.write(txt_file, rel_path)
                        logger.info(f"Added to zip: {rel_path}")
                
                # Return the zip file
                return send_file(
                    zip_path,
                    as_attachment=True,
                    download_name=f'converted_folder_{datetime.now().strftime("%Y%m%d_%H%M%S")}.zip',
                    mimetype='application/zip'
                )
                
            except Exception as e:
                logger.error(f"Error during folder nrgpy conversion: {str(e)}")
                return jsonify({'error': f'Folder conversion failed: {str(e)}'}), 500
                
    except Exception as e:
        logger.error(f"Unexpected error in folder conversion: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/convert-status', methods=['GET'])
def convert_status():
    """Get status of conversion service"""
    return jsonify({
        'status': 'ready',
        'service': 'nrgpy-rld-converter',
        'supported_formats': ['rld'],
        'max_file_size': '100MB',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
