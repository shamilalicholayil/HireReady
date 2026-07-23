const { canTransition } = require("../utils/interviewStatusFlow");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

const Slot = require("../models/Slot");

const getMySlots = catchAsync(async (req, res, next) => {
  const filter =
    req.user.role === "hr"
      ? { contactEmail: req.user.email }
      : { booking: req.user._id };
  const slots = await Slot.find(filter).sort({ startTime: 1 });
  res.status(200).json({ status: "success", data: { slots } });
});

const getSlotById = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: "success", data: { slot: req.slot } });
});

const updateInterviewStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const slot = req.slot;

  if (!canTransition(slot.interviewStatus, status)) {
    return next(
      new AppError(
        `Cannot transition from ${slot.interviewStatus} to ${status}`,
        400,
      ),
    );
  }

  slot.interviewStatus = status;
  if (status === "in_progress") slot.startedAt = new Date();
  if (status === "completed" || status === "no_show") slot.endedAt = new Date();
  if (status === "in_progress" && !slot.roomId)
    slot.roomId = `interview-${slot._id}`;

  await slot.save();
  res.status(200).json({ status: "success", data: { slot } });
});

module.exports = { getMySlots, getSlotById, updateInterviewStatus };
