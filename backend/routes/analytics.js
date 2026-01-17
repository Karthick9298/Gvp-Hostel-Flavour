import express from 'express';
import axios from 'axios';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { authenticateFirebaseToken, requireAdmin } from '../middleware/firebaseAuth.js';
import analyticsService from '../services/analyticsService.js';

const router = express.Router();

// Helper function to get AI suggestions using free Hugging Face API
// const getAISuggestions = async (analyticsData) => {
//   try {
//     if (!process.env.HUGGINGFACE_API_KEY) {
//       return "AI suggestions temporarily unavailable. Please configure Hugging Face API key.";
//     }

//     const { averageRatings, comments, lowRatedMeals } = analyticsData;
    
//     // Prepare prompt for AI
//     const prompt = `
// Based on hostel food feedback data, provide improvement suggestions:

// Average Ratings:
// - Morning: ${averageRatings.morning}/5
// - Afternoon: ${averageRatings.afternoon}/5
// - Evening: ${averageRatings.evening}/5
// - Night: ${averageRatings.night}/5

// Low-rated meals: ${lowRatedMeals.join(', ')}

// Recent comments summary: ${comments.slice(0, 10).join('. ')}

// Please provide 3-5 specific, actionable suggestions to improve hostel food quality and student satisfaction:`;

//     const response = await axios.post(
//       'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
//       {
//         inputs: prompt,
//         parameters: {
//           max_length: 300,
//           temperature: 0.7,
//           top_p: 0.9
//         }
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 10000
//       }
//     );

//     if (response.data && response.data[0] && response.data[0].generated_text) {
//       return response.data[0].generated_text.replace(prompt, '').trim();
//     }

//     // Fallback suggestions if AI fails
//     return generateFallbackSuggestions(analyticsData);

//   } catch (error) {
//     console.error('AI suggestion error:', error);
//     return generateFallbackSuggestions(analyticsData);
//   }
// };

// Fallback suggestions based on data analysis
// const generateFallbackSuggestions = (analyticsData) => {
//   const { averageRatings, lowRatedMeals } = analyticsData;
//   const suggestions = [];

//   // Rating-based suggestions
//   Object.entries(averageRatings).forEach(([meal, rating]) => {
//     if (rating < 2.5) {
//       suggestions.push(`${meal.charAt(0).toUpperCase() + meal.slice(1)} meal needs immediate attention - consider menu changes or cooking improvements.`);
//     } else if (rating < 3.5) {
//       suggestions.push(`${meal.charAt(0).toUpperCase() + meal.slice(1)} meal could be improved - gather specific feedback from students.`);
//     }
//   });

//   // General suggestions
//   if (suggestions.length === 0) {
//     suggestions.push("Overall ratings are good. Continue maintaining food quality and consider introducing variety in menu.");
//   }

//   suggestions.push("Conduct regular quality checks and maintain hygiene standards.");
//   suggestions.push("Consider student feedback surveys for menu planning.");

//   return suggestions.join('\n\n');
// };

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data - delegates to Python analytics service
// @access  Private/Admin
// router.get('/dashboard', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
//   try {
//     const { period = 'daily', date } = req.query;

//     // For daily analysis, use the Python analytics service
//     if (period === 'daily') {
//       const targetDate = date || new Date().toISOString().split('T')[0];
//       const analysis = await analyticsService.getDailyAnalysis(targetDate);
      
//       if (analysis.error) {
//         return res.status(500).json({
//           status: 'error',
//           message: analysis.message
//         });
//       }

//       // DEBUG: Log what we're sending
//       console.log('=== SENDING RESPONSE TO FRONTEND ===');
//       console.log('Status:', analysis.status);
//       console.log('Has charts:', 'charts' in analysis);
//       if (analysis.charts) {
//         console.log('Charts keys:', Object.keys(analysis.charts));
//         console.log('avgRatings has base64:', !!analysis.charts.avgRatings?.base64);
//       } else {
//         console.log('❌ NO CHARTS IN ANALYSIS RESULT!');
//       }

//       return res.json({
//         status: analysis.status,
//         data: analysis.data,
//         charts: analysis.charts, // *** FIXED: Include charts from Python response ***
//         date: analysis.date,
//         type: analysis.type,
//         message: analysis.message,
//         timestamp: analysis.timestamp
//       });
//     }
    
//     // For weekly analysis, use the Python analytics service
//     if (period === 'weekly') {
//       const targetDate = date || new Date().toISOString().split('T')[0];
//       const analysis = await analyticsService.getWeeklyAnalysis(targetDate);
      
