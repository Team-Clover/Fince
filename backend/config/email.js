import nodemailer from "nodemailer";

/**
 * Initialize and cache the nodemailer transporter.
 * Uses environment variables if provided; otherwise falls back to an Ethereal test account for development.
 */
let transporter;
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false otherwise
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development fallback – create a test account on Ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("⚙️ Using Ethereal test email account. Preview URL will be logged after sending.");
  }

  return transporter;
}

/**
 * Send a simple email.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} text Plain text body
 */
export async function sendEmail(to, subject, text) {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@fince.com",
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("Preview URL:", previewUrl);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

/**
 * Send a login notification email.
 * @param {string} to Recipient email address
 * @param {string} name User's full name for personalization
 */
export async function sendLoginEmail(to, name) {
  const subject = "Login Notification";
  const text = `Hello ${name},\n\nYou have successfully logged into Fince at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.\n\nBest regards,\nFince Team`;
  await sendEmail(to, subject, text);
}
