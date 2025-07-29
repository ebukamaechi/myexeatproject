// /students/
const StudentDetails = require("../models/StudentDetails");
const User = require("../models/User");


exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).populate("studentDetails").sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getOneStudentByMatric = async (req, res) => {
  try {
    const { matricNumber } = req.params;

    const student = await User.findOne({matricNumber}).lean();

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentDetails = await StudentDetails.findOne({
      user: student._id,
    }).lean();

    student.studentDetails = studentDetails || null;
    res.json(student);
  } catch (error) {
    console.error("Server Error while fetching student:", error.message);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
};


exports.addStudentDetailsStudents = async (req, res) => {
  try {
    const userId  = req.user.id;

    //   const user = await User.findById(req.params);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Student not found" });
    }
    if (user.role !== "student") {
      return res.status(404).json({ error: "Not a Student to use this route" });
    }

    // Check if details already exist
    const existingDetails = await StudentDetails.findOne({
      user: userId,
    });
    if (existingDetails) {
      return res
        .status(400)
        .json({ error: "Details already exist for this student" });
    }

    const studentDetails = new StudentDetails({
      user: userId,
      ...req.body, // make sure the body contains level, department, etc.
    });

    await studentDetails.save();

    // Link to user
    user.studentDetails = studentDetails._id;
    await user.save();

    res.status(201).json({
      message: "Student details added successfully",
      studentDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.addStudentDetailsAdmins = async (req, res) => {
  try {
    const { matricNumber } = req.params; //

    // Find the user by matric number
    const userMat = await User.findOne({ matricNumber });  
    if (!userMat) {
      return res.status(404).json({ error: "Student not found" });
    }

    const userId = userMat._id;

    // Ensure user is a student
    if (userMat.role !== "student") {
      return res.status(400).json({ error: "User is not a student" });
    }

    // Check if student details already exist
    const existingDetails = await StudentDetails.findOne({ user: userId });
    if (existingDetails) {
      return res.status(400).json({ error: "Details already exist for this student" });
    }

    // Create and save new student details
    const studentDetails = new StudentDetails({
      user: userId,
      ...req.body, // Should include fields like level, department, etc.
    });

    await studentDetails.save();

    // Link details to the user
    userMat.studentDetails = studentDetails._id;
    await userMat.save();

    res.status(201).json({
      message: "Student details added successfully",
      studentDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getStudentDetailsStudents = async (req, res) => {
  try {
    const userId  = req.user.id;

    // Allow access if user is admin OR the student themselves

    const user = await User.findById(userId).populate("studentDetails");

    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.getStudentDetailsAdmins = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("studentDetails");

    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.updateStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedDetails = await StudentDetails.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    );

    if (!updatedDetails) {
      return res.status(404).json({ error: "Student details not found" });
    }

    res.json({ message: "Student details updated", updatedDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateStudentDetailsStudents = async (req, res) => {
  try {
    const userId  = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedDetails = await StudentDetails.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    );

    if (!updatedDetails) {
      return res.status(404).json({ error: "Student details not found" });
    }

    res.json({ message: "Student details updated", updatedDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};


exports.deleteStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete associated student details
    await StudentDetails.deleteOne({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      message: "Student and their details deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
