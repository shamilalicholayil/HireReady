const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/regex");

const Tutorial = require("../models/Tutorial");

const httpStatus = require("../constants/httpStatus");
const ROLES = require("../constants/roles");

const createTutorial = catchAsync(async (req, res, next) => {
  const { title, youtubeId, track, description, difficulty, topics } = req.body;
  const addedBy = req.user._id;

  const newTutorial = await Tutorial.create({
    title,
    youtubeId,
    track,
    description,
    difficulty,
    topics,
    addedBy,
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    tutorial: newTutorial,
    message: "New Tutorial created successfully.",
  });
});

const getAllTutorials = catchAsync(async (req, res, next) => {
  const { track, difficulty, search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (track) filter.track = track;
  if (difficulty) filter.difficulty = difficulty;
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tutorials, total] = await Promise.all([
    Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Tutorial.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    success: true,
    count: tutorials.length,
    tutorials,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
    message: "Tutorials fetched successfully.",
  });
});

const getTutorialById = catchAsync(async (req, res, next) => {
  const tutorial = await Tutorial.findById(req.params.id);
  if (!tutorial)
    return next(new AppError("Tutorial not found.", httpStatus.NOT_FOUND));

  if (!tutorial.isActive && req.user?.role !== ROLES.ADMIN) {
    return next(new AppError("Tutorial not found.", httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({
    success: true,
    tutorial,
    message: "Tutorial fetched successfully.",
  });
});

const updateTutorial = catchAsync(async (req, res, next) => {
  const { title, youtubeId, track, description, difficulty, topics } = req.body;

  const updated = await Tutorial.findByIdAndUpdate(
    req.params.id,
    { title, youtubeId, track, description, difficulty, topics },
    { new: true, runValidators: true },
  );

  if (!updated)
    return next(new AppError("Tutorial not found.", httpStatus.NOT_FOUND));

  res.status(httpStatus.OK).json({
    success: true,
    tutorial: updated,
    message: "Tutorial updated successfully.",
  });
});

const toggleTutorialStatus = catchAsync(async (req, res, next) => {
  const tutorial = await Tutorial.findById(req.params.id);
  if (!tutorial)
    return next(new AppError("Tutorial not found.", httpStatus.NOT_FOUND));

  tutorial.isActive = !tutorial.isActive;
  await tutorial.save();

  res.status(httpStatus.OK).json({
    success: true,
    message: tutorial.isActive
      ? "Tutorial restored successfully."
      : "Tutorial deleted successfully.",
    tutorial,
  });
});

const getPublicTutorials = catchAsync(async (req, res, next) => {
  const { track, difficulty } = req.query;

  const filter = { isActive: true };
  if (track) filter.track = track;
  if (difficulty) filter.difficulty = difficulty;

  const tutorials = await Tutorial.find(filter).sort({ createdAt: -1 });

  res.status(httpStatus.OK).json({
    success: true,
    count: tutorials.length,
    tutorials,
    message: "Tutorials fetched successfully.",
  });
});

module.exports = {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorial,
  toggleTutorialStatus,
  getPublicTutorials,
};
