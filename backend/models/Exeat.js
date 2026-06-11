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
  rejectedAt: { type: Date, default: null },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // e.g., Hostel Admin/dean
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
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
    enum: [
      "pending",
      "recommended",
      "approved",
      "rejected",
      "cancelled",
      "used",
      "expired",
      "returned",
    ],
    default: "pending",
  },
  departedAt: { type: Date, default: null },
  returnedAt: { type: Date, default: null },
  isUsed: {
    type: Boolean,
    default: false,
  },
  hasReturned: {
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
    type: Date,
  },
  securityCheckedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Security personnel user ID
  },
  securityReturnedCheckedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Security personnel user ID
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Exeat = mongoose.model("Exeat", ExeatSchema);
module.exports = Exeat;
