const streamFileDownload = require("../utils/streamFileDownload");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const User = require("../models/User");

const httpStatus = require("../constants/httpStatus");
const ROLES = require("../constants/roles");
const HR_STATUS = require("../constants/hrStatus");

const getHRApplicants = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = HR_STATUS.PENDING,
  } = req.query;

  if (
    ![HR_STATUS.PENDING, HR_STATUS.APPROVED, HR_STATUS.REJECTED].includes(
      status,
    )
  ) {
    return next(new AppError("Invalid status filter.", httpStatus.BAD_REQUEST));
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

  res.status(httpStatus.OK).json({
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
  if (!user) return next(new AppError("User not found.", httpStatus.NOT_FOUND));
  if (user.hrStatus !== HR_STATUS.PENDING) {
    return next(
      new AppError(
        "This applicant is not pending review.",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  user.role = ROLES.HR;
  user.hrStatus = HR_STATUS.APPROVED;
  await user.save();

  res
    .status(httpStatus.OK)
    .json({ success: true, message: "HR applicant approved.", user });
});

const rejectHR = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", httpStatus.NOT_FOUND));
  if (user.hrStatus !== HR_STATUS.PENDING) {
    return next(
      new AppError(
        "This applicant is not pending review.",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  user.hrStatus = HR_STATUS.REJECTED;
  user.hrRejectionReason = reason || "";
  await user.save();

  res
    .status(httpStatus.OK)
    .json({ success: true, message: "HR applicant rejected.", user });
});

const downloadHRDocument = catchAsync(async (req, res, next) => {
  const { userId, documentId } = req.params;

  const targetUser = await User.findById(userId);
  if (!targetUser)
    return next(new AppError("User not found", httpStatus.NOT_FOUND));

  const document = targetUser.hrDocuments.id(documentId);
  if (!document)
    return next(new AppError("Document not found", httpStatus.NOT_FOUND));

  await streamFileDownload(
    res,
    document.url,
    `hr-document-${targetUser.name}.pdf`,
  );
});

module.exports = { getHRApplicants, approveHR, rejectHR, downloadHRDocument };
