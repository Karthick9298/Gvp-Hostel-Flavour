# 🍽️ Hostel Flavour — Hostel Food Feedback & Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

## 📋 Overview

**Hostel Flavour** is a comprehensive full-stack application designed for hostel food management, enabling students to provide meal feedback and administrators to analyze dining quality through advanced analytics and visualizations.

### 🏗️ Architecture

The project follows a **microservices architecture**:

- **`frontend/`** — React 19 + Vite + Tailwind CSS (Student & Admin UI)
- **`backend/`** — Express.js + MongoDB + Firebase Auth (REST API)
- **`analytics-service/`** — FastAPI + Python (Independent Analytics Microservice)

### Architecture Diagram
```
┌─────────────┐      ┌─────────────┐      ┌──────────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│    Analytics     │
│   (React)   │      │  (Express)  │      │    (FastAPI)     │
└─────────────┘      └──────┬──────┘      └────────┬─────────┘
                            │                      │
                            ▼                      ▼
                     ┌─────────────────────────────┐
                     │      MongoDB Database       │
                     └─────────────────────────────┘
```

## ✨ Features

### 👨‍🎓 Student Features
- 🔐 **Secure Authentication** — Firebase-based login/registration
- ⭐ **Meal Feedback System** — Rate and comment on 4 daily meals:
  - Morning (Breakfast)
  - Afternoon (Lunch)
  - Evening (Snacks)
  - Night (Dinner)
- 📊 **Submission Dashboard** — Real-time feedback status tracking
- 📅 **Menu Display** — View daily and weekly meal schedules
- ⏰ **Time-based Submissions** — Smart time windows for each meal

### 👨‍💼 Admin Features
- 📈 **Daily Analytics Dashboard** — Comprehensive insights for any date:
  - Overall participation rates
  - Average ratings per meal
  - Rating distribution analysis
  - Sentiment analysis (positive/neutral/negative)
  - Quality consistency scoring
- 📊 **Interactive Charts** — Chart.js visualizations with real-time data
- 🎨 **Static Charts** — Python-generated matplotlib/seaborn charts (base64)
status
- 📋 **Menu Management** — Create, update, delete weekly menus

### 📊 Analytics & Visualizations
- **Average Ratings Chart** — Color-coded bar charts
- **Rating Distribution** — Stacked bar charts per meal
- **Sentiment Analysis** — Pie charts showing feedback sentiment
- **Participation Rate** — Donut charts with engagement metrics

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19+ with Vite
- **Styling:** Tailwind CSS
## 🚀 Quick Start

### 🐳 Docker Deployment (Recommended)

**Prerequisites:** Docker & Docker Compose installed

```bash
# Clone repository
git clone https://github.com/Karthick9298/Gvp-Hostel-Flavour.git
cd Gvp-Hostel-Flavour

# Configure environment
cp backend/.env.example backend/.env
cp analytics-service/.env.example analytics-service/.env
# Edit .env files with your credentials

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Service URLs:**
- Frontend: http://localhost:80
- Backend: http://localhost:5000
- Analytics: http://localhost:8000
- Analytics API Docs: http://localhost:8000/docs

### 💻 Local Development

See detailed setup instructions in [DEPLOYMENT.md](DEPLOYMENT.md)
### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Firebase Admin SDK
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** express-validator
- **Timezone:** moment-timezone (IST support)

### Analytics Service (FastAPI)
- **Framework:** FastAPI (Python 3.8+)
- **Database Client:** pymongo
- **Visualization:** matplotlib, seaborn
- **NLP:** textblob (sentiment analysis)
- **Server:** Uvicorn (ASGI)
- **API Docs:** Swagger UI, ReDoc

### Infrastructure
- **Authentication:** Firebase Authentication
- **Database:** MongoDB (local or Atlas)
- **File Storage:** Local filesystem for chart outputs

### 1️⃣ Analytics Service Setup (FastAPI)

```bash
cd analytics-service

# Quick start
chmod +x start.sh
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hostel-food-analysis

# Analytics Service URL
ANALYTICS_API_URL=http://localhost:8000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

**Start Backend:**
```bash
npm run dev
```
The backend uses the root Python virtual environment at `.venv/bin/python`.

