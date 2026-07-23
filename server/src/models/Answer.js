const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    parentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    questionText: {
      type: String,
    },
    userAnswer: {
      type: String,
    },
    score: {
      type: Number,
    },
    missedPoints: {
      type: [String],
    },
    polishedAnswer: {
      type: String,
    },
    type: {
      type: String,
      enum: ["voice", "text"],
    },
    time: {
      type: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Answer", answerSchema);
