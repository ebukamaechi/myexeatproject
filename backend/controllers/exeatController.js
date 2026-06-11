const Exeat = require("../models/Exeat");
const StudentDetails = require("../models/StudentDetails");
const User = require("../models/User");
const Debt = require("../models/Debt");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const logger = require("../config/logger");
const {
  sendExeatApprovedEmail,
  sendExeatRejectedEmail,
  sendExeatRecommendedEmail,
  sendExeatRequestedEmail,
  sendDepartureConfirmedEmail,
  sendReturnConfirmedEmail,
  sendLateReturnDebtEmail,
} = require("../config/emailService");

exports.requestExeat = async (req, res) => {
  try {
    const student = await StudentDetails.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ error: "Student details not found" });
    }

    const activeExeat = await Exeat.findOne({
      user: req.user.id,
      requestStatus: { $in: ["pending", "recommended"] },
    });
    if (activeExeat) {
      return res.status(400).json({
        message: `You already have a request that is still ${activeExeat.requestStatus}. Wait for it to be resolved or cancel it first.`,
      });
    }

    const userDoc = await User.findById(req.user.id);
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    if (student.quota <= 0) {
      return res
        .status(400)
        .json({ error: "Quota exhausted. Cannot request new exeat." });
    }

    const { destination, purpose, departureDate, returnDate } = req.body;
    if (!destination || !purpose || !departureDate || !returnDate) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (new Date(returnDate) <= new Date(departureDate)) {
      return res
        .status(400)
        .json({ error: "Return date must be after departure date" });
    }
    const newExeat = new Exeat({
      user: req.user.id,
      matricNumber: userDoc.matricNumber,
      destination,
      purpose,
      departureDate,
      returnDate,
      qrToken: uuidv4(),
    });

    await newExeat.save();

    // Deduct 1 from quota
    student.quota -= 1;
    await student.save();

    //notify hostel admins of the new request
    const hostelAdmins = await User.find({ role: "hostelAdmin" }).select(
      "email",
    );
    for (const admin of hostelAdmins) {
      await sendExeatRequestedEmail(admin.email, userDoc, newExeat);
    }
    logger.info(`Exeat requested by user ${req.user.id} → ${destination}`);
    res
      .status(201)
      .json({ message: "Exeat requested successfully", exeat: newExeat });
    logger.info(
      `Exeat requested by user ${req.user.id} → Destination: ${destination}, Purpose: ${purpose}`,
    );
  } catch (err) {
    console.error(err);
    logger.error(
      `Error requesting exeat for user ${req.user.id}: ${err.message}`,
    );
    res.status(500).json({ error: "Error requesting exeat" });
  }
};

exports.getAllExeats = async (req, res) => {
  try {
    const exeats = await Exeat.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "email role studentDetails",
        populate: {
          path: "studentDetails",
          select: "firstName middleName lastName",
        },
      })
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("approvedBy", "name email role approvalDate")
      .populate("securityCheckedBy", "name email role");
    res.json(exeats);
  } catch (err) {
    res.status(500).json({ error: "Error fetching exeats" });
  }
};

