const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = require("../models/User");

const { getIO, getOnlineSocketIds } = require("../config/socket");

const getAllUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", role = "user" } = req.query;

  if (!["user", "hr", "admin"].includes(role)) {
    return next(new AppError("Invalid role filter.", 400));
  }

  const filter = { role };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully.",
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / Number(limit)),
    currentPage: Number(page),
  });
});

const toggleBlockUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));

  if (user.role === "admin") {
    return next(new AppError("Cannot block an admin.", 403));
  }

  user.isBlocked = !user.isBlocked;

  if (user.isBlocked) {
    user.refreshToken = null;
  }

  await user.save();

  if (user.isBlocked) {
    const socketIds = getOnlineSocketIds(user._id);
    if (socketIds.size > 0) {
      const io = getIO();
      socketIds.forEach((socketId) => {
        io.to(socketId).emit("accountBlocked", {
          message: "Your account has been blocked by an admin.",
        });
        io.sockets.sockets.get(socketId)?.disconnect(true);
      });
    }
  }

  res.status(200).json({
    success: true,
    message: user.isBlocked
      ? "User blocked successfully."
      : "User unblocked successfully.",
    user,
  });
});

module.exports = {
  getAllUsers,
  toggleBlockUser,
};
