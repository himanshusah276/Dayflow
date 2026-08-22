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
import { seedDatabase } from './database/seed.js';
import db from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Auto-seed if database is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (!userCount || userCount.count === 0) {
  console.log('Database appears empty. Auto-seeding initial Dayflow HRMS data...');
  seedDatabase();
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Dayflow HRMS REST API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dayflow HRMS Backend running on http://localhost:${PORT}`);
  console.log(`📋 API Docs & Health: http://localhost:${PORT}/api/health`);
});
