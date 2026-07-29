const { Router } = require("express");
const router = Router();

const validate = require("../../middlewares/validate.middleware");
const {
  createTutorialSchema,
  updateTutorialSchema,
} = require("../../validators/tutorial.validator");

const {
  createTutorial,
  getAllTutorials,
  getTutorialById,
  updateTutorial,
  toggleTutorialStatus,
} = require("../../controllers/tutorialController");

const { protect, isAdmin } = require("../../middlewares/auth.middleware");

router.use(protect);
router.use(isAdmin);

router.post("/", validate(createTutorialSchema), createTutorial);
router.get("/", getAllTutorials);
router.get("/:id", getTutorialById);
router.put("/:id", validate(updateTutorialSchema), updateTutorial);
router.patch("/:id/toggle-status", toggleTutorialStatus);

module.exports = router;
