const multer = require("multer");
const AppError = require("../utils/AppError");

const storage = multer.memoryStorage();

const LIMITS_BY_PREFIX = {
  "image/": 10 * 1024 * 1024,
  "video/": 100 * 1024 * 1024,
  "audio/": 100 * 1024 * 1024,
};
const RAW_LIMIT = 10 * 1024 * 1024;

const ALLOWED_EXACT_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip",
];

const fileFilter = (req, file, cb) => {
  const matchedPrefix = Object.keys(LIMITS_BY_PREFIX).find((p) =>
    file.mimetype.startsWith(p),
  );
  if (matchedPrefix || ALLOWED_EXACT_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(`File type ${file.mimetype} is not supported.`, 400),
      false,
    );
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});
