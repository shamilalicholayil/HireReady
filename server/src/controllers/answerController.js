const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const httpStatus = require("../constants/httpStatus");

const Answer = require("../models/Answer");
const Session = require("../models/Session");

const saveAnswer = catchAsync(async (req, res, next) => {
  const {
    session,
    question,
    questionText,
    userAnswer,
    score,
    missedPoints,
    polishedAnswer,
    type,
    timeTaken,
  } = req.body;

  const newAnswer = await Answer.create({
    session,
    question,
    questionText,
    userAnswer,
    score,
    missedPoints,
    polishedAnswer,
    type,
    timeTaken,
    user: req.user._id,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    answer: newAnswer,
    message: "Answer saved successfully.",
  });
});

const getAnswerHistory = catchAsync(async (req, res, next) => {
  const { session, track, page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };

  if (session) {
    filter.session = session;
  } else if (track) {
    const matchingSessionIds = await Session.find({ track }).distinct("_id");
    filter.session = { $in: matchingSessionIds };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [answers, total] = await Promise.all([
    Answer.find(filter)
      .populate("question", "question track difficulty")
      .populate("session", "track difficulty type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Answer.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    count: answers.length,
    answers,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    message: "Answer history fetched successfully.",
  });
});

module.exports = { saveAnswer, getAnswerHistory };
