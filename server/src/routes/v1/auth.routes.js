const passport = require("passport");
const { Router } = require("express");
const router = Router();

const validate = require("../../middlewares/validate.middleware");
const {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerHRSchema,
  verifyOtpHRSchema,
} = require("../../validators/auth.validator");

const {
  register,
  verifyOtp,
  login,
  logout,
  refreshToken,
  googleCallback,
  forgotPassword,
  resetPassword,

  registerHR,
  verifyOtpHR,
} = require("../../controllers/authController");

router.post("/register", validate(registerSchema), register);
router.post("/register/verify", validate(verifyOtpSchema), verifyOtp);

router.post("/register-hr", validate(registerHRSchema), registerHR);
router.post("/register-hr/verify", validate(verifyOtpHRSchema), verifyOtpHR);

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

router.post("/refresh", refreshToken);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword,
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback,
);

module.exports = router;
