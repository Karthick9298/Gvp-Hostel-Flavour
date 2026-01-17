# 📐 Implementation Guide - Hostel Flavour Platform

## 🎯 Project Flow Overview

This document provides a comprehensive walkthrough of how data flows through the Hostel Flavour platform, from user actions to database storage and analytics visualization.

---

## 📊 Complete System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTIONS                          │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
    ┌───────▼────────┐                 ┌───────▼────────┐
    │    STUDENT     │                 │     ADMIN      │
    │   DASHBOARD    │                 │   DASHBOARD    │
    └───────┬────────┘                 └───────┬────────┘
            │                                   │
            │                                   │
    ┌───────▼────────────────────────┐  ┌──────▼─────────────-----┐
    │  1. View Menu                  │  │  1. View Analytics      |           
    │  2. Submit Feedback            │  │  2. Manage Users(fut)   |                              
    │  3. Check Submission Status    │  │  3. Manage Menus(future)|   
    └───────┬────────────────────────┘  └──────┬─────────────------
            │                                   │
            └──────────────┬────────────────────┘
                           │
                 ┌─────────▼──────────┐
                 │   FIREBASE AUTH    │
                 │  (Token Validation)│
                 └─────────┬──────────┘
                           │
                 ┌─────────▼──────────┐
                 │   EXPRESS BACKEND  │
                 │   (REST API)       │
                 └─────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼────────┐
  │  MongoDB  │    │   Python    │   │  File System  │
  │ Database  │    │  Analytics  │   │  (Charts)     │
  └───────────┘    └─────────────┘   └───────────────┘
```

---

## 🔄 Detailed Implementation Flows

### 1. Student Registration Flow

```
Step 1: User Signs Up
  ├─ User clicks "Sign Up" button
  ├─ Enters email, password, name, roll number
  └─ Submits form
        ↓
Step 2: Firebase Authentication
  ├─ Frontend calls Firebase Auth createUserWithEmailAndPassword()
  ├─ Firebase creates authentication record
  ├─ Returns firebaseUid and ID token
  └─ Frontend stores token in localStorage
        ↓
Step 3: Create MongoDB Profile
  ├─ Frontend calls POST /api/auth/register
  ├─ Request includes:
  │   ├─ Authorization: Bearer <firebase-token>
  │   ├─ Body: { name, email, rollNumber }
  ├─ Backend verifies Firebase token
  ├─ Backend creates User document in MongoDB:
  │   {
  │     firebaseUid: "xyz123",
  │     email: "student@example.com",
  │     name: "John Doe",
  │     rollNumber: "20A91A0501",
  │     isAdmin: false,
  │     isActive: true,
  │     createdAt: Date,
  │     lastLogin: Date
  │   }
  └─ Backend returns user profile
        ↓
Step 4: Update Auth Context
  ├─ Frontend receives user data
  ├─ Updates AuthContext state:
  │   ├─ user: userData
  │   ├─ isAuthenticated: true
  │   ├─ isAdmin: false
  └─ Redirects to student dashboard
```

**Files Involved:**
- `frontend/src/pages/auth/Register.jsx` — Registration UI
- `frontend/src/contexts/AuthContext-Firebase.jsx` — Auth state management
- `backend/routes/auth-firebase.js` — Registration endpoint
- `backend/middleware/firebaseAuth.js` — Token verification
- `backend/models/User.js` — User schema

---

### 2. Feedback Submission Flow

```
Step 1: Student Selects Meal
  ├─ Student navigates to Dashboard
  ├─ Views 4 meal cards (Morning, Afternoon, Evening, Night)
  ├─ Each card shows:
  │   ├─ Meal time window
  │   ├─ Submission status
  │   └─ Enable/disable based on time
  └─ Clicks on available meal card
        ↓
Step 2: Student Provides Feedback
  ├─ Star rating component appears
  ├─ Student selects rating (0-5 stars)
  ├─ Optional: Adds comment (max 500 chars)
  └─ Clicks "Submit Feedback"
        ↓
Step 3: Time Window Validation (Frontend)
  ├─ Check current IST time
  ├─ Validate meal submission window:
  │   ├─ Morning: Available after 9:00 AM
  │   ├─ Afternoon: Available after 1:00 PM
  │   ├─ Evening: Available after 5:00 PM
  │   └─ Night: Available after 8:00 PM
  └─ Proceed if valid, else show error
        ↓
