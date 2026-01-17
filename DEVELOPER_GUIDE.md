# 🚀 Developer Guide - Hostel Flavour Platform

## 📑 Table of Contents
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Database Schema](#database-schema)
- [API Design Patterns](#api-design-patterns)
- [Authentication Flow](#authentication-flow)
- [Analytics Pipeline](#analytics-pipeline)
- [Frontend State Management](#frontend-state-management)
- [Error Handling](#error-handling)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

---

## 📂 Project Structure

```
Hostel-Flavour/
├── frontend/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/          # Shared components (StarRating, LoadingSpinner)
│   │   │   ├── layout/          # Layout components (Navbar, Layout)
│   │   │   └── charts/          # Chart components (unused currently)
│   │   ├── contexts/            # React Context providers
│   │   │   └── AuthContext-Firebase.jsx  # Firebase auth state management
│   │   ├── pages/               # Page components
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── student/        # Student Dashboard
│   │   │   ├── admin/          # Admin Dashboards (Daily, Simple)
│   │   │   └── Profile.jsx     # User profile page
│   │   ├── config/             # Configuration files
│   │   │   ├── api.js          # API endpoints configuration
│   │   │   └── firebase.js     # Firebase client configuration
│   │   ├── styles/             # CSS files
│   │   └── main.jsx            # Application entry point
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
│
├── backend/                       # Express.js Backend
│   ├── config/                   # Configuration modules
│   │   ├── database.js          # MongoDB connection
│   │   └── firebase-admin.js    # Firebase Admin SDK setup
│   ├── middleware/              # Express middleware
│   │   └── firebaseAuth.js      # Authentication & authorization
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js             # User model
│   │   ├── Feedback.js         # Feedback model
│   │   └── WeeklyMenu.js       # Menu model
│   ├── routes/                 # API route handlers
│   │   ├── auth-firebase.js    # Authentication routes
│   │   ├── users.js            # User management routes
│   │   ├── feedback.js         # Feedback submission routes
│   │   ├── menu.js             # Menu management routes
│   │   └── analytics.js        # Analytics routes
│   ├── services/               # Business logic services
│   │   └── analyticsService.js # Python analytics integration
│   ├── scripts/                # Utility scripts
│   │   ├── bulk-register-users.js
│   │   ├── generate-test-feedback.js
│   │   ├── insert-weekly-menu.js
│   │   └── delete-all-feedback.js
│   ├── utils/                  # Utility functions
│   │   └── istDate.js          # IST timezone helpers
│   └── server.js               # Express app entry point
│
├── analytics-service/            # Python Analytics Microservice
│   ├── services/                # Analysis scripts
│   │   └── daily_analysis.py   # Daily feedback analysis
│   ├── utils/                   # Utility modules
│   │   ├── database.py         # MongoDB connection
│   │   └── chart_generator.py  # Chart generation (matplotlib/seaborn)
│   ├── output/                  # Generated chart files
│   │   └── daily/              # Daily analysis outputs
│   └── requirements.txt        # Python dependencies
│
├── .gitignore                   # Git ignore rules (root level)
├── README.md                    # Project overview
├── IMPLEMENTATION.md            # Implementation details
├── DEVELOPER_GUIDE.md           # This file
└── CODE_CLEANUP_REPORT.md       # Code cleanup analysis
```

---

## 🔄 Development Workflow

### 1. **Environment Setup**

#### Step 1: MongoDB
```bash
# Start MongoDB locally
mongod --dbpath /path/to/data/db

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env to Atlas connection string
```

#### Step 2: Backend
```bash
cd backend
npm install
cp .env.example .env  # Create .env and fill in values
npm run dev           # Starts on port 5000
```

#### Step 3: Python Analytics
```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

cd analytics-service
pip install -r requirements.txt
```

#### Step 4: Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Create .env and fill in Firebase config
npm run dev           # Starts on port 5173
```

### 2. **Development Server Startup Order**

1. ✅ **MongoDB** — Ensure running first
2. ✅ **Backend** — `npm run dev` in `backend/`
3. ✅ **Frontend** — `npm run dev` in `frontend/`

**Note:** Python analytics runs on-demand via backend subprocess calls.

### 3. **Hot Reload Configuration**

- **Frontend:** Vite provides instant HMR (Hot Module Replacement)
- **Backend:** Nodemon watches for file changes and auto-restarts
- **Python:** No hot reload; backend spawns new process each time

---

## 🏗️ Architecture Deep Dive

### **Three-Tier Architecture**

```
┌─────────────────────────────────────────────────┐
│          PRESENTATION TIER                      │
│  ┌──────────────────────────────────────┐       │
│  │  React Frontend (Port 5173)          │       │
│  │  - Components                        │       │
│  │  - Context API (Global State)        │       │
│  │  - React Router (Client-side routing)│       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
                    ↓ HTTP/REST
┌─────────────────────────────────────────────────┐
│           APPLICATION TIER                      │
│  ┌──────────────────────────────────────┐       │
│  │  Express.js (Port 5000)              │       │
│  │  - Routes (API Endpoints)            │       │
│  │  - Middleware (Auth, Validation)     │       │
│  │  - Services (Business Logic)         │       │
│  │  - Python Process Spawner            │       │
│  └──────────────────────────────────────┘       │
│  ┌──────────────────────────────────────┐       │
│  │  Python Analytics Service            │       │
│  │  - Data Analysis                     │       │
│  │  - Chart Generation                  │       │
│  │  - Sentiment Analysis                │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
                    ↓ MongoDB Driver
┌─────────────────────────────────────────────────┐
│            DATA TIER                            │
│  ┌──────────────────────────────────────┐       │
│  │  MongoDB (Port 27017)                │       │
│  │  - users collection                  │       │
│  │  - feedbacks collection              │       │
│  │  - weeklymenus collection            │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

### **Key Design Patterns**

1. **Repository Pattern** — Mongoose models abstract database operations
2. **Middleware Chain** — Express middleware for auth, validation, error handling
3. **Service Layer** — Business logic separated from route handlers
4. **Context Provider** — React Context for global state (authentication)
5. **Microservice** — Python analytics as independent service

---

## 🗄️ Database Schema

### **Users Collection**

```javascript
{
  _id: ObjectId,
  firebaseUid: String (unique, indexed),
  email: String (unique, required),
  name: String (required),
  rollNumber: String (unique, required for students),
  isAdmin: Boolean (default: false),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - firebaseUid (unique)
// - email (unique)
// - rollNumber (unique, sparse)
```

### **Feedbacks Collection**

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  date: Date (midnight IST, indexed),
  meals: {
    morning: {
      rating: Number (0-5),
      comment: String (max 500 chars),
      submittedAt: Date
    },
    afternoon: { /* same structure */ },
    evening: { /* same structure */ },
    night: { /* same structure */ }
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - { user: 1, date: 1 } (unique compound index)
// - { date: 1 } (for analytics queries)
```

### **WeeklyMenus Collection**

```javascript
{
  _id: ObjectId,
  weekStart: Date (Monday, midnight IST),
  weekEnd: Date (Sunday, 11:59 PM IST),
  isActive: Boolean (default: true),
  meals: {
    monday: {
      morning: String,
      afternoon: String,
      evening: String,
      night: String
    },
    tuesday: { /* same structure */ },
    // ... all days
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - { weekStart: 1 }
// - { isActive: 1, weekStart: 1 }
```

---

## 🔌 API Design Patterns

### **Request/Response Structure**

#### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { /* ... */ },
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ /* validation errors */ ],
  "timestamp": "2026-01-17T10:30:00.000Z"
}
```

### **Authentication Pattern**

All protected routes require:
```
Authorization: Bearer <firebase-id-token>
```

**Middleware Chain:**
```javascript
router.get('/protected', 
  authenticateFirebaseToken,  // Verifies token, attaches req.user
  requireAdmin,               // Checks req.user.isAdmin
  async (req, res) => { /* handler */ }
);
```

### **Error Handling Pattern**

```javascript
try {
  // Business logic
  const result = await someOperation();
  res.json({ status: 'success', data: result });
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({
    status: 'error',
    message: 'Operation failed',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

---

## 🔐 Authentication Flow

### **Registration Flow**

```
1. User signs up with Firebase (frontend)
   ↓
2. Firebase creates auth user (firebaseUid)
   ↓
3. Frontend receives Firebase ID token
   ↓
4. Frontend calls POST /api/auth/register with:
   - Firebase token (Authorization header)
   - User details (name, rollNumber, email)
   ↓
5. Backend verifies token with Firebase Admin SDK
   ↓
6. Backend creates MongoDB user document
   ↓
7. Backend returns user profile
```

### **Login Flow**

```
1. User logs in with Firebase (frontend)
   ↓
2. Firebase returns ID token
   ↓
3. Frontend calls POST /api/auth/sync-user
   ↓
4. Backend verifies token
   ↓
5. Backend finds/creates MongoDB user
   ↓
6. Backend updates lastLogin timestamp
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend sets AuthContext state (user, isAuthenticated)
```

### **Protected Request Flow**

```
1. Frontend makes API request with token:
   Authorization: Bearer <token>
   ↓
2. authenticateFirebaseToken middleware:
   - Extracts token from header
   - Verifies with Firebase Admin SDK
   - Queries MongoDB for user
   - Attaches user to req.user
   ↓
3. requireAdmin middleware (if admin route):
   - Checks req.user.isAdmin
   - Returns 403 if not admin
   ↓
4. Route handler executes
```

---

## 📊 Analytics Pipeline

### **Daily Analysis Workflow**

```
Admin selects date → Frontend
   ↓
GET /api/analytics/daily/2026-01-16
   ↓
Backend (analyticsService.js)
   ↓
Spawn Python process:
  python .venv/bin/python \
    analytics-service/services/daily_analysis.py \
    "2026-01-16"
   ↓
Python Script:
  1. Connect to MongoDB
  2. Query feedbacks for date
  3. Calculate metrics:
     - Participation rate
     - Average ratings per meal
     - Rating distributions
     - Sentiment analysis (rating-based)
     - Quality consistency score
  4. Generate charts (matplotlib/seaborn):
     - Average ratings bar chart
     - Rating distribution stacked bars
     - Sentiment pie charts (per meal)
     - Participation donut chart
  5. Save charts to output/daily/{date}/
  6. Encode charts as base64
  7. Output JSON to stdout
   ↓
Backend captures stdout
   ↓
Parse JSON response
   ↓
Return to frontend:
{
  status: "success",
  data: { /* metrics */ },
  charts: {
    avgRatings: { path: "...", base64: "data:image/png;base64,..." },
    distribution: { /* ... */ },
    sentiment: { /* ... */ },
    participation: { /* ... */ }
  }
}
   ↓
Frontend displays:
  - Metrics in cards
  - Charts rendered from base64
```

### **Chart Generation Details**

**Technologies:**
- **matplotlib** — Chart rendering
- **seaborn** — Enhanced styling
- **base64** — Encoding for web display

**Chart Types:**
1. **Average Ratings** — Bar chart, color-coded by rating
2. **Rating Distribution** — Stacked bars showing 1-5 star counts
3. **Sentiment Analysis** — Pie charts (positive/neutral/negative)
4. **Participation** — Donut chart with percentage

**Storage:**
- **File System:** `analytics-service/output/daily/{YYYY-MM-DD}/`
- **API Serving:** `GET /analytics-images/daily/{date}/{chart}.png`
- **Frontend Display:** Base64 embedded in `<img>` tags

---

## 🎨 Frontend State Management

### **Global State (Context API)**

```javascript
// AuthContext-Firebase.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with backend
        const response = await syncUser(firebaseUser);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setIsAdmin(response.data.user.isAdmin);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### **Local State Management**

Pages use React hooks for component state:
```javascript
const [feedback, setFeedback] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchFeedback();
}, []);
```

### **API Communication Pattern**

```javascript
// config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const feedbackAPI = {
  submit: async (data) => {
    const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

---

## ⚠️ Error Handling

### **Backend Error Handling**

**Global Error Handler:**
```javascript
// server.js
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

**Route-Level Error Handling:**
```javascript
router.post('/submit', async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Business logic
    const result = await submitFeedback(req.body);
    
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit feedback'
    });
  }
});
```

### **Frontend Error Handling**

```javascript
try {
  const response = await feedbackAPI.submit(data);
  if (response.status === 'success') {
    toast.success(response.message);
  } else {
    toast.error(response.message);
  }
} catch (error) {
  console.error('Error:', error);
  toast.error('Network error. Please try again.');
}
```

---

## 🧪 Testing Strategy

### **Current Status**
⚠️ **No tests implemented yet**

### **Recommended Testing Approach**

#### **Backend Tests (Jest)**

```javascript
// Example: __tests__/routes/feedback.test.js
describe('POST /api/feedback/submit', () => {
  it('should submit feedback successfully', async () => {
    const response = await request(app)
      .post('/api/feedback/submit')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        mealType: 'morning',
        rating: 4.5,
        comment: 'Good breakfast'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
});
```

#### **Frontend Tests (React Testing Library)**

```javascript
// Example: __tests__/components/StarRating.test.jsx
describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={3} onChange={() => {}} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });
});
```

#### **Python Tests (pytest)**

```python
# Example: tests/test_daily_analysis.py
def test_calculate_participation_rate():
    result = calculate_participation_rate(
        participating=50,
        total=100
    )
    assert result == 50.0
```

---

## 🚀 Deployment Guide

### **Environment Variables**

#### Production Backend `.env`
```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hostel-food

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccount.json
```

#### Production Frontend `.env`
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
# ... other Firebase config
```

### **Deployment Checklist**

- [ ] Environment variables configured
- [ ] Firebase service account uploaded securely
- [ ] MongoDB Atlas connection tested
- [ ] Python virtual environment activated
- [ ] Static files served correctly
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL certificates installed
- [ ] Error logging configured (Winston/Sentry)
- [ ] Database backups scheduled

### **Recommended Platforms**

- **Frontend:** Vercel, Netlify
- **Backend:** Railway, Heroku, AWS EC2, DigitalOcean
- **Database:** MongoDB Atlas
- **Python Service:** Same server as backend (subprocess)

---

## 🔧 Troubleshooting

### **Common Issues**

#### 1. **Charts Not Displaying**

**Symptom:** Admin dashboard shows "No charts available"

**Solution:**
```bash
# Check Python environment
source .venv/bin/activate
python --version  # Should be 3.8+

# Test Python script directly
cd analytics-service
python services/daily_analysis.py "2026-01-16"

# Check backend logs for Python errors
# Verify analyticsService.js points to correct Python path
```

#### 2. **Authentication Failures**

**Symptom:** "Invalid token" errors

**Solution:**
```bash
# Verify Firebase service account JSON
cat backend/config/serviceAccountKey.json

# Check Firebase project ID matches
echo $FIREBASE_PROJECT_ID

# Clear frontend localStorage
localStorage.clear()

# Re-login to get fresh token
```

#### 3. **MongoDB Connection Issues**

**Symptom:** "Failed to connect to database"

**Solution:**
```bash
# Check MongoDB is running
mongosh  # or mongo

# Verify connection string
echo $MONGODB_URI

# Check network access (MongoDB Atlas)
# Add IP to whitelist in Atlas dashboard
```

#### 4. **CORS Errors**

**Symptom:** "Access blocked by CORS policy"

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Ensure CORS_ORIGIN matches frontend URL
```

---

## 📖 Additional Resources

- **MongoDB Docs:** https://docs.mongodb.com/
- **Express.js Guide:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **Firebase Auth:** https://firebase.google.com/docs/auth
- **Matplotlib Guide:** https://matplotlib.org/stable/tutorials/index.html

---

## 🤝 Contributing Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test Locally**
   - Test all affected endpoints
   - Check frontend UI changes
   - Verify analytics still works

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/new-feature
   ```

6. **Code Review**
   - Wait for review
   - Address feedback
   - Merge when approved

---

**Last Updated:** January 17, 2026  
**Maintainer:** Karthick ([Karthick9298](https://github.com/Karthick9298))
