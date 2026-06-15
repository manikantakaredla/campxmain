const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER or EMAIL_PASS is missing!");
      return false;
    }

    console.log("=========================================");
    console.log("📧 EMAIL CONFIG");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("SMTP_HOST:", process.env.SMTP_HOST || "smtp.gmail.com");
    console.log("SMTP_PORT:", process.env.SMTP_PORT || 587);
    console.log("=========================================");

    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});
    console.log("🔍 Verifying SMTP connection...");

    await transporter.verify();

    console.log("✅ SMTP VERIFIED");

    const mailOptions = {
      from: `"CAMPX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (html) {
      mailOptions.html = html;
    }

    console.log("=========================================");
    console.log(`📧 SENDING EMAIL TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`📄 TEXT: ${text}`);
    console.log("=========================================");

    console.log("🚀 Before sendMail");

    const info = await transporter.sendMail(mailOptions);

    console.log("🚀 After sendMail");
    console.log("✅ Email Sent Successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return true;
  } catch (error) {
    console.error("❌ EMAIL ERROR");
    console.error(error);
    return false;
  }
};

module.exports = sendEmail;