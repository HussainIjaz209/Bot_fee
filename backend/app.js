require('dotenv').config();
const path = require('path');
const fs = require('fs');
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
  // Only connect to DB on /api requests
  if (req.path.startsWith('/api')) {
    try {
      await connectToDatabase();
    } catch (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
  }
  next();
});

// API Routes
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

// Static frontend serving (Express 5 compatible)
const distPath = fs.existsSync(path.join(__dirname, '../dist'))
  ? path.join(__dirname, '../dist')
  : path.join(__dirname, '../frontend/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
}

module.exports = app;
module.exports.connectToDatabase = connectToDatabase;
