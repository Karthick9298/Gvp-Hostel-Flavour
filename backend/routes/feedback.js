import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { authenticateFirebaseToken, requireAdmin } from '../middleware/firebaseAuth.js';

const router = express.Router();

// @route   POST /api/feedback/submit
// @desc    Submit feedback for a meal
// @access  Private
router.post('/submit', [
  authenticateFirebaseToken,
  body('mealType')
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Invalid meal type'),
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mealType, rating, comment = '' } = req.body;
    const userId = req.user._id;

    // Get current date in IST (date only, no time)
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const currentDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
    currentDate.setHours(0, 0, 0, 0); // Ensure time is 00:00:00.000

    // console.log(`Debug Feedback Submit: User ${userId}, Current Date: ${currentDate.toISOString()}, IST Time: ${istTime.toLocaleString()}`);

    // Find or create feedback document for today
    let feedback = await Feedback.findOne({
      user: userId,
      date: currentDate
    });

    if (!feedback) {
      // console.log(`Creating new feedback document for user ${userId} on date ${currentDate.toISOString()}`);
      feedback = new Feedback({
        user: userId,
        date: currentDate,
        meals: {
          morning: { rating: null, comment: '', submittedAt: null },
          afternoon: { rating: null, comment: '', submittedAt: null },
          evening: { rating: null, comment: '', submittedAt: null },
          night: { rating: null, comment: '', submittedAt: null }
        }
      });
    } else {
      // console.log(`Found existing feedback document for user ${userId} on date ${currentDate.toISOString()}`);
      // console.log(`Current meal ${mealType} status:`, feedback.meals[mealType]);
    }

    // Check if meal can be submitted
    const canSubmitResult = feedback.canSubmitMeal(mealType);
    if (!canSubmitResult.canSubmit) {
      return res.status(400).json({
        status: 'error',
        message: canSubmitResult.reason
      });
    }

    // Update the specific meal feedback
    feedback.meals[mealType] = {
      rating: parseFloat(rating),
      comment: comment.trim(),
      submittedAt: new Date()
    };

    await feedback.save();

    // Get submission statistics
    const stats = feedback.getSubmissionStats();

    res.json({
      status: 'success',
      message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} meal feedback submitted successfully`,
      data: {
        feedback: {
          mealType,
          rating: parseFloat(rating),
          comment: comment.trim(),
          submittedAt: feedback.meals[mealType].submittedAt
        },
        stats
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/feedback/my-feedback
// @desc    Get current user's feedback for today
// @access  Private
router.get('/my-feedback', authenticateFirebaseToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get current date in IST (date only, no time)
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const currentDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
    currentDate.setHours(0, 0, 0, 0); // Ensure time is 00:00:00.000

    // Find today's feedback
    let feedback = await Feedback.findOne({
      user: userId,
      date: currentDate
    });

    if (!feedback) {
      // console.log(`No feedback found for user ${userId} on date ${currentDate.toISOString()}, creating empty structure`);
      // Create empty feedback structure
      feedback = {
        _id: null,
        user: userId,
        date: currentDate,
        meals: {
          morning: { rating: null, comment: '', submittedAt: null },
          afternoon: { rating: null, comment: '', submittedAt: null },
          evening: { rating: null, comment: '', submittedAt: null },
          night: { rating: null, comment: '', submittedAt: null }
        },
        createdAt: currentDate,
        updatedAt: currentDate
      };
    } else {
      // console.log(`Found existing feedback for user ${userId} on date ${currentDate.toISOString()}`);
      // console.log('Feedback meals:', JSON.stringify(feedback.meals, null, 2));
    }

    // Get submission statistics (manually calculate for empty feedback)
    const submittedMeals = ['morning', 'afternoon', 'evening', 'night'].filter(
      meal => feedback.meals[meal].rating !== null && feedback.meals[meal].rating !== undefined
    );
    
    const stats = {
      totalMeals: 4,
      submittedMeals: submittedMeals.length,
      pendingMeals: 4 - submittedMeals.length,
      submittedMealTypes: submittedMeals
    };

    // Get total submission count for today (for all users)
    const totalSubmissions = await Feedback.countDocuments({ date: currentDate });

    res.json({
      status: 'success',
      data: {
        feedback,
        stats,
        totalSubmissionsToday: totalSubmissions
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/feedback/submission-stats
// @desc    Get submission statistics for students (how many submitted)
// @access  Private
router.get('/submission-stats', authenticateFirebaseToken, async (req, res) => {
  try {
    const { date } = req.query;
    
    // Parse date or use current date
    let targetDate;
    if (date) {
      targetDate = new Date(date);
    } else {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset);
      targetDate = new Date(istDate.getFullYear(), istDate.getMonth(), istDate.getDate());
    }

    // Get total registered users
    const totalUsers = await User.countDocuments({ isActive: true, isAdmin: false });

    // Get submission statistics for each meal
    const feedbacks = await Feedback.find({ date: targetDate });

    const mealStats = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };

    feedbacks.forEach(feedback => {
      Object.keys(mealStats).forEach(meal => {
        if (feedback.meals[meal].rating !== null) {
          mealStats[meal]++;
        }
      });
    });

    // Calculate percentages
    const mealPercentages = {};
    Object.keys(mealStats).forEach(meal => {
      mealPercentages[meal] = totalUsers > 0 ? 
        Math.round((mealStats[meal] / totalUsers) * 100) : 0;
    });

    res.json({
      status: 'success',
      data: {
        date: targetDate,
        totalUsers,
        totalSubmissions: feedbacks.length,
        mealStats,
        mealPercentages,
        overallSubmissionRate: totalUsers > 0 ? 
          Math.round((feedbacks.length / totalUsers) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get submission statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/feedback/all
// @desc    Get all feedback (Admin only)
// @access  Private/Admin
router.get('/all', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
  try {
    const { 
      date, 
      startDate, 
      endDate, 
      mealType, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Build query
    let query = {};

    // Date filtering
    if (date) {
      const targetDate = new Date(date);
      query.date = targetDate;
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get feedbacks with user data
    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email rollNumber hostelRoom')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Feedback.countDocuments(query);

    // Filter by meal type if specified
    let filteredFeedbacks = feedbacks;
    if (mealType && ['morning', 'afternoon', 'evening', 'night'].includes(mealType)) {
      filteredFeedbacks = feedbacks.filter(feedback => 
        feedback.meals[mealType].rating !== null
      );
    }

    res.json({
      status: 'success',
      data: {
        feedbacks: filteredFeedbacks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get feedback data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