//       if (analysis.error) {
//         return res.status(500).json({
//           status: 'error',
//           message: analysis.message
//         });
//       }

//       return res.json({
//         status: 'success',
//         data: analysis.data,
//         weekStart: analysis.weekStart,
//         weekEnd: analysis.weekEnd,
//         timestamp: analysis.timestamp
//       });
//     }

//     // Default error response for unsupported periods
//     res.status(400).json({
//       status: 'error',
//       message: 'Unsupported analysis period. Use "daily" or "weekly".'
//     });

//   } catch (error) {
//     console.error('Analytics dashboard error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to get analytics data',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// ============================================================================
// DEPRECATED FUNCTIONS - Kept for backward compatibility only
// All analytics should now use the Python analytics service
// These functions are no longer used by the main dashboard endpoint
// ============================================================================

// Helper function to calculate analytics
// const calculateAnalytics = (feedbacks, period) => {
//   const mealTypes = ['morning', 'afternoon', 'evening', 'night'];
  
//   // Initialize analytics object
//   const analytics = {
//     averageRatings: {},
//     totalSubmissions: {},
//     ratingDistribution: {},
//     satisfactionPercentage: {},
//     comments: [],
//     keyInsights: [],
//     trendData: period === 'weekly' ? [] : null
//   };

//   // Calculate for each meal type
//   mealTypes.forEach(mealType => {
//     const mealRatings = [];
//     const mealComments = [];
//     let submissionCount = 0;

//     feedbacks.forEach(feedback => {
//       if (feedback.meals[mealType].rating !== null) {
//         mealRatings.push(feedback.meals[mealType].rating);
//         submissionCount++;
        
//         if (feedback.meals[mealType].comment) {
//           mealComments.push(feedback.meals[mealType].comment);
//         }
//       }
//     });

//     // Average rating
//     analytics.averageRatings[mealType] = mealRatings.length > 0 
//       ? parseFloat((mealRatings.reduce((a, b) => a + b, 0) / mealRatings.length).toFixed(2))
//       : 0;

//     // Total submissions
//     analytics.totalSubmissions[mealType] = submissionCount;

//     // Rating distribution
//     analytics.ratingDistribution[mealType] = {
//       1: mealRatings.filter(r => r >= 0 && r < 1).length,
//       2: mealRatings.filter(r => r >= 1 && r < 2).length,
//       3: mealRatings.filter(r => r >= 2 && r < 3).length,
//       4: mealRatings.filter(r => r >= 3 && r < 4).length,
//       5: mealRatings.filter(r => r >= 4 && r <= 5).length
//     };

//     // Satisfaction percentage (rating >= 3)
//     const satisfiedCount = mealRatings.filter(r => r >= 3).length;
//     analytics.satisfactionPercentage[mealType] = mealRatings.length > 0 
//       ? Math.round((satisfiedCount / mealRatings.length) * 100)
//       : 0;

//     // Collect comments
//     analytics.comments = analytics.comments.concat(mealComments);
//   });

//   // Generate key insights
//   analytics.keyInsights = generateKeyInsights(analytics);

//   // Generate trend data for weekly view
//   if (period === 'weekly') {
//     analytics.trendData = generateTrendData(feedbacks);
//   }

//   // Low-rated meals for AI suggestions
//   analytics.lowRatedMeals = Object.entries(analytics.averageRatings)
//     .filter(([meal, rating]) => rating < 3)
//     .map(([meal, rating]) => meal);

//   return analytics;
// };

// Generate key insights from data
// const generateKeyInsights = (analytics) => {
//   const insights = [];
//   const { averageRatings, satisfactionPercentage, totalSubmissions } = analytics;

//   // Best and worst performing meals
//   const mealEntries = Object.entries(averageRatings);
//   if (mealEntries.length > 0) {
//     const bestMeal = mealEntries.reduce((a, b) => a[1] > b[1] ? a : b);
//     const worstMeal = mealEntries.reduce((a, b) => a[1] < b[1] ? a : b);

//     if (bestMeal[1] > 0) {
//       insights.push(`Best performing meal: ${bestMeal[0]} with ${bestMeal[1]}/5 rating`);
//     }
//     if (worstMeal[1] > 0 && worstMeal[1] < 3) {
//       insights.push(`Needs improvement: ${worstMeal[0]} with ${worstMeal[1]}/5 rating`);
//     }
//   }

//   // Overall satisfaction
//   const overallSatisfaction = Object.values(satisfactionPercentage).reduce((a, b) => a + b, 0) / 4;
//   if (overallSatisfaction > 75) {
//     insights.push(`High satisfaction rate: ${Math.round(overallSatisfaction)}% of students are satisfied`);
//   } else if (overallSatisfaction < 50) {
//     insights.push(`Low satisfaction rate: Only ${Math.round(overallSatisfaction)}% of students are satisfied`);
//   }

