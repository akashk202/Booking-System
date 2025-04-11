const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdmin } = require('../middleware/authenticateToken');
const Room = require('../models/Room');
const User = require('../models/User');

router.post('/room', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ name, email, phone, password, role: 'admin' });
    await newUser.save();

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, message: 'Admin registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;