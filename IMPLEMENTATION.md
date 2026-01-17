# Implementation Notes (Hostel Flavour)

This document is a code-oriented walkthrough of how the project works, with the focus on what is implemented in this repo (and what is stubbed/incomplete).

## High-level flow
1) User signs in using Firebase Auth in the frontend.
2) Frontend calls the backend with `Authorization: Bearer <Firebase ID Token>`.
3) Backend verifies the token, looks up the MongoDB `User`, and applies RBAC:
   - students can submit feedback + read menu
   - admins can access analytics endpoints
4) For daily analytics, the backend spawns the Python script and returns its JSON output.

## Repo structure
- `frontend/` – React UI (Vite)
- `backend/` – Express API + MongoDB models + Firebase Admin verification
- `analytics-service/` – Python daily analysis + chart generation

## Data model (MongoDB)
### `User` (`backend/models/User.js`)
- Stores identity and profile fields plus role flags.
- Key fields used across the app: `firebaseUid`, `isAdmin`, `isActive`.

### `Feedback` (`backend/models/Feedback.js`)
- One document per user per day (unique compound index: `{ user, date }`).
- `date` is normalized to IST midnight (time set to `00:00:00.000`).
- `meals` has four sub-documents: `morning`, `afternoon`, `evening`, `night`.
  - Each meal stores: `rating` (0–5), `comment` (max 500), `submittedAt`.
- Submission gating:
  - `feedback.canSubmitMeal(mealType)` enforces an IST-based time rule + prevents double-submit.
  - If you need the exact time windows, refer to the switch-case in `Feedback.js` (this is the source of truth).

### `WeeklyMenu` (`backend/models/WeeklyMenu.js`)
- Stores a weekly menu; the student dashboard reads “today’s menu” from the active one.

## Authentication + RBAC
### Frontend
- Firebase Auth client is initialized from env vars in `frontend/src/config/firebaseConfig.js`.
- After login, the frontend calls `POST /api/auth/sync-user` to fetch the MongoDB profile (and determine `isAdmin`).

### Backend
- Firebase Admin is initialized in `backend/config/firebase-admin.js`.
- Middleware in `backend/middleware/firebaseAuth.js`:
  - verifies the Firebase ID token
  - loads the MongoDB user by `firebaseUid` and attaches it to `req.user`
  - `requireAdmin` blocks admin-only routes

## API surface (what exists)
This is a practical map of the main routes.

### Auth (`backend/routes/auth-firebase.js`)
- `POST /api/auth/register`
  - validates `name`, `rollNumber`, `hostelRoom`
  - requires Firebase token
  - creates MongoDB user (defaults `isAdmin: false`)
- `POST /api/auth/sync-user`
  - requires Firebase token
  - fetches MongoDB user by `firebaseUid`
- `GET /api/auth/me`
  - requires Firebase token
  - returns the current MongoDB user profile

### Feedback (`backend/routes/feedback.js`)
- `POST /api/feedback/submit`
  - writes rating/comment for a single meal for “today” (IST)
- `GET /api/feedback/my-feedback`
  - returns today’s feedback document (or an empty structure)
- `GET /api/feedback/submission-stats`
  - aggregated submission counts per meal

### Menu (`backend/routes/menu.js`)
- `GET /api/menu/today`
  - resolves today’s menu from the active weekly menu
- Admin menu endpoints exist under `/api/menu/weekly`.

### Analytics (admin) (`backend/routes/analytics.js`)
There are two “styles” of analytics in this repo:

1) Node-computed analytics (MongoDB → Node → JSON)
- `GET /api/analytics/dashboard?period=daily|weekly&date=YYYY-MM-DD`
  - builds aggregates directly from MongoDB feedback
  - optionally calls Hugging Face for suggestions (`HUGGINGFACE_API_KEY`)
  - includes `trendData` when `period=weekly`
- `GET /api/analytics/comments` (raw comments across meals)
- `GET /api/analytics/dashboard/quick-stats` (yesterday quick stats)
- `GET /api/analytics/alerts` (alerts derived from daily analysis output)
- `POST /api/analytics/reports/generate` (returns a downloadable report)

2) Python-backed analytics (MongoDB → Python → JSON + charts)
- `GET /api/analytics/daily/:date`
  - spawns Python daily analysis and returns its parsed JSON

⚠️ Weekly/historical Python routes are currently incomplete
- The backend also exposes:
  - `GET /api/analytics/weekly/:date`
  - `GET /api/analytics/historical/comparison|trends|patterns`
- These call `analyticsService.getWeeklyAnalysis()` / `getHistoricalAnalysis()`, which expect Python scripts:
  - `analytics-service/services/weekly_analysis.py`
  - `analytics-service/services/historical_analysis.py`
- Those scripts are not present in `analytics-service/services/` in this workspace, so these endpoints will fail unless you implement the missing scripts (or change the backend to compute them in Node like `/api/analytics/dashboard`).

## Daily analysis pipeline (Node → Python)
### Node side
- Implementation: `backend/services/analyticsService.js`
- The service spawns:
  - `analytics-service/venv/bin/python`
  - `analytics-service/services/daily_analysis.py <YYYY-MM-DD>`
- The Python script prints JSON to stdout; Node parses it and returns it.

### Python side
- Entry point: `analytics-service/services/daily_analysis.py`
- Database access: `analytics-service/utils/database.py`
  - loads `MONGODB_URI` from `backend/.env`
- “Sentiment” is rating-based (not NLP):
  - rating ≥ 4 → positive
  - rating ≤ 2 → negative
  - otherwise neutral
- Chart generation: `analytics-service/utils/chart_generator.py`
  - images are returned as base64 and also written to `analytics-service/output/<...>`

### How charts are served
- Backend serves the output folder statically:
  - `GET /analytics-images/...` → `analytics-service/output/...` (see `backend/server.js`)

## Frontend screens (what’s wired)
- Routing is role-based in `frontend/src/App.jsx`.
  - `/dashboard` routes to student or admin experience based on `isAdmin`.
- Student dashboard: `frontend/src/pages/student/Dashboard.jsx`
  - feedback submission + “today’s menu”
- Admin daily analysis: `frontend/src/pages/admin/DashboardDaily.jsx`
  - picks a date
  - calls `/api/analytics/daily/:date`
  - renders Chart.js charts and Python-generated base64 images

## Chart export (frontend)
- `frontend/src/components/charts/ChartWrapper.jsx` exports a chart card using `html2canvas` + `jspdf`.

## Notes / limitations (current repo)
- Only the daily Python analysis script is present (`daily_analysis.py`). Weekly/historical Python routes are wired but missing the scripts they require.
- Firebase Admin is initialized with a simplified config in `backend/config/firebase-admin.js`. For production-grade token verification, Firebase Admin typically needs proper credentials (e.g., service account / Application Default Credentials).
