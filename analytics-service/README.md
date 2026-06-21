# Analytics Service

FastAPI-based microservice for analyzing hostel food feedback data and generating visualizations.

## 🎯 Overview

This service connects directly to the same MongoDB Atlas database as the Node.js backend, reads the `feedbacks` and `users` collections, and produces:
- Per-meal average ratings
- Rating distribution charts
- Sentiment analysis per meal
- Participation rate metrics
- Quality consistency scores
- Base64-encoded matplotlib/seaborn charts

Results are returned as JSON to the backend, which caches them in the `dailyanalytics` collection.

---

## 🚀 Quick Start

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Linux / macOS
.\venv\Scripts\Activate.ps1       # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
# Edit .env — set MONGODB_URI and SERVICE_API_KEY

# Start the service
uvicorn main:app --reload --port 8000
```

Service runs at: `http://127.0.0.1:8000`  
Swagger docs at: `http://127.0.0.1:8000/docs`

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Root welcome message |
| `GET` | `/health` | DB connectivity health check |
| `GET` | `/api/analytics/daily/{date}` | Full daily analysis for `YYYY-MM-DD` |

> **Note:** All `/api/*` routes require the `X-API-Key` header matching `SERVICE_API_KEY` in `.env`.

### Daily Analysis Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | path | — | Date in `YYYY-MM-DD` format |
| `include_charts` | query | `true` | Whether to include base64 charts |

---

## 🔧 Configuration — `.env`

```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Shared secret — must match backend's ANALYTICS_API_SECRET
SERVICE_API_KEY=<your-shared-secret>

# MongoDB — MUST include the database name
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hostel-food-analysis

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

> ⚠️ **Critical:** The `MONGODB_URI` must explicitly include `/hostel-food-analysis` as the database name. Without it, PyMongo falls back to a default (`hostel-food-analysis` internally, but can mismatch if the Node backend connects to `test`).

---

## 📊 Response Format

### Success
```json
{
  "status": "success",
  "date": "2025-10-15",
  "data": {
    "overview": {
      "totalStudents": 150,
      "participatingStudents": 118,
      "participationRate": 78.7,
      "overallRating": 3.42,
      "qualityConsistencyScore": 72.4
    },
    "dailySummary": "...",
    "averageRatingPerMeal": { "Breakfast": 3.6, "Lunch": 3.3, "Dinner": 3.5, "Night Snacks": 3.1 },
    "studentRatingPerMeal": { ... },
    "feedbackDistributionPerMeal": { ... },
    "sentimentAnalysisPerMeal": { ... },
    "allComments": [ ... ]
  },
  "charts": {
    "avgRatings": { "base64": "..." },
    "distribution": { "base64": "..." },
    "sentiment": { "base64": "...", "topComments": { ... } },
    "participation": { "base64": "..." }
  },
  "timestamp": "2025-10-15T14:30:00"
}
```

### No Data
```json
{
  "status": "no_data",
  "type": "no_feedback",
  "message": "No feedback found for this date",
  "date": "2025-10-21",
  "data": {
    "overview": { "totalStudents": 150, "participatingStudents": 0, ... }
  }
}
```

---

## 📁 File Structure

```
analytics-service/
├── main.py                   # FastAPI app, routes, API key guard
├── services/
│   └── daily_analysis_core.py # Core analysis + chart generation logic
├── utils/
│   ├── database.py            # PyMongo connection (reads MONGODB_URI)
│   └── chart_generator.py     # Matplotlib/Seaborn chart builder
├── requirements.txt
├── Procfile                   # Render deployment
├── runtime.txt                # Python version pin
└── .env.example
```
