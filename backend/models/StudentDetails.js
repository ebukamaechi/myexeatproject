const mongoose = require("mongoose");

const StudentDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  firstName: String,
  middleName: String,
  lastName: String,
  origin: String,
  department: String,
  faculty: String,
  hostel: String,
  phone: String,
  guardianName: String,
  guardianPhone: String,
  address: String,
  quota: {
    type: Number,
    default: 3, 
  },
});
const StudentDetails = mongoose.model("StudentDetails", StudentDetailsSchema);
module.exports = StudentDetails;