//   // Participation rate
//   const totalParticipation = Object.values(totalSubmissions).reduce((a, b) => a + b, 0);
//   if (totalParticipation < 20) {
//     insights.push("Low participation rate - consider encouraging more feedback submissions");
//   }

//   return insights;
// };

// Generate trend data for weekly view
// const generateTrendData = (feedbacks) => {
//   const trendData = [];
//   const groupedByDate = {};

//   // Group feedbacks by date
//   feedbacks.forEach(feedback => {
//     const dateKey = feedback.date.toISOString().split('T')[0];
//     if (!groupedByDate[dateKey]) {
//       groupedByDate[dateKey] = [];
//     }
//     groupedByDate[dateKey].push(feedback);
//   });

//   // Calculate daily averages
//   Object.entries(groupedByDate).forEach(([date, dayFeedbacks]) => {
//     const mealTypes = ['morning', 'afternoon', 'evening', 'night'];
//     const dayData = { date };

//     mealTypes.forEach(mealType => {
//       const ratings = dayFeedbacks
//         .map(f => f.meals[mealType].rating)
//         .filter(r => r !== null);
      
//       dayData[mealType] = ratings.length > 0 
//         ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
//         : 0;
//     });

//     trendData.push(dayData);
//   });

//   return trendData.sort((a, b) => new Date(a.date) - new Date(b.date));
// };

// @route   GET /api/analytics/comments
// @desc    Get comment analysis
// @access  Private/Admin
// router.get('/comments', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
//   try {
//     const { date, mealType } = req.query;

//     let query = {};
//     if (date) {
//       query.date = new Date(date);
//     }

//     const feedbacks = await Feedback.find(query)
//       .populate('user', 'name rollNumber')
//       .sort({ date: -1 });

//     let comments = [];

//     feedbacks.forEach(feedback => {
//       const mealTypes = mealType ? [mealType] : ['morning', 'afternoon', 'evening', 'night'];
      
//       mealTypes.forEach(meal => {
//         if (feedback.meals[meal].comment && feedback.meals[meal].comment.trim()) {
//           comments.push({
//             user: feedback.user,
//             date: feedback.date,
//             mealType: meal,
//             rating: feedback.meals[meal].rating,
//             comment: feedback.meals[meal].comment,
//             submittedAt: feedback.meals[meal].submittedAt
//           });
//         }
//       });
//     });

//     // Sort by submission time
//     comments.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

//     res.json({
//       status: 'success',
//       data: {
//         comments,
//         totalComments: comments.length
//       }
//     });

//   } catch (error) {
//     console.error('Comments analysis error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to get comments data',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });


// This is the only route we are using from frontend !!!!!!!!
/**
 * @route   GET /api/analytics/daily/:date
 * @desc    Get comprehensive daily analysis
 * @access  Admin only
 */
