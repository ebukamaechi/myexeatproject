const express = require("express");
const {
  getQuotaBalance,
  updateQuotaMatric,
  incrementQuotaAll,
  addPricePlan,
} = require("../controllers/quotaController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET /quota/balance  - check available quota balance
router.get(
  "/balance",
  authenticateUser,
  authorizeRoles("dean", "student", "superAdmin"),
  getQuotaBalance
);

// PUT /quota/increment  Add a quota value to all students
router.put(
  "/increment",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  incrementQuotaAll
);

router.post("/price-plan", authenticateUser, authorizeRoles("dean", "superAdmin"), addPricePlan);

// PUT /quota/onboarding/:matricNumber  - manually update quota balance
router.put(
  "/onboarding/:matricNumber",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  updateQuotaMatric
);
module.exports = router;
