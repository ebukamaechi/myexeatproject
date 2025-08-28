// logArchiver.js
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const cron = require("node-cron");

const logDir = path.join(__dirname,"../", "logs");
const archiveDir = path.join(logDir, "archives");

// Ensure archive folder exists
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// Run at midnight on the 1st day of each month
cron.schedule("0 0 1 * *", () => {
  const month = new Date().toISOString().slice(0, 7); // e.g. 2025-08
  const outputFile = path.join(archiveDir, `logs-${month}.zip`);

  const output = fs.createWriteStream(outputFile);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`✅ Logs archived: ${archive.pointer()} total bytes`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add all logs except already zipped archives
  archive.directory(path.join(logDir, "errors"), "errors");
  archive.directory(path.join(logDir, "combined"), "combined");
  archive.directory(path.join(logDir, "requests"), "requests");

  archive.finalize();
});
