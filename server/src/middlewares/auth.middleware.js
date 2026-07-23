const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new AppError("Not Authorized", 401));

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken -resetToken -resetTokenExpiry",
    );
    if (!user) return next(new AppError("Not Authorized", 401));

    if (user.isBlocked) {
      return next(new AppError("Your account has been blocked.", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Not Authorized", 401));
  }
};

const isHR = (req, res, next) => {
  if (req.user.role !== "hr") {
    return next(new AppError("You do not have HR access.", 403));
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Access denied. Admins only.", 403));
  }
  next();
};

module.exports = { protect: auth, isHR, isAdmin };
