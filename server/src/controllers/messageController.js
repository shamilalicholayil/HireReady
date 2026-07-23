const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const findOrCreateConversation = require("../utils/findOrCreateConversation");
const { streamUploadAttachment } = require("../utils/cloudinaryUpload");
const isBlocked = require("../utils/isBlocked");

const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

const { getOnlineSocketIds, getIO } = require("../config/socket");

const getConversation = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { userId } = req.params;
  const { before, limit = 30 } = req.query;

  const conversation = await findOrCreateConversation(myId, userId, {
    create: false,
  });
  if (!conversation)
    return res.status(200).json({
      success: true,
      messages: [],
      conversationId: null,
      hasMore: false,
    });

  const query = { conversationId: conversation._id };
  if (before) query.createdAt = { $lt: new Date(before) };

  const numericLimit = Number(limit);

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(numericLimit + 1);

  const hasMore = messages.length > numericLimit;
  const trimmed = hasMore ? messages.slice(0, numericLimit) : messages;

  res.status(200).json({
    success: true,
    messages: trimmed.reverse(),
    conversationId: conversation._id,
    hasMore,
  });
});

const getConversationsList = catchAsync(async (req, res, next) => {
  const myId = req.user._id;

  const conversations = await Conversation.find({ participants: myId })
    .populate("participants", "name avatar email")
    .populate("lastMessage.sender", "name")
    .sort({ updatedAt: -1 });

  const unreadCounts = await Message.aggregate([
    { $match: { receiver: myId, status: { $ne: "read" } } },
    { $group: { _id: "$conversationId", count: { $sum: 1 } } },
  ]);

  const unreadMap = new Map(
    unreadCounts.map((entry) => [entry._id.toString(), entry.count]),
  );

  const conversationsWithUnread = conversations.map((conv) => ({
    ...conv.toObject(),
    unreadCount: unreadMap.get(conv._id.toString()) || 0,
  }));

  res.status(200).json({
    success: true,
    conversations: conversationsWithUnread,
  });
});

const sendMessage = catchAsync(async (req, res, next) => {
  const senderId = req.user._id;
  const { receiverId, content, attachments } = req.body;

  if (!receiverId) {
    return next(new AppError("receiverId is required.", 400));
  }
  const hasContent = content?.trim();
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
  if (!hasContent && !hasAttachments) {
    return next(
      new AppError("Message must have content or an attachment.", 400),
    );
  }
  if (receiverId === senderId.toString()) {
    return next(new AppError("You cannot message yourself.", 400));
  }

  const receiverExists = await User.exists({ _id: receiverId });
  if (!receiverExists) return next(new AppError("Receiver not found.", 404));

  const [senderBlockedReceiver, receiverBlockedSender] = await Promise.all([
    isBlocked(senderId, receiverId),
    isBlocked(receiverId, senderId),
  ]);

  if (senderBlockedReceiver || receiverBlockedSender) {
    return next(new AppError("You cannot message this user.", 403));
  }

  const conversation = await findOrCreateConversation(senderId, receiverId);

  const message = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content: content?.trim() || "",
    attachments: hasAttachments ? attachments : [],
    status: "sent",
    conversationId: conversation._id,
  });

  conversation.lastMessage = {
    content: hasContent ? message.content : "📎 Attachment",
    sender: senderId,
    createdAt: message.createdAt,
  };
  await conversation.save();

  const receiverSocketIds = getOnlineSocketIds(receiverId);
  if (receiverSocketIds.size > 0) {
    message.status = "delivered";
    await message.save();
    const io = getIO();
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("newMessage", message);
    });
  }

  res.status(201).json({ success: true, message });
});

const markAsRead = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { userId } = req.params;

  const conversation = await findOrCreateConversation(myId, userId, {
    create: false,
  });

  if (!conversation) {
    return res
      .status(200)
      .json({ success: true, message: "No conversation to mark read." });
  }

  await Message.updateMany(
    {
      conversationId: conversation._id,
      receiver: myId,
      status: { $ne: "read" },
    },
    { $set: { status: "read" } },
  );

  const io = getIO();

  const senderSocketIds = getOnlineSocketIds(userId);
  senderSocketIds.forEach((socketId) => {
    io.to(socketId).emit("messagesRead", {
      conversationId: conversation._id,
      readBy: myId,
    });
  });

  const readerSocketIds = getOnlineSocketIds(myId);
  readerSocketIds.forEach((socketId) => {
    io.to(socketId).emit("conversationRead", {
      conversationId: conversation._id,
      unreadCount: 0,
    });
  });

  res.status(200).json({ success: true, message: "Messages marked as read." });
});

const uploadAttachment = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("No file provided.", 400));

  const senderId = req.user._id;
  const { receiverId } = req.body;
  if (!receiverId) return next(new AppError("receiverId is required.", 400));

  const [senderBlockedReceiver, receiverBlockedSender] = await Promise.all([
    isBlocked(senderId, receiverId),
    isBlocked(receiverId, senderId),
  ]);

  if (senderBlockedReceiver || receiverBlockedSender) {
    return next(new AppError("You cannot message this user.", 403));
  }

  const { mimetype, size } = req.file;
  const isImage = mimetype.startsWith("image/");
  const isRaw =
    !isImage &&
    !mimetype.startsWith("video/") &&
    !mimetype.startsWith("audio/");
  const limit = isImage || isRaw ? 10 * 1024 * 1024 : 100 * 1024 * 1024;

  if (size > limit) {
    return next(
      new AppError(
        `File exceeds the ${limit / (1024 * 1024)}MB limit for this file type.`,
        400,
      ),
    );
  }

  const result = await streamUploadAttachment(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
  );

  res.status(200).json({
    success: true,
    attachment: {
      url: result.secure_url,
      type: result.attachmentType,
      name: req.file.originalname,
      size: req.file.size,
    },
  });
});

module.exports = {
  getConversation,
  getConversationsList,
  sendMessage,
  markAsRead,
  uploadAttachment,
};
