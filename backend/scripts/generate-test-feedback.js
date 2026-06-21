import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

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

// Sample comments for different ratings with more realistic and diverse feedback
const comments = {
  5: [
    "Excellent taste! Really enjoyed it",
    "Perfect seasoning and fresh ingredients",
    "One of the best meals this week",
    "Amazing food quality today",
    "Delicious and well-prepared",
    "Outstanding meal, keep it up!",
    "Fresh and tasty, loved it",
    "Perfect portion size and taste",
    "Superb quality, chef did great job",
    "Absolutely delicious, want more!",
    "Top-notch meal, very satisfied",
    "Exceptional taste and presentation"
  ],
  4: [
    "Good taste, quite satisfied",
    "Well cooked and flavorful",
    "Nice meal, enjoyed it",
    "Pretty good quality food",
    "Tasty and fresh",
    "Good preparation, liked it",
    "Decent meal, above average",
    "Well-balanced and nutritious",
    "Good effort, mostly satisfied",
    "Nice variety, enjoyed the meal",
    "Good quality ingredients used",
    "Satisfying and filling meal"
  ],
  3: [
    "Average taste, okay meal",
    "Nothing special but edible",
    "Could be better",
    "Acceptable quality",
    "Standard meal, no complaints",
    "Average preparation",
    "Okay taste, room for improvement",
    "Neither good nor bad",
    "Decent but could be improved",
    "Standard quality, nothing exciting",
    "Mediocre taste, acceptable",
    "Basic meal, serves the purpose"
  ],
  2: [
    "Below average quality",
    "Needs improvement in taste",
    "Not very appetizing",
    "Poor seasoning, too bland",
    "Could taste much better",
    "Disappointing meal today",
    "Quality needs work",
    "Not satisfied with the taste",
    "Food was cold when served",
    "Too salty, hard to eat",
    "Overcooked and dry",
    "Lacking flavor and freshness",
    "Small portion, not filling",
    "Too spicy, couldn't finish",
    "Vegetables were stale",
    "Oil was too much"
  ],
  1: [
    "Very poor quality",
    "Terrible taste, couldn't finish",
    "Badly prepared food",
    "Completely unsatisfying",
    "Worst meal of the week",
    "Needs major improvement",
    "Inedible quality",
    "Very disappointed",
    "Food was spoiled, tasted bad",
    "Burnt food, completely ruined",
    "Hair found in food, disgusting",
    "Undercooked rice, couldn't eat",
    "Rotten vegetables, smelled bad",
    "Too much salt, impossible to eat",
    "Food poisoning risk, unsafe",
    "Dirty plates, unhygienic service",
    "Stale bread, very hard",
    "Insects found in food",
    "Extremely bitter taste",
    "Food was ice cold and hard"
  ]
};

// Generate realistic rating with balanced distribution for better analysis
const generateRating = () => {
  const random = Math.random();

  // More balanced distribution for realistic feedback analysis
  if (random < 0.12) return 1;      // 12% - Very poor (issues to identify)
  else if (random < 0.25) return 2; // 13% - Poor (improvement areas)
  else if (random < 0.50) return 3; // 25% - Average (neutral feedback)
  else if (random < 0.78) return 4; // 28% - Good (positive feedback)
  else return 5;                    // 22% - Excellent (highlights)
};

// Generate meal-specific rating variations (some meals perform better/worse)
const generateMealSpecificRating = (mealType, baseRating) => {
  // Add meal-specific variations for more realistic analysis
  const mealModifiers = {
    morning: 0.1,    // Breakfast slightly better (fresh morning preparation)
    afternoon: -0.1, // Lunch slightly worse (rush hour issues)
    evening: 0.0,    // Dinner average
    night: -0.2      // Night snacks often have issues (limited options, cold food)
  };

  const modifier = mealModifiers[mealType] || 0;
  const random = Math.random();

  // Apply meal-specific bias
  if (modifier < 0 && random < Math.abs(modifier)) {
    // Increase chance of lower rating for problematic meals
    return Math.max(1, baseRating - 1);
  } else if (modifier > 0 && random < modifier) {
    // Increase chance of higher rating for good meals
    return Math.min(5, baseRating + 1);
  }

  return baseRating;
};

// Generate date-specific quality variations (some days have issues)
const getDateQualityModifier = (dateIndex) => {
  // Create realistic scenarios for different days
  const dateScenarios = {
    0: { modifier: 0.0, description: "Normal day" },    // Oct 12 - Sunday
    1: { modifier: -0.15, description: "Monday blues, some kitchen issues" },  // Oct 13 - Monday  
    2: { modifier: 0.1, description: "Good Tuesday, fresh ingredients" },      // Oct 14 - Tuesday
    3: { modifier: -0.1, description: "Mid-week average" },                    // Oct 15 - Wednesday
    4: { modifier: -0.2, description: "Thursday problems, equipment breakdown" }, // Oct 16 - Thursday
    5: { modifier: 0.15, description: "Great Friday, special menu" },          // Oct 17 - Friday
    6: { modifier: -0.05, description: "Weekend, reduced staff" }              // Oct 18 - Saturday
  };

  return dateScenarios[dateIndex] || { modifier: 0, description: "Normal day" };
};