Step 4: API Request
  ├─ POST /api/feedback/submit
  ├─ Headers:
  │   └─ Authorization: Bearer <token>
  ├─ Body:
  │   {
  │     mealType: "morning",
  │     rating: 4.5,
  │     comment: "Great breakfast today!"
  │   }
        ↓
Step 5: Backend Validation
  ├─ Authenticate user (verify Firebase token)
  ├─ Validate request body:
  │   ├─ mealType ∈ ['morning', 'afternoon', 'evening', 'night']
  │   ├─ rating: 0 ≤ rating ≤ 5
  │   └─ comment.length ≤ 500
  ├─ Get current IST date (midnight)
  └─ Check time window (server-side validation)
        ↓
Step 6: Database Operation
  ├─ Find existing feedback document:
  │   feedbacks.findOne({ user: userId, date: today })
  ├─ If not exists:
  │   ├─ Create new document with all 4 meals (null ratings)
  │   └─ Set meals[mealType] = { rating, comment, submittedAt }
  ├─ If exists:
  │   ├─ Check if meal already submitted
  │   ├─ If not, update meals[mealType]
  │   └─ If yes, check if within same time window
  └─ Save document
        ↓
Step 7: Response
  ├─ Return success with submission stats:
  │   {
  │     status: "success",
  │     message: "Feedback submitted",
  │     data: {
  │       feedback: { mealType, rating, comment, submittedAt },
  │       stats: {
  │         submittedMeals: 2,
  │         pendingMeals: 2,
  │         completionRate: 50
  │       }
  │     }
  │   }
  └─ Frontend shows success toast
        ↓
Step 8: UI Update
  ├─ Refresh feedback data
  ├─ Update meal card status (submitted ✓)
  ├─ Update submission statistics
  └─ Disable submitted meal card
```

**Files Involved:**
- `frontend/src/pages/student/Dashboard.jsx` — Student UI
- `frontend/src/components/common/StarRating.jsx` — Rating input
- `backend/routes/feedback.js` — Feedback submission endpoint
- `backend/models/Feedback.js` — Feedback schema with validation
- `backend/utils/istDate.js` — IST timezone handling

---

### 3. Daily Analytics Generation Flow

```
Step 1: Admin Selects Date
  ├─ Admin navigates to Daily Analytics Dashboard
  ├─ Sees date picker (max = yesterday)
  ├─ Selects analysis date (e.g., 2026-01-16)
  └─ Clicks "Analyze" button
        ↓
Step 2: Frontend API Call
  ├─ GET /api/analytics/daily/2026-01-16
  ├─ Headers:
  │   └─ Authorization: Bearer <admin-token>
  └─ Loading state displayed
        ↓
Step 3: Backend Authentication
  ├─ authenticateFirebaseToken middleware
  │   ├─ Verify token
  │   ├─ Load user from MongoDB
  │   └─ Attach to req.user
  ├─ requireAdmin middleware
  │   ├─ Check req.user.isAdmin === true
  │   └─ Return 403 if not admin
        ↓
Step 4: Validate Date
  ├─ Check date format (YYYY-MM-DD)
  ├─ Ensure date is not in future
  └─ Calculate date range (midnight to 11:59 PM IST)
        ↓
Step 5: Spawn Python Process
  ├─ analyticsService.getDailyAnalysis(date)
  ├─ Construct command:
  │   ['.venv/bin/python', 
  │    'analytics-service/services/daily_analysis.py', 
  │    '2026-01-16']
  ├─ Spawn child process
  └─ Capture stdout and stderr
        ↓
