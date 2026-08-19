require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const travelRoutes = require('./routes/travelRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const Hospital = require('./models/Hospital');
const seedAllData = require('./seed/seedData');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Database connection state
let isConnected = false;
let isSeeding = false;

const ensureDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  await connectDB();
  isConnected = true;

  // Asynchronously seed initial data if collection is empty
  if (!isSeeding) {
    isSeeding = true;
    Hospital.countDocuments()
      .then(async (count) => {
        if (count === 0) {
          console.log('[Server] Database is empty. Auto-seeding initial medical tourism catalog...');
          await seedAllData();
        }
      })
      .catch((err) => console.warn('[Server] Seed check error:', err.message))
      .finally(() => {
        isSeeding = false;
      });
  }
};

// Health check endpoint (always accessible for diagnosis)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    } else {
      await connectDB();
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = 'error';
    dbError = err.message;
  }

  res.json({
    status: dbStatus === 'connected' ? 'online' : 'degraded',
    platform: 'MediJourney India - Integrated Digital Platform for International Patients',
    database: {
      status: dbStatus,
      host: mongoose.connection?.host || null,
      mongoUriProvided: Boolean(process.env.MONGO_URI),
      error: dbError,
    },
    timestamp: new Date().toISOString(),
  });
});

// Middleware to ensure DB connection on all API routes
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error('[API Error] Database connection error:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please verify MONGO_URI in Vercel environment variables and Atlas IP whitelist.',
      error: err.message,
    });
  }
});

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/travel', travelRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Standalone execution for local development
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 MediJourney India REST API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`========================================================`);
  });
}

module.exports = app;
