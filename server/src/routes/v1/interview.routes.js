const { Router } = require("express");
const router = Router();

const { protect } = require("../../middlewares/auth.middleware");
const createRateLimiter = require("../../middlewares/rateLimiter.middleware");
const acquireSessionLock = require("../../middlewares/sessionLock.middleware");

const {
  startSession,
  submitAnswer,
  finishSession,
  getSessionReport,
  getMySessions,
  getQuestionById,
} = require("../../controllers/interviewController");

const startSessionLimiter = createRateLimiter({
  keyPrefix: "rl_ai_start",
  points: 10,
  duration: 3600, // 1 hour
  keyBy: "user",
});

const submitAnswerLimiter = createRateLimiter({
  keyPrefix: "rl_ai_answer",
  points: 30,
  duration: 3600,
  keyBy: "user",
});

const finishSessionLimiter = createRateLimiter({
  keyPrefix: "rl_ai_finish",
  points: 10,
  duration: 3600,
  keyBy: "user",
});

router.post("/sessions", protect, startSessionLimiter, startSession);
router.post(
  "/sessions/answer",
  protect,
  submitAnswerLimiter,
  acquireSessionLock((req) => req.body.sessionId),
  submitAnswer,
);
router.patch(
  "/sessions/:sessionId/finish",
  protect,
  finishSessionLimiter,
  acquireSessionLock((req) => req.params.sessionId),
  finishSession,
);
router.get("/sessions/:sessionId", protect, getSessionReport);
router.get("/sessions", protect, getMySessions);
router.get("/questions/:id", protect, getQuestionById);

module.exports = router;