Step 6: Python Analysis Script
  ├─ Connect to MongoDB
  ├─ Query feedbacks collection:
  │   feedbacks.find({ 
  │     date: { 
  │       $gte: startOfDay, 
  │       $lt: endOfDay 
  │     } 
  │   })
  ├─ Query users collection for total students
  ├─ Calculate metrics:
  │   ├─ Participation rate
  │   ├─ Average ratings per meal
  │   ├─ Rating distributions (1-5 stars)
  │   ├─ Sentiment analysis (positive/neutral/negative)
  │   ├─ Quality consistency score
  │   └─ Daily summary text
  ├─ Generate charts:
  │   ├─ 1. Average Ratings Bar Chart
  │   │   ├─ matplotlib bar chart
  │   │   ├─ Color-coded (red <2.5, yellow <3.5, green ≥3.5)
  │   │   └─ Save to output/daily/2026-01-16/avg_ratings.png
  │   ├─ 2. Rating Distribution Stacked Bars
  │   │   ├─ 4 meals × 5 star ratings
  │   │   ├─ Stacked bar chart
  │   │   └─ Save to rating_distribution.png
  │   ├─ 3. Sentiment Analysis Pie Charts
  │   │   ├─ 2×2 subplot grid
  │   │   ├─ One pie chart per meal
  │   │   └─ Save to sentiment_analysis.png
  │   └─ 4. Participation Donut Chart
  │       ├─ Donut chart (participated vs not)
  │       ├─ Center text shows percentage
  │       └─ Save to participation.png
  ├─ Encode charts as base64
  └─ Output JSON to stdout:
      {
        "status": "success",
        "data": {
          "overview": {
            "totalStudents": 100,
            "participatingStudents": 75,
            "participationRate": 75.0,
            "overallRating": 4.2
          },
          "averageRatingPerMeal": {
            "morning": 4.3,
            "afternoon": 4.1,
            "evening": 4.0,
            "night": 4.4
          },
          "feedbackDistributionPerMeal": { ... },
          "sentimentAnalysisPerMeal": { ... },
          "qualityConsistencyScore": 85.2,
          "dailySummary": "Excellent feedback today..."
        },
        "charts": {
          "avgRatings": {
            "path": "/path/to/avg_ratings.png",
            "base64": "data:image/png;base64,iVBORw0KG..."
          },
          "distribution": { ... },
          "sentiment": { ... },
          "participation": { ... }
        },
        "date": "2026-01-16",
        "timestamp": "2026-01-17T10:30:00Z"
      }
        ↓
Step 7: Backend Processes Response
  ├─ Capture JSON from stdout
  ├─ Parse JSON
  ├─ Check for errors
  └─ Return to frontend:
      {
        "status": "success",
        "data": { ... },  // Metrics
        "charts": { ... }, // Base64 charts
        "date": "2026-01-16",
        "timestamp": "..."
      }
        ↓
Step 8: Frontend Renders Dashboard
  ├─ Update state with received data
  ├─ Render metric cards:
  │   ├─ Participation rate
  │   ├─ Overall rating
  │   ├─ Quality consistency
  │   └─ Daily summary
  ├─ Render charts:
  │   ├─ Create <img> tags with base64 src
  │   ├─ Each chart in card with title
  │   └─ Export buttons (PNG/PDF)
  └─ Hide loading spinner
```

**Files Involved:**
- `frontend/src/pages/admin/DashboardDaily.jsx` — Admin UI
- `backend/routes/analytics.js` — Analytics endpoints
- `backend/services/analyticsService.js` — Python process spawner
- `analytics-service/services/daily_analysis.py` — Main analysis script
- `analytics-service/utils/chart_generator.py` — Chart generation
- `analytics-service/utils/database.py` — MongoDB connection

---

### 4. Menu Management Flow

```
Step 1: Admin Creates Weekly Menu
  ├─ Admin navigates to Menu Management
  ├─ Selects week start date (Monday)
  ├─ Fills in meal details for 7 days × 4 meals
  └─ Clicks "Create Menu"
        ↓
Step 2: Validation
  ├─ Frontend validates all fields filled
  ├─ Ensures week starts on Monday
  └─ POST /api/menu/weekly
        ↓
Step 3: Backend Processing
  ├─ Authenticate admin user
  ├─ Calculate weekStart and weekEnd:
  │   ├─ weekStart: Monday 00:00:00 IST
  │   └─ weekEnd: Sunday 23:59:59 IST
  ├─ Create WeeklyMenu document:
  │   {
  │     weekStart: Date,
  │     weekEnd: Date,
  │     isActive: true,
  │     meals: {
  │       monday: { morning, afternoon, evening, night },
  │       tuesday: { ... },
  │       ...
  │     }
  │   }
  └─ Save to MongoDB
        ↓
