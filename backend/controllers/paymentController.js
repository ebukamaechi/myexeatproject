require("dotenv").config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const StudentDetails = require("../models/StudentDetails");
const Payment = require("../models/Payment");
const Debt = require("../models/Debt");
const logger = require("../config/logger");
const axios = require("axios");
const {
  sendQuotaPaymentSuccessEmail,
  sendDebtPaymentSuccessEmail,
} = require("../config/emailService");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

//save pending payment
exports.saveDetails = async (req, res) => {
  try {
    const { type = "quota", quota =0, debtId, amount, reference } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    if (!amount || !reference) {
      return res
        .status(400)
        .json({ error: "amount and reference are required" });
    }
    const refExists = await Payment.findOne({ reference });
    if (refExists)
      return res.status(400).json({ error: "Reference already exists" });

    //validation for debt payments
    if (type === "debt") {
      if (!debtId)
        return res
          .status(400)
          .json({ error: "debtId is required for debt payments" });
      const debt = await Debt.findOne({
        _id: debtId,
        user: userId,
        status: "active",
      });
      if (!debt)
        return res
          .status(400)
          .json({ error: "Active debt not found for this user" });
    }

    const newPayment = new Payment({
      user: userId,
      email: email,
      type,
      quota: type === "quota" ? quota : 0,
      debt: type === "debt" ? debtId : null,
      amount,
      reference,
      status: "pending",
    });
    await newPayment.save();
    logger.info(
      `Payment saved for reference: ${reference}, type:${type} and email: ${email}`,
    );
    res.status(201).json({
      message: "Payment Saved",
      payment: newPayment,
      paymentId: newPayment._id,
    });
  } catch (error) {
    console.error(error);
    logger.error(`saveDetails error: ${error.message}`);
    res.status(500).json({ error: "Failed to save payments" + error });
  }
};

//verify payment
exports.verifyPayment = async (req, res) => {
  const { reference } = req.body;
  if (!reference)
    return res.status(400).json({ error: "reference is required" });
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    const paymentData = response.data.data;
    if (paymentData.status !== "success") {
      return res
        .status(400)
        .json({ error: "Payment not successful on Paystack" });
    }

    const payment = await Payment.findOneAndUpdate(
      { reference: reference },
      { status: "success" },
      { new: true },
    ).populate("debt");

    if (!payment) return res.status(400).json({ error: "payment not found" });

    const user = await User.findById(payment.user);
    if (!user || !user.studentDetails)
      return res.status(400).json({ error: "student details not linked" });

    if (payment.type === "quota") {
      const student = await StudentDetails.findById(user.studentDetails);
      if (!student)
        return res.status(404).json({ error: "Student details not linked" });
      student.quota += payment.quota;
      await student.save();
      // Send email notification
      await sendQuotaPaymentSuccessEmail(
        user.email,
        reference,
        payment.amount,
        payment.quota,
      );
      logger.info(
        `Payment verified for reference: ${reference}, quota +${payment.quota} for email: ${user.email}`,
      );

      return res.status(200).json({
        message: "Payment verified and quota updated",
        status: "success",
        type: payment.type,
      });
    } else if (payment.type === "debt") {
      const debt = await Debt.findById(payment.debt).populate(
        "exeat",
        "destination",
      );
      if (!debt)
        return res.status(404).json({ error: "Associated record not found" });

      debt.status = "settled";
      debt.settledBy = payment.user;
      debt.settledAt = new Date();
      debt.notes = `Payment of ₦${payment.amount} received for debt clearance.`;
      await debt.save();

      await sendDebtPaymentSuccessEmail(
        user.email,
        user.name,
        reference,
        payment.amount,
        debt.exeat,
      );
      logger.info(
        `Debt payment verified — ref: ${reference}, debt ${debt._id} settled for ${user.email}`,
      );
      return res
        .status(200)
        .json({ message: "Payment verified and debt cleared", type: "debt" });
    }
    return res.status(400).json({ error: "Unknown payment type" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to verify payments" + error?.message });
    logger.info(
      `Payment verification failed for reference: ${reference}, ${error}`,
    );
  }
};

//delete payment
exports.deletePayment = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const deleted = await Payment.findByIdAndDelete(paymentId);
    if (!deleted) return res.status(404).json({ error: "Payment not found" });
    logger.info(`Payment ${paymentId} deleted`);
    res
      .status(200)
      .json({ message: `Payment ${paymentId} deleted successfully` });
  } catch (error) {
    logger.error(`deletePayment error: ${error.message}`);
    res.status(500).json({ error: "Failed to delete payment" });
  }
};

