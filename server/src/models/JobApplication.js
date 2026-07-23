const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected"],
      default: "applied",
    },
    scheduledSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
    },
    interviewSlotIndex: { type: Number },
  },
  { timestamps: true },
);

jobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
