const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show' },
  movieTitle: String,
  showTime: String,
  showDate: String,
  selectedSeats: [String], 
  seatType: String,
  location: String,       
  totalFare: Number,
  bookingDate: Date
});

module.exports = mongoose.model('Booking', bookingSchema);
