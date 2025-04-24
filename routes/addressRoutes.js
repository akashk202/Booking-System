const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/authenticateToken');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newAddress = { 
      ...req.body,
      isActive: user.addresses.length === 0
    };
    
    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update existing address
router.put('/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    Object.assign(address, req.body);
    await user.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set address as active
router.patch('/:addressId/set-active', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.forEach(addr => addr.isActive = false);
    
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    address.isActive = true;
    await user.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all addresses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete('/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    const wasActive = address.isActive;
    address.remove();
    
    if (wasActive && user.addresses.length > 0) {
      user.addresses[0].isActive = true;
    }
    
    await user.save();
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

