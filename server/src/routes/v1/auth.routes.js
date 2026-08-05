const passport = require("passport");
const { Router } = require("express");
const router = Router();

const validate = require("../../middlewares/validate.middleware");
const createRateLimiter = require("../../middlewares/rateLimiter.middleware");
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

const loginLimiter = createRateLimiter({
  keyPrefix: "rl_login",
  points: 5,
  duration: 900, // 15 min
  keyBy: "ip",
});

router.post("/register", loginLimiter, validate(registerSchema), register);
router.post(
  "/register/verify",
  loginLimiter,
  validate(verifyOtpSchema),
  verifyOtp,
);

router.post(
  "/register-hr",
  loginLimiter,
  validate(registerHRSchema),
  registerHR,
);
router.post(
  "/register-hr/verify",
  loginLimiter,
  validate(verifyOtpHRSchema),
  verifyOtpHR,
);

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", logout);

router.post("/refresh", refreshToken);

router.post(
  "/forgot-password",
  loginLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  loginLimiter,
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
