const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const Session = require("../models/Session");
const Slot = require("../models/Slot");

const httpStatus = require("../constants/httpStatus");
const ROLES = require("../constants/roles");
const HR_STATUS = require("../constants/hrStatus");

const getDashboardStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalHR,
    pendingHR,
    totalSessions,
    completedSessions,
    totalSlots,
    bookedSlots,
    completedInterviews,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.USER }),
    User.countDocuments({
      role: ROLES.HR,
      hrStatus: HR_STATUS.APPROVED,
    }),
    User.countDocuments({
      role: ROLES.HR,
      hrStatus: HR_STATUS.PENDING,
    }),
    Session.countDocuments({}),
    Session.countDocuments({ status: "completed" }),
    Slot.countDocuments({}),
    Slot.countDocuments({ slotStatus: "booked" }),
    Slot.countDocuments({ interviewStatus: "completed" }),
    Session.aggregate([
      { $match: { status: "completed", finalScore: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: "$finalScore" } } },
    ]),
  ]);

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      totalUsers,
      totalHR,
      pendingHR,
      totalSessions,
      completedSessions,
      totalSlots,
      bookedSlots,
      completedInterviews,
    },
  });
});

module.exports = { getDashboardStats };
