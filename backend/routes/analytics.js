import express from 'express';
import axios from 'axios';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { authenticateFirebaseToken, requireAdmin } from '../middleware/firebaseAuth.js';
import analyticsService from '../services/analyticsService.js';

const router = express.Router();

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
