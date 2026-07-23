const mongoose = require("mongoose");

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    youtubeId: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "hr", "fullstack"],
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    topics: {
      type: [String],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tutorial", tutorialSchema);
