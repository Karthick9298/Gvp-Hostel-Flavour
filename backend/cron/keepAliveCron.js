import cron from 'node-cron';
import axios from 'axios';

export function startKeepAliveCron(PORT) {
  cron.schedule('*/10 * * * *', async () => {
    console.log('Running keep-alive cron job...');

    try {
      const backendUrl =
        process.env.BACKEND_URL || `http://localhost:${PORT}`;

      const analyticsUrl =
        process.env.ANALYTICS_API_URL || 'http://localhost:8000';

      // Backend Ping
      await axios
        .get(`${backendUrl}/health`)
        .catch(err =>
          console.log(`Keep-alive backend ping failed: ${err.message}`)
        );

      // Analytics Ping
      await axios
        .get(`${analyticsUrl}/health`, {
          headers: {
            'X-API-Key': process.env.ANALYTICS_API_SECRET || '',
          },
        })
        .catch(err =>
          console.log(`Keep-alive analytics ping failed: ${err.message}`)
        );

      console.log('Keep-alive ping completed.');
    } catch (error) {
      console.error('Keep-alive cron error:', error.message);
    }
  });

  console.log('Keep-alive cron started');
}