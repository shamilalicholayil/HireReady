const { canTransition } = require("../utils/interviewStatusFlow");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

const ROLES = require("../constants/roles");
const httpStatus = require("../constants/httpStatus");

const Slot = require("../models/Slot");

const createSlot = catchAsync(async (req, res, next) => {
  const { name, track, job, date, startTime, endTime } = req.body;

  if (new Date(startTime) >= new Date(endTime)) {
    return next(
      new AppError("startTime must be before endTime", httpStatus.BAD_REQUEST),
    );
  }

  const slot = await Slot.create({
    name,
    contactEmail: req.user.email,
    track,
    job,
    date,
    startTime,
    endTime,
    slotStatus: "open",
  });

  res.status(httpStatus.CREATED).json({ status: "success", data: { slot } });
});

const getMySlots = catchAsync(async (req, res, next) => {
  const { track, status } = req.query;

  const filter =
    req.user.role === ROLES.HR
      ? { contactEmail: req.user.email }
      : { booking: req.user._id };

  if (track) filter.track = track;
  if (status) filter.slotStatus = status;

  const slots = await Slot.find(filter)
    .sort({ startTime: 1 })
    .populate("job", "title company track");

  res.status(httpStatus.OK).json({ status: "success", data: { slots } });
});

const getSlotById = catchAsync(async (req, res, next) => {
  res
    .status(httpStatus.OK)
    .json({ status: "success", data: { slot: req.slot } });
});

const updateInterviewStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const slot = req.slot;

  if (!canTransition(slot.interviewStatus, status)) {
    return next(
      new AppError(
        `Cannot transition from ${slot.interviewStatus} to ${status}`,
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  slot.interviewStatus = status;
  if (status === "in_progress") slot.startedAt = new Date();
  if (status === "completed" || status === "no_show") slot.endedAt = new Date();
  if (status === "in_progress" && !slot.roomId)
    slot.roomId = `interview-${slot._id}`;

  await slot.save();
  res.status(httpStatus.OK).json({ status: "success", data: { slot } });
});

module.exports = { createSlot, getMySlots, getSlotById, updateInterviewStatus };
