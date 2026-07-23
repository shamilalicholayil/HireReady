const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const streamifier = require("streamifier");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const transporter = require("../utils/mailer");

const client = require("../config/redis");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/auth.service");

const User = require("../models/User");

const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return next(new AppError("Email already in use", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const max = 999999;
  const min = 100000;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;

  await client.setEx(
    `otp:${email}`,
    300,
    JSON.stringify({
      name,
      email,
      password: hashedPassword,
      otp,
    }),
  );

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "HireReady - Verify Your Email",
    html: `
      <h3>Welcome to HireReady</h3>
      <p>Your verification code is:</p>
      <h2 style="letter-spacing: 4px;">${otp}</h2>
      <p>This code expires in 5 minutes.</p>
    `,
  });

  res.status(200).json({
    success: true,
    message: "Success. Otp has been sent",
  });
});

const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const cachedData = await client.get(`otp:${email}`);
  if (!cachedData) return next(new AppError("Otp expired.", 400));

  const pendingUser = JSON.parse(cachedData);

  if (String(otp) !== String(pendingUser.otp))
    return next(new AppError("Invalid otp.", 400));

  const newUser = await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
  });

  newUser.refreshToken = generateRefreshToken(newUser);

  await newUser.save();
  await client.del(`otp:${email}`);

  const accessToken = generateAccessToken(newUser);

  res.cookie("refreshToken", newUser.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    message: "User Registered successfuly.",
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Invalid email or password.", 400));

  if (user.isBlocked) {
    return next(
      new AppError("Your account has been blocked. Contact support.", 403),
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password", 400));
  }

  const accessToken = generateAccessToken(user);
  user.refreshToken = generateRefreshToken(user);
  await user.save();

  res.cookie("refreshToken", user.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      track: user.track,
      bio: user.bio,
      hrStatus: user.hrStatus,
      companyName: user.companyName,
      hrDocuments: user.hrDocuments,
      hrRejectionReason: user.hrRejectionReason,
    },
    message: "Login successfull.",
  });
});

const logout = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  if (!token) {
    return res.status(200).json({
      success: true,
      message: "User is already logged out.",
    });
  }

  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "Logout successfull.",
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return next(new AppError("Not authorized", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    return next(new AppError("Not authorized", 401));
  }

  const accessToken = generateAccessToken(user);
  user.refreshToken = generateRefreshToken(user);
  await user.save();

  res.cookie("refreshToken", user.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    accessToken,
    message: "Token refresh successfull.",
  });
});

const googleCallback = catchAsync(async (req, res, next) => {
  const accessToken = generateAccessToken(req.user);
  const refreshToken = generateRefreshToken(req.user);
  req.user.refreshToken = refreshToken;
  await req.user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "HireReady Password Reset",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password. Link expires in 10 minutes.</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset Password</a>
      `,
    });
  }

  res.status(200).json({
    success: true,
    message: "If that email is registered, a reset link has been sent.",
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiry: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Invalid token.", 400));

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful.",
  });
});

const registerHR = catchAsync(async (req, res, next) => {
  const { name, email, password, companyName } = req.body;

  if (!name || !email || !password || !companyName) {
    return next(new AppError("All fields are required.", 400));
  }

  const user = await User.findOne({ email });
  if (user) return next(new AppError("Email already in use", 400));

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000);

  await client.setEx(
    `otp:${email}`,
    300,
    JSON.stringify({ name, email, password: hashedPassword, companyName, otp }),
  );

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "HireReady - Verify Your HR Application Email",
    html: `<h3>HireReady HR Application</h3><p>Your code:</p><h2 style="letter-spacing:4px;">${otp}</h2><p>Expires in 5 minutes.</p>`,
  });

  res
    .status(200)
    .json({ success: true, message: "Success. Otp has been sent" });
});

const verifyOtpHR = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const cachedData = await client.get(`otp:${email}`);
  if (!cachedData) return next(new AppError("Otp expired.", 400));

  const pendingUser = JSON.parse(cachedData);
  if (String(otp) !== String(pendingUser.otp))
    return next(new AppError("Invalid otp.", 400));

  const newUser = await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password,
    companyName: pendingUser.companyName,
    role: "user",
    hrStatus: "pending",
  });

  newUser.refreshToken = generateRefreshToken(newUser);
  await newUser.save();
  await client.del(`otp:${email}`);

  const accessToken = generateAccessToken(newUser);
  res.cookie("refreshToken", newUser.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      hrStatus: newUser.hrStatus,
      companyName: newUser.companyName,
      hrDocuments: newUser.hrDocuments,
    },
    message:
      "HR application created. Please upload your verification document.",
  });
});

module.exports = {
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
};
