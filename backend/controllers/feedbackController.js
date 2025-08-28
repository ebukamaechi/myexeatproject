const Feedback = require("../models/FeedBack");
const logger = require("../config/logger");

exports.newFeedback = async (req, res) => {
  try {
    const { name, email, rating, message, additionalFeedback } = req.body;
    const newFeedback = new Feedback({
      name,
      email,
      rating,
      message,
      additionalFeedback,
    });
    await newFeedback.save();
    res.status(201).json({ message: "New feedback sent", newFeedback });
    logger.info(`Feedback sent by ${email}`);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Error sending feedback" });
    logger.error(error);
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    if (!feedbacks) res.status(404).json({ message: "No feedbacks found" });
    res.json(feedbacks);
  } catch (error) {}
};
exports.getOneFeedback = async (req, res) => {
  try {
    const { Id } = req.params;
    const feedback = await Feedback.findById(Id);
    if (!feedback)
      res.status(404).json({ message: "No feedback found for this id" });
    res.json(feedback);
  } catch (error) {}
};
exports.deleteFeedback = async (req, res) => {
  try {
    const { Id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(Id);
    if (!feedback)
      res.status(404).json({ message: "No feedback found for this id" });

    res.json({
      message: "feedback deleted successfully",
    });
    logger.info(`feedback id: ${Id} deleted by ${req.user.id}`);
  } catch (error) {}
};
