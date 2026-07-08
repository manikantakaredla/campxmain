const crypto = require('crypto');
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const Resource = require("../models/Resource");
const AcademicActivity = require("../models/AcademicActivity");
const Notification = require("../models/Notification");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const SubjectSectionAssignment = require("../models/SubjectSectionAssignment");
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const calculateAcademicInfo = require("../utils/academicCalculator");

// ==================== GET PROFILE ====================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const { resolveClassFaculty, resolveProctorFaculty } = require("../utils/assignmentResolver");
    const [classResult, proctorResult] = await Promise.all([
      resolveClassFaculty(user),
      resolveProctorFaculty(user)
    ]);
    
    res.status(200).json({
      success: true,
      user,
      assignments: {
        classFaculty: classResult?.faculty || null,
        proctorFaculty: proctorResult?.faculty || null
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PROFILE ====================
exports.updateProfile = async (req, res) => {
  try {
    const { name, section, phoneNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (name) user.name = name;
    if (section && user.role === "student") user.section = section;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    await user.save();
    
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PHONE NUMBER ====================
exports.updatePhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number"
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { phoneNumber },
      { new: true }
    ).select("-password");
    
    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PROFILE PICTURE ====================
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP)"
      });
    }
    
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than 2MB"
      });
    }
    
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `profiles/${req.user.id}-${Date.now()}.${fileExtension}`;
    
    const { error } = await supabase.storage
      .from("campx-files")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600"
      });
    
    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to upload image: " + error.message
      });
    }
    
    const { data: publicUrlData } = supabase.storage
      .from("campx-files")
      .getPublicUrl(fileName);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: publicUrlData.publicUrl },
      { new: true }
    ).select("-password");
    
    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error("Update profile picture error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE NOTIFICATION PREFERENCES ====================
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { email, push } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.notificationPreferences = {
      email: email !== undefined ? email : user.notificationPreferences?.email ?? true,
      push: push !== undefined ? push : user.notificationPreferences?.push ?? true
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Notification preferences updated",
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET DASHBOARD DATA ====================
exports.getDashboardData = async (req, res) => {
  try {
 const user = await User.findById(req.user.id);

if (
  user &&
  user.role === "student" &&
  user.rollNumber
) {
  const academicInfo = calculateAcademicInfo(
    user.rollNumber
  );

  user.currentYear = academicInfo.currentYear;
  user.currentSemester = academicInfo.currentSemester;
  user.batch = academicInfo.batch;

  await user.save();
}
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const [recentAnnouncements, recentResources, upcomingActivities, unreadNotifications] = await Promise.all([
      Announcement.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "name")
        .lean(),
      Resource.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("uploadedBy", "name")
        .lean(),
      AcademicActivity.find({
        status: { $in: ["upcoming", "ongoing"] },
        startDate: { $gte: new Date() }
      })
        .sort({ startDate: 1 })
        .limit(5)
        .lean(),
      Notification.countDocuments({
        targetUsers: user._id,
        isRead: false
      })
    ]);

    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          rollNumber: user.rollNumber,
          branch: user.branch,
          currentYear: user.currentYear,
          currentSemester: user.currentSemester,
          profilePicture: user.profilePicture
        },
        recentAnnouncements,
        recentResources,
        upcomingActivities,
        unreadNotifications
      }
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ==================== GET ASSIGNED FACULTY ====================
exports.getAssignedFaculty = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const { resolveClassFaculty, resolveProctorFaculty } = require("../utils/assignmentResolver");

    const branchAliases = [student.branch];
    if (student.branch === 'CSE' || student.branch === 'Computer Science') {
      branchAliases.push('B.Tech. - Computer Science and Engineering', 'CSE', 'Computer Science');
    } else if (student.branch === 'B.Tech. - Computer Science and Engineering') {
      branchAliases.push('CSE', 'Computer Science');
    }

    const [classResult, proctorResult, teachingFaculty] = await Promise.all([
      resolveClassFaculty(student),
      resolveProctorFaculty(student),
      SubjectSectionAssignment.find({
        department: { $in: branchAliases },
        year: student.currentYear,
        section: student.section,
        isActive: true
      })
      .populate("subjectId", "name code")
      .populate("facultyId", "name employeeId department profilePicture")
      .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        proctor: proctorResult ? proctorResult.faculty : null,
        classTeacher: classResult ? classResult.faculty : null,
        teachingFaculty: teachingFaculty || []
      }
    });
  } catch (error) {
    console.error("Get assigned faculty error:", error);
    res.status(500).json({ success: false, message: "Error fetching assigned faculty" });
  }
};
