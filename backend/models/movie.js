const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  locations: [String],
  theatre: String,
  timings: [String],
  prices: {
    normal: Number
  },
  poster: String 
});

module.exports = mongoose.model('Movie', movieSchema);
