const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  dateFrom: Date,
  dateTo: Date,
  totalAmount: Number,
  status: { type: String, enum: [ 'booked', 'pending', 'cancelled'], default: 'booked' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);