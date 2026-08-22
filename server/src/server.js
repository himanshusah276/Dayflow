import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import docsRoutes from './routes/docsRoute.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { seedDatabase } from './database/seed.js';
import db from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, automated test suites)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked request from origin: ' + origin));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Auto-seed if database is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (!userCount || userCount.count === 0) {
  console.log('Database appears empty. Auto-seeding initial Dayflow HRMS data...');
  seedDatabase();
}

// General API rate limiter
app.use('/api', apiRateLimiter);

// API Documentation
app.use('/api/docs', docsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const dbCheck = db.prepare('SELECT 1 as status').get();
    res.json({
      status: 'ok',
      system: 'Dayflow HRMS REST API',
      database: dbCheck.status === 1 ? 'connected' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      system: 'Dayflow HRMS REST API',
      database: 'disconnected',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Fallback for SPA routing in production
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Dayflow HRMS Client not built yet. Running in dev mode.');
    }
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message || err);
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({
    error: err.message || 'Internal server error occurred.',
    timestamp: new Date().toISOString()
  });
});

// Export app and only start listener if executed directly as entrypoint
const isMain = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));
if (isMain) {
  app.listen(PORT, () => {
    console.log(`🚀 Dayflow HRMS Backend running on http://localhost:${PORT}`);
    console.log(`📋 Interactive API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
