const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["quota", "debt"],
      required: true,
      default: "quota",
    },
    quota: {
      type: Number,
      default: 0,
    },
    // ── For debt payments ──────────────────────────────────────────────────
    // Which Debt document is being cleared?
    debt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Debt",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