// Apply date and meal specific modifications to rating
const getFinalRating = (baseRating, mealType, dateIndex) => {
  const mealRating = generateMealSpecificRating(mealType, baseRating);
  const dateModifier = getDateQualityModifier(dateIndex);

  // Apply date modifier with some randomness
  if (Math.random() < 0.3) { // 30% chance to apply date modifier
    if (dateModifier.modifier < 0) {
      return Math.max(1, mealRating - 1);
    } else if (dateModifier.modifier > 0) {
      return Math.min(5, mealRating + 1);
    }
  }

  return mealRating;
};

// Generate realistic meal participation with more randomness
const shouldSubmitFeedback = (mealType, rollNumber) => {
  // Use roll number as seed for consistent but random behavior per user
  const userSeed = parseInt(rollNumber) % 100;

  // Base participation rates
  const baseRates = {
    morning: 0.75,   // 75% base rate for breakfast
    afternoon: 0.90, // 90% base rate for lunch  
    evening: 0.85,   // 85% base rate for dinner
    night: 0.50      // 50% base rate for night snacks
  };

  // Add user-specific variation based on roll number
  let participationRate = baseRates[mealType];

  // Some users are more consistent (higher participation)
  if (userSeed < 20) {
    participationRate += 0.15; // Very active users
  } else if (userSeed < 40) {
    participationRate += 0.05; // Moderately active users
  } else if (userSeed > 80) {
    participationRate -= 0.20; // Less active users
  }

  // Ensure rate stays within bounds
  participationRate = Math.max(0.1, Math.min(0.95, participationRate));

  return Math.random() < participationRate;
};

// Determine if a user should be completely skipped for a day
const shouldSkipUserForDay = (rollNumber, dateIndex) => {
  // Use combination of roll number and date as seed for consistency
  const seed = (parseInt(rollNumber) + dateIndex * 17) % 100;

  // 15% chance to skip the entire day
  return seed < 15;
};

// Get random comment based on rating
const getRandomComment = (rating) => {
  const ratingComments = comments[rating];
  if (Math.random() < 0.3) return ''; // 30% chance of no comment
  return ratingComments[Math.floor(Math.random() * ratingComments.length)];
};

// Generate realistic submission time for each meal
const getSubmissionTime = (date, mealType) => {
  const baseDate = new Date(date);

  // Meal time windows (in IST hours)
  const mealWindows = {
    morning: { start: 9, end: 11 },    // 9 AM - 11 AM
    afternoon: { start: 13, end: 15 }, // 1 PM - 3 PM  
    evening: { start: 19, end: 21 },   // 7 PM - 9 PM
    night: { start: 22, end: 23 }      // 10 PM - 11 PM
  };

  const window = mealWindows[mealType];
  const randomHour = window.start + Math.random() * (window.end - window.start);
  const randomMinute = Math.floor(Math.random() * 60);

  baseDate.setHours(Math.floor(randomHour), randomMinute, 0, 0);
  return baseDate;
};

// Generate specific date range: October 12-18, 2025
const generateDateRange = () => {
  const dates = [];

  // Create dates from Oct 12 to Oct 18, 2025
  for (let day = 12; day <= 18; day++) {
    const date = new Date(2025, 9, day); // Month is 0-indexed (9 = October)
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }

  return dates;
};

