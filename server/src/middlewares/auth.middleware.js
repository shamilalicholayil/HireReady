const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const User = require("../models/User");

const httpStatus = require("../constants/httpStatus");
const ROLES = require("../constants/roles");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return next(new AppError("Not Authorized", httpStatus.UNAUTHORIZED));

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken -resetToken -resetTokenExpiry",
    );
    if (!user)
      return next(new AppError("Not Authorized", httpStatus.UNAUTHORIZED));

    if (user.isBlocked) {
      return next(
        new AppError("Your account has been blocked.", httpStatus.FORBIDDEN),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Not Authorized", httpStatus.UNAUTHORIZED));
  }
};

const isHR = (req, res, next) => {
  if (req.user.role !== ROLES.HR) {
    return next(
      new AppError("You do not have HR access.", httpStatus.FORBIDDEN),
    );
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return next(
      new AppError("Access denied. Admins only.", httpStatus.FORBIDDEN),
    );
  }
  next();
};

module.exports = { protect: auth, isHR, isAdmin };
