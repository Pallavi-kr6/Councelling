const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  Instagram:{type:String},
  password: { type: String, required: true },

  otp: { type: String },
  otpExpiry: { type: Date },   // OTP valid for 5 minutes
  isVerified: { type: Boolean, default: false },
   year: { type: Number, required: true },       // e.g., 1, 2, 3, 4
  course: { type: String, required: true },  
  bookedCounsellors: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor" }
  ]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
