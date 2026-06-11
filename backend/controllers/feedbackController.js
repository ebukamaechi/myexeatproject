const Feedback = require("../models/Feedback");
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting feedbacks" });
    logger.error(error);
  }
};
exports.getOneFeedback = async (req, res) => {
  try {
    const { Id } = req.params;
    const feedback = await Feedback.findById(Id);
    if (!feedback)
      res.status(404).json({ message: "No feedback found for this id" });
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting one feedback" });
    logger.error(error);
  }
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting feedback" });
    logger.error(error);
  }
};

exports.getFeedbackByOnePerson = async (req, res) => {
  try {
    const { email } = req.params;
    const feedbacks = await Feedback.find({ email });
    if (!feedbacks)
      res.status(404).json({ message: `feedbacks not found for ${email}` });
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting feedback" });
    logger.error(error);
  }
};
