const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/regex");

const Question = require("../models/Question");
const httpStatus = require("../constants/httpStatus");

const createQuestion = catchAsync(async (req, res, next) => {
  const { question, track, difficulty, topics, answerKeyPoints } = req.body;

  const newQuestion = await Question.create({
    question,
    track,
    difficulty,
    topics,
    answerKeyPoints,
    source: "admin",
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    question: newQuestion,
    message: "Question created successfully.",
  });
});

const getAllQuestions = catchAsync(async (req, res, next) => {
  const { track, difficulty, search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (track) filter.track = track;
  if (difficulty) filter.difficulty = difficulty;
  if (search) {
    filter.question = { $regex: escapeRegex(search), $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Question.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    count: questions.length,
    questions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    message: "Questions fetched successfully.",
  });
});

const getQuestionById = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question)
    return next(new AppError("Question not found.", httpStatus.NOT_FOUND));

  res.status(httpStatus.OK).json({
    success: true,
    question,
    message: "Question fetched successfully.",
  });
});

const updateQuestion = catchAsync(async (req, res, next) => {
  const { question, track, difficulty, topics, answerKeyPoints } = req.body;

  const updated = await Question.findByIdAndUpdate(
    req.params.id,
    { question, track, difficulty, topics, answerKeyPoints },
    { new: true, runValidators: true },
  );

  if (!updated)
    return next(new AppError("Question not found.", httpStatus.NOT_FOUND));

  res.status(httpStatus.OK).json({
    success: true,
    question: updated,
    message: "Question updated successfully.",
  });
});

const toggleQuestionStatus = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question)
    return next(new AppError("Question not found.", httpStatus.NOT_FOUND));

  question.isActive = !question.isActive;
  await question.save();

  res.status(httpStatus.OK).json({
    success: true,
    message: question.isActive
      ? "Question restored successfully."
      : "Question deleted successfully.",
    question,
  });
});

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  toggleQuestionStatus,
};
