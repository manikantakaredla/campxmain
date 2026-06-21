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

const sendBatchEmails = async (emailsArray, subject, htmlContent) => {
  if (!emailsArray || emailsArray.length === 0) return { delivered: 0, failed: 0, failedEmails: [] };

  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const BATCH_SIZE = 50;
    let delivered = 0;
    let failed = 0;
    let failedEmails = [];

    // Chunk the array
    for (let i = 0; i < emailsArray.length; i += BATCH_SIZE) {
      const chunk = emailsArray.slice(i, i + BATCH_SIZE);
      
      try {
        const bccList = chunk.map(email => ({ email }));
        
        await apiInstance.sendTransacEmail({
          sender: {
            email: "luckyha0637k@gmail.com",
            name: "CAMPX",
          },
          to: [{ email: "luckyha0637k@gmail.com", name: "CAMPX Updates" }], // Primary to self
          bcc: bccList, // BCC users so they don't see each other
          subject,
          htmlContent,
        });

        delivered += chunk.length;
      } catch (err) {
        console.error("❌ Batch Email error for chunk:", err.message);
        failed += chunk.length;
        failedEmails.push(...chunk);
      }
    }

    return { delivered, failed, failedEmails };
  } catch (error) {
    console.error("❌ Fatal Batch Email error:", error);
    return { delivered: 0, failed: emailsArray.length, failedEmails: emailsArray };
  }
};

module.exports = { sendEmail, sendBatchEmails };