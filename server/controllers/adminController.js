const User = require("../models/User");
const { StudentData, FacultyData } = require("../models/InstitutionalData");
const Announcement = require("../models/Announcement");
const Resource = require("../models/Resource");
const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
const Setting = require("../models/Setting");
const calculateAcademicInfo = require("../utils/academicCalculator");
const bcrypt = require("bcryptjs");

const normalizeBranchName = (input, validBranches) => {
  if (!input) return input;
  const cleanInput = input.trim().toUpperCase();

  // 1. Direct case-insensitive match
  const exactMatch = validBranches.find(b => b.toUpperCase() === cleanInput);
  if (exactMatch) return exactMatch;

  // 2. Common abbreviations -> Long names
  const abbreviations = {
    "CSE": "COMPUTER SCIENCE AND ENGINEERING",
    "ECE": "ELECTRONICS AND COMMUNICATION ENGINEERING",
    "EEE": "ELECTRICAL AND ELECTRONICS ENGINEERING",
    "IT": "INFORMATION TECHNOLOGY",
    "MECH": "MECHANICAL ENGINEERING",
    "CIVIL": "CIVIL ENGINEERING",
    "AIML": "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING",
    "AI & ML": "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING",
    "DS": "DATA SCIENCE",
    "AGRI": "AGRICULTURAL ENGINEERING",
    "MINING": "MINING ENGINEERING",
    "PETRO": "PETROLEUM TECHNOLOGY"
  };

  const expandedInput = abbreviations[cleanInput] || cleanInput;

  // 3. Substring match against valid branches
  // E.g. "Computer Science" will match "B.Tech. - Computer Science and Engineering"
  // First, check if valid branch contains the input
  let bestMatch = validBranches.find(b => b.toUpperCase().includes(expandedInput));
  if (bestMatch) return bestMatch;

  // 4. Reverse substring: If the input contains a known abbreviation
  for (const [abbr, expanded] of Object.entries(abbreviations)) {
    // If user typed "B.Tech CSE" or "Computer Science"
    if (cleanInput.includes(abbr) || cleanInput.includes(expanded)) {
      const match = validBranches.find(b => b.toUpperCase().includes(expanded) || b.toUpperCase() === abbr);
      if (match) return match;
    }
  }

  return input.trim(); // fallback
};


