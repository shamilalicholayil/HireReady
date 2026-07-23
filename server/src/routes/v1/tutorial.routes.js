const { Router } = require("express");
const router = Router();

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

router.post("/", createTutorial);
router.get("/", getAllTutorials);
router.get("/:id", getTutorialById);
router.put("/:id", updateTutorial);
router.patch("/:id/toggle-status", toggleTutorialStatus);

module.exports = router;
