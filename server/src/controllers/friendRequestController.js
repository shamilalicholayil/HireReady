const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");

const sendFriendRequest = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { receiverId } = req.body;

  if (!receiverId) {
    return next(new AppError("receiverId required.", 400));
  }

  if (receiverId === myId.toString()) {
    return next(
      new AppError("You cannot send a friend request to yourself.", 400),
    );
  }

  const target = await User.findById(receiverId).select("blockedUsers");
  if (!target) return next(new AppError("User not found.", 404));

  if (target.blockedUsers.includes(myId.toString())) {
    return next(new AppError("You cannot send a request to this user.", 403));
  }

  const me = await User.findById(myId).select("blockedUsers");
  if (me.blockedUsers.includes(receiverId)) {
    return next(
      new AppError("Unblock this user before sending a request.", 400),
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
        409,
      ),
    );
  }

  const friendRequest = await FriendRequest.create({
    requester: myId,
    receiver: receiverId,
  });

  res.status(201).json({ success: true, friendRequest });
});

const updateRequestStatus = (newStatus, allowedCaller) =>
  catchAsync(async (req, res, next) => {
    const myId = req.user._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return next(new AppError("Friend request not found.", 404));
    }

    const callerField =
      allowedCaller === "receiver" ? request.receiver : request.requester;

    if (callerField.toString() !== myId.toString()) {
      return next(
        new AppError("You are not authorized to update this request.", 403),
      );
    }

    if (request.status !== "pending") {
      return next(
        new AppError(`This request is already ${request.status}.`, 400),
      );
    }

    request.status = newStatus;
    await request.save();

    res.status(200).json({ success: true, friendRequest: request });
  });

const acceptRequest = updateRequestStatus("accepted", "receiver");
const rejectRequest = updateRequestStatus("rejected", "receiver");
const cancelRequest = updateRequestStatus("cancelled", "requester");

const searchUsers = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { q } = req.query;

  if (!q || !q.trim()) {
    return next(new AppError("Search query required.", 400));
  }

  const me = await User.findById(myId).select("blockedUsers");

  const users = await User.find({
    _id: { $ne: myId },
    role: "user",
    blockedUsers: { $ne: myId },
    name: { $regex: q.trim(), $options: "i" },
  }).select("name avatar email");

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

  res.status(200).json({ success: true, users: results });
});

const getIncomingRequests = catchAsync(async (req, res, next) => {
  const myId = req.user._id;

  const requests = await FriendRequest.find({
    receiver: myId,
    status: "pending",
  }).populate("requester", "name avatar email");

  res.status(200).json({ success: true, requests });
});

const getOutgoingRequests = catchAsync(async (req, res, next) => {
  const myId = req.user._id;

  const requests = await FriendRequest.find({
    requester: myId,
    status: "pending",
  }).populate("receiver", "name avatar email");

  res.status(200).json({ success: true, requests });
});

const getFriends = catchAsync(async (req, res, next) => {
  const myId = req.user._id;

  const accepted = await FriendRequest.find({
    $or: [{ requester: myId }, { receiver: myId }],
    status: "accepted",
  })
    .populate("requester", "name avatar email lastSeen")
    .populate("receiver", "name avatar email lastSeen");

  const friends = accepted.map((r) =>
    r.requester._id.toString() === myId.toString() ? r.receiver : r.requester,
  );

  res.status(200).json({ success: true, friends });
});

const blockUser = catchAsync(async (req, res, next) => {
  const myId = req.user._id;
  const { userId } = req.params;

  if (userId === myId.toString()) {
    return next(new AppError("You cannot block yourself.", 400));
  }

  const target = await User.findById(userId).select("_id");
  if (!target) return next(new AppError("User not found.", 404));

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

  res.status(200).json({
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

  res.status(200).json({
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
