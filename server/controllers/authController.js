const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { StudentData, FacultyData } = require("../models/InstitutionalData");
const sendEmail = require("../utils/sendEmail");
const calculateAcademicInfo = require("../utils/academicCalculator");
const supabase = require("../config/supabase");
// Helper Functions
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==================== STUDENT REGISTRATION ====================
exports.registerStudent = async (req, res) => {
  try {
    const { rollNumber, email, password } = req.body;

    if (!email.endsWith("@adityauniversity.in")) {
      return res.status(400).json({
        success: false,
        message: "Please use your college email (@adityauniversity.in)"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered with this email"
      });
    }

    const studentData = await StudentData.findOne({ 
      roll: rollNumber.toUpperCase(),
      email: email.toLowerCase()
    });

    if (!studentData) {
      return res.status(400).json({
        success: false,
        message: "Roll number and email do not match our records"
      });
    }

    if (studentData.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "This student is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const academicInfo = calculateAcademicInfo(rollNumber);
    const otp = generateOTP();

    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      purpose: "registration",
      registrationData: {
        name: studentData.name,
        email,
        password: hashedPassword,
        rollNumber: rollNumber.toUpperCase(),
        course: studentData.course,
        branch: studentData.branch,
        section: studentData.section || "A",
        phoneNumber: studentData.ph_no,
        role: "student",
        admissionYear: academicInfo?.admissionYear,
        studentType: academicInfo?.studentType,
        currentYear: academicInfo?.currentYear,
        currentSemester: academicInfo?.currentSemester,
        batch: academicInfo?.batch
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    sendEmail(
      email,
      "CAMPX - Verify Your Email",
      `Your OTP for registration is: ${otp}\nValid for 10 minutes.`
    );

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration."
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FACULTY REGISTRATION ====================
exports.registerFaculty = async (req, res) => {
  try {
    const { employeeId, email, password } = req.body;

    if (!email.endsWith("@adityauniversity.in")) {
      return res.status(400).json({
        success: false,
        message: "Please use your college email (@adityauniversity.in)"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered"
      });
    }

    const facultyData = await FacultyData.findOne({
      empid: employeeId.toUpperCase(),
      email: email.toLowerCase()
    });

    if (!facultyData) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and email do not match our records"
      });
    }

    if (facultyData.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "This faculty is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();

    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      purpose: "registration",
      registrationData: {
        name: facultyData.name,
        email,
        password: hashedPassword,
        employeeId: employeeId.toUpperCase(),
        department: facultyData.dept,
        designation: facultyData.designation,
        staffRole: facultyData.staff_role,
        role: facultyData.staff_role,
        isVerified: true,
        isRegistered: true
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    sendEmail(
      email,
      "CAMPX - Verify Your Email",
      `Your OTP for faculty registration is: ${otp}\nValid for 10 minutes.`
    );

    res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("Faculty registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== VERIFY OTP ====================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      const existing = await OTP.findOne({ email });
      if (existing) {
        existing.attempts += 1;
        await existing.save();

        if (existing.attempts >= 3) {
          await OTP.deleteMany({ email });
          return res.status(400).json({
            success: false,
            message: "Maximum attempts exceeded. Please register again."
          });
        }
      }
      return res.status(400).json({
            success: false,
        message: "Invalid OTP"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteMany({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again."
      });
    }

    if (otpRecord.purpose === "forgot_password" || purpose === "forgot_password") {
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully"
      });
    }

    const registrationData = otpRecord.registrationData;
    
    const user = await User.create({
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
      rollNumber: registrationData.rollNumber,
      employeeId: registrationData.employeeId,
      course: registrationData.course,
      branch: registrationData.branch,
      section: registrationData.section,
      phoneNumber: registrationData.phoneNumber,
      department: registrationData.department,
      designation: registrationData.designation,
      staffRole: registrationData.staffRole,
      admissionYear: registrationData.admissionYear,
      studentType: registrationData.studentType,
      currentYear: registrationData.currentYear,
      currentSemester: registrationData.currentSemester,
      batch: registrationData.batch,
      isVerified: true,
      isRegistered: true,
      isActive: true
    });

    if (user.role === "student") {
      await StudentData.findOneAndUpdate(
        { email },
        { isRegistered: true, registeredAt: new Date() }
      );
    } else {
      await FacultyData.findOneAndUpdate(
        { email },
        { isRegistered: true, registeredAt: new Date() }
      );
    }

    await OTP.deleteMany({ email });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        course: user.course,
        branch: user.branch,
        currentYear: user.currentYear,
        currentSemester: user.currentSemester,
        batch: user.batch
      }
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RESEND OTP ====================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found"
      });
    }

    const newOtp = generateOTP();
    otpRecord.otp = newOtp;
    otpRecord.attempts = 0;
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();

    sendEmail(
      email,
      "CAMPX - New OTP",
      `Your new OTP is: ${newOtp}\nValid for 10 minutes.`
    );

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LOGIN ====================
exports.loginUser = async (req, res) => {
  try {
    const { rollNoOrEmpId, password, rememberMe } = req.body;

    if (!rollNoOrEmpId) {
      return res.status(400).json({
        success: false,
        message: "Roll No / Employee ID is required"
      });
    }

    const identifier = rollNoOrEmpId.trim().toUpperCase();

    const user = await User.findOne({
      $or: [
        { rollNumber: identifier },
        { employeeId: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register.",
        error: "User not found. Please register."
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Contact admin."
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your password.",
        error: "Invalid credentials. Please check your password."
      });
    }

    // ==========================
    // RECALCULATE STUDENT DATA
    // ==========================
    if (user.role === "student" && user.rollNumber) {

      const academicInfo = calculateAcademicInfo(
        user.rollNumber
      );

      user.admissionYear = academicInfo.admissionYear;
      user.studentType = academicInfo.studentType;
      user.currentYear = academicInfo.currentYear;
      user.currentSemester = academicInfo.currentSemester;
      user.batch = academicInfo.batch;

      console.log(
        "Academic Info Updated:",
        academicInfo
      );
    }

    user.lastLogin = new Date();

    await user.save();

    const token = generateToken(user);

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    };
    
    if (rememberMe) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }
    
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        course: user.course,
        branch: user.branch,
        currentYear: user.currentYear,
        currentSemester: user.currentSemester,
        batch: user.batch,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email, rollNoOrEmpId } = req.body;
    const identifier = (rollNoOrEmpId || email || "").trim().toUpperCase();

    const user = await User.findOne({
      $or: [
        { rollNumber: identifier },
        { employeeId: identifier },
        { email: identifier.toLowerCase() }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register.",
        error: "User not found. Please register."
      });
    }

    const targetEmail = user.email;
    const otp = generateOTP();

    await OTP.deleteMany({ email: targetEmail, purpose: "forgot_password" });
    await OTP.create({
      email: targetEmail,
      otp,
      purpose: "forgot_password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    sendEmail(
      targetEmail,
      "CAMPX - Password Reset OTP",
      `Your OTP to reset password is: ${otp}\nValid for 10 minutes.`
    );

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      email: targetEmail
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ email, otp, purpose: "forgot_password" });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteMany({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    await OTP.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PROFILE ====================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    if (name) user.name = name;
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

// ==================== GET CURRENT USER ====================
exports.getMe = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password");
if (
  user &&
  user.role === "student" &&
  user.rollNumber
) {
  const academicInfo =
    calculateAcademicInfo(
      user.rollNumber
    );

  user.currentYear =
    academicInfo.currentYear;

  user.currentSemester =
    academicInfo.currentSemester;

  user.batch =
    academicInfo.batch;

  await user.save();
}
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (
      user.role === "student" &&
      user.rollNumber
    ) {

      const academicInfo =
        calculateAcademicInfo(
          user.rollNumber
        );

      user.currentYear =
        academicInfo.currentYear;

      user.currentSemester =
        academicInfo.currentSemester;

      user.batch =
        academicInfo.batch;

      await user.save();
      
      try {
        const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
        const ClassFacultyAssignment = require("../models/ClassFacultyAssignment");
        
        const proctorAssignment = await ProctorStudentAssignment.findOne({ studentId: user._id })
          .populate("facultyId", "name phoneNumber email");
          
        const classAssignment = await ClassFacultyAssignment.findOne({ studentId: user._id })
          .populate("facultyId", "name phoneNumber email");
          
        const userObj = user.toObject();
        userObj.proctor = proctorAssignment ? proctorAssignment.facultyId : null;
        userObj.classTeacher = classAssignment ? classAssignment.facultyId : null;
        
        return res.status(200).json({
          success: true,
          user: userObj
        });
      } catch (err) {
        console.error("Error fetching proctor/class faculty:", err);
      }
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};