require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // Assuming your User model is in the

// Register
exports.register = async (req, res) => {
  try {
    const { name, matricNumber, email, password, role } = req.body;
    // const { name, matricNumber, email, password, confirmPassword, role } = req.body; //unlock for confirm password with line 37

    //everyone provides email
    if (!email) return res.status(400).json({ message: "Email is required" });

    //students have matric
    if (role === "student" && !matricNumber) {
      return res
        .status(400)
        .json({ message: "Matric Number is required for students" });
    }

    const userExists = await User.findOne({
      $or: [
        { email },
        ...(role === "student" ? [{ matricNumber }] : []), // Only check matricNumber for students
      ],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email or Matric number already exists" });
    }

    // if (password !==confirmPassword) return res.status(400).json({error:"Passwords must match!"});

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      matricNumber: role === "student" ? matricNumber : undefined,
      email,
      password: hashedPassword,
      role,
    });
    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error during registration" });
  }
};

//login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Identifier can be matricNumber students) or email(staff)

    // Find user based on role
    const user = await User.findOne({
      $or: [
        { matricNumber: identifier }, // For students
        { email: identifier }, // For non-students
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if login method is correct
    if (user.role === "student" && user.matricNumber !== identifier) {
      return res
        .status(400)
        .json({ message: "Students must log in with their matric number" });
    }

      if (user.isDisabled === true) return res.status(400).json({ message: "This User is Disabled from accessing the system" });
   

    if (user.role !== "student" && user.email !== identifier) {
      return res
        .status(400)
        .json({ message: "Non-students must log in with their email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid Password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set token in HttpOnly cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure this is true in production (https)
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
      sameSite: "strict", // Security to prevent CSRF
    });
    console.log("Generated Token:", token);
    res.json({
      message: "Login successful",
      token, //this will be used for react-native
      user: { name: user.name, identifier: identifier, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

//me
exports.currentUser = async (req, res) => {
  //roles: student, hostelAdmin, dean, security, superAdmin
  try {
    const user = await User.findById(req.user.id).select("-password"); // don't return password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        isDisabled:user.isDisabled,
        quota: user.quota || 0,
        identifier:user.role === "student" ? user.matricNumber : user.email, //  Consistent with login response
      },
    });

    // res.json({ user });
    // ✅ now matches frontend expectation
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//logout
exports.logout = async (req, res) => {
  // Clear the token cookie
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure this is true in production (https)
    sameSite: "strict",
  });

  res.json({ message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log("reset token:", resetToken);
  // console.log('hash reset token:', resetPasswordToken);

  // Set reset token and expiration time
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  // Send email with the reset link
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    to: email,
    subject: "Password Reset Request",
    text: `Click the following link to reset your password: ${resetLink}`,
  });

  res.status(200).json({ message: "Password reset link sent to email" });
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const resetToken = req.params.token;

  // Hash the token received from the URL to compare with the stored hash
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find user by the hashed reset token and ensure token hasn't expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }, // Check that the token is still valid
  });

  // If user is not found or token is expired
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password and clear the reset token and expiry fields
  user.password = hashedPassword;
  user.resetPasswordToken = undefined; // Clear the reset token
  user.resetPasswordExpires = undefined; // Clear the expiration date
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
};


