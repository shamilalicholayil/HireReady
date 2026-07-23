const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "hr", "fullstack"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    type: {
      type: String,
      enum: ["solo", "peer"],
    },
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
      },
    ],
    communicationNotes: {
      type: String,
    },
    strengths: {
      type: [String],
    },
    weaknesses: {
      type: [String],
    },
    improvementSuggestions: {
      type: [String],
    },
    finalScore: {
      type: Number,
    },
    finishTime: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Session", sessionSchema);
