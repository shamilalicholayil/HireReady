const { Router } = require("express");
const router = Router();

const {
  saveAnswer,
  getAnswerHistory,
} = require("../../controllers/answerController");

const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

router.post("/", saveAnswer);
router.get("/", getAnswerHistory);

module.exports = router;