//get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { type } = req.query; // optional filter: ?type=quota or ?type=debt
    const filter = type ? { type } : {};
    const payments = await Payment.find(filter)
      .populate("user", "name email matricNumber")
      .populate("debt")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    logger.error(`getAllPayments error: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};
//get payments by reference
exports.getRefPayment = async (req, res) => {
  const { reference } = req.params;
  try {
    const payment = await Payment.findOne({ reference }).populate("debt");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (error) {
    logger.error(`getRefPayment error: ${error.message}`);
    res
      .status(500)
      .json({ error: `Failed to fetch payment ref: ${reference}` });
  }
};

//get all payments made by a user
exports.getUserPayments = async (req, res) => {
  const { userId } = req.params;
  try {
    const payments = await Payment.find({ user: userId })
      .populate("debt")
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    logger.error(`getUserPayments error: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch payments for this user" });
  }
};

// Get all payments made by the logged-in user
exports.getLoggedUserPayments = async (req, res) => {
  const userId = req.user.id;
  try {
    const payments = await Payment.find({ user: userId })
      .populate("debt")
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    logger.error(`getLoggedUserPayments error: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch your payments" });
  }
};

//webhook
exports.webhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    // ✅ Respond to Paystack immediately — they expect 200 fast
    res.sendStatus(200);

    const { event: eventType, data } = req.body;

    if (eventType === "charge.success") {
      const reference = data.reference;
      logger.info(`Webhook: charge.success received for ref ${reference}`);
      console.log(
        `Webhook received: Payment success for reference ${reference}`,
      );

      // ✅ Defer further processing
      setImmediate(async () => {
        try {
          const payment = await Payment.findOneAndUpdate(
            { reference, status: "pending" },
            { status: "success" },
            { new: true },
          ).populate("debt");

          if (!payment) {
            // Already processed (e.g. via verifyPayment) — that's fine
            logger.info(
              `Webhook: ref ${reference} already processed, skipping`,
            );
            return;
          }
          const user = await User.findById(payment.user);
          if (!user) {
            logger.error(`Webhook: user not found for payment ${payment._id}`);
            return;
          }

          //branch : quota or debt
          if (payment.type === "quota") {
            const student = await StudentDetails.findById(user.studentDetails);
            if (student) {
              student.quota += payment.quota;
              await student.save();
              await sendQuotaPaymentSuccessEmail(
                user.email,
                reference,
                payment.amount,
                payment.quota,
              );
              logger.info(
                `Webhook: quota +${payment.quota} applied to ${user.email}`,
              );
            }
          } else if (payment.type === "debt") {
            const debt = await Debt.findById(payment.debt).populate(
              "exeat",
              "destination",
            );
            if (debt && debt.status !== "settled") {
              debt.status = "settled";
              debt.settledBy = payment.user;
              debt.settledAt = new Date();
              debt.notes = `Payment of ₦${payment.amount} received for debt clearance.`;
              await debt.save();

              await sendDebtPaymentSuccessEmail(
                user.email,
                user.name,
                reference,
                payment.amount,
                debt.exeat,
              );
              logger.info(
                `Webhook: debt ${debt._id} settled for ${user.email}`,
              );
            }
          }
        } catch (err) {
          logger.error(`Error processing webhook for ${reference}:, ${err}`);
          console.error(`Error processing webhook for ${reference}:`, err);
        }
      });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    logger.error(`Webhook error: ${error}`);
    res.status(500).send("Webhook error");
  }
};

// send email notification
// This function sends an email notification to the user when payment is verified
// using nodemailer. It uses the SMTP transport method to send the email.
// The email contains the payment reference, amount paid, and quota added.
// The email is sent to the user's email address, which is passed as a parameter.
// The email is sent using the nodemailer transporter, which is configured with
// the email host, port, user, and password from environment variables.
//  nodemailer transporter

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD,
//   },
// });

// Function to send email notification on payment success
// async function sendPaymentSuccessEmail(toEmail, reference, amount, quota) {
//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to: toEmail,
//     subject: `Payment Verified - Reference: ${reference}`,
//     html: `
//       <h3>Payment Verified Successfully</h3>
//       <p>Reference: <b>${reference}</b></p>
//       <p>Amount Paid: <b>${amount}</b></p>
//       <p>Quota Added: <b>${quota}</b></p>
//       <p>Thank you for your payment.</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(
//       `Payment success email sent to ${toEmail} for reference ${reference}`,
//     );
//   } catch (error) {
//     console.error("Error sending payment success email:", error);
//   }
// }
