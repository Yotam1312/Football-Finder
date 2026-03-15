import 'dotenv/config'; // Must be the very first import — loads .env before anything else reads it
import app from './app';
import cron from 'node-cron';
import { runFixtureSync } from './jobs/sync.service';

const PORT = process.env.PORT || 3001;

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Schedule nightly fixture sync at midnight UTC
// node-cron expression: minute hour day month weekday
// '0 0 * * *' = minute 0, hour 0 (midnight), every day
cron.schedule('0 0 * * *', () => {
  console.log('[Cron] Triggering scheduled fixture sync...');
  runFixtureSync().catch((error) => {
    // Log and continue — old data stays in DB
    // Decision: no retry, no alert on failure
    console.error('[Cron] Scheduled sync failed:', error);
  });
}, {
  timezone: 'UTC', // ensure cron runs at midnight UTC regardless of server timezone
});

console.log('[Cron] Nightly fixture sync scheduled for 00:00 UTC');

// Graceful shutdown — close DB connections when the process is killed
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