exports.getOwnExeat = async (req, res) => {
  try {
    const myExeats = await Exeat.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(myExeats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your exeats" });
  }
};

exports.getExeatStatsForStudent = async (req, res) => {
  try {
    console.log("User from token:", req.user); // 👈 Add this
    // const studentId = req.user.id;

    const exeats = await Exeat.find({ user: req.user.id });

    const totalRequests = exeats.length;
    const pendingRequests = exeats.filter(
      (e) => e.requestStatus === "pending",
    ).length;
    const rejectedRequests = exeats.filter(
      (e) => e.requestStatus === "rejected",
    ).length;
    const approvedRequests = exeats.filter(
      (e) => e.requestStatus === "approved",
    ).length;

    res.json({
      totalRequests,
      pendingRequests,
      rejectedRequests,
      approvedRequests,
    });
  } catch (error) {
    // console.error("Error in stats route:", error);
    res.status(500).json({ message: "Server Error: " + error });
  }
};

exports.recommendExeat = async (req, res) => {
  try {
    const exeat = await Exeat.findById(req.params.id).populate(
      "user",
      "name email matricNumber",
    );
    if (!exeat) return res.status(404).json({ error: "Exeat not found" });

    exeat.requestStatus = "recommended";
    exeat.recommendedBy = req.user.id;
    exeat.recommendationDate = new Date();
    await exeat.save();

    //notify deans of the recommendation
    const deans = await User.find({ role: "dean" }).select("email");
    for (const dean of deans) {
      await sendExeatRecommendedEmail(dean.email, exeat.user, exeat);
    }

    res.json({ message: "Exeat recommended", exeat });
    logger.info(`Exeat ${exeat._id} recommended by user ${req.user.email}`);
  } catch (err) {
    res.status(500).json({ error: "Error recommending exeat" });
    logger.error(`FunctionName: ${err.message}`);
  }
};

exports.getRecommendedExeats = async (req, res) => {
  try {
    const exeats = await Exeat.find({ requestStatus: "recommended" })
      .populate("user", "name email matricNumber role")
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("approvedBy", "name email role approvalDate")
      .populate("securityCheckedBy", "name email role");
    if (!exeats) return res.status(404).json({ message: "Exeats not found" });
    res.status(200).json({ exeats });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error: " + error.message });
    logger.error(`FunctionName: ${err.message}`);
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const exeat = await Exeat.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!exeat) {
      logger.warn(`Approve failed - Exeat ${req.params.id} not found`);
      return res.status(404).json({ error: "Exeat not found" });
    }

    exeat.requestStatus = "approved";
    exeat.approvedBy = req.user.id;
    exeat.approvalDate = new Date();
    await exeat.save();

    // send approval email to student
    if (exeat.user?.email) {
      await sendExeatApprovedEmail(exeat.user.email, exeat.user.name, exeat);
    }
    logger.info(`Exeat ${exeat._id} approved by user ${req.user.email}`);
    res.json({ message: "Exeat approved", exeat });
  } catch (err) {
    logger.error(`Error approving exeat ${req.params.id}: ${err.message}`);
    res.status(500).json({ error: "Error approving exeat" });
  }
};

exports.rejectExeat = async (req, res) => {
  try {
    const exeat = await Exeat.findById(req.params.id).populate(
      "user",
      "name email studentDetails",
    );
    if (!exeat) return res.status(404).json({ error: "Exeat not found" });

    const reason =
      req.body.rejectionReason || "Your exeat request has been rejected";
    exeat.requestStatus = "rejected";
    exeat.rejectedBy = req.user.id;
    exeat.rejectedAt = new Date();
    exeat.rejectionReason = reason;
    await exeat.save();

    //refund quota back to student
    if (exeat.user?.studentDetails) {
      const student = await StudentDetails.findById(exeat.user.studentDetails);
      if (student) {
        student.quota += 1;
        await student.save();
      }
    }
    //notify student of the rejection
    if (exeat.user?.email) {
      await sendExeatRejectedEmail(
        exeat.user.email,
        exeat.user.name,
        exeat,
        reason,
        false,
      );
    }

    res.json({ message: "Exeat rejected", exeat });
    logger.info(`Exeat ${exeat._id} rejected by user ${req.user.email}`);
  } catch (err) {
    res.status(500).json({ error: "Error rejecting exeat" });
    logger.error(`FunctionName: ${err.message}`);
  }
};

exports.deleteExeat = async (req, res) => {
  try {
    const exeat = await Exeat.findByIdAndDelete(req.params.id);
    if (!exeat) return res.status(404).json({ error: "Exeat not found" });

    res.json({ message: "Exeat deleted successfully" });
    logger.info(`Exeat ${exeat._id} deleted by user ${req.user.email}`);
  } catch (err) {
    res.status(500).json({ error: "Error deleting exeat" });
  }
};

