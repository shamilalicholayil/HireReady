const multer = require("multer");
const AppError = require("../utils/AppError");
const httpStatus = require("../constants/httpStatus");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF files allowed", httpStatus.BAD_REQUEST), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
