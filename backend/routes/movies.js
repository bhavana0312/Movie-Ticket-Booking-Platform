const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');

// Admin - Add a movie
router.post('/add', async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: 'Movie added successfully!', movie });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add movie', error: err.message });
  }
});
// Get movies available in a specific location
router.get('/by-location/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const movies = await Movie.find({ locations: location }); // Filter by location
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching movies', error: err.message });
  }
});

// Get movie by title (for movie-details page)
router.get('/by-title/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const movie = await Movie.findOne({ title: { $regex: new RegExp('^' + title + '$', 'i') } });

  if (!movie) return res.status(404).json({ message: 'Movie not found' });
  res.json(movie);
});


module.exports = router;
