const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    googleId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    resumeUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "hr", "admin"],
      default: "user",
    },
    hrStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: undefined,
    },
    hrRejectionReason: { type: String },
    hrRejectionHistory: [
      {
        reason: String,
        rejectedAt: Date,
      },
    ],
    hrDocuments: [
      {
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    companyName: { type: String },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    bio: {
      type: String,
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "fullstack"],
    },
    skills: {
      type: [String],
    },
    refreshToken: {
      type: String,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
