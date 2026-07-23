const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Session = require("../models/Session.js");

const createSession = catchAsync(async (req, res, next) => {
  const { track, difficulty, type } = req.body;

  if (!track || !difficulty) {
    return next(new AppError("track and difficulty are required", 400));
  }

  const session = await Session.create({
    user: req.user._id,
    track,
    difficulty,
    type: type || "solo",
  });

  res.status(201).json({ success: true, session });
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

  if (!session) return next(new AppError("Session not found", 404));

  if (session.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Forbidden", 403));
  }

  res.json({ success: true, session });
});

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
};
