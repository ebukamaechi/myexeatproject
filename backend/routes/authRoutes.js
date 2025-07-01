// require("dotenv").config();
const express = require("express");

const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  currentUser,
} = require("../controllers/authController");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Register Route
router.post("/register", register);

// Login Route
router.post("/login", login);

// Logout Route
router.post("/logout", logout);

//forgot password
router.post("/forgot-password", forgotPassword);


//reset password
router.post("/reset-password/:token", resetPassword);

//get current user
router.get("/me", authenticateUser, currentUser);

module.exports = router;