exports.getExeatById = async (req, res) => {
  try {
    const { exeatId } = req.params;

    const exeat = await Exeat.findById(exeatId)
      .populate("user", "name email matricNumber role")
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("rejectedBy", "name email role rejectedAt")
      .populate("approvedBy", "name email role approvalDate signature")
      .populate("securityCheckedBy", "name email role")
      .lean();

    if (!exeat) {
      return res.status(404).json({ error: "Exeat not found" });
    }

    const studentDetails = await StudentDetails.findOne({
      user: exeat.user._id,
    }).lean();

    exeat.studentDetails = studentDetails || null;
    res.json(exeat);
  } catch (error) {
    console.error("Server Error while fetching exeat:", error.message);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};
exports.getExeatByMatric = async (req, res) => {
  try {
    const { matricNumber } = req.params;

    const exeats = await Exeat.find({ matricNumber })
      .populate("user", "name email matricNumber")
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("approvedBy", "name email role approvalDate")
      .populate("securityCheckedBy", "name email role");
    if (!exeats.length) {
      return res
        .status(404)
        .json({ error: "No exeats found for this student" });
    }

    res.json(exeats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error while fetching exeats" });
  }
};

exports.getExeatByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const exeats = await Exeat.find({ user: userId })
      .populate("user", "name email matricNumber")
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("approvedBy", "name email role approvalDate")
      .populate("securityCheckedBy", "name email role")
      .sort({ createdAt: -1 });

    if (!exeats.length) {
      return res
        .status(404)
        .json({ error: "No exeats found for this student" });
    }

    res.json(exeats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error while fetching exeats" });
  }
};

exports.getExeatByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["pending", "recommended", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status filter" });
    }

    const exeats = await Exeat.find({ requestStatus: status })
      .populate("user", "name email matricNumber")
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("approvedBy", "name email role approvalDate");

    if (!exeats.length) {
      return res.status(404).json({ error: "No exeats found for this status" });
    }

    res.json(exeats);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Server error while filtering exeats by status" });
  }
};

exports.getExeatByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res
        .status(400)
        .json({ error: "Both 'from' and 'to' dates are required." });
    }
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const exeats = await Exeat.find({
      departureDate: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).populate("user", "name email role");

    res.json(exeats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching exeats by date range" });
  }
};

exports.getExeatByStatusAndDateRange = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    if (!from || !to) {
      return res
        .status(400)
        .json({ error: "'from' and 'to' query parameters are required." });
    }

    const filter = {};

    if (status) {
      filter.requestStatus = status;
    }

    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    if (isNaN(fromDate) || isNaN(toDate)) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    if (fromDate && toDate) {
      filter.departureDate = {
        $gte: fromDate,
        $lte: toDate,
      };
    }

    const exeats = await Exeat.find(filter)
      .populate("user", "name email matricNumber")
      .populate("recommendedBy", "name email role recommendationDate")
      .populate("approvedBy", "name email role approvalDate");

    res.json(exeats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error filtering exeats" });
  }
};

