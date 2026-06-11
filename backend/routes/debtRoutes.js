// routes/debtRoutes.js
const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  getAllDebts,
  getStudentDebts,
  getMyDebts,
  settleDebt,
  checkStudentDebtStatus,
  aiAnalyseStudent,
  aiSuggestRejectionReason,
} = require("../controllers/debtController");

// Student: view their own debts
router.get(
  "/my-debts",
  authenticateUser,
  authorizeRoles("student"),
  getMyDebts,
);

// Student: check if they have active debts (used before exeat request form)
router.get(
  "/my-status",
  authenticateUser,
  authorizeRoles("student"),
  checkStudentDebtStatus,
);

// Admin/Dean: get all debts (optional ?status=active|settled query param)
router.get(
  "/",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  getAllDebts,
);

// Admin/Dean: get debts for a specific student
router.get(
  "/student/:userId",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "superAdmin"),
  getStudentDebts,
);

// Admin/Dean: check a student's debt status (for exeat review)
router.get(
  "/student/:userId/status",
  authenticateUser,
  authorizeRoles("hostelAdmin", "dean", "superAdmin"),
  checkStudentDebtStatus,
);

// Dean/SuperAdmin: settle (clear) a debt
router.put(
  "/:debtId/settle",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  settleDebt,
);

// AI: full student risk analysis (dean / superAdmin)
router.get(
  "/ai/analyse/:userId",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  aiAnalyseStudent,
);

// AI: suggest rejection reasons for a specific exeat (dean / superAdmin)
router.get(
  "/ai/rejection-reasons/:exeatId",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  aiSuggestRejectionReason,
);

module.exports = router;
