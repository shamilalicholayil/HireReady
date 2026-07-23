const FriendRequest = require("../models/FriendRequest");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const requireFriendship = (getTargetUserId) =>
  catchAsync(async (req, res, next) => {
    const myId = req.user._id;
    const targetUserId = getTargetUserId(req);

    const friendship = await FriendRequest.findOne({
      $or: [
        { requester: myId, receiver: targetUserId },
        { requester: targetUserId, receiver: myId },
      ],
      status: "accepted",
    });

    if (!friendship) {
      return next(
        new AppError(
          "You must be friends with this user to message them.",
          403,
        ),
      );
    }

    next();
  });

module.exports = requireFriendship;
