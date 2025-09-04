const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },   // OTP valid for 5 minutes
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
