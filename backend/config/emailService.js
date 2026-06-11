// single shared email utility for sending emails accross the system

const nodemailer = require("nodemailer");
const logger = require("./logger");
require("dotenv").config();

//create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, //true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// internal helper function
async function send(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} — "${subject}"`);
  } catch (err) {
    logger.error(`Email failed to ${to} - "${subject}" : ${err.message}`);
  }
}

// ── Base template wrapper ───
function template(title, bodyHtml) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#1d4ed8;padding:20px 24px">
        <h2 style="color:#fff;margin:0;font-size:18px">${title}</h2>
      </div>
      <div style="padding:24px;color:#374151;line-height:1.6">
        ${bodyHtml}
      </div>
      <div style="background:#f9fafb;padding:14px 24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb">
        This is an automated message from the Exeat Management System. Please do not reply.
      </div>
    </div>`;
}

function exeatSummary(exeat) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      <tr><td style="padding:6px 0;color:#6b7280;width:140px">Destination</td><td><strong>${exeat.destination}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Purpose</td><td>${exeat.purpose}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Departure</td><td>${new Date(exeat.departureDate).toDateString()}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Return date</td><td>${new Date(exeat.returnDate).toDateString()}</td></tr>
    </table>`;
}

// 1. Student submitted a new request → notify hostel admin
exports.sendExeatRequestedEmail = async (hostelAdminEmail, student, exeat) => {
  await send(
    hostelAdminEmail,
    "New Exeat Request Awaiting Your Recommendation",
    template(
      "New Exeat Request",
      `<p>A student has submitted a new exeat request requiring your recommendation.</p>
       <p><strong>Student:</strong> ${student.name} (${student.matricNumber || ""})</p>
       ${exeatSummary(exeat)}
       <p style="margin-top:16px">Please log in to review and recommend or decline this request.</p>`
    )
  );
};
 
// 2. Hostel admin recommended → notify dean
exports.sendExeatRecommendedEmail = async (deanEmail, student, exeat) => {
  await send(
    deanEmail,
    "Exeat Awaiting Your Approval",
    template(
      "Exeat Recommended — Action Required",
      `<p>A hostel admin has recommended an exeat request for your approval.</p>
       <p><strong>Student:</strong> ${student.name} (${student.matricNumber || ""})</p>
       ${exeatSummary(exeat)}
       <p style="margin-top:16px">Please log in to approve or reject this request.</p>`
    )
  );
};
 
// 3. Dean approved → notify student
exports.sendExeatApprovedEmail = async (studentEmail, studentName, exeat) => {
  await send(
    studentEmail,
    "Your Exeat Has Been Approved ✅",
    template(
      "Exeat Approved",
      `<p>Hi <strong>${studentName}</strong>,</p>
       <p>Your exeat request has been <strong style="color:#16a34a">approved</strong>. You may proceed on your trip.</p>
       ${exeatSummary(exeat)}
       <p style="margin-top:16px">Remember to present your QR code at the security gate when departing and returning.</p>`
    )
  );
};
 
// 4. Rejected (by dean or auto-rejection) → notify student
exports.sendExeatRejectedEmail = async (studentEmail, studentName, exeat, reason, isAuto = false) => {
  const tag = isAuto ? "Auto-Rejected (Expired)" : "Rejected";
  const reasonHtml = reason
    ? `<p><strong>Reason:</strong> ${reason}</p>`
    : isAuto
    ? `<p>Your request was not acted on within the allowed time and has been automatically cancelled. Your quota has been refunded.</p>`
    : "";
 
  await send(
    studentEmail,
    `Your Exeat Request Has Been ${tag}`,
    template(
      `Exeat ${tag}`,
      `<p>Hi <strong>${studentName}</strong>,</p>
       <p>Your exeat request has been <strong style="color:#dc2626">${tag.toLowerCase()}</strong>.</p>
       ${exeatSummary(exeat)}
       ${reasonHtml}
       <p style="margin-top:16px">You may submit a new request if needed.</p>`
    )
  );
};
 
// 5. Student departs (gate scan — departure confirmed)
exports.sendDepartureConfirmedEmail = async (studentEmail, studentName, exeat) => {
  await send(
    studentEmail,
    "Departure Confirmed — Safe Travels",
    template(
      "Departure Confirmed 🚀",
      `<p>Hi <strong>${studentName}</strong>,</p>
       <p>Your departure has been confirmed by security. Safe travels!</p>
       ${exeatSummary(exeat)}
       <p style="margin-top:16px"><strong>Please remember to return by ${new Date(exeat.returnDate).toDateString()}.</strong> Late returns incur a fine of ₦10,000 per day.</p>`
    )
  );
};
 
// 6. Student returned on time
exports.sendReturnConfirmedEmail = async (studentEmail, studentName, exeat) => {
  await send(
    studentEmail,
    "Return Confirmed — Welcome Back",
    template(
      "Return Confirmed ✅",
      `<p>Hi <strong>${studentName}</strong>,</p>
       <p>Your return has been confirmed by security. Welcome back!</p>
       ${exeatSummary(exeat)}`
    )
  );
};
 
// 7. Student returned late — debt created
exports.sendLateReturnDebtEmail = async (studentEmail, studentName, exeat, debt) => {
  const fmt = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
 
  await send(
    studentEmail,
    "Late Return Fine Applied to Your Account",
    template(
      "Late Return Fine ⚠️",
      `<p>Hi <strong>${studentName}</strong>,</p>
       <p>You returned <strong>${debt.daysLate} day(s) late</strong> from your exeat. A fine of <strong style="color:#dc2626">${fmt(debt.currentAmount)}</strong> has been applied to your account.</p>
       ${exeatSummary(exeat)}
       <table style="width:100%;border-collapse:collapse;margin-top:12px">
         <tr><td style="padding:6px 0;color:#6b7280;width:140px">Days late</td><td><strong>${debt.daysLate}</strong></td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Rate</td><td>₦10,000 per day</td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Total fine</td><td><strong style="color:#dc2626">${fmt(debt.currentAmount)}</strong></td></tr>
       </table>
       <p style="margin-top:16px">Please log in to your dashboard to pay this fine. Outstanding debts are visible to your dean.</p>`
    )
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// PAYMENT EMAILS
// ══════════════════════════════════════════════════════════════════════════════
 
// 8. Quota payment successful
exports.sendQuotaPaymentSuccessEmail = async (toEmail, reference, amount, quota) => {
  const fmt = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
 
  await send(
    toEmail,
    "Quota Payment Successful",
    template(
      "Payment Confirmed ✅",
      `<p>Your payment has been verified successfully.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:12px">
         <tr><td style="padding:6px 0;color:#6b7280;width:140px">Reference</td><td><strong>${reference}</strong></td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Amount paid</td><td><strong>${fmt(amount)}</strong></td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Quota added</td><td><strong>${quota} exeat(s)</strong></td></tr>
       </table>
       <p style="margin-top:16px">Thank you for your payment.</p>`
    )
  );
};
 
// 9. Debt payment successful
exports.sendDebtPaymentSuccessEmail = async (toEmail, studentName, reference, amount, debtDetails) => {
  const fmt = (n) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
 
  await send(
    toEmail,
    "Debt Payment Confirmed — Fine Cleared",
    template(
      "Fine Cleared ✅",
      `<p>Hi <strong>${studentName}</strong>,</p>
       <p>Your late return fine has been paid and cleared from your account.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:12px">
         <tr><td style="padding:6px 0;color:#6b7280;width:140px">Reference</td><td><strong>${reference}</strong></td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Amount paid</td><td><strong>${fmt(amount)}</strong></td></tr>
         <tr><td style="padding:6px 0;color:#6b7280">Fine for trip to</td><td>${debtDetails?.destination || "N/A"}</td></tr>
       </table>
       <p style="margin-top:16px">Your account is now clear. Thank you for settling your fine.</p>`
    )
  );
};
// auth----------------------------------//
exports.sendResetPasswordEmail = async (email, resetLink) => {
  await send(
    email,
    "New Password Reset Request",
    template(
      "Password Reset Request",
      `<p>Click the link to reset your password</p>
       <p><strong>Reset link:</strong><a>${resetLink}</a> </p>

       <p style="margin-top:16px">If you didn't request for a password reset, please ignore this email and double check your passwords</p>`,
    ),
  );
};
 
// Re-export transporter for authController to use (replace its local one)
exports.transporter = transporter;