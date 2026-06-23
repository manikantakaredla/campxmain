import os
import re

file_path = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix destructuring in createAnnouncement
destructure_old = """      const {
        title,
        description,
        type,
        priority,
        audience,
        contacts,
        location,
        startDate,
        expiryDate,
        tags,
        targetDepartment,
        targetYear,
        targetSection,
        feeAmount,
        feeLastDate,
        eventDate,
        eventVenue,
        registrationLink
      } = req.body;"""

destructure_new = """      const {
        title,
        description,
        type,
        priority,
        audience,
        contacts,
        location,
        startDate,
        expiryDate,
        tags,
        feeAmount,
        feeLastDate,
        eventDate,
        eventVenue,
        registrationLink,
        url,
        targetMyClass,
        targetMyProctor,
        targetMyDepartment,
        targetMySection,
        targetBranches,
        targetYears,
        targetSections
      } = req.body;"""

content = content.replace(destructure_old, destructure_new)

# Fix role based validation and object construction
# Remove the old targetDepartment logic
old_role_logic = """    const currentUser = await User.findById(req.user.id);
    let finalTargetDepartment = targetDepartment || null;
    
    if (["faculty", "hod"].includes(currentUser.role)) {
      finalTargetDepartment = currentUser.department;
    } else if (["dean", "principal", "management"].includes(currentUser.role)) {
      const allowedBranches = currentUser.managedBranches && currentUser.managedBranches.length > 0 
        ? currentUser.managedBranches 
        : [currentUser.department];
      
      if (targetDepartment && !allowedBranches.includes(targetDepartment)) {
        return res.status(403).json({
          success: false,
          message: "You can only target your managed branches."
        });
      }
      // If no target department selected, it will target all allowed branches (handled in query/notification)
    }

    // Build announcement data
    const announcementData = {
      title,
      description,
      type: type || "general",
      priority: priority || "medium",
      audience: audience || "all",
      attachment,
      attachmentType,
      contacts: parsedContacts || [],
      location: location || null,
      startDate: startDate || new Date(),
      expiryDate: expiryDate || null,
      tags: tags || [],
      createdBy: req.user.id,
      status: "active",
      targetDepartment: finalTargetDepartment,
      targetYear: targetYear ? parseInt(targetYear) : null,
      targetSection: targetSection || null
    };"""

new_role_logic = """    const currentUser = await User.findById(req.user.id);

    // Build announcement data
    const announcementData = {
      title,
      description,
      type: type || "general",
      priority: priority || "medium",
      audience: audience || "all",
      attachment,
      attachmentType,
      url: url || null,
      contacts: parsedContacts || [],
      location: location || null,
      startDate: startDate || new Date(),
      expiryDate: expiryDate || null,
      tags: tags || [],
      createdBy: req.user.id,
      status: "active",
      targetMyClass: targetMyClass === 'true' || targetMyClass === true,
      targetMyProctor: targetMyProctor === 'true' || targetMyProctor === true,
      targetMyDepartment: targetMyDepartment === 'true' || targetMyDepartment === true,
      targetMySection: targetMySection === 'true' || targetMySection === true
    };
    
    if (targetBranches) {
      try {
        announcementData.targetBranches = typeof targetBranches === 'string' ? JSON.parse(targetBranches) : targetBranches;
      } catch(e) { announcementData.targetBranches = []; }
    }
    if (targetYears) {
      try {
        announcementData.targetYears = typeof targetYears === 'string' ? JSON.parse(targetYears) : targetYears;
      } catch(e) { announcementData.targetYears = []; }
    }
    if (targetSections) {
      try {
        announcementData.targetSections = typeof targetSections === 'string' ? JSON.parse(targetSections) : targetSections;
      } catch(e) { announcementData.targetSections = []; }
    }
    
    if (["faculty", "hod"].includes(currentUser.role) && announcementData.targetMyDepartment) {
      announcementData.targetBranches = [currentUser.department];
    } else if (["dean", "principal", "management"].includes(currentUser.role)) {
      const allowedBranches = currentUser.managedBranches && currentUser.managedBranches.length > 0 
        ? currentUser.managedBranches 
        : [currentUser.department];
        
      if (announcementData.targetBranches && announcementData.targetBranches.length > 0) {
        const hasUnauthorized = announcementData.targetBranches.some(b => !allowedBranches.includes(b));
        if (hasUnauthorized) {
          return res.status(403).json({
            success: false,
            message: "You can only target your managed branches."
          });
        }
      }
    }"""

content = content.replace(old_role_logic, new_role_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated createAnnouncement to save advanced targeting")
