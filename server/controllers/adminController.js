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
    // If user typed "B.Tech CSE"
    if (cleanInput.includes(abbr) || cleanInput.includes(expanded)) {
      const match = validBranches.find(b => b.toUpperCase().includes(expanded));
      if (match) return match;
    }
  }

  return input.trim(); // fallback
};


// ==================== DASHBOARD STATISTICS ====================
let adminStatsCache = {
  data: null,
  timestamp: null
};

exports.getDashboardStats = async (req, res) => {
  try {
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    // Return cached data if valid
    if (adminStatsCache.data && adminStatsCache.timestamp && (Date.now() - adminStatsCache.timestamp < CACHE_TTL)) {
      return res.status(200).json(adminStatsCache.data);
    }

    const totalStudents = await User.countDocuments({ role: "student" }).lean();
    const totalFaculty = await User.countDocuments({ 
      role: { $in: ["faculty", "hod", "dean", "principal"] }
    }).lean();
    const totalAnnouncements = await Announcement.countDocuments().lean();
    const totalResources = await Resource.countDocuments().lean();
    const activeUsers = await User.countDocuments({ isActive: true }).lean();
    const pendingRegistrations = await StudentData.countDocuments({ isRegistered: false }).lean() +
                                  await FacultyData.countDocuments({ isRegistered: false }).lean();

    // Recent activities
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name")
      .lean();

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")
      .lean();

    const responseData = {
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
    };

    // Update cache
    adminStatsCache.data = responseData;
    adminStatsCache.timestamp = Date.now();

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, status } = req.query;
    
    let userQuery = {};
    let studentBranchQuery = null;
    let facultyBranchQuery = null;
    
    if (role) {
      userQuery.role = role;
    }
    
    // For HODs, automatically lock to their department
    let requestedBranch = req.query.branch;
    if (req.user.role === 'hod' && req.user.department) {
      requestedBranch = req.user.department;
    }

    if (requestedBranch) {
      const branchInput = requestedBranch.toUpperCase();
      const variations = [requestedBranch];
      
      const map = {
        "CSE": ["COMPUTER SCIENCE AND ENGINEERING", "B.TECH COMPUTER SCIENCE AND ENGINEERING", "CS", "B.Tech. - Computer Science and Engineering"],
        "ECE": ["ELECTRONICS AND COMMUNICATION ENGINEERING", "B.TECH ELECTRONICS AND COMMUNICATION ENGINEERING", "EC", "B.Tech. - Electronics and Communication Engineering"],
        "EEE": ["ELECTRICAL AND ELECTRONICS ENGINEERING", "B.TECH ELECTRICAL AND ELECTRONICS ENGINEERING", "EE", "B.Tech. - Electrical and Electronics Engineering"],
        "IT": ["INFORMATION TECHNOLOGY", "B.TECH INFORMATION TECHNOLOGY", "B.Tech. - Information Technology"],
        "MECH": ["MECHANICAL ENGINEERING", "B.TECH MECHANICAL ENGINEERING", "ME", "B.Tech. - Mechanical Engineering"],
        "CIVIL": ["CIVIL ENGINEERING", "B.TECH CIVIL ENGINEERING", "CE", "B.Tech. - Civil Engineering"],
        "AIML": ["ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", "AI ML", "AI", "B.Tech. - Artificial Intelligence & Machine Learning (AI & ML)", "ARTIFICIAL INTELLIGENCE & MACHINE LEARNING (AI & ML)"],
        "DS": ["DATA SCIENCE", "B.TECH DATA SCIENCE", "DATA", "B.Tech. - Computer Science and Engineering - Data Science", "COMPUTER SCIENCE AND ENGINEERING - DATA SCIENCE"],
        "AGRI": ["AGRICULTURAL ENGINEERING", "AGRICULTURAL", "AG", "B.Tech. - Agricultural Engineering"],
        "MINING": ["MINING ENGINEERING", "MINING", "B.Tech. - Mining Engineering"],
        "PETRO": ["PETROLEUM TECHNOLOGY", "PETROLEUM", "B.Tech. - Petroleum Technology"]
      };
      
      if (map[branchInput]) {
        variations.push(...map[branchInput]);
      } else {
        for (const [key, vals] of Object.entries(map)) {
          if (vals.some(v => v === branchInput || branchInput.includes(v))) {
            variations.push(key, ...vals);
          }
        }
      }
      
      const branchRegexArray = variations.map(v => {
        const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^${escaped}$`, 'i');
      });
      
      if (!role || role === 'student') {
        userQuery.branch = { $in: branchRegexArray };
        studentBranchQuery = { $in: branchRegexArray };
      }
      if (!role || role !== 'student') {
        userQuery.department = { $in: branchRegexArray };
        facultyBranchQuery = { $in: branchRegexArray };
      }
    }

    if (req.query.section) {
      userQuery.section = req.query.section;
    }
    if (req.query.currentYear) {
      userQuery.currentYear = parseInt(req.query.currentYear);
    }
    
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } }
      ];
    }
    
    let allUsers = [];

    // 1. Fetch Registered Users
    if (status !== 'not_verified') {
      const users = await User.find(userQuery).select("-password").lean();
      allUsers.push(...users);
    }

    // 2. Fetch Not Registered Students & Faculty
    if (status !== 'active' && status !== 'inactive') {
      // Students
      if (!role || role === 'student') {
        const sdQuery = { isRegistered: false };
        if (studentBranchQuery) sdQuery.branch = studentBranchQuery;
        if (req.query.section) {
          sdQuery.section = new RegExp(`^${req.query.section}$`, 'i');
        }
        if (search) {
          sdQuery.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { roll: { $regex: search, $options: "i" } }
          ];
        }
        const studentsData = await StudentData.find(sdQuery).lean();
        const mappedStudents = studentsData.map(s => ({
          _id: s._id,
          name: s.name,
          email: s.email,
          rollNumber: s.roll,
          branch: s.branch,
          section: s.section,
          course: s.course,
          phoneNumber: s.ph_no,
          role: 'student',
          isRegistered: false,
          isActive: false,
          createdAt: s.createdAt,
          isFromData: true
        }));
        allUsers.push(...mappedStudents);
      }

      // Faculty
      if (!role || ['faculty', 'hod', 'dean', 'principal'].includes(role)) {
        const fdQuery = { isRegistered: false };
        if (facultyBranchQuery) fdQuery.dept = facultyBranchQuery;
        if (role && role !== 'admin') fdQuery.staff_role = role;
        if (search) {
          fdQuery.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { empid: { $regex: search, $options: "i" } }
          ];
        }
        const facultyData = await FacultyData.find(fdQuery).lean();
        const mappedFaculty = facultyData.map(f => ({
          _id: f._id,
          name: f.name,
          email: f.email,
          employeeId: f.empid,
          department: f.dept,
          designation: f.designation,
          role: f.staff_role,
          isRegistered: false,
          isActive: false,
          createdAt: f.createdAt,
          isFromData: true
        }));
        allUsers.push(...mappedFaculty);
      }
    }

    // Apply Year Filter for StudentData records
    if (req.query.currentYear) {
      allUsers = allUsers.filter(u => {
        if (u.role !== 'student') return false;
        if (u.currentYear === parseInt(req.query.currentYear)) return true;
        if (u.isFromData && u.rollNumber) {
          const academicInfo = calculateAcademicInfo(u.rollNumber);
          return academicInfo.currentYear === parseInt(req.query.currentYear);
        }
        return false;
      });
    }

    // Apply Status Filter for User records
    if (status === 'active') {
      allUsers = allUsers.filter(u => u.isActive === true && u.isRegistered !== false);
    } else if (status === 'inactive') {
      allUsers = allUsers.filter(u => u.isActive === false && u.isRegistered !== false);
    } else if (status === 'not_verified') {
      allUsers = allUsers.filter(u => u.isRegistered === false);
    }

    // Sort by createdAt descending
    allUsers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = allUsers.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = allUsers.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      success: true,
      users: paginatedUsers,
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
    if (req.body.specialRoles && user.role !== "student") user.specialRoles = req.body.specialRoles;
    
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
    
    const validRoles = ["student", "faculty", "hod", "dean", "principal"];
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
      userData.section = section ? section.trim().toUpperCase() : section;
      
      let calculatedYear;
      if (userData.rollNumber) {
        const academicInfo = calculateAcademicInfo(userData.rollNumber);
        calculatedYear = academicInfo.currentYear;
        userData.branch = academicInfo.branch !== "Unknown" ? academicInfo.branch : branch;
      } else {
        userData.branch = branch;
      }
      
      const settings = await Setting.findOne();
      if (settings && settings.branchConfigs && settings.branchConfigs.length > 0) {
        const validBranches = settings.branchConfigs.map(c => c.branch);
        // Ensure branch is mapped to the configured name in settings
        userData.branch = normalizeBranchName(userData.branch, validBranches);
        
        const branchConfig = settings.branchConfigs.find(c => c.branch === userData.branch);
        if (!branchConfig) {
          return res.status(400).json({ success: false, message: `Branch ${userData.branch} is not configured in Settings` });
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
          userData.section = row.section ? row.section.trim().toUpperCase() : row.section;
          
          let calculatedYear;
          if (userData.rollNumber) {
            const academicInfo = calculateAcademicInfo(userData.rollNumber);
            calculatedYear = academicInfo.currentYear;
            userData.branch = academicInfo.branch !== "Unknown" ? academicInfo.branch : row.branch;
          } else {
            userData.branch = row.branch;
          }
          
          if (settings && settings.branchConfigs && settings.branchConfigs.length > 0) {
            const validBranches = settings.branchConfigs.map(c => c.branch);
            userData.branch = normalizeBranchName(userData.branch, validBranches);

            const branchConfig = settings.branchConfigs.find(c => c.branch === userData.branch);
            if (!branchConfig) {
              throw new Error(`Branch ${userData.branch} is not configured in Settings`);
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
