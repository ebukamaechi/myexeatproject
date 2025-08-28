const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
    },
    additionalFeedback: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending","in-view", "opened", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", FeedbackSchema);
 module.exports = Feedback;