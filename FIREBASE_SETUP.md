# 🔥 Firebase Authentication Setup Guide

## Problem
The backend Firebase Admin SDK requires a service account key file to verify authentication tokens. Without it, users cannot log in or register because token verification fails on the backend.

## Solution Steps

### 1️⃣ Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if you haven't)
3. Click on **⚙️ Settings** (gear icon) → **Project settings**
4. Navigate to **Service accounts** tab
5. Click **"Generate new private key"** button
6. Click **"Generate key"** in the confirmation dialog
7. A JSON file will be downloaded (e.g., `hostel-food-analysis-firebase-adminsdk-xxxxx.json`)

### 2️⃣ Add Service Account to Backend

#### Option A: Local File (Recommended for Development)

1. Rename the downloaded file to `serviceAccountKey.json`
2. Move it to: `backend/config/serviceAccountKey.json`
3. **IMPORTANT**: This file is already in `.gitignore` - Never commit it to Git!

```bash
# From project root
mv ~/Downloads/hostel-food-analysis-firebase-adminsdk-*.json backend/config/serviceAccountKey.json
```

#### Option B: Environment Variable (For Production/Deployment)

1. Copy the entire content of the downloaded JSON file
2. Set it as an environment variable:

```bash
# In backend/.env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

### 3️⃣ Verify Setup

1. Restart your backend server:
```bash
cd backend
npm run dev
```

2. Look for this success message in the console:
```
✅ Firebase Admin initialized with service account
```

3. If you see this warning, the setup is incomplete:
```
⚠️  WARNING: No service account found. Using fallback mode.
```

### 4️⃣ Test Authentication

1. Start both frontend and backend:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

2. Try to register a new user or log in
3. Check browser console and backend logs for any errors

## 🔒 Security Notes

- **NEVER** commit `serviceAccountKey.json` to version control
- **NEVER** share your service account key publicly
- The `.gitignore` file already protects these files
- For production deployment, use environment variables instead of files
- Rotate keys periodically for enhanced security

## 🐛 Troubleshooting

### Error: "Invalid token" or "Authentication failed"
- ✅ Verify service account key is in the correct location
- ✅ Check file name is exactly `serviceAccountKey.json`
- ✅ Restart backend server after adding the key
- ✅ Ensure JSON file is valid (not corrupted)

### Error: "User not found or inactive"
- User exists in Firebase but not in MongoDB
- Complete registration flow to create user in database

### Error: "Firebase Admin initialization failed"
- Check JSON file format is valid
- Ensure file path is correct
- Check file permissions (should be readable)

## 📁 File Structure

```
backend/
├── config/
│   ├── firebase-admin.js         # Firebase Admin initialization
│   └── serviceAccountKey.json    # ← Add this file (git-ignored)
├── middleware/
│   └── firebaseAuth.js           # Auth middleware
└── .env                          # Environment variables
```

## 🌐 Frontend Firebase Config

The frontend also needs Firebase configuration. Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from Firebase Console → Project Settings → General → Your apps → SDK setup and configuration.

## ✅ Complete Setup Checklist

- [ ] Downloaded service account key from Firebase Console
- [ ] Renamed file to `serviceAccountKey.json`
- [ ] Moved to `backend/config/` directory
- [ ] Verified file is in `.gitignore`
- [ ] Restarted backend server
- [ ] Confirmed success message in console
- [ ] Created frontend `.env` with Firebase config
- [ ] Tested registration/login functionality
- [ ] Both frontend and backend running successfully

---

**Need Help?** Check the console logs for detailed error messages. Both frontend browser console and backend terminal will show helpful debugging information.
