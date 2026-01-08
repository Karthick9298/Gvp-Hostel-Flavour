import mongoose from 'mongoose';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Firebase config - using your existing environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Generate random room number (A-101 to B-400)
const generateRandomRoom = () => {
  const blocks = ['A', 'B'];
  const block = blocks[Math.floor(Math.random() * blocks.length)];
  const roomNumber = Math.floor(Math.random() * 300) + 101; // 101-400
  return `${block}-${roomNumber}`;
};

// Generate users data array
const generateUsersData = (startRoll, endRoll) => {
  const users = [];
  
  for (let rollNum = startRoll; rollNum <= endRoll; rollNum++) {
    const rollNumber = rollNum.toString();
    users.push({
      name: `Student ${rollNumber}`,
      email: `${rollNumber}@gvpce.ac.in`, // Using a proper domain format
      rollNumber: rollNumber,
      hostelRoom: generateRandomRoom(),
      password: '12345678',
      isAdmin: false
    });
  }
  
  console.log(`📋 Generated data for ${users.length} users`);
  return users;
};

// Register single user with error handling
const registerUser = async (userData, index, total) => {
  try {
    const progressPercent = ((index + 1) / total * 100).toFixed(1);
    console.log(`\n📝 [${index + 1}/${total}] (${progressPercent}%) Registering: ${userData.rollNumber}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Room: ${userData.hostelRoom}`);
    
    // Step 1: Create Firebase user
    console.log('   🔥 Creating Firebase account...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const firebaseUser = userCredential.user;
    console.log(`   ✅ Firebase user created with UID: ${firebaseUser.uid}`);
    
    // Step 2: Create user in MongoDB
    console.log('   💾 Saving to MongoDB...');
    const user = new User({
      name: userData.name,
      email: userData.email,
      rollNumber: userData.rollNumber,
      hostelRoom: userData.hostelRoom,
      firebaseUid: firebaseUser.uid,
      isAdmin: userData.isAdmin,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await user.save();
    console.log(`   ✅ MongoDB record created successfully`);
    console.log(`   🎉 User ${userData.rollNumber} registered successfully!`);
    
    return { 
      success: true, 
      rollNumber: userData.rollNumber,
      email: userData.email,
      room: userData.hostelRoom,
      firebaseUid: firebaseUser.uid
    };
    
  } catch (error) {
    console.error(`   ❌ Registration failed for ${userData.rollNumber}:`);
    console.error(`   📝 Error: ${error.message}`);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      console.error(`   💡 Email ${userData.email} is already registered`);
    } else if (error.code === 'auth/weak-password') {
      console.error(`   💡 Password is too weak`);
    } else if (error.code === 'auth/invalid-email') {
      console.error(`   💡 Invalid email format`);
    } else if (error.code === 'auth/quota-exceeded') {
      console.error(`   ⚠️  Firebase quota exceeded - will retry later`);
    }
    
    return { 
      success: false, 
      rollNumber: userData.rollNumber, 
      email: userData.email,
      error: error.message,
      errorCode: error.code 
    };
  }
};

// Delay function with progress indicator
const delay = async (seconds, reason = '') => {
  console.log(`   ⏳ Waiting ${seconds} seconds${reason ? ` (${reason})` : ''}...`);
  
  // Show countdown for longer delays
  if (seconds >= 5) {
    for (let i = seconds; i > 0; i--) {
      process.stdout.write(`\r   ⏳ ${i} seconds remaining...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\r   ✅ Wait complete!                    ');
  } else {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
};

// Main bulk registration function
const bulkRegister = async () => {
  const startTime = new Date();
  console.log('🚀 BULK USER REGISTRATION STARTED');
  console.log('==================================');
  console.log(`📅 Start Time: ${startTime.toLocaleString()}`);
  console.log('');
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('');
    
    // Generate user data
    const startRoll = 323103310001;
    const endRoll = 323103310150;
    const usersData = generateUsersData(startRoll, endRoll);
    
    console.log('📊 REGISTRATION DETAILS:');
    console.log(`   Range: ${startRoll} → ${endRoll}`);
    console.log(`   Total Users: ${usersData.length}`);
    console.log(`   Default Password: 12345678`);
    console.log(`   Estimated Time: ~${Math.ceil(usersData.length * 3 / 60)} minutes`);
    console.log('');
    
    // Confirm before proceeding
    console.log('⚠️  This will create real Firebase accounts and database records!');
    console.log('🔄 Starting registration in 5 seconds...');
    await delay(0.5, 'preparation time');
    console.log('');
    
    const results = {
      success: [],
      failed: [],
      total: usersData.length,
      quotaErrors: 0,
      duplicateErrors: 0
    };
    
    // Process each user with appropriate delays
    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const result = await registerUser(userData, i, usersData.length);
      
      if (result.success) {
        results.success.push({
          rollNumber: result.rollNumber,
          email: result.email,
          room: result.room,
          firebaseUid: result.firebaseUid
        });
      } else {
        results.failed.push({
          rollNumber: result.rollNumber,
          email: result.email,
          error: result.error,
          errorCode: result.errorCode
        });
        
        // Track specific error types
        if (result.errorCode === 'auth/quota-exceeded') {
          results.quotaErrors++;
        } else if (result.errorCode === 'auth/email-already-in-use') {
          results.duplicateErrors++;
        }
      }
      
      // Add delays to respect Firebase rate limits
      if (i < usersData.length - 1) {
        let delayTime = 2; // Default 2 seconds
        let delayReason = 'rate limiting';
        
        // Increase delay after quota errors
        if (result.errorCode === 'auth/quota-exceeded') {
          delayTime = 10;
          delayReason = 'quota exceeded recovery';
        }
        
        // Longer delay every 10 users
        if ((i + 1) % 10 === 0) {
          delayTime = 5;
          delayReason = 'batch completion';
        }
        
        // Longer delay every 25 users
        if ((i + 1) % 25 === 0) {
          delayTime = 15;
          delayReason = 'extended break';
          console.log(`\n🎯 Milestone: ${i + 1} users processed!`);
        }
        
        await delay(delayTime, delayReason);
      }
    }
    
    // Final results summary
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🏁 BULK REGISTRATION COMPLETED!');
    console.log('=====================================');
    console.log(`📅 End Time: ${endTime.toLocaleString()}`);
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log('');
    console.log('📊 FINAL SUMMARY:');
    console.log(`✅ Successful: ${results.success.length} users`);
    console.log(`❌ Failed: ${results.failed.length} users`);
    console.log(`📋 Total Processed: ${results.total} users`);
    console.log(`📈 Success Rate: ${(results.success.length / results.total * 100).toFixed(1)}%`);
    
    if (results.quotaErrors > 0) {
      console.log(`⚠️  Quota Errors: ${results.quotaErrors}`);
    }
    if (results.duplicateErrors > 0) {
      console.log(`🔄 Duplicate Emails: ${results.duplicateErrors}`);
    }
    
    // Show successful registrations
    if (results.success.length > 0) {
      console.log('\n✅ SUCCESSFUL REGISTRATIONS:');
      results.success.slice(0, 10).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.rollNumber} - ${user.room} - ${user.email}`);
      });
      if (results.success.length > 10) {
        console.log(`   ... and ${results.success.length - 10} more users`);
      }
    }
    
    // Show failed registrations
    if (results.failed.length > 0) {
      console.log('\n❌ FAILED REGISTRATIONS:');
      results.failed.forEach((fail, index) => {
        console.log(`   ${index + 1}. ${fail.rollNumber} (${fail.email})`);
        console.log(`      Error: ${fail.error}`);
      });
    }
    
    console.log('\n🎉 Registration process completed successfully!');
    console.log('💡 Users can now login with their roll number as email and password: 12345678');
    
  } catch (error) {
    console.error('\n💥 BULK REGISTRATION FAILED:');
    console.error(`❌ Error: ${error.message}`);
    console.error('📝 Stack:', error.stack);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully');
    console.log('👋 Script execution completed');
    process.exit(0);
  }
};

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  console.log('🔌 Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the bulk registration
console.log('🎯 Firebase Bulk User Registration Script');
console.log('=========================================');
bulkRegister().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});