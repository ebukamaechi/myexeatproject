const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    matricNumber: { type: String, unique: true, sparse: true }, // Only applies to students
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "hostelAdmin", "dean", "security", "superAdmin"],
      default: "student",
    },
    studentDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentDetails", // referencing the other collection
    },
    quota: { type: Number, default: 0 }, // Optional: track quota for students
    isDisabled: {
      type: Boolean,
      default: false,
    },
    signature: { type: String, default: null },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
