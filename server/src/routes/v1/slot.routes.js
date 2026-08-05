const { Router } = require("express");
const router = Router();

const { protect, isHR } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  requireInterviewParty,
} = require("../../middlewares/interviewAuth.middleware");
const {
  createSlot,
  getMySlots,
  getSlotById,
  updateInterviewStatus,
} = require("../../controllers/slotController");
const {
  createSlotSchema,
  updateInterviewStatusSchema,
} = require("../../validators/slot.validator");

router.post("/", protect, isHR, validate(createSlotSchema), createSlot);
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
