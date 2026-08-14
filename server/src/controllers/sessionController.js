const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Session = require("../models/Session.js");
const httpStatus = require("../constants/httpStatus.js");

const createSession = catchAsync(async (req, res, next) => {
  const { track, stack, difficulty, type } = req.body;

  if (!track || !difficulty) {
    return next(
      new AppError("track and difficulty are required", httpStatus.BAD_REQUEST),
    );
  }

  if (track !== "dsa" && !stack) {
    return next(
      new AppError("stack is required for this track", httpStatus.BAD_REQUEST),
    );
  }

  const session = await Session.create({
    user: req.user._id,
    track,
    stack: track === "dsa" ? undefined : stack,
    difficulty,
    type: type || "solo",
  });

  res.status(httpStatus.CREATED).json({ success: true, session });
});

const getMySessions = catchAsync(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, sessions });
});

const getSessionById = catchAsync(async (req, res, next) => {
  const session = await Session.findById(req.params.id)
    .populate("answers")
    .lean();

  if (!session)
    return next(new AppError("Session not found", httpStatus.NOT_FOUND));

  if (session.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Forbidden", httpStatus.FORBIDDEN));
  }

  res.json({ success: true, session });
});

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
};
