const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const emailHelper = require('../controls/emailHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'akash@172002';
const TOKEN_EXPIRY = '7d';

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ name, email, phone, password });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
// Email Function--
    const to = email;
    const subject = "User Registration";
    const body = "You are succesfully Registered to the System"
    await emailHelper.sendTextEmail(to, subject, body);

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
