const mongoose = require("mongoose");

const ExeatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  matricNumber: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  recommendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // e.g., Hostel Admin
  },
  recommendationDate: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // e.g., Dean or SuperAdmin
  },
  approvalDate: {
    type: Date,
  },
  requestStatus: {
    type: String,
    enum: ["pending", "recommended", "approved", "rejected", "cancelled", "used"],
    default: "pending",
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  qrToken: {
    type: String,
    unique: true,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  securityCheck: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Exeat = mongoose.model("Exeat", ExeatSchema);
module.exports = Exeat;
