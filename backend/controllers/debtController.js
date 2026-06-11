// controllers/debtController.js
const Debt = require("../models/Debt");
const User = require("../models/User");
const StudentDetails = require("../models/StudentDetails");
const Exeat = require("../models/Exeat");
const logger = require("../config/logger");
const axios = require("axios");

// ─── Get all debts (superAdmin / dean) ───────────────────────────────────────
exports.getAllDebts = async (req, res) => {
  try {
    const { status } = req.query; // ?status=active or ?status=settled
    const filter = {};
    if (status) filter.status = status;

    const debts = await Debt.find(filter)
      .populate("user", "name email matricNumber")
      .populate("exeat", "destination purpose returnDate securityCheck")
      .populate("settledBy", "name email role")
      .sort({ createdAt: -1 });

    // Attach virtuals manually for JSON serialisation
    const debtsWithAmounts = debts.map((d) => {
      const obj = d.toObject();
      obj.currentAmount = d.currentAmount;
      obj.daysLate = d.daysLate;
      return obj;
    });

    res.json(debtsWithAmounts);
  } catch (err) {
    logger.error(`getAllDebts error: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch debts" });
  }
};

// ─── Get debts for a specific student (by userId) ────────────────────────────
exports.getStudentDebts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const debts = await Debt.find({ user: userId })
      .populate("exeat", "destination purpose returnDate securityCheck")
      .sort({ createdAt: -1 });

    const debtsWithAmounts = debts.map((d) => {
      const obj = d.toObject();
      obj.currentAmount = d.currentAmount;
      obj.daysLate = d.daysLate;
      return obj;
    });

    // calculate Total outstanding
    const totalOutstanding = debts
      .filter((d) => d.status === "active")
      .reduce((sum, d) => sum + d.currentAmount, 0);

    res.json({ debts: debtsWithAmounts, totalOutstanding });
  } catch (err) {
    logger.error(`getStudentDebts error: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch student debts" });
  }
};

// ─── Get my own debts (student) ───────────────────────────────────────────────
exports.getMyDebts = async (req, res) => {
  try {
    const debts = await Debt.find({ user: req.user.id })
      .populate("exeat", "destination purpose returnDate securityCheck")
      .sort({ createdAt: -1 });

    const debtsWithAmounts = debts.map((d) => {
      const obj = d.toObject();
      obj.currentAmount = d.currentAmount;
      obj.daysLate = d.daysLate;
      return obj;
    });

    //calculate total outstanding
    const totalOutstanding = debts
      .filter((d) => d.status === "active")
      .reduce((sum, d) => sum + d.currentAmount, 0);

    res.json({ debts: debtsWithAmounts, totalOutstanding });
  } catch (err) {
    logger.error(`getMyDebts error: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch your debts" });
  }
};

// ─── Settle a debt (superAdmin / dean marks it as paid) ──────────────────────
//  uploaded letter signed by the vc to clear the debt
exports.settleDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const { notes, proof} = req.body;

    const debt = await Debt.findById(debtId);
    if (!debt) return res.status(404).json({ error: "Debt not found" });
    if (debt.status === "settled")
      return res.status(400).json({ error: "Debt already settled" });

    debt.status = "settled";
    debt.settledBy = req.user.id;
    debt.settledAt = new Date();
    debt.notes = notes || "";
    debt.proof = proof || "";
    await debt.save();

    logger.info(
      `Debt ${debtId} settled by ${req.user.email} for student ${debt.matricNumber}`,
    );
    res.json({ message: "Debt settled successfully", debt });
  } catch (err) {
    logger.error(`settleDebt error: ${err.message}`);
    res.status(500).json({ error: "Failed to settle debt" });
  }
};

// reduce a student's debt by a certain amount (used for partial payments, if implemented in the future)
exports.reduceDebt = async (req,res) => {
    const {debtId, amount}=req.body;
  try {
    const debt = await Debt.findById(debtId);
    if (!debt) return res.status(404).json({ error: "Debt not found" });
    if (debt.status === "settled") return res.status(400).json({ error: "Debt already settled" });
    if (debt.currentAmount < amount) return res.status(400).json({ error: "Insufficient debt balance" });

    debt.currentAmount -= amount;
    await debt.save();
    logger.info(`Debt ${debtId} reduced by ₦${amount} by ${req.user.email}`);
    res.json({ message: "Debt reduced successfully", debt });

  } catch (err) {
    logger.error(`reduceDebt error: ${err.message}`);
    res.status(500).json({ error: "Failed to reduce debt" });
  }
};

// ─── Check if student has active debts (used in exeat request flow) ───────────
exports.checkStudentDebtStatus = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const activeDebts = await Debt.find({
      user: userId,
      status: "active",
    }).populate("exeat", "destination returnDate");

    const debtsWithAmounts = activeDebts.map((d) => {
      const obj = d.toObject();
      obj.currentAmount = d.currentAmount;
      obj.daysLate = d.daysLate;
      return obj;
    });

    const totalOutstanding = activeDebts.reduce(
      (sum, d) => sum + d.currentAmount,
      0,
    );

    res.json({
      hasDebt: activeDebts.length > 0,
      totalOutstanding,
      activeDebts: debtsWithAmounts,
    });
  } catch (err) {
    logger.error(`checkStudentDebtStatus error: ${err.message}`);
    res.status(500).json({ error: "Failed to check debt status" });
  }
};

// ─── AI: Analyse a student's exeat + debt history ────────────────────────────
// Returns a plain-language risk assessment and recommendation for the dean.
exports.aiAnalyseStudent = async (req, res) => {
  try {
    const { userId } = req.params;

    // Gather all the data we need
    const [user, studentDetails, exeats, debts] = await Promise.all([
      User.findById(userId).select("-password"),
      StudentDetails.findOne({ user: userId }),
      Exeat.find({ user: userId }).sort({ createdAt: -1 }).limit(20),
      Debt.find({ user: userId }).sort({ createdAt: -1 }),
    ]);

    if (!user) return res.status(404).json({ error: "Student not found" });

    // Build a concise summary to send to Claude
    const exeatSummary = exeats.map((e) => ({
      destination: e.destination,
      purpose: e.purpose,
      departureDate: e.departureDate,
      returnDate: e.returnDate,
      checkedInAt: e.securityCheck || null,
      status: e.requestStatus,
      isEmergency: e.isEmergency,
      daysLate: e.securityCheck
        ? Math.max(
            0,
            Math.ceil(
              (new Date(e.securityCheck) - new Date(e.returnDate)) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : null,
    }));

    const debtSummary = debts.map((d) => ({
      returnDate: d.returnDate,
      checkedInAt: d.checkedInAt,
      daysLate: d.daysLate,
      amount: d.currentAmount,
      status: d.status,
    }));

    const prompt = `You are an assistant for a Nigerian university exeat management system.
Analyse this student's history and provide a concise risk assessment for the dean.

Student: ${user.name} (${user.matricNumber || "N/A"})
Department: ${studentDetails?.department || "Unknown"}
Faculty: ${studentDetails?.faculty || "Unknown"}

Exeat history (last 20):
${JSON.stringify(exeatSummary, null, 2)}

Debt history:
${JSON.stringify(debtSummary, null, 2)}

Respond in JSON only. No markdown, no preamble. Use this exact structure:
{
  "riskLevel": "low" | "medium" | "high",
  "summary": "2-3 sentence plain English summary of patterns you noticed",
  "flags": ["list of specific concerns, e.g. 'Returned late 3 times in last 2 months'"],
  "recommendation": "One sentence recommendation for whether to approve future exeats freely, with caution, or escalate"
}`;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          // The API key is injected by the platform
        },
      },
    );

    const rawText = response.data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let analysis;
    try {
      analysis = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      analysis = { raw: rawText };
    }

    logger.info(
      `AI analysis requested for student ${userId} by ${req.user.email}`,
    );
    res.json({
      analysis,
      student: { name: user.name, matricNumber: user.matricNumber },
    });
  } catch (err) {
    logger.error(`aiAnalyseStudent error: ${err.message}`);
    res.status(500).json({ error: "AI analysis failed: " + err.message });
  }
};

// ─── AI: Suggest rejection reason for a dean ─────────────────────────────────
exports.aiSuggestRejectionReason = async (req, res) => {
  try {
    const { exeatId } = req.params;

    const exeat = await Exeat.findById(exeatId)
      .populate("user", "name matricNumber")
      .lean();
    if (!exeat) return res.status(404).json({ error: "Exeat not found" });

    const studentDebts = await Debt.find({
      user: exeat.user._id,
      status: "active",
    });
    const totalDebt = studentDebts.reduce((s, d) => s + d.currentAmount, 0);
    const pastExeats = await Exeat.find({ user: exeat.user._id })
      .sort({
        createdAt: -1,
      })
      .limit(10);
    const lateReturns = pastExeats.filter(
      (e) =>
        e.securityCheck && new Date(e.securityCheck) > new Date(e.returnDate),
    ).length;

    const prompt = `You are assisting a university dean who is about to reject a student's exeat request.
Write 2-3 possible professional rejection reason messages they could use.

Exeat details:
- Student: ${exeat.user.name} (${exeat.user.matricNumber})
- Destination: ${exeat.destination}
- Purpose: ${exeat.purpose}
- Departure: ${exeat.departureDate}
- Return: ${exeat.returnDate}
- Outstanding debt: ₦${totalDebt.toLocaleString()}
- Times returned late (last 10 exeats): ${lateReturns}

Respond in JSON only. No markdown. Use this structure:
{
  "reasons": [
    "Reason 1 (formal, 1-2 sentences)",
    "Reason 2 (references debt if applicable)",
    "Reason 3 (references late return history if applicable)"
  ]
}`;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
        },
      },
    );

    const rawText = response.data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let result;
    try {
      result = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      result = { reasons: [rawText] };
    }

    res.json(result);
  } catch (err) {
    logger.error(`aiSuggestRejectionReason error: ${err.message}`);
    res.status(500).json({ error: "Failed to suggest rejection reason" });
  }
};
