const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Answer = require("../models/Answer");

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

  res.status(201).json({
    success: true,
    answer: newAnswer,
    message: "Answer saved successfully.",
  });
});

const getAnswerHistory = catchAsync(async (req, res, next) => {
  const { session, track } = req.query;

  const filter = { user: req.user._id };
  if (session) filter.session = session;

  const answers = await Answer.find(filter)
    .populate("question", "question track difficulty")
    .populate("session", "track difficulty type")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: answers.length,
    answers,
    message: "Answer history fetched successfully.",
  });
});

module.exports = { saveAnswer, getAnswerHistory };
