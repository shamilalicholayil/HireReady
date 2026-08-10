const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const httpStatus = require("../constants/httpStatus");

const Notification = require("../models/Notification");

const getMyNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    Notification.countDocuments({ user: req.user._id }),
  ]);

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

const markNotificationRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    return next(new AppError("Notification not found", httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({ status: "success", data: { notification } });
});

const markAllNotificationsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true },
  );
  res.status(httpStatus.OK).json({ status: "success" });
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
