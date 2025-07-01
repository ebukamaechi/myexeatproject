const express = require("express");
const {
  addPricePlan,
  getAllPricePlans,
  getPricePlanById,
  updatePricePlan,
  deletePricePlan,
} = require("../controllers/pricingController");

const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Add a new price plan
router.post(
  "/",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  addPricePlan
);

// Get all price plans (open to all users)
router.get("/", authenticateUser, getAllPricePlans);

// Get a single price plan by ID
router.get(
  "/:id",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  getPricePlanById
);

// Update a price plan
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  updatePricePlan
);

// Delete a price plan
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  deletePricePlan
);

module.exports = router;
