import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for confirmation
const askConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('\n⚠️  WARNING: This will delete ALL users from Firebase Authentication!\nType "DELETE ALL USERS" to confirm: ', (answer) => {
      resolve(answer === 'DELETE ALL USERS');
    });
  });
};

// Delete users in batches
const deleteAllUsers = async () => {
  let deletedCount = 0;
  let errorCount = 0;
  let nextPageToken;

  try {
    console.log('\n🔍 Fetching users from Firebase Authentication...');

    do {
      // List users in batches of 1000 (Firebase limit)
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      if (listUsersResult.users.length === 0) {
        console.log('\n✅ No users found in Firebase Authentication');
        break;
      }

      console.log(`\n📋 Found ${listUsersResult.users.length} users in this batch`);
      console.log('🗑️  Deleting users...');

      // Delete users one by one with progress
      for (let i = 0; i < listUsersResult.users.length; i++) {
        const user = listUsersResult.users[i];
        try {
          await admin.auth().deleteUser(user.uid);
          deletedCount++;
          
          // Show progress every 10 users
          if (deletedCount % 10 === 0 || i === listUsersResult.users.length - 1) {
            const progress = ((i + 1) / listUsersResult.users.length * 100).toFixed(1);
            console.log(`   Progress: ${i + 1}/${listUsersResult.users.length} (${progress}%) - Total deleted: ${deletedCount}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`   ❌ Failed to delete user ${user.uid}: ${error.message}`);
        }
      }

      nextPageToken = listUsersResult.pageToken;

      if (nextPageToken) {
        console.log('\n⏭️  Moving to next batch...');
      }

    } while (nextPageToken);

    console.log('\n' + '='.repeat(60));
    console.log('📊 DELETION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully deleted: ${deletedCount} users`);
    if (errorCount > 0) {
      console.log(`❌ Failed to delete: ${errorCount} users`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during deletion process:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔥 FIREBASE AUTHENTICATION - DELETE ALL USERS');
  console.log('='.repeat(60));
  console.log('\nThis script will permanently delete ALL users from Firebase Authentication.');
  console.log('This action CANNOT be undone!');
  console.log('\nMake sure you have:');
  console.log('  1. ✅ Backed up any important user data');
  console.log('  2. ✅ Deleted users from MongoDB (if needed)');
  console.log('  3. ✅ Confirmed this is the correct Firebase project');

  const confirmed = await askConfirmation();
  rl.close();

  if (!confirmed) {
    console.log('\n❌ Operation cancelled. No users were deleted.');
    process.exit(0);
  }

  console.log('\n✅ Confirmation received. Starting deletion process...');
  await deleteAllUsers();
  
  console.log('\n✅ All done! Firebase Authentication has been cleared.');
  console.log('💡 You can now run bulk-register-users.js to add new users.\n');
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
