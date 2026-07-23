const { Router } = require("express");
const router = Router();

const {
  getPublicTutorials,
  getTutorialById,
} = require("../../controllers/tutorialController");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

router.get("/", getPublicTutorials);
router.get("/:id", getTutorialById);

module.exports = router;