Create virtual environment and install dependencies:
```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install analytics dependencies
cd analytics-service
pip install -r requirements.txt
```

**Environment Setup:**
- The Python scripts read `MONGODB_URI` from environment variables
- Ensure MongoDB is running and accessible

**Test Analytics Service:**
```bash
# From analytics-service directory
### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Firebase Web Configuration
# Get these from Firebase Console → Project Settings → Web App
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Firebase Web App Setup:**
1. Firebase Console → Project Settings → General
2. Under "Your apps", click Web icon (</>) 
3. Register app and copy configuration
## 📖 Usage Guide

### Student Workflow
1. **Register/Login** → Firebase authentication
2. **Complete Profile** → First-time registration creates MongoDB user
3. **View Menu** → Check today's meals
4. **Submit Feedback** → Rate and comment on meals (time-based availability)
5. **Track Progress** → View submission statistics

### Admin Workflow
1. **Login** → Firebase authentication with admin privileges
2. **Select Date** → Choose analysis date
3. **View Analytics** → Comprehensive dashboard with:
   - Participation metrics
   - Rating distributions
   - Sentiment analysis
   - Visual charts
## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Create user profile | Public (requires Firebase token) |
| POST | `/sync-user` | Sync Firebase user to MongoDB | Public (requires Firebase token) |
| GET | `/me` | Get current user profile | Private |
| POST | `/logout` | Logout user | Private |

### 👥 Users (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get own profile | Private |
| PUT | `/profile` | Update own profile | Private |
| GET | `/all` | List all users | Admin |
| GET | `/:userId` | Get user by ID | Private |
| PUT | `/:userId/admin` | Toggle admin status | Admin |
| PUT | `/:userId/status` | Toggle active status | Admin |
| GET | `/stats/overview` | User statistics | Admin |

### 📝 Feedback (`/api/feedback`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/submit` | Submit meal feedback | Private |
| GET | `/my-feedback` | Get today's feedback | Private |
| GET | `/all` | Get all feedback (filtered) | Admin |

### 🍽️ Menu (`/api/menu`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/weekly` | Create weekly menu | Admin |
| GET | `/current` | Get current week menu | Private |
| GET | `/today` | Get today's menu | Private |
| GET | `/date/:date` | Get menu by date | Private |
## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  React Frontend (Vite + Tailwind)                  │     │
│  │  - Student Dashboard                               │     │
│  │  - Admin Analytics Dashboard                       │     │
│  │  - Authentication (Firebase Client SDK)            │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Express.js Backend                                │     │
│  │  - REST API Routes                                 │     │
│  │  - Firebase Token Verification                     │     │
│  │  - Role-Based Access Control (RBAC)               │     │
│  │  - Business Logic                                  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐              ┌─────────────────────────┐
│  DATABASE LAYER  │              │  ANALYTICS SERVICE      │
│                  │              │                         │
│  MongoDB         │              │  Python Scripts         │
│  - Users         │              │  - daily_analysis.py    │
│  - Feedback      │←─────────────┤  - Chart Generation     │
│  - Menus         │  PyMongo     │  - Sentiment Analysis   │
└──────────────────┘              └─────────────────────────┘
```

### 🔄 Data Flow

1. **Authentication Flow:**
   ```
   User → Firebase Auth → Frontend → Backend (verify token) → MongoDB
   ```

2. **Feedback Submission:**
   ```
   Student → Submit Rating → Backend API → MongoDB → Success Response
   ```

3. **Analytics Generation:**
   ```
   Admin → Select Date → Backend → Spawn Python Process → 
   Python queries MongoDB → Generate Charts → Return JSON + Base64 Images → 
   Backend → Frontend Display
   ```

4. **Chart Serving:**
   ```
   Generated charts saved to: analytics-service/output/daily/{date}/
   Served via: GET /analytics-images/daily/{date}/{chart-name}.png
   ```

## 📚 Documentation

- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** — Detailed implementation guide
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** — Developer workflow and architecture


## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Karthick** - [Karthick9298](https://github.com/Karthick9298)

## 🙏 Acknowledgments

- GVP College of Engineering (Autonomous)
- Firebase for authentication services
- MongoDB for database solutions
- React and Express.js communities.js
