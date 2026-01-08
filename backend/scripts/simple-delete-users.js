import mongoose from 'mongoose';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin SDK using environment variables
try {
  // Create service account object from environment variables
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    universe_domain: "googleapis.com"
  };

  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Missing required Firebase Admin SDK environment variables. Please check FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env file');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-food-analysis';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Simple deletion function
const deleteUsersByEmailRange = async () => {
  console.log('🗑️  Starting User Deletion Process');
  console.log('==================================');
  
  try {
    await connectDB();
    
    // Define email patterns to search for
    const emailPatterns = [
  /^32310331000[1-9]@gvpce\.ac\.in$/,           // 001-009
  /^32310331001[0-9]@gvpce\.ac\.in$/,           // 010-019
  /^32310331002[0-9]@gvpce\.ac\.in$/,           // 020-029
  /^32310331003[0-9]@gvpce\.ac\.in$/,           // 030-039
  /^32310331004[0-9]@gvpce\.ac\.in$/,           // 040-049
  /^32310331005[0-9]@gvpce\.ac\.in$/,           // 050-059
  /^32310331006[0-9]@gvpce\.ac\.in$/,           // 060-069
  /^32310331007[0-9]@gvpce\.ac\.in$/,           // 070-079
  /^32310331008[0-9]@gvpce\.ac\.in$/,           // 080-089
  /^32310331009[0-9]@gvpce\.ac\.in$/,           // 090-099
  /^32310331010[0-9]@gvpce\.ac\.in$/,           // 100-109
  /^32310331011[0-9]@gvpce\.ac\.in$/,           // 110-119
  /^32310331012[0-9]@gvpce\.ac\.in$/,           // 120-129
  /^32310331013[0-9]@gvpce\.ac\.in$/,           // 130-139
  /^32310331014[0-9]@gvpce\.ac\.in$/,           // 140-149
  /^3231033100150@gvpce\.ac\.in$/               // 150
];
    
    // Also check for other possible email domains
    const alternativePatterns = [
      /^32310331001[0-9]@student\.hostel\.edu$/,
      /^32310331002[0-9]@student\.hostel\.edu$/,
      /^32310331003[0-9]@student\.hostel\.edu$/,
      /^32310331004[0-9]@student\.hostel\.edu$/,
      /^32310331005[0-9]@student\.hostel\.edu$/,
      /^323103310060@student\.hostel\.edu$/,
      /^323103310061@student\.hostel\.edu$/,
      /^323103310062@student\.hostel\.edu$/,
      /^323103310063@student\.hostel\.edu$/,
      /^323103310064@student\.hostel\.edu$/,
      /^323103310065@student\.hostel\.edu$/,
      /^323103310066@student\.hostel\.edu$/,
      /^323103310067@student\.hostel\.edu$/,
      /^323103310068@student\.hostel\.edu$/
    ];
    
    const allPatterns = [...emailPatterns, ...alternativePatterns];
    
    // Find users in MongoDB that match any of these patterns
    console.log('🔍 Searching for users in database...');
    const usersToDelete = await User.find({
      $or: allPatterns.map(pattern => ({ email: { $regex: pattern } }))
    });
    
    console.log(`📊 Found ${usersToDelete.length} users to delete`);
    
    if (usersToDelete.length === 0) {
      console.log('✅ No users found matching the criteria');
      return;
    }
    
    // Display users that will be deleted
    console.log('\n👥 Users to be deleted:');
    usersToDelete.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.rollNumber} - ${user.email} (${user.name})`);
    });
    
    // Confirmation
    console.log('\n⚠️  WARNING: This will permanently delete these users!');
    console.log('⚠️  Proceeding in 5 seconds... Press Ctrl+C to cancel');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    let successCount = 0;
    let failCount = 0;
    
    // Delete each user
    for (let i = 0; i < usersToDelete.length; i++) {
      const user = usersToDelete[i];
      console.log(`\n🗑️  [${i + 1}/${usersToDelete.length}] Deleting: ${user.email}`);
      
      try {
        // Delete from Firebase
        if (user.firebaseUid) {
          try {
            await admin.auth().deleteUser(user.firebaseUid);
            console.log('   🔥 Firebase user deleted');
          } catch (fbError) {
            if (fbError.code !== 'auth/user-not-found') {
              console.log(`   ⚠️  Firebase deletion warning: ${fbError.message}`);
            } else {
              console.log('   ⚠️  Firebase user not found (may have been deleted already)');
            }
          }
        }
        
        // Delete from MongoDB
        await User.deleteOne({ _id: user._id });
        console.log('   💾 MongoDB user deleted');
        console.log('   ✅ Deletion completed');
        
        successCount++;
        
        // Small delay to be respectful
        if (i < usersToDelete.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.log(`   ❌ Deletion failed: ${error.message}`);
        failCount++;
      }
    }
    
    // Summary
    console.log('\n🏁 DELETION COMPLETED!');
    console.log('======================');
    console.log(`✅ Successfully deleted: ${successCount} users`);
    console.log(`❌ Failed to delete: ${failCount} users`);
    console.log(`📊 Total processed: ${usersToDelete.length} users`);
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Script completed');
    process.exit(0);
  }
};

// Handle interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the deletion
deleteUsersByEmailRange();
