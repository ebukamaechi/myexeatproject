const express = require("express");
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  getAllUsers,
  createNewUser,
  getOneUser,
  updateOneUser,
  updateUserRole,
  deleteOneUser,
  changePassword,
  uploadSignature,
  disableUser,
  enableUser,
  getRoleCounts,
  getUsersByRole,
} = require("../controllers/userController");
const multer = require("multer");

const router = express.Router();

// GET all users
router.get("/", authenticateUser, authorizeRoles("superAdmin","dean"), getAllUsers);

// POST - Create a new user
router.post(
  "/",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  createNewUser
);


router.get("/role-counts", authenticateUser, authorizeRoles("superAdmin","dean"), getRoleCounts);

//change password for loggin in user
router.put("/change-password", authenticateUser, authorizeRoles("student", "security", "hostelAdmin", "dean", "superAdmin"), changePassword);


router.put(
  "/disable-user/:userId",
  authenticateUser,
  authorizeRoles("hostelAdmin","dean","superAdmin"),
  disableUser
);
router.put(
  "/enable-user/:userId",
  authenticateUser,
  authorizeRoles("hostelAdmin","dean","superAdmin"),
  enableUser
);

router.put(
  "/update-role/:id",
  authenticateUser,
  authorizeRoles("dean","superAdmin"),
  updateUserRole
);

// get users by role
router.get(
  "/users-by-role",
  authenticateUser,
  authorizeRoles("dean","superAdmin"),
  getUsersByRole
);


// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 }, // 100KB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG images are allowed'));
    }
  },
});
router.put(
  // "/:id/upload-signature",
    "/upload-signature",
  authenticateUser,
  authorizeRoles("dean","superAdmin"),  //only dean for production
  uploadSignature
);



// PUT - Update a user
router.put(
  "/:id",
  authenticateUser,
  // authorizeRoles("hostelAdmin", "dean", "superAdmin"),
  updateOneUser
);
// GET one user by ID
router.get("/:id", authenticateUser, getOneUser);

// DELETE - Remove a user
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("dean", "superAdmin"),
  deleteOneUser
);
module.exports = router;
