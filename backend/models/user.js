const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true  
  },
  email: {
    type: String,
    unique: true,
    required: true  
  },
  password: {
    type: String,
    required: true
  },
  location: String,
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
});

module.exports = mongoose.model('User', userSchema);
