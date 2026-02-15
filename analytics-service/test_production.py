#!/usr/bin/env python3
"""
Test script to diagnose production issues
Run this on Render to test database connection and dependencies
"""

import sys
import os

def test_imports():
    """Test if all required packages can be imported"""
    print("Testing imports...")
    try:
        import fastapi
        print("✓ FastAPI imported")
    except ImportError as e:
        print(f"✗ FastAPI import failed: {e}")
        return False
    
    try:
        import pymongo
        print("✓ PyMongo imported")
    except ImportError as e:
        print(f"✗ PyMongo import failed: {e}")
        return False
    
    try:
        import matplotlib
        print("✓ Matplotlib imported")
    except ImportError as e:
        print(f"✗ Matplotlib import failed: {e}")
        return False
    
    try:
        import seaborn
        print("✓ Seaborn imported")
    except ImportError as e:
        print(f"✗ Seaborn import failed: {e}")
        return False
    
    try:
        import textblob
        print("✓ TextBlob imported")
    except ImportError as e:
        print(f"✗ TextBlob import failed: {e}")
        return False
    
    return True


def test_env_vars():
    """Test if required environment variables are set"""
    print("\nTesting environment variables...")
    
    mongo_uri = os.getenv('MONGODB_URI')
    if mongo_uri:
        # Mask the URI for security
        masked = mongo_uri[:20] + "..." + mongo_uri[-10:]
        print(f"✓ MONGODB_URI is set: {masked}")
    else:
        print("✗ MONGODB_URI is not set")
        return False
    
    cors = os.getenv('CORS_ORIGINS', '*')
    print(f"✓ CORS_ORIGINS: {cors}")
    
    env = os.getenv('ENVIRONMENT', 'development')
    print(f"✓ ENVIRONMENT: {env}")
    
    return True


def test_database_connection():
    """Test MongoDB connection"""
    print("\nTesting database connection...")
    try:
        from utils.database import DatabaseConnection
        
        db_conn = DatabaseConnection()
        if db_conn.connect():
            print("✓ Database connection successful")
            
            # Try to get collections
            feedback_col = db_conn.get_feedback_collection()
            users_col = db_conn.get_users_collection()
            
            # Test collection access
            feedback_count = feedback_col.count_documents({})
            users_count = users_col.count_documents({})
            
            print(f"✓ Found {feedback_count} feedback documents")
            print(f"✓ Found {users_count} user documents")
            
            db_conn.close()
            return True
        else:
            print("✗ Database connection failed")
            return False
    except Exception as e:
        print(f"✗ Database connection error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_analysis_function():
    """Test the daily analysis function"""
    print("\nTesting analysis function...")
    try:
        from services.daily_analysis_core import analyze_daily_feedback
        from datetime import datetime, timedelta
        
        # Test with yesterday's date (should have no data but not error)
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        print(f"Testing analysis for date: {yesterday}")
        
        result = analyze_daily_feedback(yesterday, include_charts=False)
        
        if result.get('error'):
            print(f"✗ Analysis returned error: {result.get('message')}")
            return False
        else:
            status = result.get('status', 'unknown')
            print(f"✓ Analysis completed with status: {status}")
            return True
    except Exception as e:
        print(f"✗ Analysis function error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("=" * 60)
    print("Analytics Service Production Diagnostic Test")
    print("=" * 60)
    
    results = []
    
    results.append(("Imports", test_imports()))
    results.append(("Environment Variables", test_env_vars()))
    results.append(("Database Connection", test_database_connection()))
    results.append(("Analysis Function", test_analysis_function()))
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    if all_passed:
        print("All tests passed! ✓")
        return 0
    else:
        print("Some tests failed! ✗")
        return 1


if __name__ == "__main__":
    sys.exit(main())
