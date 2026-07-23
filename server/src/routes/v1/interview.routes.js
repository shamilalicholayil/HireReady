const { Router } = require("express");
const router = Router();
const { protect } = require("../../middlewares/auth.middleware");
const {
  startSession,
  submitAnswer,
  finishSession,
  getSessionReport,
  getMySessions,
  getQuestionById,
} = require("../../controllers/interviewController");

router.post("/sessions", protect, startSession);
router.post("/sessions/answer", protect, submitAnswer);
router.patch("/sessions/:sessionId/finish", protect, finishSession);
router.get("/sessions/:sessionId", protect, getSessionReport);
router.get("/sessions", protect, getMySessions);
router.get("/questions/:id", protect, getQuestionById);

module.exports = router;
