const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "fullstack"],
      required: true,
    },
    salaryRange: {
      min: Number,
      max: Number,
    },
    isActive: { type: Boolean, default: true },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
