const express = require("express");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {addStudentDetailsAdmins, addStudentDetailsStudents, updateStudentDetails, deleteStudentDetails, getStudentDetailsAdmins, getStudentDetailsStudents, updateStudentDetailsStudents} = require("../controllers/studentController");

const router = express.Router();

// Add student details (only LOGGED-IN students can use this route to do this)
router.post(
  "/details",
  authenticateUser,
  authorizeRoles("student"),
addStudentDetailsStudents
);
// PUT /students/:userId/details
router.put(
  "/update/:userId",
  authenticateUser,
  authorizeRoles("student"),
 updateStudentDetailsStudents
);

// Add student details (only superAdmin or dean can do this)
router.post(
  "/:matricNumber/details",
  authenticateUser,
  authorizeRoles("superAdmin", "dean"),
addStudentDetailsAdmins
);

// Get student details (can be used by superAdmin, security or dean themselves)
router.get("/:userId/details", authenticateUser, authorizeRoles("superAdmin", "dean", "security"),
getStudentDetailsAdmins
);


// Get student details (LOGGEDIN STUDENTS )
router.get(
  "/",
  authenticateUser,
  authorizeRoles( "student"),
getStudentDetailsStudents
);


// PUT /students/:userId/details
router.put(
  "/:userId",
  authenticateUser,
  authorizeRoles("superAdmin", "dean"),
 updateStudentDetails
);

// DELETE /students/:userId
router.delete(
  "/:userId",
  authenticateUser,
  authorizeRoles("superAdmin", "dean"),
deleteStudentDetails
);

module.exports = router;
