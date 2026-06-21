#!/usr/bin/env python3
"""
FastAPI Analytics Service
Independent microservice for hostel food feedback analytics
"""

from fastapi import FastAPI, HTTPException, Query, Security, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

# IST offset constant (UTC+5:30)
IST_OFFSET = timedelta(hours=5, minutes=30)

# Import analysis modules
from services.daily_analysis_core import analyze_daily_feedback
from utils.database import DatabaseConnection

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Hostel Flavour Analytics API",
    description="Analytics microservice for hostel food feedback analysis",
    version="2.0.0"
)

# Get allowed origins from environment
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Configuration
from fastapi.security.api_key import APIKeyHeader
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key: str = Security(api_key_header)):
    expected_api_key = os.getenv("SERVICE_API_KEY")
    if expected_api_key and api_key == expected_api_key:
        return api_key
    elif not expected_api_key and os.getenv("ENVIRONMENT", "development") == "development":
        return api_key
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate API KEY"
    )


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Hostel Flavour Analytics API",
        "status": "running",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check with database connectivity"""
    db_conn = DatabaseConnection()
    db_status = db_conn.connect()
    
    health_info = {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }
    
    if db_status:
        db_conn.close()
    
    return health_info


@app.get("/api/analytics/daily/{date}")
async def get_daily_analysis(
    date: str,
    include_charts: bool = Query(True, description="Include base64 chart images"),
    api_key: str = Depends(get_api_key)
):
    """
    Get comprehensive daily analytics for a specific date
    
    Args:
        date: Date in YYYY-MM-DD format
        include_charts: Whether to include base64 encoded charts (default: True)
    
    Returns:
        Comprehensive analytics data with charts
    """
    import traceback
    import sys
    
    # Validate date format
    try:
        requested_date = datetime.strptime(date, '%Y-%m-%d')
    except ValueError as e:
        error_msg = f"Invalid date format: {str(e)}"
        print(f"ERROR: {error_msg}", file=sys.stderr)
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Check if date is in the future (compare in IST, not server local time)
    now_utc = datetime.now(timezone.utc)
    now_ist = now_utc + IST_OFFSET
    today_ist = now_ist.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    if requested_date > today_ist:
        return JSONResponse(
            status_code=200,
            content={
                "status": "no_data",
                "message": f"Feedback will be available after {date}",
                "date": date,
                "type": "future_date",
                "data": {
                    "overview": {
                        "totalStudents": 0,
                        "participatingStudents": 0,
                        "participationRate": 0,
                        "overallRating": 0
                    }
                }
            }
        )
    
    try:
        print(f"INFO: Starting analysis for date: {date}, include_charts: {include_charts}", file=sys.stderr)
        
        # Perform analysis
        result = analyze_daily_feedback(date, include_charts=include_charts)
        
        print(f"INFO: Analysis completed with status: {result.get('status', 'unknown')}", file=sys.stderr)
        
        if result.get("error"):
            error_msg = result.get("message", "Analysis failed")
            print(f"ERROR: Analysis returned error: {error_msg}", file=sys.stderr)
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"ERROR: Daily analysis exception: {str(e)}", file=sys.stderr)
        print(f"TRACEBACK:\n{error_trace}", file=sys.stderr)
        raise HTTPException(
            status_code=500,
            detail=f"Daily analysis failed: {str(e)}"
        )


@app.get("/api/analytics/date-range")
async def get_date_range_analysis(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    api_key: str = Depends(get_api_key)
):
    """
    Get analytics for a date range (future enhancement)
    """
    return {
        "status": "not_implemented",
        "message": "Date range analysis will be available in future version"
    }


@app.get("/api/analytics/trends")
async def get_trends(
    days: int = Query(7, description="Number of days to analyze", ge=1, le=30),
    api_key: str = Depends(get_api_key)
):
    """
    Get trend analysis for the last N days (future enhancement)
    """
    return {
        "status": "not_implemented",
        "message": "Trend analysis will be available in future version"
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "message": "Endpoint not found",
            "path": str(request.url)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT", "development") == "development"
    )
