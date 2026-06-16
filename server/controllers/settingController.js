const Setting = require("../models/Setting");

// ==================== GET SETTINGS ====================
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create({
        platformName: "CAMPX",
        supportEmail: "support@adityauniversity.in",
        contactEmail: "support@adityauniversity.in",
        contactMobile: "",
        logoUrl: "",
        maintenanceMode: false,
        facultyRegistrationEnabled: true,
        emailDomain: "@adityauniversity.in"
      });
    }
    
    const settingsObj = settings.toObject();
    settingsObj.branches = settings.branchConfigs?.map(c => c.branch) || [];
    
    const allSections = new Set();
    if (settingsObj.branchConfigs) {
      settingsObj.branchConfigs.forEach(c => {
        if (c.years) {
          Object.values(c.years).forEach(sections => {
            if (Array.isArray(sections)) {
              sections.forEach(s => allSections.add(s));
            }
          });
        }
      });
    }
    settingsObj.sections = Array.from(allSections).sort();

    res.status(200).json({
      success: true,
      settings: settingsObj
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
      contactEmail,
      contactMobile,
      logoUrl,
      maintenanceMode,
      facultyRegistrationEnabled,
      emailDomain,
      branchConfigs
    } = req.body;
    
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = new Setting();
    }
    
    if (platformName !== undefined) settings.platformName = platformName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactMobile !== undefined) settings.contactMobile = contactMobile;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (facultyRegistrationEnabled !== undefined) settings.facultyRegistrationEnabled = facultyRegistrationEnabled;
    if (emailDomain !== undefined) settings.emailDomain = emailDomain;
    if (branchConfigs !== undefined) {
      settings.branchConfigs = branchConfigs;
      settings.markModified('branchConfigs');
    }
    
    await settings.save();
    
    const settingsObj = settings.toObject();
    settingsObj.branches = settings.branchConfigs?.map(c => c.branch) || [];
    const allSections = new Set();
    if (settingsObj.branchConfigs) {
      settingsObj.branchConfigs.forEach(c => {
        if (c.years) {
          Object.values(c.years).forEach(sections => {
            if (Array.isArray(sections)) {
              sections.forEach(s => allSections.add(s));
            }
          });
        }
      });
    }
    settingsObj.sections = Array.from(allSections).sort();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: settingsObj
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};