exports.emergencyExeat = async (req, res) => {
  const approver = req.user.id; // Use 'const' to avoid polluting global scope

  try {
    const { matricNumber, destination, purpose, departureDate, returnDate } =
      req.body;

    // Validate input
    if (
      !matricNumber ||
      !destination ||
      !purpose ||
      !departureDate ||
      !returnDate
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the user exists
    const user = await User.findOne({ matricNumber });
    if (!user) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get student details
    const student = await StudentDetails.findOne({ user: user._id });
    if (!student) {
      return res.status(404).json({ error: "Student details not found" });
    }

    // Create new emergency exeat
    const newExeat = new Exeat({
      user: user._id,
      matricNumber,
      destination,
      purpose,
      departureDate,
      returnDate,
      requestStatus: "approved",
      approvedBy: approver,
      approvalDate: new Date(),
      isEmergency: true,
      qrToken: uuidv4(),
    });

    await newExeat.save();

    res.status(201).json({
      message: "Emergency exeat created and approved",
      exeat: newExeat,
    });
    logger.info(
      `Emergency Exeat ${newExeat._id} created by user ${req.user.id} for ${matricNumber}`,
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error requesting emergency exeat" });
  }
};

//./generate-qr/:exeatId
exports.generateQRCode = async (req, res) => {
  const { exeatId } = req.params;
  if (!exeatId) {
    return res.status(400).json({ error: "Exeat ID is required" });
  }

  try {
    const exeat = await Exeat.findById(exeatId);
    if (!exeat) return res.status(404).json({ message: "Exeat not found" });
    // if (!exeat.qrToken) {
    //   return res
    //     .status(400)
    //     .json({ error: "QR Token not found for this exeat" });
    // }
    // Ensure qrToken exists
    if (!exeat.qrToken) {
      exeat.qrToken = uuidv4();
      await exeat.save(); // Save it to the DB
    }

    // const qrData = `${process.env.BACKEND_URL}/api/exeats/scan/${exeat.qrToken}`;
    const qrData = exeat.qrToken;
    const qrImage = await QRCode.toDataURL(qrData);

    res.status(200).json({ qrImage });
  } catch (err) {
    res
      .status(500)
      .json({ error: "QR generation failed", details: err.message });
    logger.error(`FunctionName: ${err.message}`);
  }
};

//security Scan QR
exports.scanQRCode = async (req, res) => {
  const { qrToken } = req.params;
  if (!qrToken) {
    return res.status(400).json({ error: "QR token is required" });
  }

  try {
    const exeat = await Exeat.findOne({ qrToken }).populate(
      "user",
      "name matricNumber email",
    );
    if (!exeat) {
      logger.warn(`Invalid QR scan attempt with token ${qrToken}`);
      return res.status(404).json({ error: "Exeat not found or Invalid QR" });
    }

    // if (exeat.isUsed) {
    //   logger.warn(`QR scan rejected - Exeat ${exeat._id} already used`);
    //   return res.status(400).json({ message: "Exeat already used" });
    // }

    if (exeat.requestStatus !== "approved") {
      logger.warn(
        `QR scan blocked - Exeat ${exeat._id} still in status: ${exeat.requestStatus}`,
      );
      return res.status(400).json({
        message: `Exeat not approved yet! Status: ${exeat.requestStatus}`,
      });
    }

    logger.info(
      `QR scanned successfully for Exeat ${exeat._id} by ${
        req.user.id || "security"
      }`,
    );
    res.status(200).json({ message: "Exeat is valid", exeat });
  } catch (err) {
    logger.error(`Error scanning QR ${qrToken}: ${err.message}`);
    res.status(500).json({ error: "Scan failed", details: err.message });
  }
};

//mark exeat as used after physical check/
//not scanned to reach this endpoint. a direct request with the qrToken as a parameter is sent to this endpoint
//with a button after scanning qr on first instance //. /qr/use/:qrToken
exports.markExeatAsUsed = async (req, res) => {
  const { qrToken } = req.params;

  if (!qrToken) {
    return res.status(400).json({ error: "QR token is required" });
  }

  try {
    const exeat = await Exeat.findOne({ qrToken });
    if (!exeat) {
      return res.status(404).json({ error: "Exeat not found" });
    }
    if (exeat.requestStatus !== "approved") {
      return res.status(400).json({
        error: `Exeat not approved yet! still on ${exeat.requestStatus}`,
      });
    }

    if (exeat.requestStatus === "approved" && !exeat.departedAt) {
      exeat.isUsed = true;
      exeat.requestStatus = "used";
      exeat.departedAt = now;
      exeat.securityCheck = new Date(); // Mark the time of security check
      exeat.securityCheckedBy = req.user.id; // Mark the user who checked the exeat
      await exeat.save();

      if (exeat.user?.email) {
        await sendDepartureConfirmedEmail(
          exeat.user.email,
          exeat.user.name,
          exeat,
        );
      }
      logger.info(
        `Exeat ${exeat._id} DEPARTURE confirmed by security ${req.user.id}`,
      );
      res.status(200).json({ message: "Departure confirmed", exeat });
      logger.info(
        `Exeat ${exeat._id} marked as used by ${req.user.id || "security"}`,
      );
    }
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ error: "Error marking exeat as used", message: err.message });
  }
};

