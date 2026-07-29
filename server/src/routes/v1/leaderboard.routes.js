const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const {
  getLeaderboard,
  getMyRank,
} = require("../../controllers/leaderboardController");

router.get("/", protect, getLeaderboard);
router.get("/my-rank", protect, getMyRank);

module.exports = router;
