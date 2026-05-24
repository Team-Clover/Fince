import nodemailer from "nodemailer";

/**
 * Initialize and cache the nodemailer transporter.
 * Uses environment variables if provided; otherwise falls back to an Ethereal test account for development.
 */
let transporter;
async function getTransporter() {
  if (transporter) return transporter;

  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
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
    console.log(
      "⚙️ Using Ethereal test email account. Preview URL will be logged after sending.",
    );
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
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "no-reply@fince.com",
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
  const subject = "Welcome Back to Fince!";
  const text = `Hi ${name},\n\nYou have just logged in to your Fince account.\n\nIf you are a business user, access your Business Dashboard for advanced analytics and team features.\n\nIf this login was not initiated by you, please reset your password immediately or contact support.\n\nThank you for choosing Fince!\n\nBest regards,\nFince Team`;
  await sendEmail(to, subject, text);
}

/**
 * Send a registration welcome email.
 * @param {string} to Recipient email address
 * @param {string} name User's full name for personalization
 */
export async function sendRegistrationEmail(to, name) {
  const subject = "Welcome to Fince - Your finance journey starts here!";
  const text = `Hi ${name},

A big, warm welcome to Fince!

Your account has been created successfully, and we are excited to have you with us. Fince is built to help you understand your money better, stay organized, and make smarter financial decisions with less stress.

Here is what you can start doing right away:

- Track your expenses and see where your money is going.
- Upload and manage invoices in one place.
- Create budgets that match your goals and lifestyle.
- Review your financial history whenever you need it.
- Use smart insights to spot patterns, opportunities, and areas where you can improve.
- Explore dashboards designed for both personal and business finance.

We built Fince to feel simple, useful, and reliable from the first day. Whether you are managing monthly spending, organizing invoices, planning a budget, or keeping an eye on business activity, your workspace is ready for you.

To get started, sign in to your Fince account and complete your profile details. After that, you can begin adding invoices, reviewing transactions, setting budgets, and exploring your dashboard.

Your privacy and security matter to us. If you did not create this account, please contact support immediately so we can help protect your information.

Thank you for joining Fince. We are glad you are here, and we hope Fince becomes a helpful part of the way you manage your financial life.

Welcome aboard!

Best regards,
Fince Team`;
  await sendEmail(to, subject, text);
}
