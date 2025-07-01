const StudentDetails = require("../models/StudentDetails");
const PricePlan = require("../models/PricePlan");
const User = require("../models/User");

exports.getQuotaBalance = async (req, res) => {
  try {
    const details = await StudentDetails.findOne({ user: req.user.id });

    if (!details) {
      return res.status(404).json({ error: "Student details not found" });
    }

    res.json({ quota: details.quota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching quota" });
  }
};
exports.updateQuotaMatric = async (req, res) => {
  const { matricNumber } = req.params;
  const { quota } = req.body;
  try {
    if (typeof quota !== "number" || quota < 0) {
      return res.status(400).json({ error: "Quota must be a positive number" });
    }
    const thisStudent = await User.findOne({ matricNumber: matricNumber });
    if (!thisStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = await StudentDetails.findOne({
      user: thisStudent._id,
    });

    if (!student) {
      return res.status(404).json({ error: "Student details not found" });
    }

    student.quota += quota;
    await student.save();

    res.json({
      message: "Quota added successfully",
      quota: student.quota,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating quota" });
  }
};
exports.incrementQuotaAll = async (req, res) => {
  try {
    const { incrementValue } = req.body;

    // Validate increment value
    if (typeof incrementValue !== "number" || incrementValue <= 0) {
      return res
        .status(400)
        .json({ error: "Increment value must be a positive number" });
    }

    // Increment the quota for all students in the StudentDetails collection
    const result = await StudentDetails.updateMany(
      {},
      { $inc: { quota: incrementValue } } // Increment the existing quota by the given value
    );

    res.json({
      message: `${result.nModified} student(s) quota incremented by ${incrementValue}`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error incrementing quotas for all students" });
  }
};

//addPricePlan
exports.addPricePlan = async (req, res)=>{
  const {description, quantity, amount} = req.body;
  if(!description || !quantity || !amount) return res.status(400).json({message:"All fields must not be empty!"});
  try {
    const pricePlan = new PricePlan({
      description,
      quantity,
      amount,
    });

    await pricePlan.save();
    res.status(201).json({message:"Price Plan deleted successfully"});
    
  } catch (error) {
    console.log(error.message);
        res
      .status(500)
      .json({ error: "Server Error: "+ error.message });
  }
};
