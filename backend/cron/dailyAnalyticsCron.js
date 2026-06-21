import cron from 'node-cron';
import DailyAnalytics from '../models/DailyAnalytics.js';
import analyticsService from '../services/analyticsService.js';
import { getISTDate } from '../utils/istDate.js';

export function startDailyAnalyticsCron() {
  // Run at 1:00 AM every day
  cron.schedule('0 1 * * *', async () => {
    console.log('Running daily analytics cron job at 1:00 AM...');
    try {
      // Calculate yesterday's date
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayIST = getISTDate(yesterday);
      
      // Format to YYYY-MM-DD
      const year = yesterdayIST.getFullYear();
      const month = String(yesterdayIST.getMonth() + 1).padStart(2, '0');
      const day = String(yesterdayIST.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log(`Fetching daily analytics for yesterday: ${dateString}`);
      
      // Fetch from python service
      const analysis = await analyticsService.getDailyAnalysis(dateString);
      
      if (!analysis.error && analysis.status !== 'error') {
        // Save to DB
        await DailyAnalytics.findOneAndUpdate(
          { date: dateString },
          {
            date: dateString,
            status: analysis.status,
            message: analysis.message || null,
            type: analysis.type || null,
            data: analysis.data || null,
            charts: analysis.charts || null,
            timestamp: analysis.timestamp || new Date()
          },
          { upsert: true, new: true }
        );
        console.log(`Successfully stored daily analytics for ${dateString} in DB.`);
      } else {
        console.error(`Analytics service returned error for ${dateString}:`, analysis.message);
      }
    } catch (error) {
      console.error('Daily analytics cron job failed:', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
  
  console.log('Daily analytics cron started (Runs at 1:00 AM IST)');
}
