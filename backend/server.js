const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const Movie = require('./models/movie');
const Show = require('./models/Show');

const app = express();

// ===== Middlewares =====
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// ===== MongoDB Connection =====
mongoose.connect('mongodb://127.0.0.1:27017/bookmyshow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== Routes (Keep only necessary here) =====

// Create a show with customShowId
app.post('/shows', async (req, res) => {
  try {
    const { movieTitle, showDate, showTime, location, theatre, city, timing, seatLayout } = req.body;
    const customShowId = `${movieTitle}-${showDate}-${showTime}-${theatre}`;
    const show = new Show({ movieTitle, showDate, showTime, location, theatre, city, timing, seatLayout, customShowId });
    await show.save();
    res.status(201).send(show);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Get shows for a movie
app.get('/movies/:id/shows', async (req, res) => {
  try {
    const shows = await Show.find({ movie: req.params.id });
    res.send(shows);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Get seat layout for a show
app.get('/shows/:id/seats', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    res.send(show.seatLayout);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// ===== Modular Routes =====
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movies');
const bookingRoutes = require('./routes/bookings');

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/movies', movieRoutes);
app.use('/booking', bookingRoutes);

// ===== Serve Frontend =====
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get(/^\/(?!api|admin|user|movies|booking).*/, (req, res) => {
  console.log("⚠️ Unmatched route:", req.originalUrl);
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
