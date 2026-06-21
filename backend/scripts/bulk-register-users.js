import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
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

const registerUsers = async () => {
  console.log('🚀 STARTING BULK REGISTRATION');
  console.log('===============================');
  
  try {
    await connectDB();

    try {
      await User.collection.dropIndex('firebaseUid_1');
      console.log('🗑️  Dropped legacy firebaseUid_1 index');
    } catch (e) {
      // Index might not exist, which is fine
    }

    const usersToInsert = [];

    // 1. Add Admin User
    usersToInsert.push({
      name: 'Admin User',
      email: 'admin@gvpce.ac.in',
      password: '12345678',
      rollNumber: 'ADMIN001',
      hostelRoom: 'A-000', // Admin room format
      isAdmin: true
    });

    // 2. Add Student Users (1 to 150)
    // Using base roll number 323103310 with 3 padded digits, e.g. 323103310001 to 323103310150
    const baseRoll = '323103310';
    for (let i = 1; i <= 150; i++) {
      const paddedNum = String(i).padStart(3, '0');
      const rollNumber = `${baseRoll}${paddedNum}`;
      
      // Distribute randomly or sequentially in A and B blocks
      const block = i % 2 === 0 ? 'A' : 'B';
      const roomNum = 100 + (i % 50); // Just dummy room numbers like A-101
      
      usersToInsert.push({
        name: `Student ${i}`,
        email: `${rollNumber}@gvpce.ac.in`,
        password: '12345678',
        rollNumber: rollNumber,
        hostelRoom: `${block}-${roomNum}`,
        isAdmin: false
      });
    }

    console.log(`Preparing to insert ${usersToInsert.length} users...`);

    let insertedCount = 0;
    let failedCount = 0;

    for (const userData of usersToInsert) {
      try {
        const existingUser = await User.findOne({ rollNumber: userData.rollNumber });
        if (existingUser) {
          console.log(`⚠️ User ${userData.rollNumber} already exists. Skipping.`);
          failedCount++;
          continue;
        }

        const user = new User(userData);
        await user.save();
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`... inserted ${insertedCount} users`);
        }
      } catch (err) {
        console.error(`❌ Failed to insert user ${userData.rollNumber}:`, err.message);
        failedCount++;
      }
    }

    console.log('===============================');
    console.log('🎉 REGISTRATION COMPLETE');
    console.log(`✅ Successfully inserted: ${insertedCount}`);
    console.log(`⚠️ Skipped/Failed: ${failedCount}`);

  } catch (error) {
    console.error('💥 Script Failed:', error.message);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    process.exit(0);
  }
};

registerUsers();
