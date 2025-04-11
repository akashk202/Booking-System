const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/authenticateToken');
const { checkAdmin } = require('../middleware/authenticateToken');
const generateBookingPdf  = require('../utils/pdfMaker').generateBookingPDF;
const fs =require('fs');


router.post('/', authenticateToken, async (req, res) => {
  try {
    const booking = new Booking({ userId: req.user.id, ...req.body });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate('roomId');
  res.json(bookings);
});


router.get('/report/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({path:'userId',select: 'name'}).populate({path: 'roomId', select: 'name'});
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const filePath = await generateBookingPdf(booking);

    // Set headers to preview in browser/Postman
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=BookingReport.pdf');

    // Create a read stream and pipe it to response
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router;
