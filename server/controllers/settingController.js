const Setting = require("../models/Setting");

// ==================== GET SETTINGS ====================
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create({
        platformName: "CAMPX",
        supportEmail: "support@adityauniversity.in",
        logoUrl: "",
        maintenanceMode: false,
        facultyRegistrationEnabled: true,
        emailDomain: "@adityauniversity.in"
      });
    }
    
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE SETTINGS ====================
exports.updateSettings = async (req, res) => {
  try {
    const {
      platformName,
      supportEmail,
      logoUrl,
      maintenanceMode,
      facultyRegistrationEnabled,
      emailDomain
    } = req.body;
    
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = new Setting();
    }
    
    if (platformName !== undefined) settings.platformName = platformName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (facultyRegistrationEnabled !== undefined) settings.facultyRegistrationEnabled = facultyRegistrationEnabled;
    if (emailDomain !== undefined) settings.emailDomain = emailDomain;
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};