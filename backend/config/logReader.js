// logReader.js
const fs = require("fs");
const path = require("path");

// Base log folder
const logDir = path.join(__dirname,"../", "logs");

/**
 * Read logs from a specific file and filter by keyword
 * @param {"errors"|"combined"|"requests"} type - log type
 * @param {string} date - date in YYYY-MM-DD format (not needed for requests)
 * @param {string} keyword - optional search keyword
 */
function readLogs(type, date, keyword = "") {
  return new Promise((resolve, reject) => {
    let filePath;

    if (type === "requests") {
      // Requests rotate differently (access.log, access.log.1, etc.)
      filePath = path.join(logDir, "requests", "access.log");
    } else {
      // Error or combined logs
      filePath = path.join(logDir, type, `${type}-${date}.log`);
    }

    if (!fs.existsSync(filePath)) {
      return resolve(`No log file found for ${type} on ${date}`);
    }

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return reject(err);

      // Split logs line by line
      let lines = data.split("\n").filter(Boolean);

      // Filter by keyword if provided
      if (keyword) {
        lines = lines.filter((line) =>
          line.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      resolve(lines);
    });
  });
}

module.exports = readLogs;
