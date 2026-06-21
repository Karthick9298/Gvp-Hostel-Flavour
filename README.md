# 🍽️ GVP Hostel Flavour

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

**A full-stack hostel food feedback and analytics platform for GVP College of Engineering.**

</div>

---

## 📌 Overview

**GVP Hostel Flavour** is a role-based web application that lets hostel students rate and comment on their daily meals (Breakfast, Lunch, Snacks, and Dinner) — and lets administrators dive deep into food quality analytics powered by a dedicated Python microservice.

The platform follows a **microservices architecture** split across three independent services:

- **Frontend** — React 19 SPA for students and admins
- **Backend** — Express.js REST API handling JWT auth, feedback, menu management, and analytics routing
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
  <b>Analytics View (Admin)</b><br />
  <a href="./screenshots/Screenshot%20from%202026-04-16%2021-49-53.png">
    <img src="./screenshots/Screenshot%20from%202026-04-16%2021-49-53.png" alt="Analytics View" width="70%" />
  </a>
</p>

---

## 🚀 Features

### 👨‍🎓 Student Features
- 🔐 **Secure Authentication** — Email/password login with JWT (7-day token, bcrypt password hashing)
- ⭐ **Meal Feedback** — Rate and comment on 4 daily meals with time-gated submission windows
- 📅 **Today's Menu** — View the active weekly meal schedule per day
- 📊 **Submission Tracker** — Real-time feedback status showing completed vs pending meals
- 👤 **Profile Management** — Update personal details (name, room, roll number) and change password

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
- Analytics results cached in MongoDB to avoid re-computation for past dates

### 🔄 Background Jobs (Cron)
- **Daily Analytics Cron** — Auto-runs analysis at 1:00 AM IST and caches results in MongoDB
- **Keep-Alive Cron** — Periodic self-ping to prevent cold starts on free hosting tiers

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| Radix UI | Accessible UI components |
| React Hot Toast | Toast notifications |
| jsPDF + html2canvas | PDF export |
| React Icons + Lucide | Iconography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| jsonwebtoken (JWT) | Stateless authentication tokens |
| bcryptjs | Password hashing (12 salt rounds) |
| express-validator | Input validation |
| Helmet + express-rate-limit | Security hardening |
| Morgan | HTTP request logging |
| node-cron | Scheduled background jobs |
| dotenv | Environment configuration |

### Analytics Service
| Technology | Purpose |
|-----------|---------|
| Python 3.8+ + FastAPI | Analytics microservice |
| Uvicorn | ASGI server |
| PyMongo | MongoDB direct access |
| Matplotlib + Seaborn | Chart generation (base64) |
| python-dotenv | Environment configuration |

### Database & Infrastructure
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud database (`hostel-food-analysis` db) |
| Vercel | Frontend deployment |
| Render / Railway | Backend & Analytics service deployment |

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                          │
│                       React 19 + Vite SPA                        │
│           Student Dashboard │ Admin Dashboard │ Auth Pages        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS / REST API  (Bearer JWT)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS BACKEND                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐  │
│  │  /auth   │ │ /feedback│ │/analytics│ │/menu │ │  /users  │  │
│  └──────────┘ └──────────┘ └────┬─────┘ └──────┘ └──────────┘  │
│        JWT Auth Middleware       │        Helmet, Rate-Limit,    │
│      (jsonwebtoken + bcrypt)     │        CORS, Morgan           │
│                                  │                               │
│   ┌──────────────────────────┐   │    ┌─────────────────────┐   │
│   │  node-cron  background   │   │    │  DailyAnalytics     │   │
│   │  - Daily analytics 1AM   │   │    │  cache (MongoDB)    │   │
│   │  - Keep-alive ping       │   │    └─────────────────────┘   │
│   └──────────────────────────┘   │                               │
└──────────────────────────────────┼───────────────────────────────┘
                 │                 │
                 ▼                 ▼
