const httpStatus = require("../constants/httpStatus");
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong.";
  logger.error(message);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

module.exports = errorMiddleware;
