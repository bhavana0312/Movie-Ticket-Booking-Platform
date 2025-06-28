// routes/admin.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const Show = require('../models/Show');
const multer = require('multer');
const path = require('path');

// AUTH DETAILS
const ADMIN_USERNAME = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_TOKEN = "hardcodedAdminToken123";

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.status(200).json({ message: "Login successful", role: "admin", token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Admin Add Movie (with image + auto show creation)
router.post('/add-movie', upload.single('poster'), async (req, res) => {
  const token = req.headers.authorization;

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    console.log("🧾 Incoming data:", req.body);
    const { title, description , locations, theatre, timings, normalPrice } = req.body;
    const posterPath = req.file ? req.file.path : '';

    if (!title || !description || !locations || !theatre || !timings || !normalPrice || !posterPath) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const locationList = locations.split(',').map(l => l.trim());
    const timingList = timings.split(',').map(t => t.trim());

    const movie = new Movie({
      title,
      description,
      locations: locationList,
      theatre,
      timings: timingList,
      prices: { normal: +normalPrice },
      poster: posterPath
    });

    await movie.save();

  for (let location of locationList) {
  for (let timing of timingList) {
    const customShowId = `${title}-${"2025-06-12"}-${timing}-${theatre}`;

    // ✅ Check if this show already exists
    const existingShow = await Show.findOne({ customShowId });
    if (existingShow) {
      console.log(`⚠️ Skipping duplicate show: ${customShowId}`);
      continue;
    }

    // ✅ Declare seatLayout here
    const seatLayout = [];

    const rows = ['A', 'B', 'C', 'D', 'E'];
    for (let row of rows) {
      for (let i = 1; i <= 8; i++) {
        seatLayout.push({
          seatNumber: `${row}${i}`,
          seatType: 'Normal',
          isBooked: false,
          price: +normalPrice
        });
      }
    }

    const show = new Show({
      movie: movie._id,
      movieTitle: title,
      showDate: "2025-06-12",
      showTime: timing,
      location,
      theatre,
      timing,
      seatLayout,
      customShowId
    });

    await show.save();
  }
}


    res.status(201).json({ message: 'Movie and shows added successfully!', movie });

  } catch (err) {
    console.error('❌ Admin Add Error:', err);
    res.status(500).json({ message: 'Failed to add movie', error: err.message });
  }
});

module.exports = router;
