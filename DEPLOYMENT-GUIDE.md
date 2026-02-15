# 🚀 Step-by-Step Deployment Guide

This guide will help you deploy the Hostel Flavour application to production.

---

## 📋 Prerequisites

- [ ] MongoDB Atlas account (free tier: https://www.mongodb.com/cloud/atlas)
- [ ] Firebase project (https://console.firebase.google.com)
- [ ] Git repository (GitHub/GitLab)
- [ ] Deployment platform account (Render/Railway/Vercel)

---

## 🔧 Step 1: Set Up MongoDB Atlas

1. **Create a Free Cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up or log in
   - Click "Build a Database" → "Free" tier
   - Choose a cloud provider and region (closest to your users)
   - Click "Create Cluster"

2. **Create Database User:**
   - Navigate to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `hostel-admin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access:**
   - Navigate to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Get Connection String:**
   - Navigate to "Database" → Your cluster
   - Click "Connect" button
   - Select "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://hostel-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - **Replace `<password>` with your actual password**
   - **Add database name:** `mongodb+srv://hostel-admin:yourpassword@cluster0.xxxxx.mongodb.net/hostel-food-analysis?retryWrites=true&w=majority`
   - **Save this connection string** - you'll need it for environment variables

---

## 🔥 Step 2: Set Up Firebase

### 2.1 Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: `hostel-flavour` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2.2 Enable Authentication

1. In your Firebase project, click "Authentication" (left sidebar)
2. Click "Get started"
3. Enable "Email/Password" authentication
4. Click "Save"

### 2.3 Get Firebase Web Config

1. Click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps"
3. Click the Web icon (`</>`)
4. Register app name: `Hostel Flavour Web`
5. Click "Register app"
6. Copy the `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:xxxxxxxxxxxxxx"
   };
   ```
   **Save these values** - you'll need them for frontend environment variables

### 2.4 Generate Service Account Key (for Backend)

1. Click gear icon (⚙️) → "Project settings"
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" (a JSON file will download)
5. **SAVE THIS FILE SECURELY** - it contains sensitive credentials
6. Open the JSON file, you'll need these values:
   - `project_id`
   - `private_key_id`
   - `private_key` (long string with `\n` characters)
   - `client_email`

---

## 🌐 Step 3: Choose Deployment Platform

We'll use **Render.com** (easiest, free tier available).

### Alternative Platforms:
- **Railway:** https://railway.app (good for monorepos)
- **Vercel (Frontend) + Render (Backend/Analytics):** Best performance
- **Heroku:** Requires credit card even for free tier

---

## 🚀 Step 4: Deploy to Render.com

### 4.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repository

### 4.2 Deploy MongoDB First (Verify Connection)

Test your MongoDB Atlas connection string works:

```bash
# On your local machine
cd backend
node -e "import('mongoose').then(m => m.default.connect('YOUR_MONGODB_URI').then(() => console.log('✅ Connected')).catch(e => console.error('❌ Failed:', e)))"
```

### 4.3 Deploy Analytics Service (Python FastAPI)

1. **Create New Web Service:**
   - Dashboard → "New" → "Web Service"
   - Connect your Git repository
   - Name: `hostel-analytics`
   - Root Directory: `analytics-service`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
     ```
     PORT=8000
     HOST=0.0.0.0
     ENVIRONMENT=production
     MONGODB_URI=mongodb+srv://hostel-admin:yourpassword@cluster0.xxxxx.mongodb.net/hostel-food-analysis?retryWrites=true&w=majority
     CORS_ORIGINS=https://hostel-backend.onrender.com,https://hostel-frontend.onrender.com
     ```
     *(You'll update CORS_ORIGINS after deploying other services)*

3. **Create Service** and wait for deployment

4. **Save the URL:** Something like `https://hostel-analytics.onrender.com`

### 4.4 Deploy Backend Service (Node.js Express)

1. **Create New Web Service:**
   - Dashboard → "New" → "Web Service"
   - Connect repository
   - Name: `hostel-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://hostel-admin:yourpassword@cluster0.xxxxx.mongodb.net/hostel-food-analysis?retryWrites=true&w=majority
   ANALYTICS_API_URL=https://hostel-analytics.onrender.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id_from_json
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxx
   CORS_ORIGIN=https://hostel-frontend.onrender.com
   ```

   **Important:** For `FIREBASE_PRIVATE_KEY`, copy the entire value from the downloaded JSON file, including the quotes and newline characters (`\n`).

3. **Create Service**

4. **Save the URL:** Something like `https://hostel-backend.onrender.com`

### 4.5 Deploy Frontend (React + Vite)

1. **Create New Static Site:**
   - Dashboard → "New" → "Static Site"
   - Connect repository
   - Name: `hostel-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables:**
   ```
   VITE_API_URL=https://hostel-backend.onrender.com/api
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxx
   ```

3. **Create Service**

4. **Save the URL:** Something like `https://hostel-frontend.onrender.com`

### 4.6 Update CORS Origins

Now that you have all URLs, update CORS settings:

1. **Backend Service:**
   - Edit `CORS_ORIGIN` to: `https://hostel-frontend.onrender.com`

2. **Analytics Service:**
   - Edit `CORS_ORIGINS` to: `https://hostel-backend.onrender.com,https://hostel-frontend.onrender.com`

3. Render will automatically redeploy after environment variable changes

---

## ✅ Step 5: Verify Deployment

### 5.1 Check Health Endpoints

Open these URLs in your browser:

- Analytics: `https://hostel-analytics.onrender.com/health`
  - Should return: `{"status":"healthy","database":"connected",...}`

- Backend: `https://hostel-backend.onrender.com/health`
  - Should return: `{"status":"healthy","database":"connected",...}`

- Frontend: `https://hostel-frontend.onrender.com`
  - Should load the login page

### 5.2 Test User Registration

1. Go to your frontend URL
2. Click "Register"
3. Fill in the form (use valid email format)
4. Check if registration succeeds

### 5.3 Test Login

1. Use the credentials you just registered
2. Login should work
3. You should see the student dashboard

### 5.4 Test Feedback Submission

1. Submit feedback for a meal
2. Check if it saves successfully
3. Verify in MongoDB Atlas:
   - Go to Atlas → Database → Browse Collections
   - Select `hostel-food-analysis` database
   - Check `feedbacks` collection for your entry

### 5.5 Test Analytics Dashboard (Admin Only)

1. First, make yourself an admin:
   - Go to MongoDB Atlas → Browse Collections
   - Database: `hostel-food-analysis` → Collection: `users`
   - Find your user document
   - Click "Edit Document"
   - Change `"isAdmin": false` to `"isAdmin": true`
   - Click "Update"

2. Logout and login again

3. Navigate to Analytics Dashboard

4. Select a date and click "Analyze"

5. Charts should load (might take 30-60 seconds on free tier)

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
- Double-check all CORS_ORIGIN environment variables match exactly
- No trailing slashes in URLs
- Use `https://` not `http://`

### Issue: "Database connection failed"

**Solution:**
- Verify MongoDB URI is correct
- Check if IP whitelist in Atlas allows 0.0.0.0/0
- Test connection string locally first

### Issue: "Firebase authentication failed"

**Solution:**
- Verify all Firebase environment variables are set correctly
- Check if `FIREBASE_PRIVATE_KEY` has proper line breaks (`\n`)
- Ensure Firebase Authentication is enabled in console

### Issue: Charts not loading

**Solution:**
- Check analytics service logs in Render dashboard
- Verify `ANALYTICS_API_URL` in backend points to correct URL
- Test analytics endpoint directly: `https://hostel-analytics.onrender.com/api/analytics/daily/2024-01-15`

### Issue: "Service Unavailable" on Render free tier

**Cause:** Free tier services spin down after 15 minutes of inactivity

**Solution:**
- Services will restart on next request (takes ~30 seconds)
- For production, upgrade to paid tier ($7/month per service)
- Or use a cron job to ping health endpoints every 10 minutes

---

## 📊 Monitoring & Maintenance

### Set Up Uptime Monitoring (Free)

**UptimeRobot:** https://uptimerobot.com

1. Sign up for free account
2. Add monitors for:
   - `https://hostel-backend.onrender.com/health`
   - `https://hostel-analytics.onrender.com/health`
   - `https://hostel-frontend.onrender.com`
3. Get email alerts if services go down

### Check Logs

**Render Dashboard:**
- Each service has a "Logs" tab
- Real-time logging
- Search and filter capabilities

**MongoDB Atlas:**
- Database → Metrics
- View query performance
- Set up alerts for high usage

### Database Backups

**MongoDB Atlas Free Tier:**
- No automatic backups on free tier
- Manually export data:
  ```bash
  mongodump --uri="mongodb+srv://hostel-admin:password@cluster0.xxxxx.mongodb.net/hostel-food-analysis"
  ```

**Paid Tier ($9/month):**
- Automatic daily backups
- Point-in-time recovery

---

## 🔐 Security Best Practices

### After Deployment:

1. **Rotate Firebase Keys:**
   - Never commit Firebase service account JSON to git
   - Store only in Render environment variables

2. **Update MongoDB Password:**
   - Use a strong, unique password
   - Store in password manager

3. **Enable MongoDB IP Whitelist:**
   - Instead of 0.0.0.0/0, add specific Render IP ranges
   - Found in Render docs: https://render.com/docs/static-outbound-ip-addresses

4. **Set Up Custom Domain (Optional):**
   - Render allows custom domains on free tier
   - Configure SSL certificates (automatic)

5. **Review Access Logs:**
   - Check MongoDB Atlas access logs weekly
   - Review Render logs for suspicious activity

---

## 💰 Cost Estimation

### Free Tier (Current Setup):
- MongoDB Atlas: FREE (512MB storage)
- Render Static Site (Frontend): FREE
- Render Web Service (Backend): FREE (750 hrs/month)
- Render Web Service (Analytics): FREE (750 hrs/month)
- **Total: $0/month** ✅

**Limitations:**
- Services sleep after 15 min inactivity
- Slower cold starts (~30 seconds)
- 512MB MongoDB storage

### Production (Paid Tier):
- MongoDB Atlas M10: $9/month
- Render Static Site: $0 (always free)
- Render Web Service (Backend): $7/month
- Render Web Service (Analytics): $7/month
- **Total: ~$23/month**

**Benefits:**
- No sleep/cold starts
- 10GB+ storage
- Auto-scaling
- Automatic backups
- 99.9% uptime SLA

---

## 📝 Deployment Checklist Summary

- [ ] MongoDB Atlas cluster created and configured
- [ ] Firebase project created with Authentication enabled
- [ ] Service account key downloaded (never commit to git!)
- [ ] Analytics service deployed to Render
- [ ] Backend service deployed to Render
- [ ] Frontend static site deployed to Render
- [ ] All environment variables configured correctly
- [ ] CORS origins updated with production URLs
- [ ] Health endpoints return 200 OK
- [ ] User registration works
- [ ] User login works
- [ ] Feedback submission works
- [ ] Admin dashboard loads
- [ ] Analytics charts generate successfully
- [ ] Uptime monitoring configured
- [ ] MongoDB backups scheduled (if paid tier)

---

## 🎉 Success!

Your Hostel Flavour application is now live!

**Share your URLs:**
- **Frontend:** `https://hostel-frontend.onrender.com`
- **Backend API:** `https://hostel-backend.onrender.com`
- **Analytics API:** `https://hostel-analytics.onrender.com`

**Next Steps:**
- Create admin users in MongoDB Atlas
- Populate weekly menu data (use backend scripts)
- Test all features thoroughly
- Monitor logs for first 24-48 hours
- Consider upgrading to paid tier for production use

---

## 📞 Support Resources

- **Render Documentation:** https://render.com/docs
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas/
- **Firebase Docs:** https://firebase.google.com/docs
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html

**Common Issues GitHub:** Create an issue in your repository for help

---

**Last Updated:** 2024  
**Maintained by:** Hostel Flavour Team
