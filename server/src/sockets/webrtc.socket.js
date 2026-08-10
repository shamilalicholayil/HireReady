const logger = require("../utils/logger");

const Slot = require("../models/Slot");

const ROLES = require("../constants/roles");

// In-memory per-room state — single Node process (fork mode), same known
// limitation as your Socket.io scaling note. Resets on restart. Fine for now,
// revisit alongside the Redis adapter migration.
const roomState = new Map(); // roomId -> { hostSocketId: string|null, waiting: Map<userId, socket> }

function getRoom(roomId) {
  if (!roomState.has(roomId)) {
    roomState.set(roomId, { hostSocketId: null, waiting: new Map() });
  }
  return roomState.get(roomId);
}

const registerWebRTCHandlers = (io, socket) => {
  let currentRoomId = null; // tracked for disconnect cleanup

  socket.on("interview:join", async ({ roomId, slotId }) => {
    try {
      const slot = await Slot.findById(slotId);
      if (!slot || slot.roomId !== roomId) {
        return socket.emit("interview:error", { message: "Invalid room" });
      }

      const isHR =
        socket.user.role === ROLES.HR &&
        slot.contactEmail === socket.user.email;
      const isBookedUser =
        slot.booking?.toString() === socket.user._id.toString();
      if (!isHR && !isBookedUser) {
        return socket.emit("interview:error", {
          message: "Not authorized to join this interview",
        });
      }

      currentRoomId = roomId;
      const room = getRoom(roomId);

      if (isHR) {
        room.hostSocketId = socket.id;
        socket.join(roomId);
        socket.emit("interview:admitted", { isHost: true });

        // Flush anyone who was already waiting before the host connected
        for (const [userId, waitingSocket] of room.waiting) {
          socket.emit("interview:join-request", {
            userId,
            name: waitingSocket.user.name,
            email: waitingSocket.user.email,
          });
        }
        return;
      }

      // Guest path — always parks in the waiting room, host must explicitly admit
      room.waiting.set(socket.user._id.toString(), socket);
      socket.emit("interview:waiting");

      if (room.hostSocketId) {
        io.to(room.hostSocketId).emit("interview:join-request", {
          userId: socket.user._id.toString(),
          name: socket.user.name,
          email: socket.user.email,
        });
      }
    } catch (err) {
      logger.error(`interview:join failed: ${err.message}`);
      socket.emit("interview:error", { message: "Failed to join interview" });
    }
  });

  socket.on("interview:admit", ({ roomId, userId }) => {
    const room = roomState.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return; // only the host can admit
    const waitingSocket = room.waiting.get(userId);
    if (!waitingSocket) return;

    room.waiting.delete(userId);
    waitingSocket.join(roomId);
    waitingSocket.emit("interview:admitted", { isHost: false });
    socket.to(roomId).emit("interview:peer-joined", { userId });
  });

  socket.on("interview:deny", ({ roomId, userId }) => {
    const room = roomState.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return;
    const waitingSocket = room.waiting.get(userId);
    if (waitingSocket) {
      waitingSocket.emit("interview:denied");
      room.waiting.delete(userId);
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

  socket.on("webrtc:hand-raise", ({ roomId, raised }) => {
    socket
      .to(roomId)
      .emit("webrtc:hand-raise", { userId: socket.user._id, raised });
  });

  socket.on("webrtc:screen-share", ({ roomId, sharing }) => {
    socket
      .to(roomId)
      .emit("webrtc:screen-share", { userId: socket.user._id, sharing });
  });

  socket.on("interview:leave", ({ roomId }) => {
    const room = roomState.get(roomId);
    if (room) {
      if (room.hostSocketId === socket.id) room.hostSocketId = null;
      room.waiting.delete(socket.user._id.toString());
    }
    socket.leave(roomId);
    socket.to(roomId).emit("interview:peer-left", { userId: socket.user._id });
  });

  socket.on("interview:end", ({ roomId }) => {
    const room = roomState.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return; // only host ends for everyone
    io.to(roomId).emit("interview:ended");
    roomState.delete(roomId);
  });

  socket.on("disconnect", () => {
    if (!currentRoomId) return;
    const room = roomState.get(currentRoomId);
    if (!room) return;
    if (room.hostSocketId === socket.id) room.hostSocketId = null;
    room.waiting.delete(socket.user._id?.toString());
    socket
      .to(currentRoomId)
      .emit("interview:peer-left", { userId: socket.user._id });
  });
};

module.exports = registerWebRTCHandlers;
