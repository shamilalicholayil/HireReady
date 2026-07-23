const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong.";
  logger.error(message);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

module.exports = errorMiddleware;
