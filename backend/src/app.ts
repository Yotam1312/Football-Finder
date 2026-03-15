import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.routes';
import adminRoutes from './routes/admin.routes';
import matchRoutes from './routes/match.routes';

const app = express();

// 1. Request logging — goes first so all requests are logged
app.use(morgan('dev'));

// 2. Security headers — helmet sets Content-Security-Policy, X-Frame-Options, etc.
app.use(helmet());

// 3. CORS — only allow requests from our frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// 4. Parse JSON request bodies
app.use(express.json());

// 5. Rate limiting — max 100 requests per 15 minutes per IP
// This protects against brute force and scraping
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matches', matchRoutes);

export default app;