┌────────────────────┐   ┌──────────────────────────────────────────┐
│   MongoDB Atlas    │   │       PYTHON FASTAPI MICROSERVICE        │
│  (hostel-food-     │   │                                          │
│   analysis)        │   │  GET /api/analytics/daily/{YYYY-MM-DD}  │
│                    │   │  GET /health                             │
│  ● users           │◀──│                                          │
│  ● feedbacks       │   │  ┌──────────┐ ┌────────┐               │
│  ● weeklymenus     │   │  │ PyMongo  │ │ Matplt │               │
│  ● dailyanalytics  │   │  │  (DB)    │ │ Seaborn│               │
└────────────────────┘   │  └──────────┘ └────────┘               │
                         └──────────────────────────────────────────┘
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
│   │   │   │   └── Login.jsx        # Email + password login (JWT)
│   │   │   ├── student/
│   │   │   │   └── Dashboard.jsx    # Meal feedback UI
│   │   │   ├── admin/
│   │   │   │   └── DashboardDaily.jsx  # Admin analytics view
│   │   │   └── Profile.jsx          # Profile & password change
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── StarRating.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   └── layout/
│   │   │       ├── Layout.jsx
│   │   │       └── Navbar.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Global auth state (JWT)
│   │   └── config/
│   │       └── api.js               # Axios instance + API methods
│   └── package.json
│
├── backend/                         # Express.js REST API
│   ├── server.js                    # App entry point
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                  # JWT verification + requireAdmin
│   ├── models/
│   │   ├── User.js                  # User schema (bcrypt pre-save hook)
│   │   ├── Feedback.js              # Feedback schema (per-day, per-meal)
│   │   ├── WeeklyMenu.js            # Weekly menu template schema
│   │   └── DailyAnalytics.js        # Analytics cache schema
│   ├── routes/
│   │   ├── auth.js                  # Login, /me, logout, change-password
│   │   ├── feedback.js              # Feedback CRUD
│   │   ├── analytics.js             # Analytics proxy + cache routes
│   │   ├── menu.js                  # Menu management
│   │   └── users.js                 # User admin endpoints
│   ├── services/
│   │   └── analyticsService.js      # Calls Python microservice via axios
│   ├── cron/
│   │   ├── dailyAnalyticsCron.js    # Runs analysis at 1AM IST daily
│   │   └── keepAliveCron.js         # Self-ping to prevent cold starts
│   ├── scripts/                     # Admin utility scripts
│   │   ├── bulk-register-users.js   # Seed 150 students + admin user
│   │   ├── delete-all-users.js      # Wipe all users + feedback
│   │   ├── insert-weekly-menu.js    # Seed a weekly menu
│   │   └── generate-test-feedback.js # Generate realistic test feedback
│   └── .env.example
│
└── analytics-service/               # Python FastAPI microservice
    ├── main.py                      # FastAPI app entry point + API key guard
    ├── services/
    │   └── daily_analysis_core.py   # Core analysis logic
    ├── utils/
    │   ├── database.py              # PyMongo connection (reads MONGODB_URI)
    │   └── chart_generator.py       # Matplotlib/Seaborn chart builder
    ├── requirements.txt
    ├── Procfile                     # Render deployment
    └── .env.example
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)

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
source venv/bin/activate        # Linux/macOS
.\venv\Scripts\Activate.ps1     # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# IMPORTANT: Set MONGODB_URI to include the database name:
# mongodb+srv://<user>:<pass>@cluster.mongodb.net/hostel-food-analysis

# Start analytics service
uvicorn main:app --reload --port 8000
```

Analytics service runs at: `http://localhost:8000`  
Swagger docs at: `http://localhost:8000/docs`

> ⚠️ **Critical:** The `MONGODB_URI` in both `backend/.env` and `analytics-service/.env` **must include the database name** (`/hostel-food-analysis`) in the connection string. If the database name is omitted, MongoDB defaults to the `test` database and the analytics service will find no data.

