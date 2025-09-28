const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slot: {
      type: String, 
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['booked', 'completed', 'cancelled'],
      default: 'booked',
    },
    zoomMeeting: {
      meetingId: {
        type: String,
        default: null
      },
      joinUrl: {
        type: String,
        default: null
      },
      startUrl: {
        type: String,
        default: null
      },
      password: {
        type: String,
        default: null
      },
      topic: {
        type: String,
        default: null
      }
    },
    meetingScheduled: {
      type: Boolean,
      default: false
    },
    emailSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create compound index to ensure unique booking per counsellor-slot-date combination
bookingSchema.index({ counsellor: 1, slot: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);