router.get('/daily/:date', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const analysis = await analyticsService.getDailyAnalysis(date);
    
    if (analysis.error) {
      return res.status(500).json({
        status: 'error',
        message: analysis.message
      });
    }

    // Handle different response types
    if (analysis.status === 'no_data') {
      return res.json({
        status: 'no_data',
        type: analysis.type,
        message: analysis.message,
        date: analysis.date,
        data: analysis.data,
        charts: analysis.charts, // Include charts even for no_data
        timestamp: analysis.timestamp
      });
    }
    
    // Success response - INCLUDE CHARTS!
    res.json({
      status: 'success',
      data: analysis.data,
      charts: analysis.charts, // *** CRITICAL FIX: Include charts! ***
      date: analysis.date,
      timestamp: analysis.timestamp
    });
    
  } catch (error) {
    console.error('Daily analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch daily analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/analytics/weekly/:date
 * @desc    Get comprehensive weekly analysis
 * @access  Admin only
 */
// router.get('/weekly/:date', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const { date } = req.params;
    
//     // Validate date format
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid date format. Use YYYY-MM-DD'
//       });
//     }
    
//     const analysis = await analyticsService.getWeeklyAnalysis(date);
    
//     if (analysis.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: analysis.message
//       });
//     }
    
//     res.json({
//       status: 'success',
//       data: analysis.data,
//       weekStart: analysis.weekStart,
//       weekEnd: analysis.weekEnd,
//       timestamp: analysis.timestamp
//     });
    
//   } catch (error) {
//     console.error('Weekly analytics error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch weekly analytics',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

/**
 * @route   GET /api/analytics/historical/comparison
 * @desc    Get historical comparison analysis
 * @access  Admin only
 */
// router.get('/historical/comparison', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Both startDate and endDate are required'
//       });
//     }
    
//     // Validate date formats
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid date format. Use YYYY-MM-DD'
//       });
//     }
    
//     const analysis = await analyticsService.getHistoricalAnalysis(startDate, endDate, 'comparison');
    
//     if (analysis.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: analysis.message
//       });
//     }
    
//     res.json({
//       status: 'success',
//       data: analysis.data,
//       startDate: analysis.startDate,
//       endDate: analysis.endDate,
//       analysisType: analysis.analysisType,
//       timestamp: analysis.timestamp
//     });
    
//   } catch (error) {
//     console.error('Historical comparison error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch historical comparison',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

/**
 * @route   GET /api/analytics/historical/trends
 * @desc    Get historical trend analysis
 * @access  Admin only
 */
// router.get('/historical/trends', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Both startDate and endDate are required'
//       });
//     }
    
//     const analysis = await analyticsService.getHistoricalAnalysis(startDate, endDate, 'trend');
    
//     if (analysis.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: analysis.message
//       });
//     }
    
//     res.json({
//       status: 'success',
//       data: analysis.data,
//       startDate: analysis.startDate,
//       endDate: analysis.endDate,
//       analysisType: analysis.analysisType,
//       timestamp: analysis.timestamp
//     });
    
//   } catch (error) {
//     console.error('Trend analysis error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch trend analysis',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

/**
 * @route   GET /api/analytics/historical/patterns
 * @desc    Get historical pattern analysis
 * @access  Admin only
 */
// router.get('/historical/patterns', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Both startDate and endDate are required'
//       });
//     }
    
//     const analysis = await analyticsService.getHistoricalAnalysis(startDate, endDate, 'pattern');
    
//     if (analysis.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: analysis.message
//       });
//     }
    
//     res.json({
//       status: 'success',
//       data: analysis.data,
//       startDate: analysis.startDate,
//       endDate: analysis.endDate,
//       analysisType: analysis.analysisType,
//       timestamp: analysis.timestamp
//     });
    
//   } catch (error) {
//     console.error('Pattern analysis error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch pattern analysis',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

/**
 * @route   GET /api/analytics/dashboard/quick-stats
 * @desc    Get quick stats for dashboard overview
 * @access  Admin only
 */
// router.get('/dashboard/quick-stats', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const dateStr = yesterday.toISOString().split('T')[0];
    
//     const quickStats = await analyticsService.getQuickStats(dateStr);
    
//     if (quickStats.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: quickStats.message
//       });
//     }
    
//     res.json({
//       status: 'success',
//       data: quickStats,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('Quick stats error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch quick stats',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

/**
 * @route   GET /api/analytics/alerts
 * @desc    Get current alerts and notifications
 * @access  Admin only
 */
// router.get('/alerts', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const alerts = await analyticsService.getCurrentAlerts();
    
//     if (alerts.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: alerts.message,
//         data: []
//       });
//     }
    
//     res.json({
//       status: 'success',
//       data: alerts.data,
//       total: alerts.total,
//       critical: alerts.critical,
//       warning: alerts.warning,
//       info: alerts.info,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('Alerts fetch error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch alerts',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

/**
 * @route   POST /api/analytics/reports/generate
 * @desc    Generate and download analytics report
 * @access  Admin only
 */
// router.post('/reports/generate', authenticateFirebaseToken, requireAdmin, async (req, res) => {
//   try {
//     const { reportType, startDate, endDate, format = 'json' } = req.body;
    
//     if (!reportType || !startDate || !endDate) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'reportType, startDate, and endDate are required'
//       });
//     }
    
//     const report = await analyticsService.generateReport({
//       reportType,
//       startDate,
//       endDate,
//       format
//     });
    
//     if (report.error) {
//       return res.status(500).json({
//         status: 'error',
//         message: report.message
//       });
//     }
    
//     // Set appropriate headers for file download
//     const contentType = format === 'csv' ? 'text/csv' : 'application/json';
//     res.setHeader('Content-Type', contentType);
//     res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    
//     res.send(report.data);
    
//   } catch (error) {
//     console.error('Report generation error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to generate report',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });



/**
 * @route   GET /api/analytics/system/health
 * @desc    Check analytics system health and dependencies
 * @access  Admin only
 */
router.get('/system/health', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const healthCheck = await analyticsService.checkPythonDependencies();
    
    res.json({
      status: 'success',
      data: {
        pythonAvailable: !healthCheck.error,
        dependencies: healthCheck,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
