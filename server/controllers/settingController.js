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
    
    const settingsObj = settings.toObject({ flattenMaps: true });
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
    
    console.log("Returning branchConfigs:", JSON.stringify(settingsObj.branchConfigs, null, 2));

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
    
    console.log("Incoming settings", JSON.stringify(req.body, null, 2));
    console.log("Incoming branchConfigs", JSON.stringify(branchConfigs, null, 2));
    
    const updateData = {};
    if (platformName !== undefined) updateData.platformName = platformName;
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactMobile !== undefined) updateData.contactMobile = contactMobile;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (facultyRegistrationEnabled !== undefined) updateData.facultyRegistrationEnabled = facultyRegistrationEnabled;
    if (emailDomain !== undefined) updateData.emailDomain = emailDomain;
    if (branchConfigs !== undefined) updateData.branchConfigs = branchConfigs;

    let updated = await Setting.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    console.log("Saved settings", JSON.stringify(updated.branchConfigs, null, 2));
    
    const settingsObj = updated.toObject({ flattenMaps: true });
    settingsObj.branches = updated.branchConfigs?.map(c => c.branch) || [];
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