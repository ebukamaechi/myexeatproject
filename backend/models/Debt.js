// models/Debt.js
const mongoose = require("mongoose");

const DebtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exeat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exeat",
      required: true,
      unique: true, // one debt record per exeat
    },
    matricNumber: {
      type: String,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true, // the date the student was supposed to return
    },
    checkedInAt: {
      type: Date,
      default: null, // set when student finally checks in (exeat marked as used)
    },
    dailyRate: {
      type: Number,
      default: 10000, // ₦10,000 per day
    },
    status: {
      type: String,
      enum: ["active", "settled"],
      default: "active",
      // active  = student has not paid yet
      // settled = admin has cleared the debt
    },
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    settledAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    proof: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Virtual: calculate how many days late the student was
DebtSchema.virtual("daysLate").get(function () {
  if (!this.checkedInAt) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = this.checkedInAt - this.returnDate;
  return Math.max(0, Math.ceil(diff / msPerDay));
});

// Virtual: total amount owed (fixed once checked in)
DebtSchema.virtual("totalAmount").get(function () {
  return this.daysLate * this.dailyRate;
});

// Virtual: current running amount (grows daily while active and not checked in)
DebtSchema.virtual("currentAmount").get(function () {
  if (this.checkedInAt) {
    // Student has checked in — amount is fixed
    return this.daysLate * this.dailyRate;
  }
  // Still out — calculate from today
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = new Date() - this.returnDate;
  const daysLate = Math.max(0, Math.ceil(diff / msPerDay));
  return daysLate * this.dailyRate;
});

DebtSchema.set("toJSON", { virtuals: true });
DebtSchema.set("toObject", { virtuals: true });

const Debt = mongoose.model("Debt", DebtSchema);
module.exports = Debt;
