import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper: generate a signed JWT for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Helper: build the safe user object to send to client
 */
const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  rollNumber: user.rollNumber,
  hostelRoom: user.hostelRoom,
  isAdmin: user.isAdmin,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login with email + password → returns JWT
// @access  Public
// ─────────────────────────────────────────────────────────────
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find user — include password field (select: false by default)
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: buildUserResponse(user),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        user: buildUserResponse(req.user)
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    });
  }
});

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout (client clears token — stateless JWT)
// @access  Public
// ─────────────────────────────────────────────────────────────
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// ─────────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @desc    Change current user's password
// @access  Private
// ─────────────────────────────────────────────────────────────
router.put('/change-password', [
  authenticateToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    // Fetch user WITH password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'No password set for this account'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Set and save new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    });
  }
});

export default router;
