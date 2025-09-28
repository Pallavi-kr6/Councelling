const Counsellor = require('../../models/counsellor');
const User = require("../../models/user");
const Booking = require("../../models/Booking");
const zoomService = require('../../services/zoomService');
const emailService = require('../../services/emailService');

// ------------------------------
// Helper to ensure user is logged in
// ------------------------------
const ensureLoggedIn = (req, res) => {
  console.log("Session check:", req.session);
  console.log("User in session:", req.session.user);
  
  if (!req.session.user) {
    console.log("No user in session, redirecting to login");
    res.redirect("/login");
    return false;
  }
  return true;
};

// ------------------------------
// Show all counsellors
// ------------------------------
exports.getCounsellors = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0]; // Default to today
    
    const counsellors = await Counsellor.find();
    
    // Get day of week from the selected date
    const dateObj = new Date(selectedDate);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dateObj.getDay()];
    
    // Get all bookings for the selected date
    const bookings = await Booking.find({ 
      date: { 
        $gte: new Date(selectedDate), 
        $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000) 
      },
      status: 'booked'
    });

    // Create a map of booked slots for each counsellor
    const bookedSlots = {};
    bookings.forEach(booking => {
      const counsellorId = booking.counsellor.toString();
      if (!bookedSlots[counsellorId]) {
        bookedSlots[counsellorId] = new Set();
      }
      bookedSlots[counsellorId].add(booking.slot);
    });

    // Get user's bookings for the selected date
    let userBookings = [];
    if (userId) {
      userBookings = await Booking.find({ 
        user: userId,
        date: { 
          $gte: new Date(selectedDate), 
          $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000) 
        },
        status: 'booked'
      });
    }

    res.render("User/counsellors", {
      counsellors,
      bookedSlots,
      userBookings,
      selectedDate,
      dayOfWeek,
      user: req.session.user || null,
      success: req.query.success || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving counsellors");
  }
};

// ------------------------------
// Book a counsellor
// ------------------------------
exports.bookCounsellor = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  const { id, slot, date } = req.body;
  if (!id || !slot || !date) return res.status(400).send("Counsellor ID, slot, and date required");

  try {
    // Check if counsellor exists and has the requested slot
    const counsellor = await Counsellor.findById(id);
    if (!counsellor) return res.status(404).send("Counsellor not found");
    
    // Get day of week from the selected date
    const selectedDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];
    
    // Check if counsellor is available on this day and time
    const availableSlots = counsellor.weeklySchedule?.[dayOfWeek] || [];
    if (!availableSlots.includes(slot)) {
      return res.status(400).send(`Counsellor is not available on ${dayOfWeek} at ${slot}`);
    }

    // Check if the slot is already booked for the given date
    const existingBooking = await Booking.findOne({
      counsellor: id,
      slot: slot,
      date: new Date(date),
      status: { $in: ['booked', 'completed'] } // Check both booked and completed statuses
    });

    if (existingBooking) {
      return res.status(400).send("This slot is already booked for the selected date");
    }

    // Additional check: Check if user already has a booking for this counsellor on this date
    const userExistingBooking = await Booking.findOne({
      counsellor: id,
      user: req.session.user._id,
      date: new Date(date),
      status: { $in: ['booked', 'completed'] }
    });

    if (userExistingBooking) {
      return res.status(400).send("You already have a booking with this counsellor on this date");
    }

    // Create new booking with error handling for duplicate key
    let booking;
    try {
      booking = new Booking({
        counsellor: id,
        user: req.session.user._id,
        slot: slot,
        date: new Date(date),
        status: 'booked'
      });

      await booking.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        return res.status(400).send("This slot is already booked for the selected date");
      }
      throw saveError; // Re-throw if it's not a duplicate key error
    }

    // Create Zoom meeting for the booking
    try {
      const user = await User.findById(req.session.user._id);
      const meetingTopic = `Counseling Session - ${user.name} with ${counsellor.name}`;
      
      // Create meeting date and time
      const meetingDateTime = new Date(date);
      const [hours, minutes] = slot.split(':');
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const zoomResult = await zoomService.createMeeting(
        meetingTopic,
        meetingDateTime.toISOString(),
        60, // 60 minutes duration
        null // No password for now
      );

      if (zoomResult.success) {
        // Update booking with Zoom meeting details
        booking.zoomMeeting = {
          meetingId: zoomResult.meeting.id,
          joinUrl: zoomResult.meeting.join_url,
          startUrl: zoomResult.meeting.start_url,
          password: zoomResult.meeting.password,
          topic: zoomResult.meeting.topic
        };
        booking.meetingScheduled = true;
        await booking.save();

        // Send email notifications with Zoom meeting details
        const emailResult = await emailService.sendMeetingNotification(user, counsellor, booking, zoomResult.meeting);
        
        if (emailResult.success) {
          booking.emailSent = true;
          await booking.save();
        }
      } else {
        console.error('Failed to create Zoom meeting:', zoomResult.error);
        // Send basic booking confirmation without Zoom details
        await emailService.sendBookingConfirmation(user, counsellor, booking);
      }
    } catch (zoomError) {
      console.error('Error creating Zoom meeting or sending emails:', zoomError);
      // Send basic booking confirmation as fallback
      try {
        const user = await User.findById(req.session.user._id);
        await emailService.sendBookingConfirmation(user, counsellor, booking);
      } catch (emailError) {
        console.error('Error sending fallback email:', emailError);
      }
    }

    // Redirect with success message
    res.redirect(`/counsellors?date=${date}&success=Meeting scheduled and email sent!`);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).send("This slot is already booked for the selected date");
    }
    res.status(500).send("Error booking counsellor");
  }
};

