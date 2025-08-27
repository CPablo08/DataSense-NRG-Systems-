from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Database URL from environment variable - use SQLite as fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nrg_config.db")

# Ensure we're using the correct database path
if DATABASE_URL.startswith("sqlite:///"):
    # Convert relative path to absolute path
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.isabs(db_path):
        # Make it relative to the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(backend_dir, db_path)
        DATABASE_URL = f"sqlite:///{db_path}"

# If using PostgreSQL from Render, convert the URL format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database Models
class FileMetadata(Base):
    __tablename__ = "file_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    records_added = Column(Integer)
    file_size = Column(Integer)
    processing_date = Column(String)
    status = Column(String)
    tags = Column(JSON, default=list)
    site_properties = Column(JSON, default=dict)
    source = Column(String, default="backend")
    category = Column(String, default="general")
    description = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    checksum = Column(String, nullable=True)
    last_accessed = Column(DateTime, default=datetime.utcnow)

class SensorData(Base):
    __tablename__ = "sensor_data"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True)
    time = Column(String)
    NRG_40C_Anem = Column(Float)
    NRG_200M_Vane = Column(Float)
    NRG_T60_Temp = Column(Float)
    NRG_RH5X_Humi = Column(Float)
    NRG_BP60_Baro = Column(Float)
    Rain_Gauge = Column(Float)
    NRG_PVT1_PV_Temp = Column(Float)
    PSM_c_Si_Isc_Soil = Column(Float)
    PSM_c_Si_Isc_Clean = Column(Float)
    Average_12V_Battery = Column(Float)
    file_source = Column(String)

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
