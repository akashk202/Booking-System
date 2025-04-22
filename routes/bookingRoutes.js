const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/authenticateToken');
const { checkAdmin } = require('../middleware/authenticateToken');
const generateBookingPdf  = require('../utils/pdfMaker').generateBookingPDF;
const fs =require('fs');



router.get('/check-availability', async (req, res) => {
  const { roomId, startDate, endDate } = req.query;

  if (!roomId || !startDate || !endDate) {
    return res.status(400).json({ message: 'roomId, startDate, and endDate are required' });
  }

  try {
    const overlappingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(200).json({ available: false });
    }

    res.status(200).json({ available: true });
  } catch (err) {
    res.status(500).json({ message: 'Error checking availability' });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  const { roomId, startDate, endDate } = req.body;

  if (!roomId || !startDate || !endDate) {
    return res.status(400).json({ message: 'roomId, startDate, and endDate are required' });
  }

  try {
    // Check if the room is already booked in the requested date range
    const overlappingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(409).json({ message: 'Room is not available for the selected dates' });
    }

    const booking = new Booking({
      userId: req.user.id,
      roomId,
      startDate,
      endDate,
      ...req.body
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({ path: 'roomId', select: 'name' })
      .populate({ path: 'userId', select: 'name email' });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
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

router.get('/all', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'roomId', select: 'name' });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all bookings' });
  }
});
//get booking by id 
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId')
      .populate({ path: 'userId', select: 'name email' });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Allow only the owner or an admin to access
    if (booking.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
});
//cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});
//update booking (user/admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update allowed fields
    const allowedUpdates = ['startDate', 'endDate', 'guests'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// Approve booking
router.put('/bookings/:id/approve', checkAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'booked' },
      { new: true }
    ).populate('roomId userId');
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve booking' });
  }
});

// Cancel booking (admin or user)
router.put('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});


module.exports = router;
                                                            