file = r'c:\Users\manik\Music\campx final\server\controllers\hodController.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Update getDepartmentFaculty
faculty_old = """    const hod = await User.findById(req.user.id);
    const department = hod.department;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department not assigned to your profile"
      });
    }

    const faculty = await User.find({
      department: department,
      role: { $in: ["faculty", "hod", "dean", "principal"] },
      isActive: true
    }).select("name email employeeId department designation staffRole profilePicture");"""

faculty_new = """    const hod = await User.findById(req.user.id);
    
    let branches = [];
    if (["dean", "principal", "management"].includes(hod.role)) {
        branches = hod.managedBranches && hod.managedBranches.length > 0 ? hod.managedBranches : [hod.department].filter(Boolean);
    } else {
        branches = [hod.department].filter(Boolean);
    }

    if (branches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Department/Branches not assigned to your profile"
      });
    }

    const faculty = await User.find({
      department: { $in: branches },
      role: { $in: ["faculty", "hod", "dean", "principal"] },
      isActive: true
    }).select("name email employeeId department designation staffRole profilePicture");"""

content = content.replace(faculty_old, faculty_new)

# Update getDepartmentStudents
students_old = """    const hod = await User.findById(req.user.id);
    const department = hod.department;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department not assigned to your profile"
      });
    }

    let query = { 
      branch: department, 
      role: "student",
      isActive: true 
    };"""

students_new = """    const hod = await User.findById(req.user.id);
    let branches = [];
    if (["dean", "principal", "management"].includes(hod.role)) {
        branches = hod.managedBranches && hod.managedBranches.length > 0 ? hod.managedBranches : [hod.department].filter(Boolean);
    } else {
        branches = [hod.department].filter(Boolean);
    }

    if (branches.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Department/Branches not assigned to your profile"
      });
    }

    let query = { 
      branch: { $in: branches }, 
      role: "student",
      isActive: true 
    };"""

content = content.replace(students_old, students_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated hodController.js')
