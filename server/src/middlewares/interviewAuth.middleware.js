const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Slot = require("../models/Slot");

const httpStatus = require("../constants/httpStatus");
const ROLES = require("../constants/roles");

const requireInterviewParty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const slot = await Slot.findById(id);
  if (!slot) return next(new AppError("Slot not found", httpStatus.NOT_FOUND));

  const isHR =
    req.user.role === ROLES.HR && slot.contactEmail === req.user.email;
  const isBookedUser = slot.booking?.toString() === req.user._id.toString();

  if (!isHR && !isBookedUser) {
    return next(
      new AppError("Not authorized for this interview", httpStatus.FORBIDDEN),
    );
  }

  req.slot = slot;
  next();
});

module.exports = { requireInterviewParty };
