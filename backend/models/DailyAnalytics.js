import mongoose from 'mongoose';

const dailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true, // Format: YYYY-MM-DD
    index: true
  },
  status: {
    type: String,
    enum: ['success', 'no_data', 'error'],
    required: true
  },
  message: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  charts: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
