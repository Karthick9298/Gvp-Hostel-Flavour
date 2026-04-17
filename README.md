# 🍽️ GVP Hostel Flavour

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange.svg)](https://firebase.google.com/)

**A full-stack hostel food feedback and analytics platform for GVP College of Engineering.**

</div>

---

## 📌 Overview

**GVP Hostel Flavour** is a role-based web application that lets hostel students rate and comment on their daily meals (Breakfast, Lunch, Snacks, and Dinner) — and lets administrators dive deep into food quality analytics powered by a dedicated Python microservice.

The platform follows a **microservices architecture** split across three independent services:

- **Frontend** — React 19 SPA for students and admins
- **Backend** — Express.js REST API handling auth, feedback, menu management, and analytics routing
- **Analytics Service** — Python FastAPI microservice that runs statistical analysis and generates matplotlib/seaborn visualizations

---




[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-VISIT%20SITE-0A66C2?style=for-the-badge)](https://gvp-hostel-flavour.vercel.app/)

🔗 **https://gvp-hostel-flavour.vercel.app/**


---

## 📸 Screenshots

| Login Page | Student Dashboard |
|---|---|
| [<img src="./screenshots/Screenshot%20from%202026-04-16%2021-44-37.png" alt="Landing Page" width="100%" />](./screenshots/Screenshot%20from%202026-04-16%2021-44-37.png) | [<img src="./screenshots/Screenshot%20from%202026-04-16%2021-46-31.png" alt="Dashboard" width="100%" />](./screenshots/Screenshot%20from%202026-04-16%2021-46-31.png) |

| Student Profile View | Admin Dashboard  |
|---|---|
| [<img src="./screenshots/Screenshot%20from%202026-04-16%2021-46-42.png" alt="Login OTP" width="100%" />](./screenshots/Screenshot%20from%202026-04-16%2021-46-42.png) | [<img src="./screenshots/Screenshot%20from%202026-04-16%2021-49-44.png" alt="Register" width="100%" />](./screenshots/Screenshot%20from%202026-04-16%2021-49-44.png) |

<p align="center">
  <b>Analytics View(Admin)</b><br />
  <a href="./screenshots/Screenshot%20from%202026-04-16%2021-49-53.png">
    <img src="./screenshots/Screenshot%20from%202026-04-16%2021-49-53.png" alt="Analytics View" width="70%" />
  </a>
</p>

---

## 🚀 Features

### 👨‍🎓 Student Features
- 🔐 **Secure Authentication** — Email/password and Google Sign-In via Firebase
- ⭐ **Meal Feedback** — Rate and comment on 4 daily meals with time-gated submission windows
- 📅 **Today's Menu** — View the active weekly meal schedule per day
- 📊 **Submission Tracker** — Real-time feedback status showing completed vs pending meals
- 👤 **Profile Management** — Update personal details (name, room, roll number)

### 👨‍💼 Admin Features
- 📈 **Daily Analytics Dashboard** — Date-selectable insights including:
  - Participation rates and student counts
  - Average ratings per meal
  - Rating distribution across all meals
  - Sentiment analysis (positive / neutral / negative)
  - Quality Consistency Score (0–100)
- 📊 **Visual Charts** — Python-generated matplotlib/seaborn charts embedded as base64 images
- 🗓️ **Menu Management** — Full CRUD for weekly menus
- 👥 **User Management** — Toggle admin roles and activate/deactivate student accounts

### 📊 Analytics Engine (Python Microservice)
- Per-meal average ratings with color-coded bar charts
- Rating distribution stacked bar charts
- Sentiment pie charts per meal
- Participation rate donut charts
- Quality consistency scoring using coefficient of variation
- Auto-generated daily summary narrative

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Firebase JS SDK | Google Sign-In (client-side) |
| Radix UI | Accessible UI components |
| React Hot Toast | Toast notifications |
| jsPDF + html2canvas | PDF export |
| React Icons + Lucide | Iconography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Firebase Admin SDK | Token verification & user creation |
| Helmet + express-rate-limit | Security hardening |
| express-validator | Input validation |
| Morgan | HTTP request logging |
| dotenv | Environment configuration |

### Analytics Service
| Technology | Purpose |
|-----------|---------|
| Python 3.8+ + FastAPI | Analytics microservice |
| Uvicorn | ASGI server |
| PyMongo | MongoDB direct access |
| Matplotlib + Seaborn | Chart generation |
| TextBlob | Sentiment analysis |

### Database & Infrastructure
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud database |
| Firebase Authentication | Identity provider |
Frontend| Vercel | Backend deployment |
| Render / Railway | Analytics service deployment |

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                          │
│                       React 19 + Vite SPA                        │
│           Student Dashboard │ Admin Dashboard │ Auth Pages        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS / REST API
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS BACKEND                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐  │
│  │  /auth   │ │ /feedback│ │/analytics│ │/menu │ │  /users  │  │
│  └──────────┘ └──────────┘ └────┬─────┘ └──────┘ └──────────┘  │
│            Firebase Admin SDK    │        Middleware: Helmet,     │
│          (Token Verification)    │        Rate-Limit, CORS        │
└──────────────────────────────────┼───────────────────────────────┘
                 │                 │
                 ▼                 ▼
┌────────────────────┐   ┌──────────────────────────────────────────┐
│   MongoDB Atlas    │   │       PYTHON FASTAPI MICROSERVICE        │
│                    │   │                                          │
│  ● Users           │◀──│  /api/analytics/daily/{date}            │
│  ● Feedback        │   │                                          │
│  ● WeeklyMenu      │   │  ┌──────────┐ ┌────────┐ ┌───────────┐ │
└────────────────────┘   │  │ PyMongo  │ │ Matplt │ │  TextBlob │ │
                         │  │  (DB)    │ │ Seaborn│ │(Sentiment)│ │
                         │  └──────────┘ └────────┘ └───────────┘ │
                         └──────────────────────────────────────────┘
                                          │
                         ┌────────────────┘
                         ▼
                ┌──────────────────┐
                │  Firebase Auth   │
                │  (Google OAuth   │
                │  + Email/Pass)   │
                └──────────────────┘
```

---

## 📂 Folder Structure

```
Gvp-Hostel-Flavour/
│
├── frontend/                        # React 19 SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # Email + Google login
│   │   │   │   └── Register.jsx     # Student registration
│   │   │   ├── student/
│   │   │   │   └── Dashboard.jsx    # Meal feedback UI
│   │   │   ├── admin/
│   │   │   │   └── DashboardDaily.jsx  # Admin analytics view
│   │   │   └── Profile.jsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── StarRating.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   └── layout/
│   │   │       ├── Layout.jsx
│   │   │       └── Navbar.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   └── config/
│   │       ├── api.js               # Axios instance + API methods
│   │       └── firebase.js          # Firebase client config
│   └── package.json
│
├── backend/                         # Express.js REST API
│   ├── server.js                    # App entry point
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── firebase-admin.js        # Firebase Admin SDK setup
│   ├── middleware/
│   │   └── firebaseAuth.js          # JWT verification middleware
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Feedback.js              # Feedback schema (per-day, per-meal)
│   │   └── WeeklyMenu.js            # Weekly menu template schema
│   ├── routes/
│   │   ├── auth-firebase.js         # Auth endpoints
│   │   ├── feedback.js              # Feedback CRUD
│   │   ├── analytics.js             # Analytics proxy routes
│   │   ├── menu.js                  # Menu management
│   │   └── users.js                 # User admin endpoints
│   ├── services/
│   │   └── analyticsService.js      # Calls Python microservice
│   ├── scripts/                     # Admin utility scripts
│   │   ├── bulk-register-users.js
│   │   ├── insert-weekly-menu.js
│   │   └── generate-test-feedback.js
│   └── .env.example
│
└── analytics-service/               # Python FastAPI microservice
    ├── main.py                      # FastAPI app entry point
    ├── services/
    │   └── daily_analysis_core.py   # Core analysis logic
    ├── utils/
    │   ├── database.py              # PyMongo connection
    │   └── chart_generator.py       # Matplotlib/Seaborn chart builder
    ├── requirements.txt
    ├── Procfile                     # Heroku/Render deployment
    └── .env.example
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Authentication enabled

---

### 1. Clone the Repository

```bash
git clone https://github.com/Karthick9298/Gvp-Hostel-Flavour.git
cd Gvp-Hostel-Flavour
```

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment config
cp .env.example .env
# Fill in your values (see Environment Variables section)

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 3. Analytics Service Setup

```bash
cd analytics-service

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# Set MONGODB_URI to match your backend's MongoDB connection

# Start analytics service
uvicorn main:app --reload --port 8000
```

Analytics service runs at: `http://localhost:8000`
Swagger docs at: `http://localhost:8000/docs`

---

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
# Add Firebase config variables (see Environment Variables)

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 5. Seed Data (Optional)

```bash
# Insert a weekly menu
cd backend
node scripts/insert-weekly-menu.js

# Bulk register students (edit the script first)
npm run bulk-register

# Generate test feedback for analytics testing
npm run generate-feedback
```

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hostel-food-analysis

# Analytics Microservice
ANALYTICS_API_URL=http://localhost:8000

# JWT
JWT_SECRET=<64-char-hex-string>

# Firebase Admin SDK (from Firebase Console → Service Accounts)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase Web SDK (used by bulk-register script)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Analytics Service — `analytics-service/.env`

```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# Must match backend's MongoDB URI
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hostel-food-analysis

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api

# Firebase Web SDK (from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔐 Authentication Flow

```
┌──────────┐                ┌─────────┐              ┌──────────┐  ┌──────────┐
│  Client  │                │ Backend │              │ Firebase │  │ MongoDB  │
└────┬─────┘                └────┬────┘              └────┬─────┘  └────┬─────┘
     │                           │                       │              │
     │  POST /api/auth/register  │                       │              │
     │──────────────────────────▶│                       │              │
     │                           │  createUser(email)    │              │
     │                           │──────────────────────▶│              │
     │                           │◀── Firebase UID ──────│              │
     │                           │  save User to DB ────────────────────▶
     │                           │◀───────────────────────────── saved ─│
     │◀─── { idToken, user } ───│                       │              │
     │  Store token in           │                       │              │
     │  localStorage             │                       │              │
     │                           │                       │              │
     │  POST /api/auth/login     │                       │              │
     │──────────────────────────▶│                       │              │
     │                           │  signInWithPassword() │              │
     │                           │──────────────────────▶│              │
     │                           │◀──── ID Token ────────│              │
     │◀─── { idToken, user } ───│                       │              │
     │                           │                       │              │
     │  Any protected request    │                       │              │
     │  (Bearer: <idToken>)      │                       │              │
     │──────────────────────────▶│                       │              │
     │                           │  verifyIdToken()      │              │
     │                           │──────────────────────▶│              │
     │                           │◀── decoded uid ───────│              │
     │                           │  lookup user by uid ──────────────────▶
     │◀─── Protected Response ──│                       │              │
```

**Google Sign-In Flow:**
1. Client triggers `signInWithPopup(GoogleAuthProvider)` — Firebase handles OAuth
2. Client extracts `idToken` from Firebase result
3. Client sends `idToken` to `POST /api/auth/google-login`
4. Backend verifies token with Firebase Admin SDK
5. If new user: creates MongoDB record; if existing: returns profile
6. Backend returns a fresh `idToken` + user object to client

---

## 🔮 Future Improvements

- [ ] **Date-Range Analytics** — Weekly and monthly trend graphs (endpoint scaffolded)
- [ ] **Email Notifications** — Remind students who haven't submitted feedback
- [ ] **Export Reports** — PDF/CSV export of admin analytics
- [ ] **Push Notifications** — Meal-time reminders via Firebase Cloud Messaging
- [ ] **Mobile App** — React Native companion app for students
- [ ] **AI Summaries** — LLM-generated daily food quality narrative
- [ ] **Multi-Hostel Support** — Tenant-based architecture for multiple hostels
- [ ] **Docker Compose** — One-command local setup for all three services

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow conventional commits and ensure code is tested before opening a PR.

---

<div align="center">

Made with ❤️ for GVP Hostel Students

</div>