// Main function to generate test feedback
const generateTestFeedback = async () => {
  const startTime = new Date();
  console.log('🚀 GENERATING TEST FEEDBACK DATA');
  console.log('==================================');
  console.log('📅 Period: October 12-18, 2025 (7 days)');
  console.log('👥 Target: Roll numbers 323103310001-323103310150');
  console.log('🎲 Features: Random user skipping + Random meal skipping');
  console.log(`📅 Start Time: ${startTime.toLocaleString()}`);
  console.log('');

  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    // Get users in the specified roll number range
    console.log('👥 Fetching user accounts in range 323103310001-323103310150...');
    const users = await User.find({
      isAdmin: false,
      rollNumber: {
        $gte: '323103310001',
        $lte: '323103310150'
      }
    }).select('_id rollNumber name');
    console.log(`   Found ${users.length} student accounts in the specified range`);

    if (users.length === 0) {
      console.log('❌ No student accounts found! Please run bulk registration first.');
      return;
    }

    // Generate date range (October 12-18, 2025)
    const dates = generateDateRange();
    console.log(`📅 Generating feedback for October 12-18, 2025 (${dates.length} days):`);
    dates.forEach((date, index) => {
      console.log(`   ${index + 1}. ${date.toDateString()}`);
    });
    console.log('');

    const mealTypes = ['morning', 'afternoon', 'evening', 'night'];
    let totalFeedbacks = 0;
    let totalMealRatings = 0;

    // Clear existing feedback for testing
    console.log('🗑️  Clearing existing test feedback...');
    await Feedback.deleteMany({});
    console.log('   ✅ Cleared existing feedback data');
    console.log('');

    // Generate feedback for each date
    for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
      const currentDate = dates[dateIndex];
      const isToday = dateIndex === dates.length - 1;
      const dayScenario = getDateQualityModifier(dateIndex);

      console.log(`📊 Day ${dateIndex + 1}/7: ${currentDate.toDateString()} ${isToday ? '(TODAY)' : ''}`);
      console.log(`   🎭 Scenario: ${dayScenario.description}`);

      let dayFeedbacks = 0;
      let dayMealRatings = 0;

      // Process users in batches for better performance
      const batchSize = 20;
      for (let i = 0; i < users.length; i += batchSize) {
        const userBatch = users.slice(i, Math.min(i + batchSize, users.length));

        const feedbackPromises = userBatch.map(async (user) => {
          // Skip some users completely for this day (realistic absence)
          if (shouldSkipUserForDay(user.rollNumber, dateIndex)) {
            return 0; // User didn't participate this day
          }

          // Each active user has varying participation
          const mealsFeedback = {};
          let userMealCount = 0;

          // Generate feedback for each meal type with individual randomness
          mealTypes.forEach(mealType => {
            if (shouldSubmitFeedback(mealType, user.rollNumber)) {
              const baseRating = generateRating();
              const rating = getFinalRating(baseRating, mealType, dateIndex);
              const comment = getRandomComment(rating);
              const submittedAt = getSubmissionTime(currentDate, mealType);

              mealsFeedback[mealType] = {
                rating: rating,
                comment: comment,
                submittedAt: submittedAt
              };

              userMealCount++;
            } else {
              // No feedback for this meal
              mealsFeedback[mealType] = {
                rating: null,
                comment: '',
                submittedAt: null
              };
            }
          });

          // Only create feedback document if user submitted at least one meal
          if (userMealCount > 0) {
            const feedback = new Feedback({
              user: user._id,
              date: currentDate,
              meals: mealsFeedback
            });

            await feedback.save();
            dayMealRatings += userMealCount;
            return 1; // Count this feedback document
          }
          return 0;
        });

        const batchResults = await Promise.all(feedbackPromises);
        dayFeedbacks += batchResults.reduce((sum, result) => sum + result, 0);

        // Show progress
        const processed = Math.min(i + batchSize, users.length);
        process.stdout.write(`\r   📝 Processing users: ${processed}/${users.length}`);
      }

      console.log(`\r   ✅ Day complete: ${dayFeedbacks} feedbacks, ${dayMealRatings} meal ratings`);
      totalFeedbacks += dayFeedbacks;
      totalMealRatings += dayMealRatings;
    }

    // Generate summary statistics
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('📊 GENERATION SUMMARY:');
    console.log('========================');

    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`📋 Total Feedback Documents: ${totalFeedbacks}`);
    console.log(`🍽️  Total Meal Ratings: ${totalMealRatings}`);
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`📅 Date Range: ${dates.length} days`);
    console.log(`📈 Average Participation: ${((totalFeedbacks / (users.length * dates.length)) * 100).toFixed(1)}%`);

    // Show sample statistics
    console.log('\n📈 SAMPLE STATISTICS:');
    const sampleFeedback = await Feedback.aggregate([
      {
        $project: {
          ratings: [
            '$meals.morning.rating',
            '$meals.afternoon.rating',
            '$meals.evening.rating',
            '$meals.night.rating'
          ]
        }
      },
      {
        $unwind: '$ratings'
      },
      {
        $match: {
          ratings: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$ratings',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('   Rating Distribution:');
    sampleFeedback.forEach(stat => {
      if (stat._id !== null) {
        const percentage = ((stat.count / totalMealRatings) * 100).toFixed(1);
        console.log(`   ⭐ ${stat._id} stars: ${stat.count} ratings (${percentage}%)`);
      }
    });

    // Show recent feedback examples
    const recentFeedback = await Feedback.find()
      .populate('user', 'rollNumber name')
      .sort({ date: -1 })
      .limit(5);

    console.log('\n📝 RECENT FEEDBACK EXAMPLES:');
    recentFeedback.forEach((feedback, index) => {
      console.log(`   ${index + 1}. ${feedback.user.rollNumber} - ${feedback.date.toDateString()}`);
      mealTypes.forEach(meal => {
        if (feedback.meals[meal].rating) {
          console.log(`      ${meal}: ${feedback.meals[meal].rating}⭐ "${feedback.meals[meal].comment}"`);
        }
      });
    });

    console.log('\n🎉 TEST FEEDBACK GENERATION COMPLETED!');
    console.log('💡 Your analytics system now has realistic data to work with!');
    console.log('🚀 Ready to implement Python analytics with meaningful datasets!');

  } catch (error) {
    console.error('\n💥 FEEDBACK GENERATION FAILED:');
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

// Run the feedback generation
console.log('🎯 Test Feedback Data Generation Script');
console.log('======================================');
generateTestFeedback().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
