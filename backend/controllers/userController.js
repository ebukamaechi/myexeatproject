// /users/
const User = require("../models/User");
const StudentDetails = require("../models/StudentDetails");
const bcrypt = require("bcryptjs");
require("dotenv").config();

//get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const query = {};
    if (role) {
      const validRoles = ["student", "hostelAdmin", "dean", "security", "superAdmin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("studentDetails");

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


//create new user
exports.createNewUser = async (req, res) => {
  try {
    const { name, matricNumber, email, role } = req.body;
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Basic validation
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (role === "student" && !matricNumber) {
      return res
        .status(400)
        .json({ error: "Matric Number is required for students" });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Check if matric number already exists for students
    if (role === "student") {
      const matricExists = await User.findOne({ matricNumber });
      if (matricExists) {
        return res.status(409).json({ error: "Matric number already exists" });
      }
    }

    const newUser = new User({
      name,
      matricNumber: role === "student" ? matricNumber : undefined,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
// if (role === "student") {
//   const {
//     firstName,
//     middleName,
//     lastName,
//     origin,
//     department,
//     faculty,
//     hostel,
//     phone,
//     address,
//     guardianName,
//     guardianPhone,
//     quota,
//   } = req.body.studentDetails || {};

//   const studentDetails = new StudentDetails({
//     user: newUser._id,
//     firstName,
//     middleName,
//     lastName,
//     origin,
//     department,
//     faculty,
//     hostel,
//     phone,
//     address,
//     guardianName,
//     guardianPhone,
//     quota,
//   });

//   await studentDetails.save();
//   newUser.studentDetails = studentDetails._id;
//   await newUser.save();
// }


    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create user: " + err.message });
  }
};

//get one user
exports.getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//updateOneUser
exports.updateOneUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//deleteOneUser
exports.deleteOneUser = async (req, res) => {
  try {
    const { password } = req.body;

    // Assuming super admin is authenticated and their ID is in req.user.id
    const admin = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === 'student' && user.studentDetails) {
      await StudentDetails.findByIdAndDelete(user.studentDetails);
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted after password confirmation" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

//updateUserRole
exports.updateUserRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    // Allowed roles
    const validRoles = [
      "student",
      "hostelAdmin",
      "dean",
      "security",
      "superAdmin",
    ];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user role" });
  }
};

//change password for logging in user
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

exports.disableUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDisabled = true;
    user.save();
    res.status(200).json({ message: "user disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};
exports.enableUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDisabled = false;
    user.save();
    res.status(200).json({ message: "user enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

exports.uploadSignature = async (req, res) => {
  try {
    // const userId = req.params.id;
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No signature file uploaded" });
    }

    // Convert to base64
    const base64String = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const base64Image = `data:${mimeType};base64,${base64String}`;
    // const base64Image = req.body.signature;

    // Update user with signature and timestamp
    const user = await User.findByIdAndUpdate(
      userId,
      {
        signature: base64Image,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Signature uploaded successfully",
      user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error", err.message);
  }
};

exports.getRoleCounts = async (req, res) => {
  try {
    const counts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $project: { _id: 0, role: "$_id", count: 1 } },
    ]);

    const allRoles = [
      "student",
      "hostelAdmin",
      "dean",
      "security",
      "superAdmin",
    ];
    const result = allRoles.map((role) => {
      const found = counts.find((r) => r.role === role);
      return { role, count: found ? found.count : 0 };
    });

    res.json(result);
  } catch (err) {
    console.error("Role count fetch failed:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET users, optionally filtered by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    const query = {};
    if (role) {
      // Optional validation
      const validRoles = ["student", "hostelAdmin", "dean", "security", "superAdmin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("studentDetails"); // Optional: populate studentDetails if needed

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
