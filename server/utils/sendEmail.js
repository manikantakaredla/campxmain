const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
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