Step 4: Student Views Menu
  ├─ Student navigates to Dashboard
  ├─ GET /api/menu/today
  ├─ Backend:
  │   ├─ Get current IST date
  │   ├─ Find active menu containing today
  │   ├─ Determine day of week
  │   └─ Return today's 4 meals
  └─ Frontend displays menu card
```

**Files Involved:**
- `backend/routes/menu.js` — Menu management endpoints
- `backend/models/WeeklyMenu.js` — Menu schema
- `frontend/src/pages/student/Dashboard.jsx` — Menu display

---

## 🔐 Security Implementation

### 1. Authentication Security

```
Token Verification Flow:
  1. Frontend obtains Firebase ID token
  2. Backend receives token in Authorization header
  3. Firebase Admin SDK verifies token:
     ├─ Validates signature
     ├─ Checks expiration
     ├─ Confirms project ID
  4. Backend queries MongoDB for user
  5. Attaches user to request object
  6. Route handler has access to authenticated user
```

**Security Features:**
- ✅ Tokens expire after 1 hour (auto-refresh by Firebase)
- ✅ HTTPS required in production
- ✅ CORS restricted to frontend domain
- ✅ Rate limiting (100 requests per 15 min per IP)
- ✅ Input validation on all endpoints
- ✅ Helmet.js security headers

### 2. Role-Based Access Control (RBAC)

```javascript
// Middleware chain for admin routes
router.get('/analytics/daily/:date', 
  authenticateFirebaseToken,  // Step 1: Verify user
  requireAdmin,               // Step 2: Check isAdmin
  async (req, res) => {       // Step 3: Execute
    // Admin-only logic
  }
);
```

**Role Hierarchy:**
- **Student** (isAdmin: false)
  - Submit feedback
  - View own data
  - View menu
- **Admin** (isAdmin: true)
  - All student permissions
  - View analytics
  - Manage users
  - Manage menus

### 3. Data Validation

**Example: Feedback Submission**
```javascript
[
  body('mealType')
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Invalid meal type'),
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
]
```

---

## ⏰ Time Window Management

### IST Timezone Handling

**Backend:**
```javascript
// Get current IST date (midnight)
const now = new Date();
const istTime = new Date(now.toLocaleString("en-US", {
  timeZone: "Asia/Kolkata"
}));
const currentDate = new Date(
  istTime.getFullYear(), 
  istTime.getMonth(), 
  istTime.getDate()
);
currentDate.setHours(0, 0, 0, 0);
```

**Submission Windows:**
```javascript
const canSubmitMeal = (mealType) => {
  const hour = istTime.getHours();
  
  switch (mealType) {
    case 'morning':  return hour >= 9;   // After 9 AM
    case 'afternoon': return hour >= 13;  // After 1 PM
    case 'evening':   return hour >= 17;  // After 5 PM
    case 'night':     return hour >= 20;  // After 8 PM
    default: return false;
  }
};
```

**Purpose:**
- Prevents students from rating meals before consumption
- Ensures feedback is timely and relevant
- Maintains data integrity

---

## 📈 Analytics Calculations

### 1. Participation Rate
```python
participation_rate = (participating_students / total_students) × 100
```

### 2. Average Rating Per Meal
```python
avg_rating = sum(ratings) / count(ratings)
```

### 3. Sentiment Classification
```python
def classify_sentiment(rating):
    if rating >= 4:
        return 'positive'
    elif rating <= 2:
        return 'negative'
    else:
        return 'neutral'
```

### 4. Quality Consistency Score
```python
# Measures consistency across all meals (0-100)
# Higher = more consistent quality

consistency_score = 100 - (coefficient_of_variation × 2)

# Where coefficient_of_variation = (std_dev / mean) × 100
```

---

## 🎨 Chart Generation Process

### Chart Configuration

**1. Average Ratings Chart**
```python
fig, ax = plt.subplots(figsize=(10, 6))
colors = ['red' if r < 2.5 else 'yellow' if r < 3.5 else 'green' 
          for r in ratings]
