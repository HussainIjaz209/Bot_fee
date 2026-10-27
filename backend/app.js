require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bot');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hussainijaz233911_db_user:IYEHjSzISqRPUSeL@cluster0.hqdtaki.mongodb.net/vps_fee_management?retryWrites=true&w=majority';

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Serverless DB connection caching
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  const db = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
  cachedDb = db;
  return db;
}

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Routes
app.use('/api', authRoutes);
app.use('/api/bot', botRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
module.exports.connectToDatabase = connectToDatabase;
