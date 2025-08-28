require("dotenv").config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const StudentDetails = require("../models/StudentDetails");
const Payment = require("../models/Payment");
const logger = require("../config/logger");
const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

//save pending payment
exports.saveDetails = async (req, res) => {
  try {
    const { quota, amount, reference } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    const refExists = await Payment.findOne({ reference: reference });
    if (refExists)
      return res.status(400).json({ error: "Reference already exists" });

    const newPayment = new Payment({
      user: userId,
      email: email,
      quota: quota,
      amount: amount,
      reference: reference,
      status: "pending",
    });
    await newPayment.save();
    res.status(201).json({
      message: "Payment Saved",
      payment: newPayment,
      paymentId: newPayment._id,
    });
    logger.info(
      `Payment saved for reference: ${reference} and email: ${email}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save payments" + error });
  }
};

//verify payment
exports.verifyPayment = async (req, res) => {
  const { reference } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const paymentData = response.data.data;
    if (paymentData.status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    const payment = await Payment.findOneAndUpdate(
      { reference: reference },
      { status: "success" },
      { new: true }
    );

    if (!payment) return res.status(400).json({ error: "payment not found" });
    const user = await User.findById(payment.user);
    if (!user || !user.studentDetails)
      return res.status(400).json({ error: "student details not linked" });

    const student = await StudentDetails.findById(user.studentDetails);
    student.quota += payment.quota;
    await student.save();
    // Send email notification
    await sendPaymentSuccessEmail(
      user.email,
      reference,
      payment.amount,
      payment.quota
    );
    return res.status(200).json({
      message: "Payment verified and quota updated",
      status: "success",
    });
    logger.info(`Payment verified for reference: ${reference}`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to verify payments" + error?.message });
      logger.info(`Payment verification failed for reference: ${reference}, ${error}`);
  }
};

//delete payment
exports.deletePayment = async (req, res) => {
  const { paymentId } = req.params;
  try {
    const deletePay = await Payment.findOneAndDelete({ _id: paymentId });
    if (!deletePay)
      return res.status(400).json({ error: "failed to delete payment" });

    res
      .status(200)
      .json({ message: `Payment ${paymentId} Deleted successfully` });
      logger.info(`Payment ${paymentId} Deleted successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete payments" });
  }
};

//get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user", "email");
    if (!payments) return res.status(404).json({ error: "payments not found" });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

//get payments by reference
exports.getRefPayment = async (req, res) => {
  const { reference } = req.params;
  try {
    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: `Failed to fetch payment ref: ${reference}` });
  }
};

//get all payments made by a user
exports.getUserPayments = async (req, res) => {
  const { userId } = req.params;
  try {
    const payments = await Payment.find({ user: userId });
    if (!payments) return res.status(404).json({ error: "Payments not found" });
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch payments made by this user" });
  }
};

// Get all payments made by the logged-in user
exports.getLoggedUserPayments = async (req, res) => {
  const userId = req.user.id;

  try {
    const payments = await Payment.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: "No payments found for this user" });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch payments made by this user" });
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

    const event = req.body;
    const { event: eventType, data } = event;

    // ✅ Respond immediately
    res.sendStatus(200);

    if (eventType === "charge.success") {
      const reference = data.reference;
      console.log(
        `Webhook received: Payment success for reference ${reference}`
      );

      // ✅ Defer further processing
      setImmediate(async () => {
        try {
          const payment = await Payment.findOneAndUpdate(
            { reference },
            { status: "success" },
            { new: true }
          );

          if (payment) {
            const user = await User.findById(payment.user);
            if (user?.studentDetails) {
              const student = await StudentDetails.findById(
                user.studentDetails
              );
              student.quota += payment.quota;
              await student.save();

              await sendPaymentSuccessEmail(
                user.email,
                reference,
                payment.amount,
                payment.quota
              );

              console.log(`Payment ${reference} processed and quota updated.`);
              logger.info(`Payment ${reference} processed and quota updated via webhook.`);
            }
          }
        } catch (err) {
          console.error(`Error processing webhook for ${reference}:`, err);
          logger.error(`Error processing webhook for ${reference}:, ${err}`);
        }
      });
    }
  } catch (error) {
    console.error("Webhook error:", error);
     logger.error(`Webhook error: ${err}`);
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
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Function to send email notification on payment success
async function sendPaymentSuccessEmail(toEmail, reference, amount, quota) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Payment Verified - Reference: ${reference}`,
    html: `
      <h3>Payment Verified Successfully</h3>
      <p>Reference: <b>${reference}</b></p>
      <p>Amount Paid: <b>${amount}</b></p>
      <p>Quota Added: <b>${quota}</b></p>
      <p>Thank you for your payment.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Payment success email sent to ${toEmail} for reference ${reference}`
    );
  } catch (error) {
    console.error("Error sending payment success email:", error);
  }
}
