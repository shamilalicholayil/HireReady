const { Router } = require("express");
const router = Router();

const notification = require("./notification.routes");

const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const answerRoutes = require("./answer.routes");
const sessionRoutes = require("./session.routes.js");
const friendRequestRoutes = require("./friendRequest.routes.js");
const messageRoutes = require("./message.routes.js");
const tutorialHubRoutes = require("./tutorialHub.routes.js");
const interviewRoutes = require("./interview.routes.js");
const leaderboardRoutes = require("./leaderboard.routes");

const slotRoutes = require("./slot.routes.js");
const jobRoutes = require("./job.routes.js");

const adminRoutes = require("./admin.routes.js");
const userRoutes = require("./user.routes.js");
const questionRoutes = require("./question.routes");
const tutorialRoutes = require("./tutorial.routes.js");
const hrVerificationRoutes = require("./hrVerification.routes.js");

router.use("/notifications", notification);

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/tutorials", tutorialHubRoutes);
router.use("/answers", answerRoutes);
router.use("/sessions", sessionRoutes);
router.use("/friend-requests", friendRequestRoutes);
router.use("/messages", messageRoutes);
router.use("/interview", interviewRoutes);
router.use("/leaderboard", leaderboardRoutes);

router.use("/slots", slotRoutes);
router.use("/jobs", jobRoutes);

router.use("/admin", adminRoutes);
router.use("/admin/users", userRoutes);
router.use("/admin/questions", questionRoutes);
router.use("/admin/tutorials", tutorialRoutes);
router.use("/admin/hr-applicants", hrVerificationRoutes);

module.exports = router;
