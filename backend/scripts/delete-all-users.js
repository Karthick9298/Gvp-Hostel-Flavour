import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const deleteAllUsers = async () => {
  console.log('🚀 STARTING DELETION OF ALL USERS AND FEEDBACK');
  console.log('=============================================');
  
  try {
    await connectDB();

    // Since feedback is tied to users, deleting users means we should ideally clear feedback as well to avoid orphaned documents.
    console.log('🗑️  Deleting all feedback data...');
    const feedbackResult = await Feedback.deleteMany({});
    console.log(`   ✅ Deleted ${feedbackResult.deletedCount} feedback records.`);

    console.log('🗑️  Deleting all users...');
    const userResult = await User.deleteMany({});
    console.log(`   ✅ Deleted ${userResult.deletedCount} users.`);

    console.log('=============================================');
    console.log('🎉 CLEANUP COMPLETE');

  } catch (error) {
    console.error('💥 Script Failed:', error.message);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    process.exit(0);
  }
};

deleteAllUsers();
