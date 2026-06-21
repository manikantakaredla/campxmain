const ClassStudentAssignment = require("../models/ClassStudentAssignment");
const ClassSectionAssignment = require("../models/ClassSectionAssignment");
const ProctorStudentAssignment = require("../models/ProctorStudentAssignment");

/**
 * Resolves the class faculty for a given student.
 * Priority: 
 * 1. Individual ClassStudentAssignment
 * 2. Section-level ClassSectionAssignment
 * 
 * @param {Object} student - The student document (needs _id, branch, currentYear, section)
 * @returns {Object|null} - The faculty assignment object or null
 */
const resolveClassFaculty = async (student) => {
  // 1. Check individual assignment
  const individualAssignment = await ClassStudentAssignment.findOne({ studentId: student._id })
    .populate("facultyId", "name employeeId profilePicture department email");
  
  if (individualAssignment && individualAssignment.facultyId) {
    return {
      type: "individual",
      assignment: individualAssignment,
      faculty: individualAssignment.facultyId
    };
  }
  
  // 2. Check section-level assignment
  if (student.branch && student.currentYear && student.section) {
    const sectionAssignment = await ClassSectionAssignment.findOne({
      department: student.branch,
      year: student.currentYear,
      section: student.section,
      isActive: true
    }).populate("facultyId", "name employeeId profilePicture department email");
    
    if (sectionAssignment && sectionAssignment.facultyId) {
      return {
        type: "section",
        assignment: sectionAssignment,
        faculty: sectionAssignment.facultyId
      };
    }
  }
  
  return null;
};

/**
 * Resolves the proctor faculty for a given student.
 * 
 * @param {Object} student - The student document
 * @returns {Object|null}
 */
const resolveProctorFaculty = async (student) => {
  const proctorAssignment = await ProctorStudentAssignment.findOne({ studentId: student._id })
    .populate("facultyId", "name employeeId profilePicture department email");
    
  if (proctorAssignment && proctorAssignment.facultyId) {
    return {
      type: "individual",
      assignment: proctorAssignment,
      faculty: proctorAssignment.facultyId
    };
  }
  return null;
};

module.exports = {
  resolveClassFaculty,
  resolveProctorFaculty
};
