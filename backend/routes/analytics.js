import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import analyticsService from '../services/analyticsService.js';
import DailyAnalytics from '../models/DailyAnalytics.js';
import { getISTDate } from '../utils/istDate.js';

const router = express.Router();

// This is the only route we are using from frontend !!!!!!!!
/**
 * @route   GET /api/analytics/daily/:date
 * @desc    Get comprehensive daily analysis
 * @access  Admin only
 */
router.get('/daily/:date', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Try to fetch from database first (cache hit)
    const cachedAnalytics = await DailyAnalytics.findOne({ date });
    if (cachedAnalytics) {
      return res.json({
        status: cachedAnalytics.status,
        type: cachedAnalytics.type,
        message: cachedAnalytics.message,
        data: cachedAnalytics.data,
        charts: cachedAnalytics.charts,
        date: cachedAnalytics.date,
        timestamp: cachedAnalytics.timestamp
      });
    }
    
    // Cache miss: Fetch from analytics service
    const analysis = await analyticsService.getDailyAnalysis(date);
    
    if (analysis.error) {
      return res.status(500).json({
        status: 'error',
        message: analysis.message
      });
    }

    // Check if the requested date is in the past (to determine if we should cache it)
    const todayIST = getISTDate();
    const todayStr = `${todayIST.getFullYear()}-${String(todayIST.getMonth() + 1).padStart(2, '0')}-${String(todayIST.getDate()).padStart(2, '0')}`;
    const isPastDate = date < todayStr;

    // Save to DB if it's a past date and not an error
    if (isPastDate && !analysis.error && analysis.status !== 'error') {
      await DailyAnalytics.findOneAndUpdate(
        { date: analysis.date || date },
        {
          date: analysis.date || date,
          status: analysis.status,
          message: analysis.message || null,
          type: analysis.type || null,
          data: analysis.data || null,
          charts: analysis.charts || null,
          timestamp: analysis.timestamp || new Date()
        },
        { upsert: true }
      ).catch(err => console.error('Failed to cache analytics in DB:', err.message));
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
 * @route   GET /api/analytics/system/health
 * @desc    Check analytics system health and dependencies
 * @access  Admin only
 */
router.get('/system/health', authenticateToken, requireAdmin, async (req, res) => {
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
