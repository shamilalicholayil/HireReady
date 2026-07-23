const { Router } = require("express");
const router = Router();

const upload = require("../../middlewares/multer.middleware");
const resume = require("../../middlewares/multer.resume.middleware");

const {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResume,
  uploadHRDocument,
  reapplyHR,
} = require("../../controllers/profileController");

const validate = require("../../middlewares/validate.middleware");
const { updateProfileSchema } = require("../../validators/profile.validator");
const { protect } = require("../../middlewares/auth.middleware");

router.use(protect);

router.get("/me", getProfile);
router.put("/me", validate(updateProfileSchema), updateProfile);
router.put("/me/avatar", upload.single("avatar"), uploadAvatar);
router.post("/me/resume", resume.single("resume"), uploadResume);
router.post("/me/hr-document", resume.single("document"), uploadHRDocument);
router.patch("/me/reapply-hr", reapplyHR);

module.exports = router;
