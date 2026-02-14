import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      // Check if service account key file exists
      const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        // Production mode: Use service account key file
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        
        console.log('✅ Firebase Admin initialized with service account');
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Use service account from environment variable (for deployment)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        
        console.log('✅ Firebase Admin initialized from environment variable');
      } else {
        // Development fallback: Use emulator or simple config
        // NOTE: This won't work for token verification in production!
        console.warn('⚠️  WARNING: No service account found. Using fallback mode.');
        console.warn('⚠️  Token verification will NOT work without proper Firebase Admin setup.');
        console.warn('⚠️  Please add serviceAccountKey.json to backend/config/ directory.');
        console.warn('⚠️  Download it from Firebase Console > Project Settings > Service Accounts');
        
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'hostel-food-analysis',
        });
      }
      
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      throw error;
    }
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize on import
initializeFirebaseAdmin();

export default admin;
