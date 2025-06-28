const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/user');

// Book a show and update user's profile
router.post('/book', async (req, res) => {
  let { userEmail, customShowId, seatNumbers, seatType, movieTitle, showTime, showDate, theatre } = req.body;

  try {
    // ✅ Normalize seatNumbers to always be an array
    if (typeof seatNumbers === 'string') {
      seatNumbers = seatNumbers.split(',').map(s => s.trim());
    }

    const show = await Show.findOne({ customShowId });
    if (!show) throw new Error('Show not found');

    let totalFare = 0;

    console.log("🔍 Booking request received");
    console.log("🎯 Requested seatType:", seatType);
    console.log("🎫 Requested seatNumbers:", seatNumbers);
    console.log("🎥 For showId:", show.customShowId);
    console.log("📋 Full seat layout:");
    show.seatLayout.forEach(s => {
      console.log(`➡️ Seat: ${s.seatNumber} | Type: ${s.seatType} | Booked: ${s.isBooked}`);
    });

    // ✅ Check each seat
    seatNumbers.forEach(sn => {
      const seat = show.seatLayout.find(s => s.seatNumber === sn);
      if (!seat) throw new Error(`Seat ${sn} not found`);
      if (seatType && seat.seatType !== seatType) {
        console.log(`⚠️ Seat type mismatch: ${sn} is ${seat.seatType} but selected ${seatType}`);
      }
      if (seat.isBooked) throw new Error(`Seat ${sn} is not available`);
      totalFare += seat.price;
    });

    // ✅ Mark seats as booked
    show.seatLayout.forEach(seat => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.isBooked = true;
      }
    });

    await show.save();

    // ✅ Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) throw new Error('User not found');

    // ✅ Save booking
    const booking = new Booking({
      user: user._id,
      show: show._id,
      movieTitle,
      showTime,
      showDate,
      selectedSeats: seatNumbers,
      seatType,
      location: theatre,
      userEmail,
      totalFare,
      bookingDate: new Date()
    });

    const savedBooking = await booking.save();

    // ✅ Push to user profile
    user.bookings.push(savedBooking._id);
    await user.save();

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error('❌ Booking Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});




// ✅ Fetch bookings using user email from User model
router.get('/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .populate('bookings');  // 👈 THIS line is what gives full booking details

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user); 
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
});


// ✅ Get booked seats for a given show
router.get('/booked-seats', async (req, res) => {
  try {
    const { customShowId } = req.query;

    if (!customShowId) {
      return res.status(400).json({ error: "Missing showId" });
    }

    // 🔍 Find the show first using customShowId
    const show = await Show.findOne({ customShowId: decodeURIComponent(customShowId) });

    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }

    // ✅ Now get bookings by show _id
    const bookings = await Booking.find({ show: show._id });

    // Combine all booked seats
    const bookedSeats = bookings.flatMap(b => b.selectedSeats);

    res.json({ bookedSeats });

  } catch (err) {
    console.error('❌ Error fetching booked seats:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE a booking and free the seats
router.delete('/delete-booking/:bookingId', async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Get the show and free the seats
    const show = await Show.findById(booking.show);
    if (show) {
      show.seatLayout.forEach(seat => {
        if (booking.selectedSeats.includes(seat.seatNumber)) {
          seat.isBooked = false;
        }
      });
      await show.save();
    }

    // 3. Remove from user's profile
    const user = await User.findOne({ email: booking.userEmail });
    if (user) {
      user.bookings = user.bookings.filter(bid => bid.toString() !== bookingId);
      await user.save();
    }

    // 4. Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.json({ message: "Booking deleted and seats freed." });
  } catch (err) {
    console.error("❌ Error deleting booking:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/shows/:id', async (req, res) => {
  try {
    const show = await Show.findOne({ customShowId: req.params.id });
    if (!show) {
      return res.status(404).json({ error: "Show not found" });
    }
    res.json(show);
  } catch (err) {
    console.error("❌ Error fetching show:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
