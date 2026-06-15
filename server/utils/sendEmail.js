const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;

    client.authentications["api-key"].apiKey =
      process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: {
        email: "luckyha0637k@gmail.com",
        name: "CAMPX",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html || `<p>${text}</p>`,
    });

    console.log("✅ Email sent successfully");

    return true;
  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};

module.exports = sendEmail;