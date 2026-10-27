const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// Available system users
const USERS = [
  {
    username: process.env.ADMIN_USER || 'HussainIjaz',
    password: process.env.ADMIN_PASS || 'admin123',
    name: 'Hussain Ijaz',
    role: 'Administrator',
    email: 'hussain@botfee.com'
  },
  {
    username: process.env.MANAGER_USER || 'Talha',
    password: process.env.MANAGER_PASS || 'Talha',
    name: 'Talha',
    role: 'Regional Manager',
    email: 'talha@botfee.com'
  }
];

// POST /api/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = USERS.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. Please check your username and password.' });
  }

  const token = jwt.sign(
    {
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    }
  });
});

// GET /api/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
