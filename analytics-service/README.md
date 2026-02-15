# Analytics Service - README

## 🎯 Overview

FastAPI-based microservice for analyzing hostel food feedback data and generating visualizations.

## 🚀 Quick Start

### Using Start Script (Recommended)
```bash
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start the service
uvicorn main:app --reload --port 8000
```

## 📡 API Endpoints

- **Health Check**: `GET /health`
- **Daily Analysis**: `GET /api/analytics/daily/{date}`
- **API Docs**: `GET /docs`

## 🔧 Configuration

Edit `.env` file:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/hostel-food-analysis
```

## 🐳 Docker

```bash
# Build
docker build -t analytics-service .

# Run
docker run -p 8000:8000 analytics-service
```

## 📊 Features

- Daily feedback analysis
- Rating distribution analytics
- Sentiment analysis
- Chart generation (base64)
- Quality consistency scoring
