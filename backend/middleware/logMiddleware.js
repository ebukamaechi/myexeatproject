// logMiddleware.js
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const path = require("path");

// Create rotating stream for requests
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname,"../", "logs", "requests"),
});

const requestLogger = morgan("combined", { stream: accessLogStream });

module.exports = requestLogger;
