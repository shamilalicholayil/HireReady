const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "fullstack"],
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    slotStatus: {
      type: String,
      enum: ["open", "booked", "completed", "cancelled"],
      default: "open",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roomId: { type: String, unique: true, sparse: true },
    interviewStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "no_show"],
      default: "not_started",
    },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Slot", slotSchema);
