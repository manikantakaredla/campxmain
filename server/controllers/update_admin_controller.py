file = r'c:\Users\manik\Music\campx final\server\controllers\adminController.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

new_functions = """
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
      userData.section = section;
    } else if (["faculty", "hod", "dean", "principal", "admin"].includes(role)) {
      userData.employeeId = employeeId ? employeeId.toUpperCase() : undefined;
      userData.department = department;
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
          userData.section = row.section;
        } else if (["faculty", "hod", "dean", "principal", "admin"].includes(userData.role)) {
          userData.employeeId = row.employeeId ? row.employeeId.toUpperCase() : undefined;
          userData.department = row.department;
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
"""

if 'exports.createUser' not in content:
    content += '\n' + new_functions

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated adminController.js')
