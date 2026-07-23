const passport = require("passport");
const { Router } = require("express");
const router = Router();

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

router.post("/register", register);
router.post("/register/verify", verifyOtp);

router.post("/register-hr", registerHR);
router.post("/register-hr/verify", verifyOtpHR);

router.post("/login", login);
router.post("/logout", logout);

router.post("/refresh", refreshToken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

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
