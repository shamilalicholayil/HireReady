const { Router } = require("express");
const router = Router();

const {
  getHRApplicants,
  approveHR,
  rejectHR,
} = require("../../controllers/hrVerificationController");

const { protect, isAdmin } = require("../../middlewares/auth.middleware");

router.use(protect);
router.use(isAdmin);

router.get("/", getHRApplicants);
router.patch("/:id/approve", approveHR);
router.patch("/:id/reject", rejectHR);

module.exports = router;
