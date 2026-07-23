const { Router } = require("express");
const router = Router();

const {
  createSession,
  getMySessions,
  getSessionById,
} = require("../../controllers/sessionController.js");
const { protect } = require("../../middlewares/auth.middleware.js");

router.use(protect);

router.post("/", createSession);
router.get("/me", getMySessions);
router.get("/:id", getSessionById);

module.exports = router;
