const User = require('../../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Counsellor = require('../../models/counsellor');  // ✅ Model
const Booking = require('../../models/Booking');



// setup transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pk2239@srmist.edu.in',   // sender email
    pass: 'qhjcrtarcwrtmfju'       // replace with Gmail App Password
  }
});

// OTP generator
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, year, course, Instagram } = req.body; // ✅ include Instagram

    if (!year || !course) {
      return res.render("User/signup", { error: "Please select year and course", success: null });
    }

    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      if (user.isVerified) {
        return res.render("User/login", { error: "User already exists. Please log in.", success: null });
      } else {
        return res.render("User/verify", { error: "User already exists but not verified. Please verify your email.", success: null });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      otp,
      otpExpiry,
      year,
      course,
      Instagram   // ✅ save it to DB
    });

    await user.save();

    await transporter.sendMail({
      from: 'pk2239@srmist.edu.in',
      to: normalizedEmail,
      subject: 'Verify your email',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    });

    res.render("User/verify", { success: "Registration successful. Please verify your email.", error: null });

  } catch (err) {
    console.error(err);
    res.status(500).render("User/signup", { error: "Server error. Please try again.", success: null });
  }
};


// ---------------- VERIFY OTP ----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.render("User/verify", { error: "User not found", success: null });
    if (user.isVerified) return res.render("User/login", { error: "User already verified. Please log in.", success: null });

    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (Date.now() > user.otpExpiry) return res.status(400).json({ msg: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

   res.render("User/login", { success: "Email verified successfully. Please log in." });
  } catch (err) {
    res.status(500).json({ msg: "Error verifying OTP", error: err.message });
  }
};

// ---------------- RESEND OTP ----------------
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.render("User/signup", { error: "User not found. Please sign up.", success: null });
    if (user.isVerified) return res.render("User/login", { error: "User already verified. Please log in.", success: null });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: 'pk2239@srmist.edu.in',
      to: email,
      subject: 'Resend OTP',
      text: `Your new OTP is ${otp}. It is valid for 5 minutes.`
    });

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resending OTP', error: err.message });
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("User/login", { error: "User not found" });
    }

    if (!user.isVerified) {
      return res.render("User/verify", { error: "Please verify your email" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("User/login", { error: "Invalid credentials" });
    }

    // 3. Store user in session
    req.session.user = user;

    // 4. Fetch counsellors from DB
    const counsellors = await Counsellor.find();

    // 5. Fetch user's active bookings
    const userBookings = await Booking.find({ 
      user: user._id,
      status: 'booked'
    }).populate('counsellor');

    // 6. Pass user, counsellors, and userBookings to EJS
    res.render("User/home", { 
      user: req.session.user, 
      counsellors,
      userBookings: userBookings || []
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("User/login", { error: "Server error, please try again" });
  }
};


// ---------------- LOGOUT ----------------
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie('connect.sid'); // clear session cookie
    res.redirect("/login"); // after logout, send user back to login page
  });
};


// ---------------- DASHBOARD ----------------
exports.dashboard = async (req, res) => {
  res.json({ message: `Welcome to the dashboard, ${req.user.name}` });
};
