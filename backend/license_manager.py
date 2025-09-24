#!/usr/bin/env python3
"""
License Management System for NRG DataSense
Handles license key generation, validation, and management
"""

import secrets
import hashlib
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from database import get_db, LicenseKey, LicenseValidation
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LicenseManager:
    """Comprehensive license management system"""
    
    def __init__(self):
        self.master_key = "NRG_DATASENSE_2024_MASTER"  # Change this to your master key
        self.license_prefix = "NRG"
        self.key_length = 32
        
    def generate_license_key(self, client_name: str, client_email: str, 
                           months: int = 1, notes: str = None) -> Dict:
        """Generate a new license key for a client"""
        try:
            # Generate unique key components
            timestamp = int(datetime.now().timestamp())
            random_part = secrets.token_hex(16)
            
            # Create license key
            key_data = f"{self.license_prefix}-{timestamp}-{random_part}"
            license_key = hashlib.sha256(key_data.encode()).hexdigest()[:self.key_length].upper()
            
            # Format as readable key (XXXX-XXXX-XXXX-XXXX)
            formatted_key = '-'.join([license_key[i:i+4] for i in range(0, len(license_key), 4)])
            
            # Calculate expiry date
            expiry_date = datetime.now() + timedelta(days=months * 30)
            
            # Save to database
            db = next(get_db())
            license_record = LicenseKey(
                license_key=formatted_key,
                client_name=client_name,
                client_email=client_email,
                expiry_date=expiry_date,
                notes=notes
            )
            db.add(license_record)
            db.commit()
            
            logger.info(f"Generated license key for {client_name} ({client_email})")
            
            return {
                "success": True,
                "license_key": formatted_key,
                "client_name": client_name,
                "client_email": client_email,
                "expiry_date": expiry_date.isoformat(),
                "months": months,
                "notes": notes
            }
            
        except Exception as e:
            logger.error(f"Error generating license key: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def validate_license_key(self, license_key: str, client_info: Dict = None) -> Dict:
        """Validate a license key"""
        try:
            db = next(get_db())
            
            # Find license key
            license_record = db.query(LicenseKey).filter(
                LicenseKey.license_key == license_key
            ).first()
            
            if not license_record:
                return {
                    "valid": False,
                    "error": "License key not found",
                    "code": "NOT_FOUND"
                }
            
            # Check if license is active
            if not license_record.is_active:
                return {
                    "valid": False,
                    "error": "License key is deactivated",
                    "code": "DEACTIVATED"
                }
            
            # Check if license has expired
            if datetime.now() > license_record.expiry_date:
                return {
                    "valid": False,
                    "error": "License key has expired",
                    "code": "EXPIRED",
                    "expiry_date": license_record.expiry_date.isoformat()
                }
            
            # Update usage statistics
            license_record.usage_count += 1
            license_record.last_used = datetime.now()
            db.commit()
            
            # Log validation
            validation_record = LicenseValidation(
                license_key=license_key,
                is_valid=True,
                client_info=client_info,
                ip_address=client_info.get('ip_address') if client_info else None,
                user_agent=client_info.get('user_agent') if client_info else None
            )
            db.add(validation_record)
            db.commit()
            
            # Calculate days remaining
            days_remaining = (license_record.expiry_date - datetime.now()).days
            
            return {
                "valid": True,
                "client_name": license_record.client_name,
                "client_email": license_record.client_email,
                "expiry_date": license_record.expiry_date.isoformat(),
                "days_remaining": days_remaining,
                "usage_count": license_record.usage_count,
                "created_date": license_record.created_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error validating license key: {e}")
            return {
                "valid": False,
                "error": str(e),
                "code": "VALIDATION_ERROR"
            }
    
    def get_license_status(self, license_key: str) -> Dict:
        """Get detailed status of a license key"""
        try:
            db = next(get_db())
            
            license_record = db.query(LicenseKey).filter(
                LicenseKey.license_key == license_key
            ).first()
            
            if not license_record:
                return {"error": "License key not found"}
            
            # Get recent validations
            recent_validations = db.query(LicenseValidation).filter(
                LicenseValidation.license_key == license_key
            ).order_by(LicenseValidation.validation_date.desc()).limit(10).all()
            
            return {
                "license_key": license_record.license_key,
                "client_name": license_record.client_name,
                "client_email": license_record.client_email,
                "created_date": license_record.created_date.isoformat(),
                "expiry_date": license_record.expiry_date.isoformat(),
                "is_active": license_record.is_active,
                "usage_count": license_record.usage_count,
                "last_used": license_record.last_used.isoformat() if license_record.last_used else None,
                "notes": license_record.notes,
                "days_remaining": (license_record.expiry_date - datetime.now()).days,
                "recent_validations": [
                    {
                        "date": v.validation_date.isoformat(),
                        "is_valid": v.is_valid,
                        "ip_address": v.ip_address
                    } for v in recent_validations
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting license status: {e}")
            return {"error": str(e)}
    
    def list_all_licenses(self) -> List[Dict]:
        """List all license keys with their status"""
        try:
            db = next(get_db())
            
            licenses = db.query(LicenseKey).order_by(LicenseKey.created_date.desc()).all()
            
            result = []
            for license_record in licenses:
                days_remaining = (license_record.expiry_date - datetime.now()).days
                status = "Active" if license_record.is_active and days_remaining > 0 else "Expired" if days_remaining <= 0 else "Inactive"
                
                result.append({
                    "id": license_record.id,
                    "license_key": license_record.license_key,
                    "client_name": license_record.client_name,
                    "client_email": license_record.client_email,
                    "created_date": license_record.created_date.isoformat(),
                    "expiry_date": license_record.expiry_date.isoformat(),
                    "status": status,
                    "days_remaining": days_remaining,
                    "usage_count": license_record.usage_count,
                    "last_used": license_record.last_used.isoformat() if license_record.last_used else None,
                    "notes": license_record.notes
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error listing licenses: {e}")
            return []
    
    def deactivate_license(self, license_key: str) -> Dict:
        """Deactivate a license key"""
        try:
            db = next(get_db())
            
            license_record = db.query(LicenseKey).filter(
                LicenseKey.license_key == license_key
            ).first()
            
            if not license_record:
                return {"success": False, "error": "License key not found"}
            
            license_record.is_active = False
            db.commit()
            
            logger.info(f"Deactivated license key: {license_key}")
            
            return {"success": True, "message": "License key deactivated"}
            
        except Exception as e:
            logger.error(f"Error deactivating license: {e}")
            return {"success": False, "error": str(e)}
    
    def extend_license(self, license_key: str, months: int) -> Dict:
        """Extend a license key by specified months"""
        try:
            db = next(get_db())
            
            license_record = db.query(LicenseKey).filter(
                LicenseKey.license_key == license_key
            ).first()
            
            if not license_record:
                return {"success": False, "error": "License key not found"}
            
            # Extend expiry date
            if datetime.now() > license_record.expiry_date:
                # If expired, extend from current date
                license_record.expiry_date = datetime.now() + timedelta(days=months * 30)
            else:
                # If still active, extend from current expiry date
                license_record.expiry_date = license_record.expiry_date + timedelta(days=months * 30)
            
            db.commit()
            
            logger.info(f"Extended license key {license_key} by {months} months")
            
            return {
                "success": True,
                "message": f"License extended by {months} months",
                "new_expiry_date": license_record.expiry_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error extending license: {e}")
            return {"success": False, "error": str(e)}

# Global license manager instance
license_manager = LicenseManager()

def generate_monthly_license(client_name: str, client_email: str, notes: str = None) -> Dict:
    """Generate a monthly license key (1 month)"""
    return license_manager.generate_license_key(client_name, client_email, 1, notes)

def generate_quarterly_license(client_name: str, client_email: str, notes: str = None) -> Dict:
    """Generate a quarterly license key (3 months)"""
    return license_manager.generate_license_key(client_name, client_email, 3, notes)

def generate_yearly_license(client_name: str, client_email: str, notes: str = None) -> Dict:
    """Generate a yearly license key (12 months)"""
    return license_manager.generate_license_key(client_name, client_email, 12, notes)
