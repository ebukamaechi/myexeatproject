// logger.js
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const { combine, timestamp, printf, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Paths
const logDir = path.join(__dirname, "../", "logs");

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join(logDir, "errors", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
    //   maxFiles: "14d", // keep 14 days
    }),

    // Combined logs
    new DailyRotateFile({
      filename: path.join(logDir, "combined", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d", // keep 30 days
    }),
  ],
});

// Console in dev
if (process.env.NODE_ENV == "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
