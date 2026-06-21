import cron from 'node-cron';
import axios from 'axios';

export function startKeepAliveCron(PORT) {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const analyticsUrl = process.env.ANALYTICS_API_URL || 'http://localhost:8000';

  cron.schedule('*/10 * * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`[Keep-Alive] ${timestamp} — Running keep-alive ping...`);

    // ── Backend Ping ─────────────────────────────────────────
    try {
      const res = await axios.get(`${backendUrl}/health`, { timeout: 10000 });
      console.log(`[Keep-Alive] Backend OK (${backendUrl}/health) → ${res.status}`);
    } catch (err) {
      console.warn(`[Keep-Alive] Backend ping FAILED (${backendUrl}/health): ${err.message}`);
    }

    // ── Analytics Service Ping ───────────────────────────────
    try {
      const apiKey = process.env.ANALYTICS_API_SECRET;
      if (!apiKey) {
        console.warn('[Keep-Alive] WARNING: ANALYTICS_API_SECRET is not set — analytics pings may fail auth.');
      }
      const res = await axios.get(`${analyticsUrl}/health`, {
        headers: { 'X-API-Key': apiKey || '' },
        timeout: 30000, // Allow up to 30s for Render cold start
      });
      console.log(`[Keep-Alive] Analytics OK (${analyticsUrl}/health) → ${res.status}`);
    } catch (err) {
      console.warn(`[Keep-Alive] Analytics ping FAILED (${analyticsUrl}/health): ${err.message}`);
    }

    console.log('[Keep-Alive] Ping cycle complete.');
  });

  console.log(`[Keep-Alive] Cron started — pinging every 10 min`);
  console.log(`  Backend  → ${backendUrl}/health`);
  console.log(`  Analytics→ ${analyticsUrl}/health`);
}