import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateFirebaseToken, requireAdmin } from '../middleware/firebaseAuth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUid -__v');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateFirebaseToken,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('hostelRoom')
    .optional()
    .trim()
    .matches(/^[AB]-\d+$/)
    .withMessage('Room format should be like A-101 or B-205')
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

    const { name, hostelRoom } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name.trim();
    if (hostelRoom) updateFields.hostelRoom = hostelRoom.toUpperCase();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-firebaseUid -__v');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Email or roll number already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/all
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/all', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 50, search, isAdmin } = req.query;

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { hostelRoom: { $regex: search, $options: 'i' } }
      ];
    }

    if (isAdmin !== undefined) {
      query.isAdmin = isAdmin === 'true';
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-firebaseUid -__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user by ID
// @access  Private (Own data or Admin)
router.get('/:userId', [authenticateFirebaseToken, authenticateFirebaseToken], async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-firebaseUid -__v');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/:userId/admin
// @desc    Toggle admin status (Admin only)
// @access  Private/Admin
// router.put('/:userId/admin', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
//   try {
//     const { isAdmin } = req.body;

//     if (typeof isAdmin !== 'boolean') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'isAdmin must be a boolean value'
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.userId,
//       { isAdmin },
//       { new: true, runValidators: true }
//     ).select('-firebaseUid -__v');

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     res.json({
//       status: 'success',
//       message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin successfully`,
//       data: {
//         user
//       }
//     });

//   } catch (error) {
//     console.error('Toggle admin status error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to update admin status',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // @route   PUT /api/users/:userId/status
// // @desc    Toggle user active status (Admin only)
// // @access  Private/Admin
// router.put('/:userId/status', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
//   try {
//     const { isActive } = req.body;

//     if (typeof isActive !== 'boolean') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'isActive must be a boolean value'
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.userId,
//       { isActive },
//       { new: true, runValidators: true }
//     ).select('-firebaseUid -__v');

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     res.json({
//       status: 'success',
//       message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
//       data: {
//         user
//       }
//     });

//   } catch (error) {
//     console.error('Toggle user status error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to update user status',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // @route   GET /api/users/stats/overview
// // @desc    Get user statistics overview (Admin only)
// // @access  Private/Admin
// router.get('/stats/overview', [authenticateFirebaseToken, requireAdmin], async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments({ isActive: true });
//     const totalAdmins = await User.countDocuments({ isActive: true, isAdmin: true });
//     const totalStudents = await User.countDocuments({ isActive: true, isAdmin: false });
//     const inactiveUsers = await User.countDocuments({ isActive: false });

//     // Recent registrations (last 7 days)
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//     const recentRegistrations = await User.countDocuments({
//       createdAt: { $gte: sevenDaysAgo },
//       isActive: true
//     });

//     // Users by hostel blocks
//     const blockStats = await User.aggregate([
//       { 
//         $match: { isActive: true, isAdmin: false } 
//       },
//       {
//         $group: {
//           _id: { $substr: ['$hostelRoom', 0, 1] }, // Extract first character (A or B)
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $sort: { _id: 1 }
//       }
//     ]);

//     res.json({
//       status: 'success',
//       data: {
//         totalUsers,
//         totalAdmins,
//         totalStudents,
//         inactiveUsers,
//         recentRegistrations,
//         blockStats: blockStats.reduce((acc, block) => {
//           acc[`Block ${block._id}`] = block.count;
//           return acc;
//         }, {})
//       }
//     });

//   } catch (error) {
//     console.error('Get user stats error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to get user statistics',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

export default router;
