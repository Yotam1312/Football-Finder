import 'dotenv/config'; // Must be the very first import — loads .env before anything else reads it
import app from './app';

const PORT = process.env.PORT || 3001;

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown — close DB connections when the process is killed
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