ax.bar(meals, ratings, color=colors)
ax.set_ylim(0, 5.5)
ax.grid(axis='y', alpha=0.3)
```

**2. Base64 Encoding**
```python
buffer = BytesIO()
fig.savefig(buffer, format='png', dpi=100)
buffer.seek(0)
image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
return f'data:image/png;base64,{image_base64}'
```

**3. File System Storage**
```python
filepath = f'output/daily/{date}/avg_ratings.png'
fig.savefig(filepath, dpi=100, bbox_inches='tight')
```

---

## 🚦 Error Handling Strategies

### 1. No Data Scenarios

```python
if not feedback_data:
    return {
        "status": "no_data",
        "message": "No feedback found for this date",
        "type": "no_feedback",
        "data": {
            "overview": {
                "totalStudents": total_students,
                "participatingStudents": 0,
                "participationRate": 0,
                "overallRating": 0
            }
        }
    }
```

### 2. Future Date Handling

```python
if requested_date > today:
    return {
        "status": "no_data",
        "message": f"Feedback will be available after {date}",
        "type": "future_date"
    }
```

### 3. Python Script Errors

```javascript
// Backend catches Python errors
if (code !== 0) {
  console.error('Python script error:', stderr);
  return {
    error: true,
    message: 'Analytics generation failed'
  };
}
```

---

## 📦 Data Models Implementation

### User Document Structure
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  firebaseUid: "abc123xyz",
  email: "student@example.com",
  name: "John Doe",
  rollNumber: "20A91A0501",
  isAdmin: false,
  isActive: true,
  lastLogin: ISODate("2026-01-17T10:30:00Z"),
  createdAt: ISODate("2026-01-01T00:00:00Z"),
  updatedAt: ISODate("2026-01-17T10:30:00Z")
}
```

### Feedback Document Structure
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  user: ObjectId("507f1f77bcf86cd799439011"),
  date: ISODate("2026-01-16T00:00:00Z"),  // Midnight IST
  meals: {
    morning: {
      rating: 4.5,
      comment: "Great breakfast!",
      submittedAt: ISODate("2026-01-16T09:30:00Z")
    },
    afternoon: {
      rating: 4.0,
      comment: "Good lunch",
      submittedAt: ISODate("2026-01-16T13:15:00Z")
    },
    evening: {
      rating: null,
      comment: "",
      submittedAt: null
    },
    night: {
      rating: null,
      comment: "",
      submittedAt: null
    }
  },
  createdAt: ISODate("2026-01-16T09:30:00Z"),
  updatedAt: ISODate("2026-01-16T13:15:00Z")
}
```

---

## 🔄 State Management Flow

### Frontend State Updates

```javascript
// 1. Initial Load
useEffect(() => {
  fetchFeedback();
  fetchMenu();
  fetchStats();
}, []);

// 2. After Submission
const handleSubmit = async () => {
  await submitFeedback(data);
  await fetchFeedback();  // Refresh state
  toast.success('Submitted!');
};

// 3. Auth State Sync
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      syncUserWithBackend(firebaseUser);
    }
  });
  return unsubscribe;
}, []);
```

---

## 📊 Performance Optimizations

### 1. Database Indexing
```javascript
// Feedback collection
feedbackSchema.index({ user: 1, date: 1 }, { unique: true });
feedbackSchema.index({ date: 1 });

// User collection
userSchema.index({ firebaseUid: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
```

### 2. Chart Caching
- Charts saved to filesystem
- Served as static files
- Base64 embedded for instant display

### 3. Frontend Optimizations
- React.memo for expensive components
- useCallback for event handlers
- Lazy loading for admin dashboard

---

## 🎓 Best Practices Followed

1. ✅ **Separation of Concerns** — Routes, services, models separate
2. ✅ **DRY Principle** — Reusable components and utilities
3. ✅ **Security First** — Authentication on all protected routes
4. ✅ **Error Handling** — Try-catch blocks, validation
5. ✅ **Code Comments** — Complex logic documented
6. ✅ **Environment Variables** — No hardcoded secrets
7. ✅ **IST Timezone** — Consistent throughout stack
8. ✅ **RESTful API** — Standard HTTP methods and status codes

---

**Last Updated:** January 17, 2026  
**Version:** 1.0.0  
**Maintainer:** Karthick ([Karthick9298](https://github.com/Karthick9298))
