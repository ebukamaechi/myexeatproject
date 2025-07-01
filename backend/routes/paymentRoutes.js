const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  saveDetails,
  verifyPayment,
  deletePayment,
  getAllPayments,
  getRefPayment,
  getUserPayments,
  webhook,
} = require("../controllers/paymentController");

//1. saving details
router.post("/initiate", authenticateUser, authorizeRoles("student"), saveDetails);

//2. verify payments
router.post(
  "/verify",
  authenticateUser,
  authorizeRoles("student", "hostelAdmin", "dean", "superAdmin"),
  verifyPayment
);

//4. get all payments
router.get(
  "/",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  getAllPayments
);
//5. get payment by reference
router.get(
  "/reference/:reference",
  authenticateUser,
  authorizeRoles("student", "hostelAdmin", "dean", "superAdmin"),
  getRefPayment
);
//6. get all payments made by a user
router.get(
  "/user/:userId",
  authenticateUser,
  authorizeRoles("student", "hostelAdmin", "dean", "superAdmin"),
  getUserPayments
);
//7. webhook
router.post("/webhook", webhook);
//3. delete payment
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("student", "hostelAdmin", "dean", "superAdmin"),
  deletePayment
);
module.exports = router;
