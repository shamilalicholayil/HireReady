const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const Session = require("../models/Session");
const Slot = require("../models/Slot");

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
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "hr", hrStatus: "approved" }),
    User.countDocuments({ role: "hr", hrStatus: "pending" }),
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

  res.status(200).json({
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
