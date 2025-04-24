const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdmin } = require('../middleware/authenticateToken');
const Room = require('../models/Room');
const User = require('../models/User');
const upload = require('../middleware/upload');


//Adding room(only for admin)
router.post('/room', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, location, description, price, capacity } = req.body;

    const room = new Room({
      name,
      location,
      description,
      price,
      capacity,
      image: req.file ? req.file.filename : null,
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//user details(only for admin)
router.get('/users', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//register new admin

router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ name, email, phone, password, role: 'admin' });
    await newUser.save();

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'akash@172002';
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, message: 'Admin registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//room updation(only for admin)
router.put('/room/:id', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, location, description, price, capacity } = req.body;
    const updateData = {
      name,
      location,
      description,
      price,
      capacity,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// added to access rooms in frontend
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});



module.exports = router;