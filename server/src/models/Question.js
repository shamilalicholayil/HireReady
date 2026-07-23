const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "hr", "fullstack"],
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    topics: {
      type: [String],
    },
    answerKeyPoints: {
      type: [String],
    },
    source: {
      type: String,
      enum: ["admin", "AI"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", questionSchema);
