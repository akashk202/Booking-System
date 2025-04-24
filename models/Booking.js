const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room',
    required: true
  },
  dateFrom: { 
    type: Date, 
    required: true,
    validate: {
      validator: function (value) {
        return value >= new Date();
      },
      message: 'Start date must be in the future.'
    }
  },
  dateTo: { 
    type: Date, 
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.dateFrom;
      },
      message: 'End date must be after the start date.'
    }
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount must be a positive number.']
  },
  guests: { 
    type: Number, 
    required: true,
    min: [1, 'At least one guest is required.'],
    default: 1
  },
  status: { 
    type: String, 
    enum: [ 'booked', 'pending', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'refunded'],
    default: 'unpaid'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);