const { canTransition } = require("../utils/interviewStatusFlow");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const transporter = require("../utils/mailer");

const ROLES = require("../constants/roles");
const httpStatus = require("../constants/httpStatus");

const Slot = require("../models/Slot");
const JobApplication = require("../models/JobApplication");

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

const setSlotOutcome = catchAsync(async (req, res, next) => {
  const { outcome } = req.body;
  const slot = req.slot;

  if (slot.interviewStatus !== "completed") {
    return next(
      new AppError(
        "Cannot set outcome before interview is completed",
        httpStatus.BAD_REQUEST,
      ),
    );
  }
  if (slot.outcome !== "pending") {
    return next(
      new AppError(
        "Outcome already recorded for this round",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  slot.outcome = outcome;
  await slot.save();

  if (outcome === "rejected") {
    await JobApplication.findOneAndUpdate(
      { job: slot.job, applicant: slot.booking },
      { status: "rejected" },
    );
  }

  res.status(httpStatus.OK).json({ status: "success", data: { slot } });
});

const scheduleNextRound = catchAsync(async (req, res, next) => {
  const { nextSlotId, round } = req.body;
  const currentSlot = req.slot;

  if (currentSlot.outcome !== "shortlisted") {
    return next(
      new AppError(
        "Candidate must be shortlisted in this round to schedule the next round",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  const nextSlot = await Slot.findOneAndUpdate(
    { _id: nextSlotId, slotStatus: "open" },
    {
      slotStatus: "booked",
      booking: currentSlot.booking,
      job: currentSlot.job,
      round,
      previousRound: currentSlot._id,
    },
    { new: true },
  )
    .populate("booking", "name email")
    .populate("job", "title company");

  if (!nextSlot) {
    return next(
      new AppError("Target slot is no longer available", httpStatus.CONFLICT),
    );
  }

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const interviewLink = `${process.env.CLIENT_URL}/interview/${nextSlot._id}`;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: nextSlot.booking.email,
      subject: `Next Round Scheduled — ${round.replace("_", " ")} — ${nextSlot.job.title}`,
      html: `
        <p>You've advanced to the <strong>${round.replace("_", " ")}</strong> round for <strong>${nextSlot.job.title}</strong> at ${nextSlot.job.company}.</p>
        <p>Your interview is scheduled for <strong>${formatDate(nextSlot.startTime)} from ${formatTime(nextSlot.startTime)} to ${formatTime(nextSlot.endTime)}</strong>.</p>
        <p><a href="${interviewLink}">Join Interview</a></p>
      `,
    });
  } catch (mailErr) {
    logger.error(
      `Failed to send next-round email to ${nextSlot.booking.email}: ${mailErr.message}`,
    );
  }

  res.status(httpStatus.OK).json({ status: "success", data: { nextSlot } });
});

module.exports = {
  createSlot,
  getMySlots,
  getSlotById,
  updateInterviewStatus,
  setSlotOutcome,
  scheduleNextRound,
};
