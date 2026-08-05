const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";

const transports = [new winston.transports.Console()];

if (!isProduction) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});

module.exports = logger;
