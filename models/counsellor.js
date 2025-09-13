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
    slots: [
      {
        type: String, // store as "HH:MM" format or you can change to Date if needed
        required: true,
      },
    ],
    booked: {
      type: Boolean,
      default: false,
    },
    selectedSlot: {
      type: String,
      default: null,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    attended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Counsellor = mongoose.model('Counsellor', counsellorSchema);

module.exports = Counsellor;
