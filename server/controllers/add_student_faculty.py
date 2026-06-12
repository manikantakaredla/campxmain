import os

# Update studentController.js
controller_path = r'c:\Users\manik\Music\campx final\server\controllers\studentController.js'
with open(controller_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_method = """// ==================== GET ASSIGNED FACULTY ====================
exports.getAssignedFaculty = async (req, res) => {
  try {
    const studentId = req.user.id;
    const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");
    const ClassFacultyAssignment = require("../models/ClassFacultyAssignment");

    const proctorAssignment = await ProctorStudentAssignment.findOne({ studentId })
      .populate("facultyId", "name email phoneNumber department staffRole");
      
    const classAssignment = await ClassFacultyAssignment.findOne({ studentId })
      .populate("facultyId", "name email phoneNumber department staffRole");

    res.status(200).json({
      success: true,
      data: {
        proctor: proctorAssignment ? proctorAssignment.facultyId : null,
        classTeacher: classAssignment ? classAssignment.facultyId : null
      }
    });
  } catch (error) {
    console.error("Get assigned faculty error:", error);
    res.status(500).json({ success: false, message: "Error fetching assigned faculty" });
  }
};
"""

if "exports.getAssignedFaculty" not in content:
    content += "\n" + new_method
    with open(controller_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added getAssignedFaculty to studentController.js")


# Update studentRoutes.js
routes_path = r'c:\Users\manik\Music\campx final\server\routes\studentRoutes.js'
with open(routes_path, 'r', encoding='utf-8') as f:
    r_content = f.read()

if "getAssignedFaculty" not in r_content:
    r_content = r_content.replace('getStudentProfile,', 'getStudentProfile,\n  getAssignedFaculty,')
    r_content = r_content.replace('module.exports = router;', 'router.get("/assigned-faculty", protect, authorizeRoles("student"), getAssignedFaculty);\n\nmodule.exports = router;')
    with open(routes_path, 'w', encoding='utf-8') as f:
        f.write(r_content)
    print("Added /assigned-faculty route to studentRoutes.js")
