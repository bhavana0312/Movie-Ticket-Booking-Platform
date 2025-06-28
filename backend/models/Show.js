const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  seatType: String,
  isBooked: Boolean,
  price: Number
});

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }, 
  movieTitle: String,
  showDate: String,
  showTime: String,
  location: String,
  theatre: String,
  timing: String,
  seatLayout: [seatSchema],
  customShowId: { type: String, unique: true, required: true }
});

module.exports = mongoose.model('Show', showSchema);
