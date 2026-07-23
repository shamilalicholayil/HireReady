const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Question = require("../models/Question");

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

  res.status(201).json({
    success: true,
    question: newQuestion,
    message: "Question created successfully.",
  });
});

const getAllQuestions = catchAsync(async (req, res, next) => {
  const { track, difficulty } = req.query;

  const filter = {};
  if (track) filter.track = track;
  if (difficulty) filter.difficulty = difficulty;

  const questions = await Question.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    questions,
    message: "Questions fetched successfully.",
  });
});

const getQuestionById = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) return next(new AppError("Question not found.", 404));

  res.status(200).json({
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

  if (!updated) return next(new AppError("Question not found.", 404));

  res.status(200).json({
    success: true,
    question: updated,
    message: "Question updated successfully.",
  });
});

const toggleQuestionStatus = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) return next(new AppError("Question not found.", 404));

  question.isActive = !question.isActive;
  await question.save();

  res.status(200).json({
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
