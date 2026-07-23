const { Router } = require("express");
const router = Router();

const { protect, isHR } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createJobSchema,
  updateApplicationStatusSchema,
  closeJobAndScheduleSchema,
} = require("../../validators/job.validator");
const {
  createJob,
  getActiveJobs,
  getMyJobPostings,
  toggleJobStatus,
  applyToJob,
  getApplicationsForJob,
  updateApplicationStatus,
  closeJobAndSchedule,
} = require("../../controllers/jobController");
const AppError = require("../../utils/AppError");

router.get("/", protect, getActiveJobs);
router.get("/my-postings", protect, isHR, getMyJobPostings);
router.post("/", protect, isHR, validate(createJobSchema), createJob);
router.patch("/:id/toggle-status", protect, isHR, toggleJobStatus);
router.post("/:id/apply", protect, applyToJob);
router.get("/:id/applications", protect, isHR, getApplicationsForJob);
router.patch(
  "/applications/:appId/status",
  protect,
  isHR,
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);
router.post(
  "/:id/close-and-schedule",
  protect,
  isHR,
  validate(closeJobAndScheduleSchema),
  closeJobAndSchedule,
);

module.exports = router;
