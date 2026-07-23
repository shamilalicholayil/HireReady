const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    attachments: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "audio", "file"],
        },
        name: String,
        size: Number,
      },
    ],
  },
  { timestamps: true },
);

messageSchema.pre("validate", function () {
  if (
    !this.content?.trim() &&
    (!this.attachments || this.attachments.length === 0)
  ) {
    throw new Error("Message must have content or an attachment.");
  }
});

messageSchema.index({ conversationId: 1, receiver: 1, status: 1 });

module.exports = mongoose.model("Message", messageSchema);
