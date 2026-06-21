const getBaseTemplate = (title, content, actionLink, actionText) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
        .header { background-color: #1e3a8a; padding: 25px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        .title { font-size: 20px; font-weight: 600; color: #1e3a8a; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
        .message-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
        .action-container { text-align: center; margin: 30px 0 10px; }
        .button { display: inline-block; background-color: #3b82f6; color: white !important; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: 600; font-size: 15px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #eaeaea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CAMPX</h1>
          <p>Aditya University</p>
        </div>
        <div class="content">
          <div class="title">${title}</div>
          <div class="message-box">
            ${content}
          </div>
          ${actionLink && actionText ? `
            <div class="action-container">
              <a href="${actionLink}" class="button">${actionText}</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated message from the CAMPX platform. Please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Aditya University. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.getGenericNotificationTemplate = (title, message) => {
  return getBaseTemplate(
    title,
    message,
    process.env.CLIENT_URL || "https://campxserver.onrender.com", 
    "View in CAMPX"
  );
};

exports.getAnnouncementTemplate = (title, message) => {
  return getBaseTemplate(
    `📢 New Announcement: ${title}`,
    message,
    process.env.CLIENT_URL || "https://campxserver.onrender.com",
    "View Announcement"
  );
};

exports.getClassAssignmentTemplate = (facultyName, department) => {
  return getBaseTemplate(
    "👨‍🏫 Class Faculty Assigned",
    `<p>You have been assigned to <strong>${facultyName}</strong> as your class faculty.</p>
     <p>Department: ${department}</p>`,
    process.env.CLIENT_URL || "https://campxserver.onrender.com",
    "View Dashboard"
  );
};

exports.getPlacementTemplate = (title, message) => {
  return getBaseTemplate(
    `🎓 Placement Update: ${title}`,
    message,
    process.env.CLIENT_URL || "https://campxserver.onrender.com",
    "View Placements"
  );
};

exports.getResourceTemplate = (title, description) => {
  return getBaseTemplate(
    `📚 New Resource Uploaded: ${title}`,
    description,
    process.env.CLIENT_URL || "https://campxserver.onrender.com",
    "Access Resource"
  );
};
