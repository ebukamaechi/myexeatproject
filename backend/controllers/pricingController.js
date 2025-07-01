const PricePlan = require("../models/PricePlan");

// @desc    Create a new price plan
// @route   POST /api/price-plans
exports.addPricePlan = async (req, res) => {
  const { name, description, quantity, amount, featured } = req.body;

  if (!name || !description || !quantity || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newPlan = new PricePlan({
      name,
      description,
      quantity,
      amount,
      featured: featured || false,
    });

    await newPlan.save();
    res.status(201).json({ message: "Price Plan created successfully", plan: newPlan });
  } catch (error) {
    console.error("Error adding price plan:", error.message);
    res.status(500).json({ error: "Server error creating price plan" });
  }
};

// @desc    Get all price plans
// @route   GET /api/price-plans
exports.getAllPricePlans = async (req, res) => {
  try {
    const plans = await PricePlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error("Error fetching price plans:", error.message);
    res.status(500).json({ error: "Server error fetching price plans" });
  }
};

// @desc    Get a single price plan by ID
// @route   GET /api/price-plans/:id
exports.getPricePlanById = async (req, res) => {
  try {
    const plan = await PricePlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Price Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    console.error("Error fetching price plan:", error.message);
    res.status(500).json({ error: "Server error fetching price plan" });
  }
};

// @desc    Update a price plan
// @route   PUT /api/price-plans/:id
exports.updatePricePlan = async (req, res) => {
  const { name, description, quantity, amount, featured } = req.body;

  try {
    const plan = await PricePlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Price Plan not found" });
    }

    plan.name = name || plan.name;
    plan.description = description || plan.description;
    plan.quantity = quantity ?? plan.quantity;
    plan.amount = amount ?? plan.amount;
    plan.featured = featured ?? plan.featured;

    await plan.save();
    res.json({ message: "Price Plan updated successfully", plan });
  } catch (error) {
    console.error("Error updating price plan:", error.message);
    res.status(500).json({ error: "Server error updating price plan" });
  }
};

// @desc    Delete a price plan
// @route   DELETE /api/price-plans/:id
exports.deletePricePlan = async (req, res) => {
  try {
    const plan = await PricePlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Price Plan not found" });
    }

    res.json({ message: "Price Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting price plan:", error.message);
    res.status(500).json({ error: "Server error deleting price plan" });
  }
};
