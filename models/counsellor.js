const mongoose = require('mongoose');

const counsellorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {                 // ✅ add password for login
      type: String,
      required: true,
    },
    qualifications: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      enum: ["stress", "academics", "career", "relationships"],
      required: true,
    },
    // Weekly schedule - each day can have multiple time slots
    weeklySchedule: {
      monday: [{
        type: String, // "HH:MM" format
      }],
      tuesday: [{
        type: String,
      }],
      wednesday: [{
        type: String,
      }],
      thursday: [{
        type: String,
      }],
      friday: [{
        type: String,
      }],
      saturday: [{
        type: String,
      }],
      sunday: [{
        type: String,
      }],
    },
    // Keep old slots field for backward compatibility (will be deprecated)
    slots: [
      {
        type: String, // "HH:MM"
      },
    ],
  },
  { timestamps: true }
);

const Counsellor = mongoose.model('Counsellor', counsellorSchema);

module.exports = Counsellor;
