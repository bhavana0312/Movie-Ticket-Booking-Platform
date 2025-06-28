const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Booking = require('../models/Booking');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    res.json({ message: "Signup successful!" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    const userResponse = {
  name: user.name,
  email: user.email,
  location: user.location || 'Not Set'  
};


    res.json({ message: 'Login successful', user: userResponse });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Update Location
router.put('/location', async (req, res) => {
  try {
    const { email, location } = req.body;

    const user = await User.findOneAndUpdate({ email }, { location }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Location updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update location", error: err.message });
  }
});

// Get Profile + Bookings
router.get('/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('bookings');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
