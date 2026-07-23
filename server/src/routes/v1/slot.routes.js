const { Router } = require("express");
const router = Router();

const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  requireInterviewParty,
} = require("../../middlewares/interviewAuth.middleware");
const {
  getMySlots,
  getSlotById,
  updateInterviewStatus,
} = require("../../controllers/slotController");
const {
  updateInterviewStatusSchema,
} = require("../../validators/slot.validator");

router.get("/my-interviews", protect, getMySlots);
router.get("/:id", protect, requireInterviewParty, getSlotById);
router.patch(
  "/:id/interview-status",
  protect,
  requireInterviewParty,
  validate(updateInterviewStatusSchema),
  updateInterviewStatus,
);

module.exports = router;
