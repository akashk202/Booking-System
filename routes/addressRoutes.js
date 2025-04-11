const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authenticateToken');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newAddress = { ...req.body, isActive: user.addresses.length === 0 };
    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update', authenticateToken, async (req, res) => {
  try {
    const updated = await Address.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Address updated', address: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
