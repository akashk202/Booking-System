const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authenticateToken');

router.get('/profile', authenticateToken, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
  res.json(user);
} catch (error){
  res.status(500).json({message: errorMonitor.message});
}
});


router.put('/', authenticateToken, async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;