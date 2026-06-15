const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  await transporter.verify();
  console.log("✅ SMTP VERIFIED");

  return transporter;
};

const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER or EMAIL_PASS is missing");
      return false;
    }

    const mailTransporter = await getTransporter();

    const mailOptions = {
      from: `CAMPX <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };

    console.log(`📧 Sending email to: ${to}`);

    const info = await mailTransporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return true;
  } catch (error) {
    console.error("❌ EMAIL ERROR");
    console.error(error.message || error);
    return false;
  }
};

module.exports = sendEmail;