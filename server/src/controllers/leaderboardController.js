const LeaderboardScore = require("../models/LeaderboardScore");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const getLeaderboard = catchAsync(async (req, res, next) => {
  const { track, difficulty, page = 1, limit = 20 } = req.query;

  if (!track || !difficulty) {
    return next(
      new AppError("track and difficulty are required", httpStatus.BAD_REQUEST),
    );
  }

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.max(parseInt(limit, 10), 1);
  const skip = (pageNum - 1) * limitNum;

  const results = await LeaderboardScore.find({ track, difficulty })
    .populate({
      path: "user",
      select: "name avatar excludeFromLeaderboard",
      match: { excludeFromLeaderboard: { $ne: true } },
    })
    .sort({ totalScore: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const filtered = results.filter((entry) => entry.user !== null);

  res.status(httpStatus.OK).json({
    success: true,
    page: pageNum,
    limit: limitNum,
    count: filtered.length,
    leaderboard: filtered,
  });
});

const getMyRank = catchAsync(async (req, res, next) => {
  const { track, difficulty } = req.query;
  const userId = req.user._id;

  if (!track || !difficulty) {
    return next(
      new AppError("track and difficulty are required", httpStatus.BAD_REQUEST),
    );
  }

  const myScore = await LeaderboardScore.findOne({
    user: userId,
    track,
    difficulty,
  });

  if (!myScore) {
    return res.status(httpStatus.OK).json({
      success: true,
      rank: null,
      totalScore: 0,
      message: "No completed sessions in this track/difficulty yet",
    });
  }

  const rank =
    (await LeaderboardScore.countDocuments({
      track,
      difficulty,
      totalScore: { $gt: myScore.totalScore },
    })) + 1;

  res.status(httpStatus.OK).json({
    success: true,
    rank,
    totalScore: myScore.totalScore,
    sessionCount: myScore.sessionCount,
  });
});

module.exports = { getLeaderboard, getMyRank };