---

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 5. Seed Data

```bash
cd backend/scripts

# Seed 150 students (323103310001–323103310150) + 1 admin
node bulk-register-users.js

# Generate realistic test feedback (Oct 12–18, 2025)
node generate-test-feedback.js

# (Optional) Insert a weekly menu
node insert-weekly-menu.js
```

You can also use the npm scripts from the `backend/` directory:
```bash
npm run bulk-register      # runs bulk-register-users.js
npm run generate-feedback  # runs generate-test-feedback.js
```

> ⚠️ **If re-seeding:** Run `node delete-all-users.js` first to wipe existing users and feedback, then re-run the above scripts.

**Default Test Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gvpce.ac.in` | `12345678` |
| Student | `323103310001@gvpce.ac.in` – `323103310150@gvpce.ac.in` | `12345678` |

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5000

# MongoDB — MUST include database name in the URI
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hostel-food-analysis

# Analytics Microservice
ANALYTICS_API_URL=http://localhost:8000
ANALYTICS_API_SECRET=<shared-secret-matching-analytics-service>

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=<64-char-hex-string>

# CORS — frontend origin
CORS_ORIGIN=http://localhost:5173
```

### Analytics Service — `analytics-service/.env`

```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# API key — must match backend's ANALYTICS_API_SECRET
SERVICE_API_KEY=<shared-secret>

# MongoDB — MUST include database name in the URI
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hostel-food-analysis

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:5000
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Authentication Flow

The app uses **stateless JWT authentication** — no Firebase, no sessions.

```
┌──────────┐                ┌─────────┐              ┌──────────┐
│  Client  │                │ Backend │              │ MongoDB  │
└────┬─────┘                └────┬────┘              └────┬─────┘
     │                           │                       │
     │  POST /api/auth/login     │                       │
     │  { email, password }      │                       │
     │──────────────────────────▶│                       │
     │                           │  findOne({ email })   │
     │                           │──────────────────────▶│
     │                           │◀──── user (+ hash) ───│
     │                           │  bcrypt.compare()     │
     │                           │  jwt.sign(userId)     │
     │◀─── { token, user } ─────│                       │
     │  Store token in           │                       │
     │  localStorage             │                       │
     │                           │                       │
     │  Any protected request    │                       │
     │  Authorization: Bearer <token>                    │
     │──────────────────────────▶│                       │
     │                           │  jwt.verify(token)    │
     │                           │  findById(userId)     │
     │                           │──────────────────────▶│
     │◀─── Protected Response ──│                       │
```

**Auth endpoints:**
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/login` | Login with email + password → returns JWT |
| `GET`  | `/api/auth/me` | Get current user (requires Bearer token) |
| `POST` | `/api/auth/logout` | Stateless logout (client clears token) |
| `PUT`  | `/api/auth/change-password` | Change password (requires Bearer token) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| POST | `/api/auth/logout` | Private |
| PUT | `/api/auth/change-password` | Private |

### Feedback
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/feedback/today` | Student |
| POST | `/api/feedback/:mealType` | Student |

### Analytics
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/analytics/daily/:date` | Admin (YYYY-MM-DD) |
| GET | `/api/analytics/system/health` | Admin |

### Menu
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/menu/current` | Student |
| POST | `/api/menu` | Admin |
| PUT | `/api/menu/:id` | Admin |
| DELETE | `/api/menu/:id` | Admin |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users` | Admin |
| PUT | `/api/users/:id/toggle-admin` | Admin |
| PUT | `/api/users/:id/toggle-active` | Admin |

---

## 🔮 Future Improvements

- [ ] **Date-Range Analytics** — Weekly and monthly trend graphs
- [ ] **Email Notifications** — Remind students who haven't submitted feedback
- [ ] **Export Reports** — PDF/CSV export of admin analytics
- [ ] **Push Notifications** — Meal-time reminders
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