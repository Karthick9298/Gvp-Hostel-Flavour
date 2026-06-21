import express from 'express';
import { body, query, validationResult } from 'express-validator';
import WeeklyMenu from '../models/WeeklyMenu.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/menu/weekly
// @desc    Create a new weekly menu template (Admin only)
// @access  Private (Admin)
router.post('/weekly', [
  authenticateToken,
  requireAdmin,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Menu name must be between 1 and 100 characters'),
  body('days')
    .isObject()
    .withMessage('Days must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name = 'Standard Weekly Menu', days } = req.body;
    
    // Check if there's already an active menu
    const existingMenu = await WeeklyMenu.findOne({ isActive: true });
    if (existingMenu) {
      // Deactivate existing menu
      existingMenu.isActive = false;
      await existingMenu.save();
    }

    // Create new weekly menu template
    const weeklyMenu = new WeeklyMenu({
      name,
      days,
      isActive: true,
      createdBy: req.user._id
    });

    await weeklyMenu.save();

    res.status(201).json({
      status: 'success',
      message: 'Weekly menu template created successfully',
      data: {
        menu: weeklyMenu
      }
    });

  } catch (error) {
    console.error('Create weekly menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create weekly menu'
    });
  }
});

// @route   GET /api/menu/current
// @desc    Get current week's menu (same as active menu)
// @access  Private
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const currentMenu = await WeeklyMenu.getActiveMenu();
    
    if (!currentMenu) {
      return res.status(404).json({
        status: 'error',
        message: 'No menu available'
      });
    }

    res.json({
      status: 'success',
      data: {
        menu: currentMenu
      }
    });

  } catch (error) {
    console.error('Get current menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get current menu'
    });
  }
});

// @route   GET /api/menu/today
// @desc    Get today's menu
// @access  Private
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const todayMenu = await WeeklyMenu.getTodaysMenu();
    
    if (!todayMenu) {
      return res.status(404).json({
        status: 'error',
        message: 'No menu available for today'
      });
    }

    res.json({
      status: 'success',
      data: {
        menu: todayMenu
      }
    });

  } catch (error) {
    console.error('Get today menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get today\'s menu'
    });
  }
});

// @route   GET /api/menu/date/:date
// @desc    Get menu for specific day (monday, tuesday, etc.)
// @access  Private
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Check if it's a day name or actual date
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    let dayMenu;
    if (validDays.includes(date.toLowerCase())) {
      // It's a day name
      dayMenu = await WeeklyMenu.getMenuForDay(date.toLowerCase());
    } else {
      // It's a date - convert to day name
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[targetDate.getDay()];
      dayMenu = await WeeklyMenu.getMenuForDay(dayName);
    }
    
    if (!dayMenu) {
      return res.status(404).json({
        status: 'error',
        message: 'No menu available for this date'
      });
    }

    res.json({
      status: 'success',
      data: {
        menu: dayMenu
      }
    });

  } catch (error) {
    console.error('Get date menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get menu for specified date'
    });
  }
});

// @route   GET /api/menu/weekly
// @desc    Get all weekly menus (Admin only)
// @access  Private (Admin)
router.get('/weekly', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const menus = await WeeklyMenu.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ weekStartDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WeeklyMenu.countDocuments({ isActive: true });

    res.json({
      status: 'success',
      data: {
        menus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get weekly menus error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get weekly menus'
    });
  }
});

// @route   PUT /api/menu/weekly/:id
// @desc    Update weekly menu (Admin only)
// @access  Private (Admin)
router.put('/weekly/:id', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    const menu = await WeeklyMenu.findById(id);
    if (!menu) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu not found'
      });
    }

    if (days) {
      menu.days = days;
    }

    await menu.save();

    res.json({
      status: 'success',
      message: 'Menu updated successfully',
      data: {
        menu
      }
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update menu'
    });
  }
});

// @route   DELETE /api/menu/weekly/:id
// @desc    Delete weekly menu (Admin only)
// @access  Private (Admin)
router.delete('/weekly/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await WeeklyMenu.findById(id);
    if (!menu) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu not found'
      });
    }

    menu.isActive = false;
    await menu.save();

    res.json({
      status: 'success',
      message: 'Menu deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete menu'
    });
  }
});

export default router;
