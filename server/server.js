require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Database connection middleware for Serverless & Long-running
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    try {
      const hospitalCount = await Hospital.countDocuments();
      if (hospitalCount === 0) {
        console.log('[Server] Database is empty. Auto-seeding initial medical tourism catalog...');
        await seedAllData();
      }
    } catch (e) {
      console.warn('[Server] Auto-seed check notice:', e.message);
    }
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    next(err);
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'MediJourney India - Integrated Digital Platform for International Patients',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// If running directly (e.g. node server.js locally)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 MediJourney India REST API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`========================================================`);
  });
}

module.exports = app;
