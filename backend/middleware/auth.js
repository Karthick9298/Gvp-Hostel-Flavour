import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Verify JWT token and attach user to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please log in.'
      });
    }

    const token = authHeader.substring(7);

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired. Please log in again.'
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.'
      });
    }

    // Find user in database
    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or account deactivated.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

/**
 * Middleware: Check if authenticated user is an admin
 * Must be used AFTER authenticateToken
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  next();
};
