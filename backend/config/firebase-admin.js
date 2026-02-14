import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      // Use certificate-based initialization with environment variables
      const privateKey = process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;
      
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!privateKey || !clientEmail || !projectId) {
        throw new Error('Missing Firebase credentials. Please set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID in .env file');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
        projectId: projectId,
      });
      
      console.log('✅ Firebase Admin initialized successfully with certificate');
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
