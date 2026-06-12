file_ctrl = r'c:\Users\manik\Music\campx final\server\controllers\facultyController.js'
with open(file_ctrl, 'r', encoding='utf-8') as f:
    content = f.read()

new_method = """// ==================== GET ALL DEPARTMENT STUDENTS ====================
exports.getAllDepartmentStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const user = await User.findById(req.user.id);
    
    // We allow matching either exact abbreviation or full name if there's confusion (e.g. CSE vs Computer Science)
    let branchQuery = user.department;
    if (user.department === 'CSE' || user.department === 'Computer Science') {
      branchQuery = { $in: ['CSE', 'Computer Science'] };
    } else if (user.department === 'ECE' || user.department === 'Electronics and Communication Engineering') {
      branchQuery = { $in: ['ECE', 'Electronics and Communication Engineering'] };
    }

    let query = { role: "student", branch: branchQuery, isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } }
      ];
    }
    
    const students = await User.find(query)
      .select("-password")
      .sort({ currentYear: -1, section: 1, rollNumber: 1 });
      
    res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    console.error("Get all department students error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ALL ASSIGNED STUDENTS ====================
"""

if "getAllDepartmentStudents" not in content:
    content = content.replace("// ==================== GET ALL ASSIGNED STUDENTS ====================\n", new_method)
    with open(file_ctrl, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added getAllDepartmentStudents to facultyController")

file_routes = r'c:\Users\manik\Music\campx final\server\routes\facultyRoutes.js'
with open(file_routes, 'r', encoding='utf-8') as f:
    route_content = f.read()

if "getAllDepartmentStudents" not in route_content:
    route_content = route_content.replace("getAllAssignedStudents,", "getAllAssignedStudents, getAllDepartmentStudents,")
    route_content = route_content.replace('router.get("/students/all", getAllAssignedStudents);', 'router.get("/students/all", getAllDepartmentStudents);')
    with open(file_routes, 'w', encoding='utf-8') as f:
        f.write(route_content)
    print("Updated facultyRoutes.js")
