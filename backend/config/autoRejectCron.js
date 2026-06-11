// config/autoRejectCron.js
// Runs every hour. Finds exeats that have been pending/recommended for more
// than AUTO_REJECT_HOURS without dean action, auto-rejects them, and refunds quota.
//
// To activate: add  require("./config/autoRejectCron");  in server.js
// (alongside the existing require("./config/logArchiver"))

const cron = require("node-cron");
const Exeat = require("../models/Exeat");
const StudentDetails = require("../models/StudentDetails");
const User = require("../models/User");
const logger = require("./logger");
const { sendExeatRejectedEmail } = require("./emailService");

// How long (in hours) before a pending/recommended exeat is auto-rejected.

const AUTO_REJECT_HOURS = 72;

async function runAutoReject() {
  const cutoff = new Date(Date.now() - AUTO_REJECT_HOURS * 60 * 60 * 1000);

  try {
    // Find all exeats still pending or recommended that are older than the cutoff
    const stale = await Exeat.find({
      requestStatus: { $in: ["pending", "recommended"] },
      createdAt: { $lt: cutoff },
    }).populate("user", "name email studentDetails");

    if (stale.length === 0) return;

    logger.info(`Auto-reject cron: found ${stale.length} stale exeat(s)`);

    for (const exeat of stale) {
      try {
        // Mark as rejected
        exeat.requestStatus = "rejected";
        exeat.rejectionReason = `Automatically rejected after ${AUTO_REJECT_HOURS} hours without dean action.`;
        exeat.rejectedBy = null; // No specific user rejected it
        exeat.rejectedAt = new Date();
        
        
        await exeat.save();

        // Refund the quota deducted when the request was made
        if (exeat.user?.studentDetails) {
          const student = await StudentDetails.findById(
            exeat.user.studentDetails,
          );
          if (student) {
            student.quota += 1;
            await student.save();
            logger.info(
              `Auto-reject: quota refunded for student ${exeat.user.email}`,
            );
          }
        }

        // Notify the student
        if (exeat.user?.email) {
          await sendExeatRejectedEmail(
            exeat.user.email,
            exeat.user.name,
            exeat,
            exeat.rejectionReason,
            true, // isAuto = true — uses the auto-rejection email copy
          );
        }

        logger.info(
          `Auto-rejected exeat ${exeat._id} for user ${exeat.user?.email} (created ${exeat.createdAt.toISOString()})`,
        );
      } catch (innerErr) {
        // Don't let one failure stop the rest
        logger.error(
          `Auto-reject failed for exeat ${exeat._id}: ${innerErr.message}`,
        );
      }
    }
  } catch (err) {
    logger.error(`Auto-reject cron error: ${err.message}`);
  }
}

// Run every hour at :00
// Change "0 * * * *" to e.g. "*/30 * * * *" for every 30 minutes
cron.schedule("0 * * * *", () => {
  logger.info("Auto-reject cron triggered");
  runAutoReject();
});

logger.info(
  `Auto-reject cron scheduled — rejects after ${AUTO_REJECT_HOURS}h of inactivity`,
);

module.exports = { runAutoReject }; // exported for manual testing if needed
