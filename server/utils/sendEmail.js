const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing!");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"CAMPX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    };

    if (html) {
      mailOptions.html = html;
    }

    console.log(`\n=========================================`);
    console.log(`📧 SENDING EMAIL TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`📄 TEXT: ${text}`);
    console.log(`=========================================\n`);

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

module.exports = sendEmail;