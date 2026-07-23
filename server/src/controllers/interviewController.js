const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Session = require("../models/Session");
const Answer = require("../models/Answer");
const Question = require("../models/Question");

const {
  getQuestionsForSession,
  scoreAnswer,
  generateFollowUp,
  generateFinalReport,
} = require("../services/interview.service");

const QUESTIONS_PER_SESSION = 5;
const FOLLOW_UP_SCORE_THRESHOLD = 50;

const startSession = catchAsync(async (req, res, next) => {
  const { track, difficulty } = req.body;
  const userId = req.user._id;

  const questions = await getQuestionsForSession({
    userId,
    track,
    difficulty,
    count: QUESTIONS_PER_SESSION,
  });

  if (!questions.length) {
    return next(
      new AppError("No questions available for this track/difficulty.", 404),
    );
  }

  const session = await Session.create({
    user: userId,
    track,
    difficulty,
    type: "solo",
  });

  res.status(201).json({
    success: true,
    session,
    firstQuestion: {
      _id: questions[0]._id,
      question: questions[0].question,
      answerKeyPoints: questions[0].answerKeyPoints,
    },
    remainingQuestionIds: questions.slice(1).map((q) => q._id),
  });
});

const submitAnswer = catchAsync(async (req, res, next) => {
  const {
    sessionId,
    questionId,
    userAnswer,
    isFollowUp,
    parentQuestion,
    time,
    type,
  } = req.body;
  const userId = req.user._id;

  const session = await Session.findById(sessionId);
  if (!session) return next(new AppError("Session not found", 404));
  if (session.user.toString() !== userId.toString()) {
    return next(new AppError("Not authorized for this session", 403));
  }

  let questionText;
  let answerKeyPoints;

  if (isFollowUp) {
    questionText = req.body.questionText;
    answerKeyPoints = req.body.answerKeyPoints || [];
  } else {
    const question = await Question.findById(questionId);
    if (!question) return next(new AppError("Question not found", 404));
    questionText = question.question;
    answerKeyPoints = question.answerKeyPoints;
  }

  const { score, missedPoints, polishedAnswer } = await scoreAnswer({
    questionText,
    answerKeyPoints,
    userAnswer,
  });

  const answer = await Answer.create({
    session: sessionId,
    user: userId,
    question: isFollowUp ? null : questionId,
    parentQuestion: isFollowUp ? parentQuestion : null,
    questionText,
    userAnswer,
    score,
    missedPoints,
    polishedAnswer,
    type: type === "voice" ? "voice" : "text",
    time,
  });

  session.answers.push(answer._id);
  await session.save();

  const shouldFollowUp = score < FOLLOW_UP_SCORE_THRESHOLD && !isFollowUp;

  if (shouldFollowUp) {
    const followUpQuestion = await generateFollowUp({
      questionText,
      userAnswer,
      missedPoints,
    });

    return res.status(200).json({
      success: true,
      answer,
      nextStep: "follow_up",
      followUp: {
        questionText: followUpQuestion,
        parentQuestion: questionId,
        answerKeyPoints,
      },
    });
  }

  res.status(200).json({
    success: true,
    answer,
    nextStep: "next_question",
  });
});

const finishSession = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await Session.findById(sessionId);
  if (!session) return next(new AppError("Session not found", 404));
  if (session.user.toString() !== userId.toString()) {
    return next(new AppError("Not authorized for this session", 403));
  }

  const answers = await Answer.find({ session: sessionId });
  if (!answers.length) {
    return next(new AppError("Cannot finish a session with no answers", 400));
  }

  const report = await generateFinalReport({ track: session.track, answers });

  session.finalScore = report.overallScore;
  session.communicationNotes = report.communicationNotes;
  session.strengths = report.strengths;
  session.weaknesses = report.weaknesses;
  session.improvementSuggestions = report.improvementSuggestions;
  session.finishTime = new Date();
  await session.save();

  res.status(200).json({ success: true, session });
});

const getSessionReport = catchAsync(async (req, res, next) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await Session.findById(sessionId).populate("answers");
  if (!session) return next(new AppError("Session not found", 404));
  if (session.user.toString() !== userId.toString()) {
    return next(new AppError("Not authorized for this session", 403));
  }

  res.status(200).json({ success: true, session });
});

const getMySessions = catchAsync(async (req, res, next) => {
  const sessions = await Session.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, sessions });
});

const getQuestionById = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id).select(
    "question answerKeyPoints",
  );
  if (!question) return next(new AppError("Question not found", 404));
  res.status(200).json({ success: true, question });
});

module.exports = {
  startSession,
  submitAnswer,
  finishSession,
  getSessionReport,
  getMySessions,
  getQuestionById,
};
