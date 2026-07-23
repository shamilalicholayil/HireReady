const { Router } = require("express");
const router = Router();

const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  toggleQuestionStatus,
} = require("../../controllers/questionController");

const { protect, isAdmin } = require("../../middlewares/auth.middleware");

router.use(protect);
router.use(isAdmin);

router.post("/", createQuestion);
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);
router.put("/:id", updateQuestion);
router.patch("/:id/toggle-status", toggleQuestionStatus);

module.exports = router;
