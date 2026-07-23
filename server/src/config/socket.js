const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const isBlocked = require("../utils/isBlocked");
const User = require("../models/User");

const registerWebRTCHandlers = require("../sockets/webrtc.socket");

const onlineUsers = new Map();
let ioInstance = null;

function initSocket(server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  ioInstance = io;

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select(
        "_id role email isBlocked",
      );
      if (!user) return next(new Error("User not found"));
      if (user.isBlocked) return next(new Error("Account blocked"));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      socket.broadcast.emit("userOnline", { userId });
    }
    onlineUsers.get(userId).add(socket.id);

    logger.info(`Socket connected: user ${userId} (${socket.id})`);

    socket.emit("onlineUsersSnapshot", {
      userIds: Array.from(onlineUsers.keys()),
    });

    socket.on("typing", async ({ receiverId }) => {
      if (!receiverId) return;
      const [senderBlockedReceiver, receiverBlockedSender] = await Promise.all([
        isBlocked(userId, receiverId),
        isBlocked(receiverId, userId),
      ]);
      if (senderBlockedReceiver || receiverBlockedSender) return;

      const receiverSockets = onlineUsers.get(receiverId);
      if (!receiverSockets) return;
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("userTyping", { senderId: userId });
      });
    });

    socket.on("stopTyping", async ({ receiverId }) => {
      if (!receiverId) return;
      const [senderBlockedReceiver, receiverBlockedSender] = await Promise.all([
        isBlocked(userId, receiverId),
        isBlocked(receiverId, userId),
      ]);
      if (senderBlockedReceiver || receiverBlockedSender) return;

      const receiverSockets = onlineUsers.get(receiverId);
      if (!receiverSockets) return;
      receiverSockets.forEach((sockId) => {
        io.to(sockId).emit("userStoppedTyping", { senderId: userId });
      });
    });

    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);

          let lastSeen = new Date();
          try {
            const updated = await User.findByIdAndUpdate(
              userId,
              { lastSeen },
              { new: true, select: "lastSeen" },
            );
            if (updated) lastSeen = updated.lastSeen;
          } catch (err) {
            logger.error(
              `Failed to persist lastSeen for user ${userId}: ${err.message}`,
            );
          }

          io.emit("userOffline", { userId, lastSeen });
        }
      }
      logger.info(`Socket disconnected: user ${userId} (${socket.id})`);
    });
    registerWebRTCHandlers(io, socket);
  });

  return io;
}

function getOnlineSocketIds(userId) {
  return onlineUsers.get(userId.toString()) || new Set();
}

function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized yet.");
  return ioInstance;
}

module.exports = { initSocket, getOnlineSocketIds, getIO };
