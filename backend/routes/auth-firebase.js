import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateFirebaseToken } from '../middleware/firebaseAuth.js';
import { verifyFirebaseToken } from '../config/firebase-admin.js';
import admin from '../config/firebase-admin.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (creates Firebase user + MongoDB record)
// @access  Public
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('rollNumber')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Roll number is required'),
  body('hostelRoom')
    .trim()
    .matches(/^[AB]-\d+$/)
    .withMessage('Room format should be like A-101 or B-205'),
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

    const { email, password, name, rollNumber, hostelRoom } = req.body;

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { rollNumber: rollNumber.toUpperCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email or roll number'
      });
    }

    // Create Firebase user (backend handles this now)
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: email.toLowerCase(),
        password: password,
        displayName: name.trim()
      });
    } catch (firebaseError) {
      console.error('Firebase user creation error:', firebaseError);
      return res.status(400).json({
        status: 'error',
        message: firebaseError.message || 'Failed to create Firebase user'
      });
    }

    // Create MongoDB user record
    let user;
    try {
      user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        rollNumber: rollNumber.toUpperCase(),
        hostelRoom: hostelRoom.toUpperCase(),
        firebaseUid: firebaseUser.uid,
        isAdmin: false
      });

      await user.save();
    } catch (dbError) {
      // If MongoDB save fails, delete the Firebase user
      console.error('MongoDB user creation error:', dbError);
      await admin.auth().deleteUser(firebaseUser.uid);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create user profile'
      });
    }

    // Generate custom token and exchange it for ID token
    try {
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);
      
      // Exchange custom token for ID token using Firebase REST API
      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`;
      
      const tokenResponse = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error('Failed to generate ID token');
      }

      // Return user data and token
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        hostelRoom: user.hostelRoom,
        isAdmin: user.isAdmin,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: userData,
          idToken: tokenData.idToken,
          refreshToken: tokenData.refreshToken
        }
      });

    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate authentication token'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (backend validates credentials and returns custom token)
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
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

    const { email, password } = req.body;

    // Check if user exists in MongoDB
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password with Firebase (backend Admin SDK can't verify passwords directly)
    // We need to use Firebase Auth REST API
    try {
      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;
      
      const response = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true
        })
      });

      const firebaseData = await response.json();

      if (!response.ok) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return user data and Firebase token
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
        hostelRoom: user.hostelRoom,
        isAdmin: user.isAdmin,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };

      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: userData,
          idToken: firebaseData.idToken,
          refreshToken: firebaseData.refreshToken
        }
      });

    } catch (firebaseError) {
      console.error('Firebase login error:', firebaseError);
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/google-login
// @desc    Login/Register user with Google (backend verifies token)
// @access  Public
router.post('/google-login', [
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required'),
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

    const { idToken } = req.body;

    // Verify Google token with Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Google token'
      });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email not provided by Google'
      });
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user - update Firebase UID if needed
      if (user.firebaseUid !== uid) {
        user.firebaseUid = uid;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // New user - create account (Google users don't need roll number/hostel initially)
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        firebaseUid: uid,
        isAdmin: false,
        rollNumber: `GOOGLE-${Date.now()}`, // Temporary roll number
        hostelRoom: 'NOT-SET', // User needs to update this
        lastLogin: new Date()
      });

      try {
        await user.save();
      } catch (dbError) {
        console.error('MongoDB user creation error:', dbError);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create user profile'
        });
      }
    }

    // Return user data and the same token (already verified)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      hostelRoom: user.hostelRoom,
      isAdmin: user.isAdmin,
      firebaseUid: user.firebaseUid,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      status: 'success',
      message: user.rollNumber.startsWith('GOOGLE-') ? 'Please complete your profile' : 'Login successful',
      data: {
        user: userData,
        idToken: idToken // Return the same token
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Google login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/sync-user
// @desc    Sync user data after Firebase login (create if doesn't exist)
// @access  Private (requires Firebase token)
router.post('/sync-user', async (req, res) => {
  try {
    // Get Firebase token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Firebase token required'
      });
    }

    const idToken = authHeader.substring(7);
    
    // Verify Firebase token
    const firebaseResult = await verifyFirebaseToken(idToken);
    if (!firebaseResult.success) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Firebase token'
      });
    }

    const { uid: firebaseUid, email } = firebaseResult;

    // Find existing user
    let user = await User.findOne({ firebaseUid, isActive: true });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please complete registration first.',
        requiresRegistration: true
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      hostelRoom: user.hostelRoom,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.json({
      status: 'success',
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync user data'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateFirebaseToken, async (req, res) => {
  try {
    const userData = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      rollNumber: req.user.rollNumber,
      hostelRoom: req.user.hostelRoom,
      isAdmin: req.user.isAdmin,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    };

    res.json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side only with Firebase)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export default router;
