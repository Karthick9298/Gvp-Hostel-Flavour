#!/usr/bin/env python3
"""
Database connection utility for analytics service
"""

import os
import sys
import json
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from backend .env
env_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

class DatabaseConnection:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hostel-food-analysis')
        self.client = None
        self.db = None
        
    def connect(self):
        """Connect to MongoDB"""
        import traceback
        try:
            print(f"DEBUG: MongoDB URI (masked): {self.mongo_uri[:20]}...", file=sys.stderr)
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            
            # Extract database name from URI
            if '/' in self.mongo_uri:
                uri_parts = self.mongo_uri.split('/')
                if len(uri_parts) > 3:
                    db_part = uri_parts[-1].split('?')[0]
                    if db_part:
                        self.db = self.client[db_part]
                        print(f"DEBUG: Using database from URI: {db_part}", file=sys.stderr)
                    else:
                        self.db = self.client['hostel-food-analysis']
                        print(f"DEBUG: Using default database: hostel-food-analysis", file=sys.stderr)
                else:
                    self.db = self.client['hostel-food-analysis']
                    print(f"DEBUG: Using default database: hostel-food-analysis", file=sys.stderr)
            else:
                self.db = self.client['hostel-food-analysis']
                print(f"DEBUG: Using default database: hostel-food-analysis", file=sys.stderr)
            
            # Test connection
            print(f"DEBUG: Testing database connection with ping", file=sys.stderr)
            self.db.command('ping')
            print(f"DEBUG: Database connection successful", file=sys.stderr)
            return True
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"ERROR: Database connection failed: {str(e)}", file=sys.stderr)
            print(f"TRACEBACK:\n{error_trace}", file=sys.stderr)
            return False
            
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            
    def get_feedback_collection(self):
        """Get feedback collection"""
        return self.db.feedbacks
        
    def get_users_collection(self):
        """Get users collection"""
        return self.db.users


# For weekly or more than analysis , we need this 
def get_date_range(date_str):
    """Get start and end datetime for a specific day"""
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        target_date = datetime.now() - timedelta(days=1)
    
    start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = start_date + timedelta(days=1)
    
    return start_date, end_date

def safe_json_output(data):
    """Safely output JSON data to stdout"""
    try:
        print(json.dumps(data, default=str))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"error": True, "message": f"JSON serialization failed: {str(e)}"}))
        sys.stdout.flush()

def handle_error(message, error_type="ERROR"):
    """Handle and output errors as JSON"""
    error_data = {
        "error": True,
        "message": message,
        "type": error_type,
        "timestamp": datetime.now().isoformat()
    }
    safe_json_output(error_data)

