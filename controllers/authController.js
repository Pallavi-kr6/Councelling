const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    user = new User({ name, email, password: hashedPassword, otp, otpExpiry });
    await user.save();

    await transporter.sendMail({
      from: 'pk2239@srmist.edu.in',
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    });

    res.status(201).json({ msg: "User registered. Please verify your email." });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ---------------- VERIFY OTP ----------------
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.isVerified) return res.status(400).json({ msg: "User already verified" });

    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (Date.now() > user.otpExpiry) return res.status(400).json({ msg: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error verifying OTP", error: err.message });
  }
};

// ---------------- RESEND OTP ----------------
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

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

    // If no user found
    if (!user) {
      return res.render("login", { error: "User not found" });
    }

    // If not verified
    if (!user.isVerified) {
      return res.render("verify", { error: "Please verify your email" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid credentials" });
    }

    // 2. Store user in session
req.session.user = user;

// Pass the booked counsellor (if any) to EJS
    res.redirect("/home");


  } catch (err) {
    console.error(err);
    res.status(500).render("login", { error: "Server error, please try again" });
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
