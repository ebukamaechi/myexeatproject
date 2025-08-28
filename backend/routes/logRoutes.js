// logRoutes.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const readLogs = require("../config/logReader");

const archiveDir = path.join(__dirname, "../", "logs", "archives");

// ✅ Route without date (latest logs)
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { keyword, page = 1, limit = 50 } = req.query;

    if (!["errors", "combined", "requests"].includes(type)) {
      return res.status(400).json({ error: "Invalid log type" });
    }

    const logs = await readLogs(
      type,
      "", // no date → fetch latest logs
      keyword,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      type,
      date: "latest",
      keyword: keyword || null,
      ...logs,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to read logs", details: err.message });
  }
});

// ✅ Route with date (specific logs)
router.get("/:type/:date", async (req, res) => {
  try {
    const { type, date } = req.params;
    const { keyword, page = 1, limit = 50 } = req.query;

    if (!["errors", "combined", "requests"].includes(type)) {
      return res.status(400).json({ error: "Invalid log type" });
    }

    const logs = await readLogs(
      type,
      type === "requests" ? "" : date, // "requests" may not use date
      keyword,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      type,
      date,
      keyword: keyword || null,
      ...logs,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to read logs", details: err.message });
  }
});

// ✅ Route to download archived logs
// Example: GET /logs/archive/2025-08
router.get("/archive/:month", (req, res) => {
  const { month } = req.params; // e.g. "2025-08"
  const filePath = path.join(archiveDir, `logs-${month}.zip`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `No archive found for ${month}` });
  }

  res.download(filePath, `logs-${month}.zip`, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Failed to download archive" });
    }
  });
});

module.exports = router;
