const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const emailHelper = require('../controls/emailHelper');
const { admin } = require('../controls/firebaseconfig');

const JWT_SECRET = process.env.JWT_SECRET || 'akash@172002';
const TOKEN_EXPIRY = '7d';
//new User
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

//google sign in
router.post("/verify-token", async (req, res) => {
  const idToken = req.body.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.status(200).json({ success: true, uid: decodedToken.uid, decodedToken });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
});


module.exports = router;
