import dotenv from 'dotenv';

// Load environment variables FIRST — before any other imports read process.env
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { startKeepAliveCron } from './cron/keepAliveCron.js';
import { startDailyAnalyticsCron } from './cron/dailyAnalyticsCron.js';

import connectDB from './config/database.js';

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import feedbackRoutes from './routes/feedback.js';
import analyticsRoutes from './routes/analytics.js';
import menuRoutes from './routes/menu.js';

// Initialize Express app
const app = express();

app.set('trust proxy', 1);

// Connect to MongoDB
await connectDB();

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CORS_ORIGIN
  : 'http://localhost:5173';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// ── Rate Limiting ─────────────────────────────────────────────
// Strict limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,
  message: { status: 'error', message: 'Too many login attempts. Please try again later.' }
});

// General limit for all other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { status: 'error', message: 'Too many requests. Please try again later.' }
});

app.use('/api/auth', authLimiter);
app.use('/api/users', generalLimiter);
app.use('/api/feedback', generalLimiter);
app.use('/api/analytics', generalLimiter);
app.use('/api/menu', generalLimiter);

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging (development only) ────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/menu', menuRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});



// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);


// Trigger nodemon restart to clear rate limit cache

  startKeepAliveCron(PORT);
  startDailyAnalyticsCron();
});