// ------------------------------
// Home route
// ------------------------------
exports.getHome = async (req, res) => {
  try {
    // Fetch logged-in user
    const user = await User.findById(req.session.user._id);

    // Fetch user's active bookings
    const userBookings = await Booking.find({ 
      user: req.session.user._id,
      status: 'booked'
    }).populate('counsellor');

    // Fetch all counsellors for listing
    const counsellors = await Counsellor.find();

    res.render("User/home", {
      user,
      counsellors,
      userBookings: userBookings || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving counsellors");
  }
};


// ------------------------------
// Counsellor Dashboard
// ------------------------------
exports.getCounsellorDashboard = async (req, res) => {
  try {
    const counsellorId = req.params.id;
    const selectedDate = req.query.date || new Date().toISOString().split('T')[0];

    // Fetch counsellor
    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor) return res.status(404).send("Counsellor not found");

    // Fetch bookings for this counsellor on the selected date
    const bookings = await Booking.find({
      counsellor: counsellorId,
      date: { 
        $gte: new Date(selectedDate), 
        $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000) 
      },
      status: 'booked'
    }).populate({
      path: 'user',
      select: 'name email Instagram course year'
    });

    res.render("User/counsellorDashboard", {
      counsellor,
      bookings,
      selectedDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ------------------------------
// Mark session as attended
// ------------------------------
exports.markSessionAttended = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  const { bookingId } = req.body;

  try {
    // Check if user session exists
    if (!req.session.user || !req.session.user._id) {
      return res.status(401).send("User session not found. Please login again.");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).send("Booking not found");

    // Check if the user owns this booking - improved comparison
    const userId = req.session.user._id.toString();
    const bookingUserId = booking.user.toString();
    
    console.log("User ID from session:", userId);
    console.log("Booking user ID:", bookingUserId);
    
    if (bookingUserId !== userId) {
      return res.status(403).send("Unauthorized: You can only mark your own bookings as attended");
    }

    // Mark booking as completed
    booking.status = 'completed';
    booking.attended = true;
    await booking.save();

    res.redirect("/home");
  } catch (err) {
    console.error("Error in markSessionAttended:", err);
    res.status(500).send("Error marking session as attended");
  }
};

// ------------------------------
// Cancel booking
// ------------------------------
exports.cancelBooking = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  const { bookingId } = req.body;

  try {
    // Check if user session exists
    if (!req.session.user || !req.session.user._id) {
      return res.status(401).send("User session not found. Please login again.");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).send("Booking not found");

    // Check if the user owns this booking - improved comparison
    const userId = req.session.user._id.toString();
    const bookingUserId = booking.user.toString();
    
    console.log("User ID from session:", userId);
    console.log("Booking user ID:", bookingUserId);
    
    if (bookingUserId !== userId) {
      return res.status(403).send("Unauthorized: You can only cancel your own bookings");
    }

    // Mark booking as cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.redirect("/home");
  } catch (err) {
    console.error("Error in cancelBooking:", err);
    res.status(500).send("Error cancelling booking");
  }
};
