const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

const httpStatus = require("../constants/httpStatus");
const ROLES = require("../constants/roles");

const sendFriendRequest = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { receiverId } = req.body;

  if (!receiverId) {
    return next(new AppError("receiverId required.", httpStatus.BAD_REQUEST));
  }

  if (receiverId === myId.toString()) {
    return next(
      new AppError(
        "You cannot send a friend request to yourself.",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  const target = await User.findById(receiverId).select("blockedUsers");
  if (!target)
    return next(new AppError("User not found.", httpStatus.NOT_FOUND));

  if (target.blockedUsers.includes(myId.toString())) {
    return next(
      new AppError(
        "You cannot send a request to this user.",
        httpStatus.FORBIDDEN,
      ),
    );
  }

  const me = await User.findById(myId).select("blockedUsers");
  if (me.blockedUsers.includes(receiverId)) {
    return next(
      new AppError(
        "Unblock this user before sending a request.",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  const existing = await FriendRequest.findOne({
    $or: [
      { requester: myId, receiver: receiverId },
      { requester: receiverId, receiver: myId },
    ],
    status: { $in: ["pending", "accepted"] },
  });

  if (existing) {
    return next(
      new AppError(
        "A friend request already exists between you and this user.",
        httpStatus.CONFLICT,
      ),
    );
  }

  const friendRequest = await FriendRequest.create({
    requester: myId,
    receiver: receiverId,
  });

  res.status(httpStatus.CREATED).json({ success: true, friendRequest });
});

const updateRequestStatus = (newStatus, allowedCaller) =>
  catchAsync(async (req, res, next) => {
    const myId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return next(
        new AppError("Friend request not found.", httpStatus.NOT_FOUND),
      );
    }

    const callerField =
      allowedCaller === "receiver" ? request.receiver : request.requester;

    if (callerField.toString() !== myId.toString()) {
      return next(
        new AppError(
          "You are not authorized to update this request.",
          httpStatus.FORBIDDEN,
        ),
      );
    }

    if (request.status !== "pending") {
      return next(
        new AppError(
          `This request is already ${request.status}.`,
          httpStatus.BAD_REQUEST,
        ),
      );
    }

    request.status = newStatus;
    await request.save();

    res.status(httpStatus.OK).json({ success: true, friendRequest: request });
  });

const acceptRequest = updateRequestStatus("accepted", "receiver");
const rejectRequest = updateRequestStatus("rejected", "receiver");
const cancelRequest = updateRequestStatus("cancelled", "requester");

const searchUsers = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || !q.trim()) {
    return next(new AppError("Search query required.", httpStatus.BAD_REQUEST));
  }

  const filter = {
    _id: { $ne: myId },
    role: ROLES.USER,
    blockedUsers: { $ne: myId },
    name: { $regex: q.trim(), $options: "i" },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name avatar email")
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  const userIds = users.map((u) => u._id);

  const relations = await FriendRequest.find({
    $or: [
      { requester: myId, receiver: { $in: userIds } },
      { requester: { $in: userIds }, receiver: myId },
    ],
    status: { $in: ["pending", "accepted"] },
  });

  const relationMap = new Map();
  relations.forEach((r) => {
    const otherId =
      r.requester.toString() === myId.toString()
        ? r.receiver.toString()
        : r.requester.toString();

    if (r.status === "accepted") {
      relationMap.set(otherId, { status: "friends" });
    } else if (r.requester.toString() === myId.toString()) {
      relationMap.set(otherId, { status: "outgoing", requestId: r._id });
    } else {
      relationMap.set(otherId, { status: "incoming", requestId: r._id });
    }
  });

  const results = users.map((u) => ({
    _id: u._id,
    name: u.name,
    avatar: u.avatar,
    email: u.email,
    relationship: relationMap.get(u._id.toString()) || { status: "none" },
  }));

  res.status(httpStatus.OK).json({
    success: true,
    users: results,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

const getIncomingRequests = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { receiver: myId, status: "pending" };

  const [requests, total] = await Promise.all([
    FriendRequest.find(filter)
      .populate("requester", "name avatar email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FriendRequest.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    requests,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

const getOutgoingRequests = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { requester: myId, status: "pending" };

  const [requests, total] = await Promise.all([
    FriendRequest.find(filter)
      .populate("receiver", "name avatar email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FriendRequest.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    requests,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

const getFriends = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {
    $or: [{ requester: myId }, { receiver: myId }],
    status: "accepted",
  };

  const [accepted, total] = await Promise.all([
    FriendRequest.find(filter)
      .populate("requester", "name avatar email lastSeen")
      .populate("receiver", "name avatar email lastSeen")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FriendRequest.countDocuments(filter),
  ]);

  const friends = accepted.map((r) =>
    r.requester._id.toString() === myId.toString() ? r.receiver : r.requester,
  );

  res.status(httpStatus.OK).json({
    success: true,
    friends,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

const blockUser = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { userId } = req.params;

  if (userId === myId.toString()) {
    return next(
      new AppError("You cannot block yourself.", httpStatus.BAD_REQUEST),
    );
  }

  const target = await User.findById(userId).select("_id");
  if (!target)
    return next(new AppError("User not found.", httpStatus.NOT_FOUND));

  const updated = await User.findByIdAndUpdate(
    myId,
    { $addToSet: { blockedUsers: userId } },
    { new: true },
  ).select("blockedUsers");

  await FriendRequest.updateMany(
    {
      $or: [
        { requester: myId, receiver: userId },
        { requester: userId, receiver: myId },
      ],
      status: { $in: ["pending", "accepted"] },
    },
    { status: "cancelled" },
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "User blocked.",
    blockedUsers: updated.blockedUsers,
  });
});

const unblockUser = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { userId } = req.params;

  const updated = await User.findByIdAndUpdate(
    myId,
    { $pull: { blockedUsers: userId } },
    { new: true },
  ).select("blockedUsers");

  res.status(httpStatus.OK).json({
    success: true,
    message: "User unblocked.",
    blockedUsers: updated.blockedUsers,
  });
});

module.exports = {
  sendFriendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  searchUsers,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  blockUser,
  unblockUser,
};
