const { Router } = require("express");
const router = Router();

const { protect, isHR } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  requireInterviewParty,
} = require("../../middlewares/interviewAuth.middleware");
const {
  getMySlots,
  getMyInterviewJobGroups,
  getSlotById,
  updateInterviewStatus,
  setSlotOutcome,
  scheduleNextRound,
} = require("../../controllers/slotController");
const {
  setSlotOutcomeSchema,
  scheduleNextRoundSchema,
  updateInterviewStatusSchema,
} = require("../../validators/slot.validator");

router.get("/my-interviews/jobs", protect, getMyInterviewJobGroups);
router.get("/my-interviews", protect, getMySlots);
router.get("/:id", protect, requireInterviewParty, getSlotById);
router.patch(
  "/:id/interview-status",
  protect,
  requireInterviewParty,
  validate(updateInterviewStatusSchema),
  updateInterviewStatus,
);
router.patch(
  "/:id/outcome",
  protect,
  requireInterviewParty,
  validate(setSlotOutcomeSchema),
  setSlotOutcome,
);
router.post(
  "/:id/next-round",
  protect,
  requireInterviewParty,
  validate(scheduleNextRoundSchema),
  scheduleNextRound,
);

module.exports = router;
