const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  newFeedback,
  getAllFeedback,
  getOneFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

router.get("/", authenticateUser, getAllFeedback);
router.post("/", authenticateUser, newFeedback);
router.get("/:id", authenticateUser, getOneFeedback);
router.put("/:id", authenticateUser);
router.delete("/:id", authenticateUser, deleteFeedback);

module.exports = router;
