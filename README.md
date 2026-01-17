# Hostel Flavour — Hostel Food Feedback & Analytics

## Overview
Hostel Flavour is a full-stack app where students submit meal feedback (rating + optional comment) and admins can review analytics.

This repo has three parts:
- `frontend/` (React): student + admin UI
- `backend/` (Express): API + MongoDB + auth/RBAC
- `analytics-service/` (Python): daily analysis + chart generation

## Features
### Student
- Firebase login
- Submit feedback per meal: `morning`, `afternoon`, `evening`, `night`
- See today’s submission status (which meals are already submitted)
- View today’s menu (if an active weekly menu exists)

### Admin
- Daily analysis for a selected date (ratings, distributions, participation, and “sentiment” derived from ratings)
- Optional AI suggestions in the analytics API using a Hugging Face key (falls back to rule-based suggestions)

### Charts
- Interactive charts in the UI (Chart.js)
- Python-generated chart images (matplotlib/seaborn) returned as base64 and also written under `analytics-service/output/`
- Export chart cards as PNG/PDF (client-side)

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, Chart.js, `html2canvas`, `jspdf`
- Backend: Node.js (Express), MongoDB (Mongoose)
- Auth: Firebase Auth (client) + Firebase Admin token verification (server)
- Analytics service: Python (`pymongo`, `matplotlib`, `seaborn`, `python-dotenv`)

## Setup
### Prerequisites
- Node.js 18+
- Python 3
- MongoDB
- A Firebase project (web config for the frontend)

### 1) Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```bash
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/hostel-food-analysis

# Used by backend token verification (see backend/config/firebase-admin.js)
FIREBASE_PROJECT_ID=your-firebase-project-id

# Optional (enables AI suggestions in analytics endpoints)
HUGGINGFACE_API_KEY=...
```

Start the API:
```bash
cd backend
npm run dev
```

Health check: `GET http://localhost:5000/health`

### 2) Analytics service (Python)
The backend runs Python from this exact path:
`analytics-service/venv/bin/python` (see `backend/services/analyticsService.js`).

Create the venv + install deps:
```bash
cd analytics-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Notes:
- The Python script reads `MONGODB_URI` from `backend/.env` (see `analytics-service/utils/database.py`).
- There is also `analytics-service/setup.sh`, but it installs packages via `pip3` (system/global). If you use that script, you still need to ensure the backend’s expected venv path exists (or update `backend/services/analyticsService.js`).

### 3) Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Start the UI:
```bash
cd frontend
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Usage (quick walkthrough)
1) Student logs in with Firebase.
2) Student completes registration (creates MongoDB `User`) via `POST /api/auth/register`.
3) Student submits meal feedback via `POST /api/feedback/submit`.
4) Admin opens the admin dashboard and requests daily analytics for a date.

### Creating an admin user
Registration defaults to `isAdmin: false`.

To promote a user to admin, update the MongoDB `users` collection and set `isAdmin: true` for that user.

### Helpful seed scripts (optional)
These are under `backend/scripts/` and can help with local testing:
- `insert-weekly-menu.js` (creates a sample weekly menu)
- `generate-test-feedback.js` (generates sample feedback)
- `bulk-register-users.js` (creates many Firebase users + MongoDB records)

## API (high level)
### Auth
- `POST /api/auth/register` (create MongoDB user profile; requires Firebase token)
- `POST /api/auth/sync-user` (fetch MongoDB profile after login)

### Feedback
- `POST /api/feedback/submit`
- `GET /api/feedback/my-feedback`
- `GET /api/feedback/submission-stats`

### Menu
- `GET /api/menu/today`
- Admin endpoints exist under `/api/menu/weekly`

### Analytics (admin)
- Daily analysis used by the current admin UI:
  - `GET /api/analytics/daily/:date`
- Other analytics endpoints exist in `backend/routes/analytics.js`:
  - `GET /api/analytics/dashboard` (Node-computed analytics + optional AI suggestions)
  - `GET /api/analytics/comments`
  - `GET /api/analytics/alerts`
  - `GET /api/analytics/dashboard/quick-stats`
  - `POST /api/analytics/reports/generate`

Important note about weekly/historical routes:
- `GET /api/analytics/weekly/:date` and `/api/analytics/historical/*` are wired to `backend/services/analyticsService.js`, which expects Python scripts `weekly_analysis.py` and `historical_analysis.py`.
- Those scripts are not present in `analytics-service/services/` in the current repo, so those endpoints will fail unless you add the missing scripts (or change the backend to compute them in Node).

## Architecture (brief)
```
React (frontend)
  → Express API (backend)
    → MongoDB (users, feedback, weekly menus)
    → Python daily analysis (daily_analysis.py) → JSON + chart images
```

- The frontend sends Firebase ID tokens in `Authorization: Bearer <token>`.
- The backend verifies tokens, applies role checks (admin-only analytics), and queries MongoDB.
- For daily analytics, the backend spawns `analytics-service/services/daily_analysis.py` and returns its JSON output.
- Generated chart files are served via `GET /analytics-images/...` from `analytics-service/output/`.

## More details
- Implementation walkthrough: `IMPLEMENTATION.md`

## License
MIT (see `backend/package.json`)