// ==================== DASHBOARD STATISTICS ====================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalFaculty = await User.countDocuments({ 
      role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] }
    });
    const totalAnnouncements = await Announcement.countDocuments();
    const totalResources = await Resource.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingRegistrations = await StudentData.countDocuments({ isRegistered: false }) +
                                  await FacultyData.countDocuments({ isRegistered: false });

    // Recent activities
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalAnnouncements,
        totalResources,
        activeUsers,
        pendingRegistrations
      },
      recentActivities: {
        announcements: recentAnnouncements,
        users: recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    if (req.query.branch) {
      query.branch = { $regex: new RegExp(`^${req.query.branch}$`, 'i') };
    }
    if (req.query.section) {
      query.section = { $regex: new RegExp(`^${req.query.section}$`, 'i') };
    }
    if (req.query.currentYear) {
      query.currentYear = parseInt(req.query.currentYear);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET USER BY ID ====================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Get assignments if student
    let assignments = {};
    if (user.role === "student") {
      const classFaculty = await ClassStudentAssignment.findOne({ studentId: user._id }).populate("facultyId", "name employeeId department");
      const proctorFaculty = await ProctorStudentAssignment.findOne({ studentId: user._id }).populate("facultyId", "name employeeId department");
      assignments = { classFaculty: classFaculty?.facultyId || null, proctorFaculty: proctorFaculty?.facultyId || null };
    }
    
    res.status(200).json({ success: true, user, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE USER ====================
exports.updateUser = async (req, res) => {
  try {
    const { name, phoneNumber, section, course, branch, department, designation, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (section && user.role === "student") user.section = section;
    if (course && user.role === "student") user.course = course;
    if (branch && user.role === "student") user.branch = branch;
    if (department && user.role !== "student") user.department = department;
    if (designation && user.role !== "student") user.designation = designation;
    if (typeof isActive === "boolean") user.isActive = isActive;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: user.toObject({ getters: true, versionKey: false, transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }})
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE USER ====================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Delete related data
    await Announcement.deleteMany({ createdBy: user._id });
    await Resource.deleteMany({ uploadedBy: user._id });
    await ClassStudentAssignment.deleteMany({ $or: [{ facultyId: user._id }, { studentId: user._id }] });
    await ProctorStudentAssignment.deleteMany({ $or: [{ facultyId: user._id }, { studentId: user._id }] });
    
    // Update institutional data
    if (user.rollNumber) {
      await StudentData.findOneAndUpdate({ roll: user.rollNumber }, { isRegistered: false, registeredAt: null });
    }
    if (user.employeeId) {
      await FacultyData.findOneAndUpdate({ empid: user.employeeId }, { isRegistered: false, registeredAt: null });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RESET USER PASSWORD ====================
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword || "Password@123", 12);
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE USER ROLE ====================
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const validRoles = ["student", "faculty", "hod", "deputyhod", "dean", "principal"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    
    user.role = role;
    if (user.role !== "student") {
      user.staffRole = role;
    }
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: user.toObject({ getters: true, versionKey: false, transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }})
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { parseFile } = require("../utils/csvParser");

// ==================== CREATE USER ====================
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, employeeId, branch, section, department, designation } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    if (role === "student" && rollNumber) {
        const existingRoll = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
        if (existingRoll) {
            return res.status(400).json({ success: false, message: "User with this roll number already exists" });
        }
    } else if (["faculty", "hod", "dean", "principal"].includes(role) && employeeId) {
        const existingEmpId = await User.findOne({ employeeId: employeeId.toUpperCase() });
        if (existingEmpId) {
            return res.status(400).json({ success: false, message: "User with this employee ID already exists" });
        }
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isVerified: true,
      isActive: true,
      isRegistered: true
    };

    if (role === "student") {
      userData.rollNumber = rollNumber ? rollNumber.toUpperCase() : undefined;
      userData.branch = branch;
      userData.section = section ? section.trim().toUpperCase() : section;
      
      const settings = await Setting.findOne();
      if (settings && settings.branchConfigs && settings.branchConfigs.length > 0) {
        const validBranches = settings.branchConfigs.map(c => c.branch);
        userData.branch = normalizeBranchName(userData.branch, validBranches);
        
        const branchConfig = settings.branchConfigs.find(c => c.branch === userData.branch);
        if (!branchConfig) {
          return res.status(400).json({ success: false, message: `Branch ${userData.branch} is not configured in Settings` });
        }
        
        let calculatedYear;
        if (userData.rollNumber) {
          const academicInfo = calculateAcademicInfo(userData.rollNumber);
          calculatedYear = academicInfo.currentYear;
        }
        
        let allowedSections = [];
        if (calculatedYear && branchConfig.years && branchConfig.years[calculatedYear.toString()]) {
          allowedSections = branchConfig.years[calculatedYear.toString()];
        } else if (branchConfig.years) {
          Object.values(branchConfig.years).forEach(secs => {
            if (Array.isArray(secs)) allowedSections.push(...secs);
          });
        }
        
        if (!allowedSections.includes(userData.section)) {
          return res.status(400).json({ success: false, message: `Please add section ${userData.section} in branch ${userData.branch}${calculatedYear ? ` for year ${calculatedYear}` : ''} in Admin Settings` });
        }
      }
    } else if (["faculty", "hod", "dean", "principal", "admin"].includes(role)) {
      userData.employeeId = employeeId ? employeeId.toUpperCase() : undefined;
      
      const settings = await Setting.findOne();
      let validBranches = [];
      if (settings && settings.branchConfigs) {
        validBranches = settings.branchConfigs.map(c => c.branch);
      }
      userData.department = department ? normalizeBranchName(department, validBranches) : department;
      userData.designation = designation;
    }

    const user = await User.create(userData);
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BULK CREATE USERS ====================
exports.bulkCreateUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    const data = await parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    const settings = await Setting.findOne();
    const errors = [];
    let successCount = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        if (!row.name || !row.email || !row.password || !row.role) {
          throw new Error("Missing required fields (name, email, password, role)");
        }
        
        const existing = await User.findOne({ email: row.email.toLowerCase() });
        if (existing) {
          throw new Error("Email already exists");
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(row.password, salt);
        
        const userData = {
          name: row.name,
          email: row.email.toLowerCase(),
          password: hashedPassword,
          role: row.role.toLowerCase(),
          isVerified: true,
          isActive: true,
          isRegistered: true
        };
        
        if (userData.role === "student") {
          userData.rollNumber = row.rollNumber ? row.rollNumber.toUpperCase() : undefined;
          userData.branch = row.branch;
          userData.section = row.section ? row.section.trim().toUpperCase() : row.section;
          
          if (settings && settings.branchConfigs && settings.branchConfigs.length > 0) {
            const validBranches = settings.branchConfigs.map(c => c.branch);
            userData.branch = normalizeBranchName(userData.branch, validBranches);

            const branchConfig = settings.branchConfigs.find(c => c.branch === userData.branch);
            if (!branchConfig) {
              throw new Error(`Branch ${userData.branch} is not configured in Settings`);
            }
            
            let calculatedYear;
            if (userData.rollNumber) {
              const academicInfo = calculateAcademicInfo(userData.rollNumber);
              calculatedYear = academicInfo.currentYear;
            }
            
            let allowedSections = [];
            if (calculatedYear && branchConfig.years && branchConfig.years[calculatedYear.toString()]) {
              allowedSections = branchConfig.years[calculatedYear.toString()];
            } else if (branchConfig.years) {
              Object.values(branchConfig.years).forEach(secs => {
                if (Array.isArray(secs)) allowedSections.push(...secs);
              });
            }
            
            if (!allowedSections.includes(userData.section)) {
              throw new Error(`Please add section ${userData.section} in branch ${userData.branch}${calculatedYear ? ` for year ${calculatedYear}` : ''}`);
            }
          }
        } else if (["faculty", "hod", "dean", "principal", "admin"].includes(userData.role)) {
          userData.employeeId = row.employeeId ? row.employeeId.toUpperCase() : undefined;
          let validBranches = [];
          if (settings && settings.branchConfigs) {
            validBranches = settings.branchConfigs.map(c => c.branch);
          }
          userData.department = row.department ? normalizeBranchName(row.department, validBranches) : row.department;
          userData.designation = row.designation;
        }
        
        await User.create(userData);
        successCount++;
      } catch (error) {
        errors.push({
          row: i + 2,
          identifier: row.email || "Unknown",
          message: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Bulk user upload completed",
      total: data.length,
      uploaded: successCount,
      failed: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
