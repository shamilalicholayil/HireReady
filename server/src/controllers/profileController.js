const streamifier = require("streamifier");
const pdfParse = require("pdf-parse");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  streamUpload,
  streamUploadResume,
  streamUploadHRDocument,
} = require("../utils/cloudinaryUpload");

const User = require("../models/User");

const getProfile = catchAsync(async (req, res, next) => {
  const user = req.user._id;

  const userData = await User.findById(user).select(
    "-password -googleId -isBlocked -refreshToken -resetToken -resetTokenExpiry",
  );
  if (!userData) return next(new AppError("User not fount.", 400));

  res.status(200).json({
    success: true,
    userData,
    message: "User profile fetch successfull.",
  });
});

const updateProfile = catchAsync(async (req, res, next) => {
  const { name, bio, skills, track, age, gender } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      bio,
      skills,
      track,
      age,
      gender,
    },
    { new: true, runValidators: true },
  ).select(
    "-password -googleId -isBlocked -refreshToken -resetToken -resetTokenExpiry",
  );

  if (!updated) return next(new AppError("User not found.", 404));

  res.status(200).json({
    success: true,
    user: updated,
    message: "Profile updated successfully.",
  });
});

const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("No file uploaded.", 400));
  const buffer = req.file.buffer;

  const result = await streamUpload(buffer);

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { returnDocument: "after" },
  ).select(
    "-password -googleId -isBlocked -refreshToken -resetToken -resetTokenExpiry",
  );

  res.status(200).json({
    success: true,
    user: updated,
    message: "Avatar updated successfully.",
  });
});

const uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) throw new AppError("No file uploaded", 400);

  const data = await pdfParse(req.file.buffer);
  const text = data.text;

  const KNOWN_SKILLS = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "Express",
    "Redux",
    "Tailwind",
    "Python",
    "SQL",
    "TypeScript",
    "Git",
  ];
  const frontendSkills = ["React", "Redux", "HTML", "CSS", "Tailwind"];
  const backendSkills = ["Node.js", "Express", "MongoDB", "SQL", "Python"];

  const foundSkills = KNOWN_SKILLS.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase()),
  );

  const hasFrontend = foundSkills.some((s) => frontendSkills.includes(s));
  const hasBackend = foundSkills.some((s) => backendSkills.includes(s));

  const suggestedTrack =
    hasFrontend && hasBackend
      ? "fullstack"
      : hasFrontend
        ? "frontend"
        : hasBackend
          ? "backend"
          : "fullstack";

  const result = await streamUploadResume(req.file.buffer);
  console.log("suggestedTrack:", suggestedTrack);
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      resumeUrl: result.secure_url,
      skills: foundSkills,
      track: suggestedTrack,
    },
    { returnDocument: "after" },
  ).select(
    "-password -googleId -isBlocked -refreshToken -resetToken -resetTokenExpiry",
  );

  if (!updated) return next(new AppError("User not found.", 404));

  res.status(200).json({
    success: true,
    resumeUrl: result.secure_url,
    foundSkills,
    suggestedTrack,
    user: updated,
    message: "Resume uploaded successfully.",
  });
});

const uploadHRDocument = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Document is required.", 400));

  const uploadResult = await streamUploadHRDocument(req.file.buffer, "raw");

  req.user.hrDocuments.push({
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });
  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Document submitted for review.",
    hrDocuments: req.user.hrDocuments,
  });
});

const reapplyHR = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (user.hrStatus !== "rejected") {
    return next(new AppError("Only rejected applicants can re-apply.", 400));
  }

  if (user.hrRejectionReason) {
    user.hrRejectionHistory.push({
      reason: user.hrRejectionReason,
      rejectedAt: user.updatedAt,
    });
  }

  user.hrStatus = "pending";
  user.hrRejectionReason = "";
  user.hrDocuments = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: "Re-application submitted. Please upload a new document.",
    user,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResume,
  uploadHRDocument,
  reapplyHR,
};
