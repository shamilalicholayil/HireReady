const { Router } = require("express");
const router = Router();

const validate = require("../../middlewares/validate.middleware");
const {
  createQuestionSchema,
  updateQuestionSchema,
} = require("../../validators//question.validator");

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

router.post("/", validate(createQuestionSchema), createQuestion);
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);
router.put("/:id", validate(updateQuestionSchema), updateQuestion);
router.patch("/:id/toggle-status", toggleQuestionStatus);

module.exports = router;
