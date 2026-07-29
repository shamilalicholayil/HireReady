const mongoose = require("mongoose");

const leaderboardScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "fullstack"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    sessionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

leaderboardScoreSchema.index(
  { user: 1, track: 1, difficulty: 1 },
  { unique: true },
);

module.exports = mongoose.model("LeaderboardScore", leaderboardScoreSchema);
