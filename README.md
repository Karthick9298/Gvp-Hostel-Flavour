# 🍽️ Hostel Food Analysis System

**A comprehensive feedback and analytics platform for hostel food management**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)]()
[![React](https://img.shields.io/badge/React-18+-blue)]()
[![Python](https://img.shields.io/badge/Python-3.11+-yellow)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-brightgreen)]()
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)]()
[![License](https://img.shields.io/badge/License-MIT-purple)]()

---

## 📋 **Table of Contents**

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Analytics Service](#analytics-service)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 **Overview**

The Hostel Food Analysis System is a modern, full-stack application designed to revolutionize food quality management in hostel environments. It provides a seamless platform for students to submit feedback and empowers administrators with AI-powered insights and comprehensive analytics.

### **Problem Solved:**
- ❌ Manual feedback collection is time-consuming and inefficient
- ❌ Lack of real-time insights into food quality issues
- ❌ No systematic approach to track improvement trends
- ❌ Poor communication between students and management
- ❌ Difficulty in identifying recurring food quality problems

### **Solution Provided:**
- ✅ Real-time digital feedback submission with star ratings
- ✅ AI-powered sentiment analysis and insights
- ✅ Comprehensive analytics dashboard with interactive charts
- ✅ Daily and weekly trend analysis
- ✅ Automated recommendations for improvement
- ✅ Firebase-based secure authentication
- ✅ Role-based access control (Student/Admin)

---

## ✨ **Features**

### **For Students** 👨‍🎓

#### **1. Intuitive Feedback System**
- Quick star-rating system (1-5 stars) for each meal
- Text comments for detailed feedback
- Meal-specific feedback (Morning, Afternoon, Evening, Night)
- Real-time submission with instant confirmation

#### **2. Personal Dashboard**
- View personal feedback history
- Track submission patterns
- Profile management

### **For Administrators** 👨‍💼

#### **1. Comprehensive Analytics Dashboard**
- **Daily Analysis**: Detailed day-wise feedback analysis
- **Weekly Analysis**: Weekly trends and patterns
- **Interactive Charts**: Dynamic visualization with Chart.js
- **Real-time Metrics**: Live feedback statistics

#### **2. AI-Powered Insights**
- Sentiment analysis of text comments
- Automated recommendations for improvement
- Critical issue identification
- Performance trend analysis

#### **3. Data Export & Reports**
- PDF report generation
- Export charts and analytics
- Historical data analysis

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework**: React 19.1.1 with Vite
- **Styling**: Tailwind CSS 3.4.0
- **Charts**: Chart.js 4.5.1 + React-Chart.js-2
- **Routing**: React Router DOM 6.8.1
- **Authentication**: Firebase 10.7.1
- **HTTP Client**: Axios 1.6.0
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **PDF Generation**: jsPDF + html2canvas

### **Backend**
- **Runtime**: Node.js 18+ with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Logging**: Morgan
- **Date Handling**: Moment.js with Timezone support

### **Analytics Service**
- **Language**: Python 3.11+
- **Data Analysis**: Pandas, NumPy
- **Database**: PyMongo
- **NLP**: TextBlob (Sentiment Analysis)
- **Visualization**: Matplotlib, Seaborn
- **Machine Learning**: Scikit-learn
- **Word Cloud**: WordCloud library

### **Authentication & Database**
- **Authentication**: Firebase Authentication
- **Database**: MongoDB Atlas/Local
- **File Storage**: Firebase Storage (if needed)

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │   Backend       │    │  Analytics      │
│   (React)       │    │   (Node.js)     │    │  Service        │
│                 │    │                 │    │  (Python)       │
│   Port: 5173    │◄──►│   Port: 5000    │◄──►│                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │                 │              │
         └─────────────►│   Firebase      │◄─────────────┘
                        │   Authentication│
                        │                 │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │                 │
                        │   MongoDB       │
                        │   Database      │
                        │                 │
                        └─────────────────┘
```

### **Component Structure**

```
src/
├── components/
│   ├── admin/analytics/          # Admin analytics components
│   ├── charts/                   # Chart components
│   │   ├── ChartComponents.jsx
│   │   ├── DailyAnalysisCharts.jsx
│   │   └── WeeklyAnalysisCharts.jsx
│   ├── common/                   # Reusable components
│   │   ├── LoadingSpinner.jsx
│   │   └── StarRating.jsx
│   └── layout/                   # Layout components
│       ├── Layout.jsx
│       └── Navbar.jsx
├── pages/
│   ├── admin/                    # Admin dashboard pages
│   ├── auth/                     # Authentication pages
│   └── student/                  # Student dashboard
├── contexts/                     # React contexts
├── config/                       # Configuration files
└── styles/                       # Custom styles
```

---

## 🚀 **Installation**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (Local or Atlas)
- Firebase Project with Authentication enabled

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd "Hostel Flavour"
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
```

### **4. Analytics Service Setup**
```bash
cd analytics-service
pip install -r requirements.txt
```

---

## ⚙️ **Configuration**

### **Backend Environment Variables**
Create `.env` file in the `backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hostel-food-analysis
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel-food-analysis

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# AI Service Configuration (Optional)
HUGGINGFACE_API_KEY=your-huggingface-api-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
```

### **Frontend Configuration**
Create `src/config/firebaseConfig.js` in the `frontend/` directory:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

export default firebaseConfig;
```

### **Analytics Service Configuration**
Create `.env` file in the `analytics-service/` directory:

```env
MONGODB_URI=mongodb://localhost:27017/hostel-food-analysis
PYTHON_ENV=development
```

---

## 🎯 **Usage**

### **Development Mode**

#### **1. Start MongoDB**
```bash
# If using local MongoDB
mongod --dbpath /path/to/your/db
```

#### **2. Start Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### **3. Start Frontend Development Server**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### **4. Test Analytics Service**
```bash
cd analytics-service
python test_api.py
```

### **Production Deployment**

#### **1. Build Frontend**
```bash
cd frontend
npm run build
```

#### **2. Start Backend in Production**
```bash
cd backend
npm start
```

### **Default Admin Setup**
Use the bulk registration script to create admin users:

```bash
cd backend
npm run bulk-register
```

---

## 📚 **API Documentation**

### **Authentication Endpoints**
```
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/verify       # Verify JWT token
```

### **User Management**
```
GET    /api/users           # Get all users (Admin)
GET    /api/users/profile   # Get user profile
PUT    /api/users/profile   # Update user profile
DELETE /api/users/:id       # Delete user (Admin)
```

### **Feedback Endpoints**
```
POST /api/feedback          # Submit feedback
GET  /api/feedback          # Get user's feedback
GET  /api/feedback/all      # Get all feedback (Admin)
GET  /api/feedback/stats    # Get feedback statistics
```

### **Analytics Endpoints**
```
GET  /api/analytics/daily/:date     # Get daily analysis
GET  /api/analytics/weekly/:date    # Get weekly analysis
GET  /api/analytics/summary         # Get overall summary
GET  /api/analytics/trends          # Get trend analysis
```

### **Menu Management**
```
GET    /api/menu/weekly     # Get weekly menu
POST   /api/menu/weekly     # Create/Update weekly menu (Admin)
DELETE /api/menu/weekly/:id # Delete weekly menu (Admin)
```

---

## 🔬 **Analytics Service**

The Python-based analytics service provides advanced data analysis capabilities:

### **Key Features**
- **Sentiment Analysis**: Text-based feedback sentiment scoring
- **Trend Analysis**: Weekly and monthly trend identification
- **Performance Metrics**: Comprehensive KPI calculations
- **Predictive Analytics**: Basic forecasting capabilities
- **Data Visualization**: Chart generation for reports

### **Available Scripts**
```bash
# Daily analysis for specific date
python services/daily_analysis.py --date 2024-01-15

# Weekly analysis
python services/weekly_analysis.py --week 2024-01-15

# Test API connectivity
python test_api.py
```

### **Analytics API Integration**
The backend integrates with the analytics service through:
- Direct Python script execution
- MongoDB data sharing
- JSON-based data exchange

---

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
npm test
```

### **Frontend Testing**
```bash
cd frontend
npm run lint
```

### **Analytics Service Testing**
```bash
cd analytics-service
python test_api.py
```

---

## 📈 **Monitoring & Health Checks**

### **Health Check Endpoint**
```
GET /health
```

### **System Monitoring**
- Server status monitoring
- Database connection health
- Firebase authentication status
- Rate limiting monitoring

---

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow ESLint configuration for JavaScript/React
- Use Python PEP 8 standards for Python code
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

### **Code Structure Standards**
- **Components**: Use functional components with hooks
- **API**: Follow RESTful conventions
- **Database**: Use proper indexing and validation
- **Security**: Implement proper authentication and authorization

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Firebase** for authentication services
- **MongoDB** for flexible document storage
- **Chart.js** for beautiful data visualizations
- **React** and **Vite** for modern frontend development
- **Express.js** for robust backend architecture
- **Python Data Science Stack** for advanced analytics

---

## 📞 **Support**

For support, please open an issue on GitHub or contact the development team.

**Happy Coding! 🚀**
