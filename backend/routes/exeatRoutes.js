const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  requestExeat,
  getAllExeats,
  getOwnExeat,
  recommendExeat,
  getRecommendedExeats,
  approveRequest,
  rejectExeat,
  deleteExeat,
  getExeatById,
  getExeatByMatric,
  getExeatByStatus,
  getExeatByDateRange,
  getExeatByStatusAndDateRange,
  emergencyExeat,
  generateQRCode,
  scanQRCode,
  markExeatAsUsed,
  trackExeatStatus,
  cancelPendingExeats,
  getExeatStatsForStudent
} = require("../controllers/exeatController");

// 1. Request exeat (students only)
router.post("/request", authenticateUser, authorizeRoles("student"), requestExeat);

// 2. Get all exeats (admins)
router.get(
  "/",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "superAdmin"),
  getAllExeats
);

// 3. Get own exeats (students)
router.get(
  "/my-exeats",
  authenticateUser,
  authorizeRoles("student"),
  getOwnExeat
);

// 4. Recommend exeat
router.put(
  "/recommend/:id",
  authenticateUser,
  authorizeRoles("hostelAdmin"),
  recommendExeat
);

router.get(
  "/recommended",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  getRecommendedExeats
);

// 5. Approve exeat
router.put(
  "/approve/:id",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  approveRequest
);

// 6. Reject exeat
router.put(
  "/reject/:id",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "superAdmin"),
  rejectExeat
);



// 8. GET exeat by ID (Everybody)
router.get("/id/:exeatId", authenticateUser, getExeatById);

// 9. GET exeats by student matric number
router.get(
  "/student/:matricNumber",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "security", "superAdmin"),
  getExeatByMatric
);

// 10. GET exeats by status
router.get(
  "/status/:status",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "security", "superAdmin"),
  getExeatByStatus
);

// 11. GET exeats within date range
router.get(
  "/date-range",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "security", "superAdmin"),
  getExeatByDateRange
);

// 12. GET exeats filtered by status and date range
router.get(
  "/filter",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "security", "superAdmin"),
  getExeatByStatusAndDateRange
);

// 13. Emergency exeat (deans and superAdmin only)
router.post(
  "/emergency",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  emergencyExeat
);
// 14. Generate QR code for exeat
router.get(
  "/generate-qr/:exeatId",
  authenticateUser,
  authorizeRoles("student", "hostelAdmin", "dean", "superAdmin"),
  generateQRCode
);
//15. Scan QR code (security only)
router.post(
  "/scan/:qrToken",
  authenticateUser,
  authorizeRoles("security", "superAdmin"),
  scanQRCode
);

// 16. Mark exeat as used (security only)
router.put(
  "/mark-used/:qrToken",
  authenticateUser,
  authorizeRoles("security", "superAdmin"),
  markExeatAsUsed
);

//tracking exeat status (everybody)
router.get(
  "/track-status/:exeatId",
  authenticateUser,
  authorizeRoles("student", "security", "hostelAdmin", "dean", "superAdmin"),
  trackExeatStatus
);

//cancel pending exeats
router.post(
  "/cancel/:exeatId",
  authenticateUser,
  authorizeRoles("student", "superAdmin", "dean"),
  cancelPendingExeats
);
// Get exeat stats for student
router.get(
  "/stats",
  authenticateUser,
  authorizeRoles("student", "hostelAdmin", "dean", "superAdmin"),
  getExeatStatsForStudent
);

// 7. Delete exeat (superAdmin only)
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("superAdmin"),
  deleteExeat
);











module.exports = router;
