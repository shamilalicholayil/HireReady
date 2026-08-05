const { Router } = require("express");
const router = Router();

const { protect, isHR } = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createJobSchema,
  updateApplicationStatusSchema,
  scheduleApplicantInterviewSchema,
} = require("../../validators/job.validator");
const {
  createJob,
  getActiveJobs,
  getJobById,
  getMyJobPostings,
  toggleJobStatus,
  applyToJob,
  getApplicationsForJob,
  updateApplicationStatus,
  closeJob,
  scheduleApplicantInterview,
} = require("../../controllers/jobController");
const AppError = require("../../utils/AppError");

router.get("/", protect, getActiveJobs);
router.get("/my-postings", protect, isHR, getMyJobPostings);
router.get("/:id", protect, getJobById);
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
router.patch("/:id/close", protect, isHR, closeJob);
router.post(
  "/applications/:appId/schedule",
  protect,
  isHR,
  validate(scheduleApplicantInterviewSchema),
  scheduleApplicantInterview,
);

module.exports = router;
