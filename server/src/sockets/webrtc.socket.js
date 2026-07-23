const logger = require("../utils/logger");
const Slot = require("../models/Slot");

const registerWebRTCHandlers = (io, socket) => {
  socket.on("interview:join", async ({ roomId, slotId }) => {
    try {
      const slot = await Slot.findById(slotId);
      if (!slot || slot.roomId !== roomId) {
        return socket.emit("interview:error", { message: "Invalid room" });
      }

      const isHR =
        socket.user.role === "hr" && slot.contactEmail === socket.user.email;
      const isBookedUser =
        slot.booking?.toString() === socket.user._id.toString();
      if (!isHR && !isBookedUser) {
        return socket.emit("interview:error", {
          message: "Not authorized to join this interview",
        });
      }

      socket.join(roomId);
      socket
        .to(roomId)
        .emit("interview:peer-joined", { userId: socket.user._id });
    } catch (err) {
      logger.error(`interview:join failed: ${err.message}`);
      socket.emit("interview:error", { message: "Failed to join interview" });
    }
  });

  socket.on("webrtc:offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc:offer", { offer, from: socket.user._id });
  });

  socket.on("webrtc:answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc:answer", { answer, from: socket.user._id });
  });

  socket.on("webrtc:ice-candidate", ({ roomId, candidate }) => {
    socket
      .to(roomId)
      .emit("webrtc:ice-candidate", { candidate, from: socket.user._id });
  });

  socket.on("interview:leave", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("interview:peer-left", { userId: socket.user._id });
  });
};

module.exports = registerWebRTCHandlers;