exports.markExeatAsReturned = async (req, res) => {
  const { qrToken } = req.params;

  if (!qrToken) {
    return res.status(400).json({ error: "QR token is required" });
  }

  try {
    const exeat = await Exeat.findOne({ qrToken });
    if (!exeat) {
      return res.status(404).json({ error: "Exeat not found" });
    }
    if (exeat.requestStatus !== "approved") {
      return res.status(400).json({
        error: `Exeat not approved yet — still on ${exeat.requestStatus}`,
      });
    }

    // ── RETURN SCAN ────────────────────────────────────────────────
    if (
      exeat.requestStatus === "used" &&
      exeat.departedAt &&
      !exeat.returnedAt
    ) {
      const now = new Date();
      exeat.hasReturned = true;
      exeat.returnedAt = now;
      exeat.requestStatus = "returned";
      exeat.securityCheck = now;
      exeat.securityReturnedCheckedBy = req.user.id;
      await exeat.save();

      // ── Debt check: was the student late? ──────────────────────────────────
      let debtCreated = null;
      const returnDate = new Date(exeat.returnDate);
      returnDate.setHours(23, 59, 59, 999); // give until end of return day

      if (now > returnDate) {
        // Check if a debt record already exists for this exeat (idempotency)
        const existingDebt = await Debt.findOne({ exeat: exeat._id });

        if (!existingDebt) {
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysLate = Math.max(
            1,
            Math.ceil((now - returnDate) / msPerDay),
          );

          debtCreated = await Debt.create({
            user: exeat.user._id,
            exeat: exeat._id,
            matricNumber: exeat.matricNumber,
            returnDate: exeat.returnDate,
            checkedInAt: now,
            dailyRate: 10000,
            status: "active",
          });

          if (exeat.user?.email) {
            await sendLateReturnDebtEmail(
              exeat.user.email,
              exeat.user.name,
              exeat,
              debtCreated,
            );
          }

          logger.warn(
            `Late return: Debt of ₦${debtCreated.currentAmount.toLocaleString()} created for student ${exeat.matricNumber} on exeat ${exeat._id}`,
          );
        }
      } else {
        if (exeat.user?.email) {
          await sendReturnConfirmedEmail(
            exeat.user.email,
            exeat.user.name,
            exeat,
          );
        }
      }
    }

    logger.info(
      `Exeat ${exeat._id} Returned and marked as used by Security: ${req.user.id || "security"}`,
    );

    res.status(200).json({
      message: debtCreated
        ? `Return confirmed. Student was ${debtCreated.daysLate} day(s) late. Fine of ₦${debtCreated.currentAmount.toLocaleString()} applied.`
        : "Return confirmed. Student returned on time.",
      exeat,
      debt: debtCreated
        ? {
            created: true,
            amount: debtCreated.currentAmount,
            daysLate: debtCreated.daysLate,
            message: `Student returned ${debtCreated.daysLate} day(s) late. Debt of ₦${debtCreated.currentAmount.toLocaleString()} has been recorded.`,
          }
        : { created: false },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Error marking exeat as returned",
      message: err.message,
    });
  }
};

exports.trackExeatStatus = async (req, res) => {
  const { exeatId } = req.params;
  if (!exeatId)
    return res.status(400).json({ message: "Exeat ID is required!" });
  try {
    const exeat = await Exeat.findById(exeatId);
    if (!exeat) return res.status(404).json({ message: "Exeat not found!" });
    trackStatus = exeat.requestStatus;
    res.status(200).json({ trackStatus });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Error marking exeat as used", message: error.message });
  }
};

exports.cancelPendingExeats = async (req, res) => {
  const userId = req.user.id;
  const { exeatId } = req.params;
  try {
    const exeat = await Exeat.findOne({ _id: exeatId, user: userId });
    if (!exeat) return res.status(404).json({ message: "Exeat not found" });
    if (exeat.requestStatus !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending exeats can be cancelled" });

    exeat.requestStatus = "cancelled";
    await exeat.save();
    res.status(200).json({ message: "exeat request cancelled!", exeat });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Error marking exeat as used", message: error.message });
  }
};
