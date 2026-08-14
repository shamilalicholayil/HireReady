const mongoose = require("mongoose");

const { TRACK_STACK_MAP } = require("../constants/trackStack");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      enum: ["frontend", "backend", "dsa", "fullstack"],
      required: true,
    },
    stack: {
      type: String,
      required: function () {
        return this.track !== "dsa";
      },
      validate: {
        validator: function (value) {
          if (this.track === "dsa") return value === undefined;
          return TRACK_STACK_MAP[this.track]?.includes(value);
        },
        message: (props) =>
          `"${props.value}" is not a valid stack for this track`,
      },
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
