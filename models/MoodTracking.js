const mongoose = require("mongoose");

const moodTrackingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: 'Mood must be an integer between 1 and 10'
      }
    },
    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: 'Energy must be an integer between 1 and 10'
      }
    },
    stress: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: 'Stress must be an integer between 1 and 10'
      }
    },
    sleep: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: 'Sleep must be an integer between 1 and 10'
      }
    },
    social: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: 'Social must be an integer between 1 and 10'
      }
    },
    notes: {
      type: String,
      maxlength: 500,
      default: ""
    },
    tags: [{
      type: String,
      enum: [
        'anxious', 'happy', 'sad', 'angry', 'excited', 'calm', 
        'overwhelmed', 'focused', 'tired', 'motivated', 'lonely', 
        'grateful', 'frustrated', 'peaceful', 'confused', 'hopeful'
      ]
    }],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create compound index for user and date
moodTrackingSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for overall wellbeing score
moodTrackingSchema.virtual('wellbeingScore').get(function() {
  return Math.round((this.mood + this.energy + (11 - this.stress) + this.sleep + this.social) / 5 * 10) / 10;
});

// Method to get mood emoji
moodTrackingSchema.methods.getMoodEmoji = function() {
  const emojis = ['😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
  return emojis[this.mood - 1] || '😐';
};

// Method to get energy emoji
moodTrackingSchema.methods.getEnergyEmoji = function() {
  const emojis = ['😴', '😪', '😑', '😐', '🙂', '😊', '😄', '😁', '⚡', '🔥'];
  return emojis[this.energy - 1] || '😐';
};

// Method to get stress emoji
moodTrackingSchema.methods.getStressEmoji = function() {
  const emojis = ['😌', '😊', '🙂', '😐', '😕', '😟', '😰', '😨', '😱', '💥'];
  return emojis[this.stress - 1] || '😐';
};

module.exports = mongoose.model("MoodTracking", moodTrackingSchema);
