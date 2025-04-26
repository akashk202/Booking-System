const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authenticateToken, checkAdmin } = require('../middleware/authenticateToken');
const generateBookingPdf = require('../utils/pdfMaker').generateBookingPDF;
const fs = require('fs');

router.get('/check-availability', authenticateToken, async (req, res) => {
  try {
    const { roomId, dateFrom, dateTo } = req.query;
    if (!roomId || !dateFrom || !dateTo) {
      return res.status(400).json({ message: 'roomId, dateFrom, and dateTo are required' });
    }

    //validation
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Date range is invalid: "dateFrom" must be before "dateTo"' });
    }
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    if (startDate < threeDaysFromNow) {
      return res.status(400).json({ message: 'Bookings must start at least 3 days in the future.' });
    }

    const userBookingsCount = await Booking.countDocuments({
      userId: req.user.id,
      dateFrom: { $gte: startDate, $lt: endDate } 
    });

    if (userBookingsCount >= 5) {
      return res.status(400).json({ message: 'You can only book up to 5 rooms on the same day.' });
    }

    const totalBookingsCount = await Booking.countDocuments({
      dateFrom: { $gte: startDate, $lt: endDate } 
    });

    if (totalBookingsCount >= 30) {
      return res.status(400).json({ message: 'No more rooms can be booked for this day. Try another date.' });
    }

    
    const overlappingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          dateFrom: { $lte: endDate },
          dateTo: { $gte: startDate }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(409).json({ message: 'Room is not available for the selected dates' });
    }

    // If there is no overlapping bookings and other checkspass, return availability
    res.status(200).json({ available: true });
  } catch (err) {
    console.error('Error in /check-availability:', err);
    res.status(500).json({ message: 'Error checking availability' });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomId, dateFrom, dateTo, guests, totalAmount, specialRequests } = req.body;

    if (!roomId || !dateFrom || !dateTo || !guests || !totalAmount) {
      return res.status(400).json({ message: 'Missing required booking information' });
    }

    const now = new Date();
    const startDate = new Date(dateFrom);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    if (startDate < threeDaysFromNow) {
      return res.status(400).json({ message: 'Bookings must start at least 3 days in the future.' });
    }

    const userBookingsCount = await Booking.countDocuments({
      userId: req.user.id,
      dateFrom: { $eq: dateFrom }
    });

    if (userBookingsCount >= 5) {
      return res.status(400).json({ message: 'You can only book up to 5 rooms on the same day.' });
    }

    const totalBookingsCount = await Booking.countDocuments({ dateFrom: { $eq: dateFrom } });
    if (totalBookingsCount >= 30) {
      return res.status(400).json({ message: 'No more rooms can be booked for this day. Try another date.' });
    }

    const overlappingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          dateFrom: { $lte: dateTo },
          dateTo: { $gte: dateFrom }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(409).json({ message: 'Room is not available for the selected dates' });
    }

    const booking = new Booking({
      userId: req.user.id,
      roomId,
      dateFrom,
      dateTo,
      guests,
      totalAmount,
      specialRequests
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: err.message || 'Error creating booking' });
  }
});

//Get all bookings for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('roomId', 'name')
      .populate('userId', 'name email');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Admin: generate PDF
router.get('/report/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name')
      .populate('roomId', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const filePath = await generateBookingPdf(booking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=BookingReport.pdf');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

// Admin: get all bookings
router.get('/all', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('roomId', 'name');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ message: 'Error fetching all bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId')
      .populate('userId', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking by ID:', err);
    res.status(500).json({ message: 'Error fetching booking' });
  }
});

// Delete booking
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
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});

// Update booking
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const allowedUpdates = ['dateFrom', 'dateTo', 'guests', 'specialRequests', 'totalAmount'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// Admin: approve booking
router.put('/bookings/:id/approve', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'booked', paymentStatus: 'paid' },
      { new: true }
    ).populate('roomId userId');
    res.json(booking);
  } catch (err) {
    console.error('Error approving booking:', err);
    res.status(500).json({ message: 'Failed to approve booking' });
  }
});

// Admin/User: cancel booking
router.put('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', paymentStatus: 'refunded' },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    console.error('Error cancelling booking via PUT:', err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});
//Filter Booking
router.get('/filter-by-status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    const validStatuses = ['pending', 'booked', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid or missing status. Must be one of: pending, booked, cancelled' });
    }

    const bookings = await Booking.find({ userId: req.user.id, status: status.toLowerCase() })
      .populate('roomId', 'name')
      .populate('userId', 'name email');

    res.json(bookings);
  } catch (err) {
    console.error('Error filtering bookings by status:', err);
    res.status(500).json({ message: 'Error filtering bookings' });
  }
});

module.exports = router;