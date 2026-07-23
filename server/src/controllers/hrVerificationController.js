const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = require("../models/User");

const getHRApplicants = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", status = "pending" } = req.query;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return next(new AppError("Invalid status filter.", 400));
  }

  const filter = { hrStatus: status };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [applicants, totalApplicants] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: "HR applicants fetched successfully.",
    applicants,
    totalApplicants,
    totalPages: Math.ceil(totalApplicants / Number(limit)),
    currentPage: Number(page),
  });
});

const approveHR = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  if (user.hrStatus !== "pending") {
    return next(new AppError("This applicant is not pending review.", 400));
  }

  user.role = "hr";
  user.hrStatus = "approved";
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "HR applicant approved.", user });
});

const rejectHR = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  if (user.hrStatus !== "pending") {
    return next(new AppError("This applicant is not pending review.", 400));
  }

  user.hrStatus = "rejected";
  user.hrRejectionReason = reason || "";
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "HR applicant rejected.", user });
});

module.exports = { getHRApplicants, approveHR, rejectHR };
